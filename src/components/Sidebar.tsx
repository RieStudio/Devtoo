import React, { useState } from 'react';
import { 
  Smartphone, 
  Image as ImageIcon, 
  Layout,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  FolderKanban,
  LayoutGrid
} from 'lucide-react';
import type { ToolItem } from '../types/mockup';
import { useAuth } from '../context/AuthContext';
import { DevtooLogo } from './common/DevtooLogo';

interface SidebarProps {
  activeTool: string;
  onSelectTool: (id: string) => void;
  onOpenAuthModal: () => void;
  onOpenProjectsModal: () => void;
}

const TOOLS: ToolItem[] = [
  {
    id: 'dashboard',
    name: 'Ana Sayfa',
    category: 'Genel',
    icon: 'LayoutGrid',
    isAvailable: true,
    description: 'Tasarım merkezi ve son projeler'
  },
  {
    id: 'mockup-editor',
    name: 'Mockup Editor',
    category: 'Geliştirici Araçları',
    icon: 'Smartphone',
    isAvailable: true,
    description: 'App Store & Play Store ekran görüntüsü giydirme'
  },
  {
    id: 'app-icon-resizer',
    name: 'App Icon Resizer',
    category: 'Geliştirici Araçları',
    icon: 'Image',
    isAvailable: true,
    description: 'iOS & Android simge seti boyutlandırma'
  },
  {
    id: 'store-banner-maker',
    name: 'Store Banner Maker',
    category: 'Geliştirici Araçları',
    icon: 'Layout',
    isAvailable: true,
    description: 'Google Play Feature Graphic & Mağaza Bannerı'
  },
  {
    id: 'privacy-policy-studio',
    name: 'Privacy Policy Studio',
    category: 'Geliştirici Araçları',
    icon: 'ShieldCheck',
    isAvailable: true,
    description: 'Gizlilik politikası & Play Store Veri Güvenliği formu'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onSelectTool,
  onOpenAuthModal,
  onOpenProjectsModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { user, signOut } = useAuth();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid':
        return <LayoutGrid className="nav-icon" />;
      case 'Smartphone':
        return <Smartphone className="nav-icon" />;
      case 'Layout':
        return <Layout className="nav-icon" />;
      case 'ShieldCheck':
        return <ShieldCheck className="nav-icon" />;
      case 'Image':
      default:
        return <ImageIcon className="nav-icon" />;
    }
  };

  const categories = Array.from(new Set(TOOLS.map((t) => t.category)));

  return (
    <aside className={`devtoo-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Brand Header & Toggle Button */}
      <div className="sidebar-header">
        <div 
          className="sidebar-header-brand"
          onClick={() => onSelectTool('dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0px', overflow: 'visible' }}
          title="Ana Sayfaya Git (Dashboard)"
        >
          <div style={{ marginRight: '-4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <DevtooLogo size={34} variant="swift" />
          </div>
          {!isCollapsed && (
            <div className="brand-name">
              <span>Dev<span style={{ color: 'var(--chili-primary)' }}>too</span></span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
          aria-label={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {categories.map((cat) => (
          <div key={cat} className="nav-group">
            {!isCollapsed && <div className="nav-section-title">{cat}</div>}
            {TOOLS.filter((t) => t.category === cat).map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => tool.isAvailable && onSelectTool(tool.id)}
                  style={{ opacity: tool.isAvailable ? 1 : 0.65 }}
                  title={isCollapsed ? `${tool.name} ${tool.badge ? `(${tool.badge})` : ''} - ${tool.description}` : tool.description}
                >
                  <div className="nav-item-left">
                    {getIcon(tool.icon)}
                    {!isCollapsed && <span>{tool.name}</span>}
                  </div>
                  {!isCollapsed && tool.badge && <span className="badge-preview">{tool.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / User Profile & Auth */}
      <div className="sidebar-footer">
        {!user ? (
          isCollapsed ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              title="Giriş Yap"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogIn size={18} color="#D90429" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F172A',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <LogIn size={15} color="#D90429" />
              <span>Giriş Yap / Kaydol</span>
            </button>
          )
        ) : (
          isCollapsed ? (
            <button
              type="button"
              onClick={onOpenProjectsModal}
              title={`Projelerim (${user.email})`}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#D90429',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.email?.[0]?.toUpperCase() || 'U'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#D90429',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '120px',
                    }}
                    title={user.email}
                  >
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Çıkış Yap"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={onOpenProjectsModal}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0F172A',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <FolderKanban size={13} color="#D90429" />
                <span>Projelerim</span>
              </button>
            </div>
          )
        )}
      </div>
    </aside>
  );
};
