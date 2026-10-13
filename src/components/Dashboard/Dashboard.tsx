import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Smartphone,
  Layout,
  Image as ImageIcon,
  ShieldCheck,
  Search,
  Upload,
  Download,
  Trash2,
  Plus,
  ArrowRight,
  Cloud,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  FolderKanban,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, type ToolType, type UserProject } from '../../lib/supabase';
import './Dashboard.css';

interface DashboardProject {
  id: string;
  name: string;
  tool_type: ToolType;
  data: Record<string, unknown>;
  updated_at: string;
  isLocal?: boolean;
}

interface DashboardProps {
  onSelectTool: (toolId: string) => void;
  onLoadProject: (toolType: ToolType, data: Record<string, unknown>) => void;
  onOpenAuthModal: () => void;
  onOpenProjectsModal: () => void;
  onShowToast: (message: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTool,
  onLoadProject,
  onOpenAuthModal,
  onOpenProjectsModal,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | ToolType>('all');
  const [cloudProjects, setCloudProjects] = useState<UserProject[]>([]);
  const [localProjects, setLocalProjects] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load drafts saved in localStorage
  const loadLocalDrafts = useCallback(() => {
    const list: DashboardProject[] = [];

    // 1. Mockup Editor local draft
    try {
      const savedMockup = localStorage.getItem('devtoo_mockup_screens');
      if (savedMockup) {
        const screens = JSON.parse(savedMockup);
        if (Array.isArray(screens) && screens.length > 0) {
          const first = screens[0];
          list.push({
            id: 'local-mockup',
            name: first.screenTitle ? `${first.screenTitle} (${screens.length} Ekran)` : `Mobil Mockup (${screens.length} Ekran)`,
            tool_type: 'mockup',
            data: { screens, activeScreenId: localStorage.getItem('devtoo_mockup_active_id') || first.id },
            updated_at: new Date().toISOString(),
            isLocal: true,
          });
        }
      }
    } catch {
      // Ignore JSON error
    }

    // 2. Store Banner Maker local draft
    try {
      const savedBanner = localStorage.getItem('devtoo_banner_config');
      if (savedBanner) {
        const banner = JSON.parse(savedBanner);
        if (banner) {
          list.push({
            id: 'local-banner',
            name: banner.appTitle ? `${banner.appTitle} Banner` : 'Google Play Banner',
            tool_type: 'banner',
            data: banner,
            updated_at: new Date().toISOString(),
            isLocal: true,
          });
        }
      }
    } catch {
      // Ignore JSON error
    }

    // 3. Privacy Policy Studio local draft
    try {
      const savedPrivacy = localStorage.getItem('devtoo_privacy_config');
      if (savedPrivacy) {
        const privacy = JSON.parse(savedPrivacy);
        if (privacy) {
          list.push({
            id: 'local-privacy',
            name: privacy.appName ? `${privacy.appName} Gizlilik Politikası` : 'Gizlilik Politikası Taslağı',
            tool_type: 'privacy',
            data: privacy,
            updated_at: new Date().toISOString(),
            isLocal: true,
          });
        }
      }
    } catch {
      // Ignore JSON error
    }

    setLocalProjects(list);
  }, []);

  // Fetch Supabase cloud projects
  const fetchCloudProjects = useCallback(async () => {
    if (!supabase || !user) {
      setCloudProjects([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Cloud projeler yüklenirken hata:', error);
      } else {
        setCloudProjects((data as UserProject[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLocalDrafts();
    if (user) {
      fetchCloudProjects();
    }
  }, [user, loadLocalDrafts, fetchCloudProjects]);

  // Combine projects
  const allProjects = useMemo(() => {
    const combined: DashboardProject[] = [];

    // Add Cloud projects first
    cloudProjects.forEach((cp) => {
      combined.push({
        id: cp.id,
        name: cp.name,
        tool_type: cp.tool_type,
        data: cp.data,
        updated_at: cp.updated_at,
        isLocal: false,
      });
    });

    // Add local drafts if not already redundant
    localProjects.forEach((lp) => {
      combined.push(lp);
    });

    return combined;
  }, [cloudProjects, localProjects]);

  // Filter & Search
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchFilter = activeFilter === 'all' || p.tool_type === activeFilter;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [allProjects, activeFilter, searchQuery]);

  // Handle open project
  const handleOpenProject = (project: DashboardProject) => {
    onLoadProject(project.tool_type, project.data);
    onShowToast(`"${project.name}" çalışma alanına yüklendi.`);
  };

  // Handle delete project
  const handleDeleteProject = async (project: DashboardProject, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`"${project.name}" adlı tasarımı silmek istediğinize emin misiniz?`)) return;

    if (project.isLocal) {
      if (project.tool_type === 'mockup') {
        localStorage.removeItem('devtoo_mockup_screens');
        localStorage.removeItem('devtoo_mockup_active_id');
      } else if (project.tool_type === 'banner') {
        localStorage.removeItem('devtoo_banner_config');
      } else if (project.tool_type === 'privacy') {
        localStorage.removeItem('devtoo_privacy_config');
      }
      loadLocalDrafts();
      onShowToast('Yerel taslak silindi.');
    } else if (supabase && user) {
      try {
        const { error } = await supabase
          .from('user_projects')
          .delete()
          .eq('id', project.id)
          .eq('user_id', user.id);

        if (error) {
          onShowToast(`Silinemedi: ${error.message}`);
        } else {
          setCloudProjects((prev) => prev.filter((p) => p.id !== project.id));
          onShowToast('Bulut projesi silindi.');
        }
      } catch {
        onShowToast('Silinirken hata oluştu.');
      }
    }
  };

  // Handle export JSON
  const handleExportProjectJson = (project: DashboardProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const exportPayload = {
      format: 'devtoo-project',
      version: 1,
      tool_type: project.tool_type,
      exported_at: new Date().toISOString(),
      name: project.name,
      data: project.data,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'proje'}.devtoo`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Proje dosyası (.devtoo) indirildi.');
  };

  // Handle import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.format === 'devtoo-project' && parsed.tool_type && parsed.data) {
          onLoadProject(parsed.tool_type as ToolType, parsed.data);
          onShowToast('Proje başarıyla yüklendi.');
        } else if (parsed.screens) {
          onLoadProject('mockup', parsed);
          onShowToast('Mockup projesi yüklendi.');
        } else {
          onShowToast('Geçersiz proje dosyası formatı.');
        }
      } catch {
        onShowToast('Dosya okunurken bir hata oluştu.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Format date helper
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Yakın zamanda';
    }
  };

  const getToolDisplayName = (type: ToolType): string => {
    switch (type) {
      case 'banner': return 'Store Banner';
      case 'privacy': return 'Privacy Policy';
      case 'icon': return 'Icon Resizer';
      default: return 'Mockup';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hidden file input for .devtoo import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".devtoo,.json"
        style={{ display: 'none' }}
      />

      {/* Hero Banner (Canva Style) */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-header">
          <div className="dashboard-hero-title-group">
            <div className="dashboard-hero-badge">
              <Sparkles size={12} />
              <span>Devtoo Design Studio</span>
            </div>
            <h1 className="dashboard-hero-title">
              {user ? `Tekrar Hoş Geldiniz, ${user.email?.split('@')[0]}!` : 'Ne tasarlamak istiyorsunuz?'}
            </h1>
            <p className="dashboard-hero-subtitle">
              Mobil uygulamalarınız ve web projeleriniz için ekran görüntüleri, mağaza bannerları, ikon paketleri ve yasal politikaları dakikalar içinde hazırlayın.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            {user && (
              <button
                type="button"
                className="dashboard-btn-import"
                onClick={onOpenProjectsModal}
                title="Tüm kayıtlı projelerinizi ve bulut yedeklerinizi yönetin"
              >
                <FolderKanban size={14} color="#D90429" />
                <span>Projelerimi Yönet</span>
              </button>
            )}
            <button
              type="button"
              className="dashboard-btn-import"
              onClick={() => fileInputRef.current?.click()}
              title="Önceden indirilmiş bir .devtoo veya .json projesini içe aktar"
            >
              <Upload size={14} color="#D90429" />
              <span>Dosya Aç (.devtoo)</span>
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="dashboard-search-wrap">
          <Search size={16} className="dashboard-search-icon" />
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Projelerinizde veya araçlarda arayın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="dashboard-search-clear"
              onClick={() => setSearchQuery('')}
              title="Aramayı Temizle"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      {/* Quick Create Section (Canva Style Tools Grid) */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div className="dashboard-section-title-wrap">
            <h2 className="dashboard-section-title">Yeni Tasarım Başlat</h2>
            <p className="dashboard-section-subtitle">Aşağıdaki stüdyolardan birini seçerek anında tasarlamaya başlayın</p>
          </div>
        </div>

        <div className="quick-create-grid">
          {/* Mockup Editor Card */}
          <div
            className="quick-create-card"
            onClick={() => onSelectTool('mockup-editor')}
          >
            <div className="quick-card-top">
              <div className="quick-card-icon-wrap" style={{ backgroundColor: '#FFF0F3', color: '#D90429' }}>
                <Smartphone size={22} />
              </div>
              <span className="quick-card-badge">1080 × 1920</span>
            </div>
            <div className="quick-card-body">
              <h3 className="quick-card-title">Mockup Editor</h3>
              <p className="quick-card-desc">
                iPhone, Galaxy ve Pixel çerçeveli profesyonel App Store & Google Play ekran görüntüleri.
              </p>
            </div>
            <div className="quick-card-action">
              <span>Hemen Başla</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Store Banner Maker Card */}
          <div
            className="quick-create-card"
            onClick={() => onSelectTool('store-banner-maker')}
          >
            <div className="quick-card-top">
              <div className="quick-card-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <Layout size={22} />
              </div>
              <span className="quick-card-badge">1024 × 500</span>
            </div>
            <div className="quick-card-body">
              <h3 className="quick-card-title">Store Banner Maker</h3>
              <p className="quick-card-desc">
                Google Play Feature Graphic, mağaza vitrin bannerları ve pazarlama görselleri.
              </p>
            </div>
            <div className="quick-card-action" style={{ color: '#D97706' }}>
              <span>Hemen Başla</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* App Icon Resizer Card */}
          <div
            className="quick-create-card"
            onClick={() => onSelectTool('app-icon-resizer')}
          >
            <div className="quick-card-top">
              <div className="quick-card-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <ImageIcon size={22} />
              </div>
              <span className="quick-card-badge">1024 × 1024</span>
            </div>
            <div className="quick-card-body">
              <h3 className="quick-card-title">App Icon Resizer</h3>
              <p className="quick-card-desc">
                Tek bir görselden iOS, iPadOS ve Android için 30+ boyutta simge paketi oluşturun.
              </p>
            </div>
            <div className="quick-card-action" style={{ color: '#2563EB' }}>
              <span>Hemen Başla</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Privacy Policy Studio Card */}
          <div
            className="quick-create-card"
            onClick={() => onSelectTool('privacy-policy-studio')}
          >
            <div className="quick-card-top">
              <div className="quick-card-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                <ShieldCheck size={22} />
              </div>
              <span className="quick-card-badge">GDPR & Play Uyumlu</span>
            </div>
            <div className="quick-card-body">
              <h3 className="quick-card-title">Privacy Policy Studio</h3>
              <p className="quick-card-desc">
                Mobil uygulamanız için yasal gerekliliklere uygun gizlilik politikası ve veri güvenliği beyanı.
              </p>
            </div>
            <div className="quick-card-action" style={{ color: '#059669' }}>
              <span>Hemen Başla</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects Section (Daha Önceki Tasarımlar) */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div className="dashboard-section-title-wrap">
            <h2 className="dashboard-section-title">Son Tasarımlarım</h2>
            <p className="dashboard-section-subtitle">
              {filteredProjects.length > 0 
                ? `Toplam ${filteredProjects.length} kayıtlı tasarım bulundu`
                : 'Daha önce oluşturduğunuz veya taslak halindeki projeler'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="dashboard-filter-tabs">
            <button
              type="button"
              className={`dashboard-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Tümü
            </button>
            <button
              type="button"
              className={`dashboard-filter-pill ${activeFilter === 'mockup' ? 'active' : ''}`}
              onClick={() => setActiveFilter('mockup')}
            >
              Mockup
            </button>
            <button
              type="button"
              className={`dashboard-filter-pill ${activeFilter === 'banner' ? 'active' : ''}`}
              onClick={() => setActiveFilter('banner')}
            >
              Banner
            </button>
            <button
              type="button"
              className={`dashboard-filter-pill ${activeFilter === 'icon' ? 'active' : ''}`}
              onClick={() => setActiveFilter('icon')}
            >
              İkon
            </button>
            <button
              type="button"
              className={`dashboard-filter-pill ${activeFilter === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveFilter('privacy')}
            >
              Gizlilik
            </button>
          </div>
        </div>

        {/* Projects Grid or Empty State */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '8px', color: '#64748B' }}>
            <Loader2 size={18} className="animate-spin" />
            <span style={{ fontSize: '13px' }}>Projeler yükleniyor...</span>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="recent-projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleOpenProject(project)}
                title="Tasarımı açmak için tıklayın"
              >
                {/* Visual Thumbnail */}
                <div className="project-card-thumbnail">
                  <div className="project-thumbnail-preview">
                    {project.tool_type === 'mockup' && (
                      <>
                        <Smartphone size={38} color="#D90429" strokeWidth={1.5} />
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Mockup Canvas</span>
                      </>
                    )}
                    {project.tool_type === 'banner' && (
                      <>
                        <Layout size={38} color="#D97706" strokeWidth={1.5} />
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>1024 × 500 Banner</span>
                      </>
                    )}
                    {project.tool_type === 'icon' && (
                      <>
                        <ImageIcon size={38} color="#2563EB" strokeWidth={1.5} />
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>İkon Paketi</span>
                      </>
                    )}
                    {project.tool_type === 'privacy' && (
                      <>
                        <ShieldCheck size={38} color="#059669" strokeWidth={1.5} />
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Gizlilik Belgesi</span>
                      </>
                    )}
                  </div>

                  {/* Hover Action Overlay */}
                  <div className="project-card-overlay">
                    <button
                      type="button"
                      className="project-card-btn-open"
                      onClick={() => handleOpenProject(project)}
                    >
                      <ExternalLink size={13} />
                      <span>Aç</span>
                    </button>
                    <button
                      type="button"
                      className="project-card-icon-btn"
                      onClick={(e) => handleExportProjectJson(project, e)}
                      title=".devtoo dosyası olarak indir"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      type="button"
                      className="project-card-icon-btn"
                      onClick={(e) => handleDeleteProject(project, e)}
                      title="Tasarımı Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Project Info */}
                <div className="project-card-info">
                  <div className="project-card-title-row">
                    <h4 className="project-card-title">{project.name}</h4>
                    <span className={`project-tool-tag ${project.tool_type}`}>
                      {getToolDisplayName(project.tool_type)}
                    </span>
                  </div>
                  <div className="project-card-meta">
                    <span>{project.isLocal ? 'Yerel Taslak' : 'Bulut Kaydı'}</span>
                    <span>{formatDate(project.updated_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-projects">
            <div className="dashboard-empty-icon">
              <Layers size={26} />
            </div>
            <h3 className="dashboard-empty-title">
              {searchQuery ? 'Aramanızla eşleşen tasarım bulunamadı' : 'Henüz kayıtlı bir tasarımınız yok'}
            </h3>
            <p className="dashboard-empty-desc">
              {searchQuery 
                ? 'Farklı bir arama terimi deneyin veya filtreleri temizleyin.'
                : 'Yukarıdaki araçlardan birine tıklayarak hemen ilk tasarımınızı oluşturun veya bir .devtoo proje dosyasını içeri aktarın.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className="dashboard-empty-btn"
                onClick={() => onSelectTool('mockup-editor')}
              >
                <Plus size={15} />
                <span>İlk Mockup Tasarımını Başlat</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Cloud Guest Sync Banner */}
      {!user && (
        <div className="dashboard-cloud-banner">
          <div className="dashboard-cloud-banner-left">
            <div className="dashboard-cloud-icon-wrap">
              <Cloud size={20} />
            </div>
            <div className="dashboard-cloud-text">
              <h4>Tasarımlarınızı Buluta Kaydedin</h4>
              <p>Oturum açarak çalışmalarınızı tüm cihazlarınızdan senkronize edebilir ve güvenle saklayabilirsiniz.</p>
            </div>
          </div>
          <button
            type="button"
            className="dashboard-cloud-btn"
            onClick={onOpenAuthModal}
          >
            Giriş Yap / Kaydol
          </button>
        </div>
      )}
    </div>
  );
};
