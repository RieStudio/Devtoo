import React, { useState } from 'react';
import { 
  Smartphone, 
  Image as ImageIcon, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { ToolItem } from '../types/mockup';

interface SidebarProps {
  activeTool: string;
  onSelectTool: (id: string) => void;
}

const TOOLS: ToolItem[] = [
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
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="nav-icon" />;
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
        <div className="sidebar-header-brand">
          <div className="logo-badge" title="Devtoo">🌶️</div>
          {!isCollapsed && (
            <div className="brand-name">
              Devtoo
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
    </aside>
  );
};
