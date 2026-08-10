import React from 'react';
import { Download, Upload, Smartphone } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onUploadClick: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onExport, onUploadClick, isExporting }) => {
  return (
    <header className="devtoo-header">
      <div className="header-title-area">
        <div className="tool-active-badge">
          <Smartphone size={18} color="#D90429" />
          <span>Mockup Editor</span>
        </div>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
          • Mobil App & Oyun Ekran Görseli Hazırlayıcı
        </span>
      </div>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onUploadClick}>
          <Upload size={14} />
          <span>Ekran Görüntüsü Yükle</span>
        </button>

        <button className="btn-chili" onClick={onExport} disabled={isExporting}>
          <Download size={14} />
          <span>{isExporting ? 'Dışa Aktarılıyor...' : 'PNG Olarak İndir'}</span>
        </button>
      </div>
    </header>
  );
};
