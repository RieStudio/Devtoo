import React from 'react';
import { Download, Upload, Smartphone, Image as ImageIcon, Layout, ShieldCheck, Undo2, Redo2, Sun, Moon } from 'lucide-react';
import { DevtooLogo } from './common/DevtooLogo';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { language, toggleLanguage, t } = useLanguage();

  const renderGlobalControls = () => (
    <>
      <button
        type="button"
        className="btn-lang-toggle"
        onClick={toggleLanguage}
        title={language === 'tr' ? 'Switch to English (EN)' : "Türkçe'ye Geç (TR)"}
        aria-label="Change Language"
      >
        <span className="lang-code">{language.toUpperCase()}</span>
      </button>

      {onToggleTheme && (
        <button
          type="button"
          className="btn-theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? t.header.switchThemeLight : t.header.switchThemeDark}
          aria-label={theme === 'dark' ? t.header.switchThemeLight : t.header.switchThemeDark}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      )}
    </>
  );

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
                <span>{t.sidebar.appIconResizer}</span>
              </>
            ) : activeTool === 'store-banner-maker' ? (
              <>
                <Layout size={18} color="var(--chili-primary)" />
                <span>{t.sidebar.storeBannerMaker}</span>
              </>
            ) : activeTool === 'privacy-policy-studio' ? (
              <>
                <ShieldCheck size={18} color="var(--chili-primary)" />
                <span>{t.sidebar.privacyPolicyStudio}</span>
              </>
            ) : (
              <>
                <Smartphone size={18} color="var(--chili-primary)" />
                <span>{t.sidebar.mockupEditor}</span>
              </>
            )}
          </div>
        )}
      </div>

      {activeTool === 'dashboard' && (
        <div className="header-actions">
          {renderGlobalControls()}
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
                title={t.header.undoTooltip}
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 8px', border: 'none', background: 'transparent' }}
                onClick={onRedo}
                disabled={!canRedo}
                title={t.header.redoTooltip}
              >
                <Redo2 size={15} />
              </button>
            </div>
          )}

          {screenCount <= 1 && (
            <button className="btn-secondary" onClick={onUploadClick}>
              <Upload size={14} />
              <span>{t.header.uploadScreenshot}</span>
            </button>
          )}

          {screenCount > 1 && onExportAll && (
            <button className="btn-secondary" onClick={onExportAll} disabled={isExporting} title={t.header.downloadAllScreens}>
              <Download size={14} />
              <span>{t.header.downloadAllScreens}</span>
            </button>
          )}

          <button className="btn-chili" onClick={onExport} disabled={isExporting}>
            <Download size={14} />
            <span>{isExporting ? t.common.exporting : t.header.exportDesign}</span>
          </button>

          {renderGlobalControls()}
        </div>
      )}

      {activeTool === 'app-icon-resizer' && (
        <div className="header-actions">
          <button className="btn-secondary" onClick={onUploadClick} title={hasIconImage ? t.header.changeIcon : t.header.uploadIcon}>
            <Upload size={14} />
            <span>{hasIconImage ? t.header.changeIcon : t.header.uploadIcon}</span>
          </button>

          <button
            className="btn-chili"
            onClick={onExport}
            disabled={isExporting || !hasIconImage}
            title={hasIconImage ? t.header.iconDownloadTooltip : t.header.iconDownloadDisabledTooltip}
          >
            <Download size={14} />
            <span>{isExporting ? t.common.exporting : t.common.download}</span>
          </button>

          {renderGlobalControls()}
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
                title={t.header.undoTooltip}
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 8px', border: 'none', background: 'transparent' }}
                onClick={onRedo}
                disabled={!canRedo}
                title={t.header.redoTooltip}
              >
                <Redo2 size={15} />
              </button>
            </div>
          )}

          <button className="btn-secondary" onClick={onUploadClick} title={t.header.uploadScreenshot}>
            <Upload size={14} />
            <span>{t.header.uploadScreenshot}</span>
          </button>

          <button
            className="btn-chili"
            onClick={onExport}
            disabled={isExporting}
            title={t.header.bannerDownloadTooltip}
          >
            <Download size={14} />
            <span>{isExporting ? t.common.generating : t.common.download}</span>
          </button>

          {renderGlobalControls()}
        </div>
      )}

      {activeTool === 'privacy-policy-studio' && (
        <div className="header-actions">
          <button
            className="btn-chili"
            onClick={onExport}
            disabled={isExporting}
            title={t.header.policyDownloadTooltip}
          >
            <Download size={14} />
            <span>{t.header.downloadHtml}</span>
          </button>

          {renderGlobalControls()}
        </div>
      )}
    </header>
  );
};
