import React from 'react';
import { Download, Upload, Smartphone, Image as ImageIcon, Layout, ShieldCheck, Undo2, Redo2, Sun, Moon } from 'lucide-react';
import { DevtooLogo } from './common/DevtooLogo';

interface HeaderProps {
  activeTool?: string;
  onExport: () => void;
  onExportAll?: () => void;
  screenCount?: number;
  onUploadClick: () => void;
  onCropClick?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isExporting: boolean;
  hasIconImage?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTool = 'mockup-editor',
  onExport, 
  onExportAll,
  screenCount = 1,
  onUploadClick, 
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  isExporting,
  hasIconImage = false,
  theme = 'light',
  onToggleTheme,
}) => {

  return (
    <header className={`devtoo-header ${activeTool === 'dashboard' ? 'floating-island-navbar' : ''}`}>
      <div className="header-title-area">
        {activeTool === 'dashboard' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <div style={{ marginRight: '-4px', display: 'flex', alignItems: 'center' }}>
              <DevtooLogo size={38} variant="swift" />
            </div>
            <span style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', display: 'inline-flex', lineHeight: 1 }}>
              <span>Dev<span style={{ color: 'var(--chili-primary)' }}>too</span></span>
            </span>
          </div>
        ) : (
          <div className="tool-active-badge">
            {activeTool === 'app-icon-resizer' ? (
              <>
                <ImageIcon size={18} color="var(--chili-primary)" />
                <span>App Icon Resizer</span>
              </>
            ) : activeTool === 'store-banner-maker' ? (
              <>
                <Layout size={18} color="var(--chili-primary)" />
                <span>Store Banner Maker</span>
              </>
            ) : activeTool === 'privacy-policy-studio' ? (
              <>
                <ShieldCheck size={18} color="var(--chili-primary)" />
                <span>Privacy Policy Studio</span>
              </>
            ) : (
              <>
                <Smartphone size={18} color="var(--chili-primary)" />
                <span>Mockup Editor</span>
              </>
            )}
          </div>
        )}
      </div>

      {activeTool === 'dashboard' && (
        <div className="header-actions">
          {onToggleTheme && (
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
              aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}
        </div>
      )}

      {activeTool === 'mockup-editor' && (
        <div className="header-actions">
        {onUndo && onRedo && (
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-subtle)', padding: '2px', borderRadius: '8px', marginRight: '4px' }}>
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

        {onToggleTheme && (
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}
      </div>
      )}

      {activeTool === 'app-icon-resizer' && (
        <div className="header-actions">
          <button className="btn-secondary" onClick={onUploadClick} title={hasIconImage ? 'Görseli değiştir' : 'İkon görseli yükle'}>
            <Upload size={14} />
            <span>{hasIconImage ? 'Görseli Değiştir' : 'İkon Yükle'}</span>
          </button>

          <button
            className="btn-chili"
            onClick={onExport}
            disabled={isExporting || !hasIconImage}
            title={hasIconImage ? 'Tüm simge paketlerini (.ZIP) indir' : 'Lütfen önce bir ikon görseli yükleyin'}
          >
            <Download size={14} />
            <span>{isExporting ? 'Dışa Aktarılıyor...' : 'İndir'}</span>
          </button>

          {onToggleTheme && (
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
              aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      )}

      {activeTool === 'store-banner-maker' && (
        <div className="header-actions">
          {onUndo && onRedo && (
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-subtle)', padding: '2px', borderRadius: '8px', marginRight: '4px' }}>
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

          <button className="btn-secondary" onClick={onUploadClick} title="Ekran görüntüsü yükle">
            <Upload size={14} />
            <span>Ekran Görüntüsü Yükle</span>
          </button>

          <button
            className="btn-chili"
            onClick={onExport}
            disabled={isExporting}
            title="Bannerı yüksek kalitede indir"
          >
            <Download size={14} />
            <span>{isExporting ? 'Oluşturuluyor...' : 'İndir'}</span>
          </button>

          {onToggleTheme && (
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
              aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      )}

      {activeTool === 'privacy-policy-studio' && (
        <div className="header-actions">
          <button
            className="btn-chili"
            onClick={onExport}
            disabled={isExporting}
            title="Gizlilik politikasını hazır HTML dosyası olarak indir"
          >
            <Download size={14} />
            <span>HTML İndir</span>
          </button>

          {onToggleTheme && (
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
              aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

