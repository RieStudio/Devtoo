import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Image as ImageIcon, 
  Layout,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import type { ToolItem } from '../types/mockup';
import { DevtooLogo } from './common/DevtooLogo';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  activeTool: string;
  onSelectTool: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onSelectTool,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { t } = useLanguage();

  const tools: ToolItem[] = useMemo(() => [
    {
      id: 'dashboard',
      name: t.sidebar.home,
      category: t.sidebar.generalCategory,
      icon: 'LayoutGrid',
      isAvailable: true,
      description: t.sidebar.homeDesc
    },
    {
      id: 'mockup-editor',
      name: t.sidebar.mockupEditor,
      category: t.sidebar.devToolsCategory,
      icon: 'Smartphone',
      isAvailable: true,
      description: t.sidebar.mockupEditorDesc
    },
    {
      id: 'app-icon-resizer',
      name: t.sidebar.appIconResizer,
      category: t.sidebar.devToolsCategory,
      icon: 'Image',
      isAvailable: true,
      description: t.sidebar.appIconResizerDesc
    },
    {
      id: 'store-banner-maker',
      name: t.sidebar.storeBannerMaker,
      category: t.sidebar.devToolsCategory,
      icon: 'Layout',
      isAvailable: true,
      description: t.sidebar.storeBannerMakerDesc
    },
    {
      id: 'privacy-policy-studio',
      name: t.sidebar.privacyPolicyStudio,
      category: t.sidebar.devToolsCategory,
      icon: 'ShieldCheck',
      isAvailable: true,
      description: t.sidebar.privacyPolicyStudioDesc
    },
  ], [t]);

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

  const categories = Array.from(new Set(tools.map((tItem) => tItem.category)));

  return (
    <aside className={`devtoo-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Brand Header & Toggle Button */}
      <div className="sidebar-header">
        <div 
          className="sidebar-header-brand"
          onClick={() => onSelectTool('dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0px', overflow: 'visible' }}
          title={t.sidebar.goToDashboard}
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
          title={isCollapsed ? t.sidebar.expandMenu : t.sidebar.collapseMenu}
          aria-label={isCollapsed ? t.sidebar.expandMenu : t.sidebar.collapseMenu}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {categories.map((cat) => (
          <div key={cat} className="nav-group">
            {!isCollapsed && <div className="nav-section-title">{cat}</div>}
            {tools.filter((tItem) => tItem.category === cat).map((tool) => {
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
    </aside>
  );
};
