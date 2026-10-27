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
  X,
  ExternalLink,
  Layers
} from 'lucide-react';
import { 
  getLocalProjects, 
  deleteLocalProject, 
  LOCAL_PROJECTS_CHANGED_EVENT, 
  type ToolType 
} from '../../lib/storage';
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
  onShowToast: (message: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTool,
  onLoadProject,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localProjects, setLocalProjects] = useState<DashboardProject[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<DashboardProject | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load drafts saved in localStorage
  const loadLocalDrafts = useCallback(() => {
    const list: DashboardProject[] = [];

    // 0. Saved local projects from ProjectsModal (Client-Only)
    const savedProjects = getLocalProjects();
    savedProjects.forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        tool_type: p.tool_type,
        data: p.data,
        updated_at: p.updated_at,
        isLocal: true,
      });
    });

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

  useEffect(() => {
    loadLocalDrafts();
    const handleLocalChange = () => loadLocalDrafts();
    window.addEventListener(LOCAL_PROJECTS_CHANGED_EVENT, handleLocalChange);
    return () => window.removeEventListener(LOCAL_PROJECTS_CHANGED_EVENT, handleLocalChange);
  }, [loadLocalDrafts]);

  // Projects list
  const allProjects = localProjects;

  // Search
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allProjects, searchQuery]);

  // Handle open project
  const handleOpenProject = (project: DashboardProject) => {
    onLoadProject(project.tool_type, project.data);
    onShowToast(`"${project.name}" çalışma alanına yüklendi.`);
  };

  // Handle delete project click (opens custom in-app confirmation modal)
  const handleDeleteProject = (project: DashboardProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  // Confirm delete project
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const project = projectToDelete;
    setProjectToDelete(null);

    if (project.id.startsWith('local-') && project.id !== 'local-mockup' && project.id !== 'local-banner' && project.id !== 'local-privacy') {
      deleteLocalProject(project.id);
    } else if (project.tool_type === 'mockup') {
      localStorage.removeItem('devtoo_mockup_screens');
      localStorage.removeItem('devtoo_mockup_active_id');
    } else if (project.tool_type === 'banner') {
      localStorage.removeItem('devtoo_banner_config');
    } else if (project.tool_type === 'privacy') {
      localStorage.removeItem('devtoo_privacy_config');
    }
    loadLocalDrafts();
    onShowToast('Yerel proje silindi.');
  };

  // Close delete modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && projectToDelete) {
        setProjectToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectToDelete]);

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
            <h1 className="dashboard-hero-title">
              Ne tasarlamak istiyorsunuz?
            </h1>
            <p className="dashboard-hero-subtitle">
              Mobil uygulamalarınız ve web projeleriniz için ekran görüntüleri, mağaza bannerları, ikon paketleri ve yasal politikaları dakikalar içinde hazırlayın.
            </p>
          </div>

          <div className="dashboard-hero-actions">
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
          </div>
        </div>

        <div className="quick-create-grid">
          {/* Mockup Editor Card */}
          <div
            className="quick-create-card"
            onClick={() => onSelectTool('mockup-editor')}
          >
            <div className="quick-card-top">
              <div className="quick-card-icon-wrap" style={{ color: '#D90429' }}>
                <Smartphone size={24} strokeWidth={2} />
              </div>
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
              <div className="quick-card-icon-wrap" style={{ color: '#D97706' }}>
                <Layout size={24} strokeWidth={2} />
              </div>
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
              <div className="quick-card-icon-wrap" style={{ color: '#2563EB' }}>
                <ImageIcon size={24} strokeWidth={2} />
              </div>
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
              <div className="quick-card-icon-wrap" style={{ color: '#059669' }}>
                <ShieldCheck size={24} strokeWidth={2} />
              </div>
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
          </div>
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length > 0 ? (
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
                      <Smartphone size={38} color="#D90429" strokeWidth={1.5} />
                    )}
                    {project.tool_type === 'banner' && (
                      <Layout size={38} color="#D97706" strokeWidth={1.5} />
                    )}
                    {project.tool_type === 'icon' && (
                      <ImageIcon size={38} color="#2563EB" strokeWidth={1.5} />
                    )}
                    {project.tool_type === 'privacy' && (
                      <ShieldCheck size={38} color="#059669" strokeWidth={1.5} />
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
                  </div>
                  <div className="project-card-meta">
                    <span>Otomatik Taslak</span>
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
                ? 'Farklı bir arama terimi deneyin.'
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

      {/* Custom In-App Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            animation: 'fadeIn 0.15s ease',
          }}
          onClick={() => setProjectToDelete(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Body */}
            <div
              style={{
                padding: '24px 24px 20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--chili-primary)',
                  paddingTop: '2px',
                }}
              >
                <Trash2 size={24} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Tasarımı Sil
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>"{projectToDelete.name}"</strong> adlı tasarımı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div
              style={{
                padding: '14px 24px 18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                backgroundColor: 'var(--bg-subtle)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--chili-primary)',
                  backgroundColor: 'var(--chili-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(217, 4, 41, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={14} />
                <span>Evet, Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
