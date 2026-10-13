import React from 'react';
import { Download, Upload, Smartphone, Image as ImageIcon, Layout, ShieldCheck, Undo2, Redo2, FolderKanban, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  onOpenAuthModal?: () => void;
  onOpenProjectsModal?: () => void;
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
  onOpenAuthModal,
  onOpenProjectsModal,
}) => {
  const { user } = useAuth();

  return (
    <header className="devtoo-header">
      <div className="header-title-area">
        {activeTool === 'dashboard' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="logo-badge" title="Devtoo" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: '#FFF0F3', fontSize: '15px' }}>🌶️</div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>Devtoo</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '999px', marginLeft: '2px' }}>Tasarım Merkezi</span>
          </div>
        ) : (
          <div className="tool-active-badge">
            {activeTool === 'app-icon-resizer' ? (
              <>
                <ImageIcon size={18} color="#D90429" />
                <span>App Icon Resizer</span>
              </>
            ) : activeTool === 'store-banner-maker' ? (
              <>
                <Layout size={18} color="#D90429" />
                <span>Store Banner Maker</span>
              </>
            ) : activeTool === 'privacy-policy-studio' ? (
              <>
                <ShieldCheck size={18} color="#D90429" />
                <span>Privacy Policy Studio</span>
              </>
            ) : (
              <>
                <Smartphone size={18} color="#D90429" />
                <span>Mockup Editor</span>
              </>
            )}
          </div>
        )}
      </div>

      {activeTool === 'dashboard' && (
        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenProjectsModal && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onOpenProjectsModal}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <FolderKanban size={14} color="#D90429" />
                  <span>Projelerim</span>
                </button>
              )}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#D90429',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
                title={user.email}
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            onOpenAuthModal && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onOpenAuthModal}
                style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
              >
                <LogIn size={14} color="#D90429" />
                <span>Giriş Yap / Kaydol</span>
              </button>
            )
          )}
        </div>
      )}

      {activeTool === 'mockup-editor' && (
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
        </div>
      )}

      {activeTool === 'store-banner-maker' && (
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
        </div>
      )}
    </header>
  );
};

