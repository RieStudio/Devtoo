import React from 'react';
import { Download, Upload, Smartphone, Undo2, Redo2 } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onExportAll?: () => void;
  screenCount?: number;
  onUploadClick: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onExport, 
  onExportAll,
  screenCount = 1,
  onUploadClick, 
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  isExporting 
}) => {
  return (
    <header className="devtoo-header">
      <div className="header-title-area">
        <div className="tool-active-badge">
          <Smartphone size={18} color="#D90429" />
          <span>Mockup Editor</span>
        </div>
      </div>

      <div className="header-actions">
        {onUndo && onRedo && (
          <div style={{ display: 'flex', gap: '2px', backgroundColor: '#F1F3F5', padding: '2px', borderRadius: '8px', marginRight: '4px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 8px', border: 'none', background: 'transparent' }}
              onClick={onUndo}
              disabled={!canUndo}
              title="Geri Al (Ctrl + Z)"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 8px', border: 'none', background: 'transparent' }}
              onClick={onRedo}
              disabled={!canRedo}
              title="İleri Al (Ctrl + Y / Ctrl + Shift + Z)"
            >
              <Redo2 size={15} />
            </button>
          </div>
        )}

        {screenCount <= 1 && (
          <button className="btn-secondary" onClick={onUploadClick}>
            <Upload size={14} />
            <span>Ekran Görüntüsü Yükle</span>
          </button>
        )}

        {screenCount > 1 && onExportAll && (
          <button className="btn-secondary" onClick={onExportAll} disabled={isExporting} title="Tüm ekranları tek bir dosya olarak indir">
            <Download size={14} />
            <span>Tüm Ekranları İndir</span>
          </button>
        )}

        <button className="btn-chili" onClick={onExport} disabled={isExporting}>
          <Download size={14} />
          <span>{isExporting ? 'Dışa Aktarılıyor...' : 'İndir'}</span>
        </button>
      </div>
    </header>
  );
};

