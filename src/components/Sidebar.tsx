import React from 'react';
import { 
  Smartphone, 
  Image, 
  Layers, 
  FileText, 
  Gamepad2, 
  Code2, 
  Search,
  CheckCircle2
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
    isAvailable: false,
    badge: 'YAKINDA',
    description: 'iOS & Android simge seti boyutlandırma'
  },
  {
    id: 'asset-scaler',
    name: 'Asset Scaler (1x 2x 3x)',
    category: 'Geliştirici Araçları',
    icon: 'Layers',
    isAvailable: false,
    badge: 'YAKINDA',
    description: 'Oyun ve uygulama grafik ölçekleme'
  },
  {
    id: 'store-text-gen',
    name: 'Mağaza Metni Oluşturucu',
    category: 'Mağaza & Tasarım',
    icon: 'FileText',
    isAvailable: false,
    badge: 'YAKINDA',
    description: 'iOS/Android mağaza açıklaması biçimlendirici'
  },
  {
    id: 'game-aspect-calc',
    name: 'Oyun Çözünürlük Hesabı',
    category: 'Mağaza & Tasarım',
    icon: 'Gamepad2',
    isAvailable: false,
    badge: 'YAKINDA',
    description: 'Unity/Unreal aspect ratio ve viewport rehberi'
  },
  {
    id: 'aso-keyword-tool',
    name: 'ASO Kelime Analizcisi',
    category: 'Kod & Yardımcılar',
    icon: 'Search',
    isAvailable: false,
    badge: 'YAKINDA',
    description: 'App Store Optimization anahtar kelime sayacı'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="nav-icon" />;
      case 'Image':
        return <Image className="nav-icon" />;
      case 'Layers':
        return <Layers className="nav-icon" />;
      case 'FileText':
        return <FileText className="nav-icon" />;
      case 'Gamepad2':
        return <Gamepad2 className="nav-icon" />;
      case 'Search':
        return <Search className="nav-icon" />;
      default:
        return <Code2 className="nav-icon" />;
    }
  };

  const categories = ['Geliştirici Araçları', 'Mağaza & Tasarım', 'Kod & Yardımcılar'] as const;

  return (
    <aside className="devtoo-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">🌶️</div>
        <div className="logo-text">
          <div className="brand-name">
            Devtoo
            <span className="brand-tag">DEV</span>
          </div>
          <span className="brand-sub">Mobil & Oyun Dev Suite</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {categories.map((cat) => (
          <div key={cat} className="nav-group">
            <div className="nav-section-title">{cat}</div>
            {TOOLS.filter((t) => t.category === cat).map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => tool.isAvailable && onSelectTool(tool.id)}
                  style={{ opacity: tool.isAvailable ? 1 : 0.65 }}
                  title={tool.description}
                >
                  <div className="nav-item-left">
                    {getIcon(tool.icon)}
                    <span>{tool.name}</span>
                  </div>
                  {tool.badge && <span className="badge-preview">{tool.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Status */}
      <div className="sidebar-footer">
        <div className="dev-profile">
          <div className="status-dot" />
          <span className="status-text">v1.0.0 (Light Mode)</span>
        </div>
        <CheckCircle2 size={16} color="#10B981" />
      </div>
    </aside>
  );
};
