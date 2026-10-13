import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  FolderKanban, 
  Trash2, 
  ExternalLink, 
  Save, 
  Smartphone, 
  Layout, 
  ShieldCheck, 
  Image as ImageIcon,
  Search,
  Loader2,
  Calendar
} from 'lucide-react';
import { supabase, type UserProject, type ToolType } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: string;
  currentToolData?: Record<string, unknown>;
  onLoadProject: (toolType: ToolType, data: Record<string, unknown>) => void;
  onShowToast?: (message: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  activeTool,
  currentToolData,
  onLoadProject,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | ToolType>('all');
  
  // Save new project state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);

  const getToolTypeFromId = (toolId: string): ToolType => {
    switch (toolId) {
      case 'store-banner-maker': return 'banner';
      case 'privacy-policy-studio': return 'privacy';
      case 'app-icon-resizer': return 'icon';
      default: return 'mockup';
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

  const getToolIcon = (type: ToolType) => {
    switch (type) {
      case 'banner': return <Layout size={14} color="#D90429" />;
      case 'privacy': return <ShieldCheck size={14} color="#D90429" />;
      case 'icon': return <ImageIcon size={14} color="#D90429" />;
      default: return <Smartphone size={14} color="#D90429" />;
    }
  };

  const fetchProjects = useCallback(async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Projeler yüklenirken hata:', error);
      } else {
        setProjects((data as UserProject[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects();
    }
  }, [isOpen, user, fetchProjects]);

  const handleSaveCurrentProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !currentToolData) return;

    if (!projectName.trim()) {
      if (onShowToast) onShowToast('Lütfen proje adı girin.');
      return;
    }

    setIsSaving(true);
    const toolType = getToolTypeFromId(activeTool);

    try {
      const { error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          name: projectName.trim(),
          tool_type: toolType,
          data: currentToolData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (onShowToast) onShowToast(`Kaydedilemedi: ${error.message}`);
      } else {
        if (onShowToast) onShowToast('Proje başarıyla buluta kaydedildi.');
        setProjectName('');
        setShowSaveForm(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast('Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!supabase || !user) return;
    if (!window.confirm(`"${name}" adlı projeyi silmek istediğinize emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (onShowToast) onShowToast(`Silinemedi: ${error.message}`);
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (onShowToast) onShowToast('Proje silindi.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = selectedFilter === 'all' || project.tool_type === selectedFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #EDF2F7',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderKanban size={18} color="#D90429" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Kayıtlı Projelerim
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Bulut hesabınıza kaydedilmiş tüm tasarımlar
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar (Search & Save Current Button) */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={15}
                color="#94A3B8"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Projelerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowSaveForm(!showSaveForm)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: showSaveForm ? '#E2E8F0' : '#D90429',
                color: showSaveForm ? '#334155' : '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <Save size={14} />
              <span>{showSaveForm ? 'İptal' : 'Mevcut Tasarımı Kaydet'}</span>
            </button>
          </div>

          {/* Inline Save Form */}
          {showSaveForm && (
            <form
              onSubmit={handleSaveCurrentProject}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Yeni proje başlığı (ör. App Store Ana Ekran)..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                autoFocus
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#D90429',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSaving && <Loader2 size={13} className="spin-animation" />}
                <span>Kaydet</span>
              </button>
            </form>
          )}

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {(['all', 'mockup', 'banner', 'privacy', 'icon'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: selectedFilter === filter ? 700 : 500,
                  backgroundColor: selectedFilter === filter ? '#0F172A' : '#FFFFFF',
                  color: selectedFilter === filter ? '#FFFFFF' : '#64748B',
                  border: `1px solid ${selectedFilter === filter ? '#0F172A' : '#E2E8F0'}`,
                  cursor: 'pointer',
                }}
              >
                {filter === 'all' ? 'Tümü' : getToolDisplayName(filter)}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', minHeight: '260px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94A3B8' }}>
              <Loader2 size={24} className="spin-animation" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '220px',
                color: '#94A3B8',
                textAlign: 'center',
              }}
            >
              <FolderKanban size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Kayıtlı proje bulunamadı</div>
              <div style={{ fontSize: '12px', marginTop: '4px', maxWidth: '280px' }}>
                {searchQuery ? 'Aramanızla eşleşen proje yok.' : 'Mevcut tasarımınızı kaydetmek için yukarıdaki butonu kullanabilirsiniz.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getToolIcon(p.tool_type)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#64748B',
                            backgroundColor: '#F1F5F9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {getToolDisplayName(p.tool_type)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} />
                          {new Date(p.updated_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadProject(p.tool_type, p.data);
                        onClose();
                        if (onShowToast) onShowToast(`"${p.name}" projesi yüklendi.`);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <ExternalLink size={12} />
                      <span>Aç</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(p.id, p.name)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Projeyi Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
