import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Globe, 
  Layers,
  Settings2
} from 'lucide-react';
import appleSvg from '../../assets/apple.svg';
import androidSvg from '../../assets/android.svg';
import type { IconResizerConfig } from '../../types/iconResizer';
import { ALL_ICON_SIZES, IOS_ICON_SIZES, ANDROID_ICON_SIZES, WEB_ICON_SIZES } from '../../constants/iconSizes';

interface IconExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IconResizerConfig;
  onChangeConfig: (updated: Partial<IconResizerConfig>) => void;
  onExport: (platformFilter?: 'ios' | 'android' | 'web', customZipName?: string) => Promise<void>;
  isExporting: boolean;
  exportProgressText: string;
  exportPercent: number;
}

export const IconExportModal: React.FC<IconExportModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onExport,
  isExporting,
  exportProgressText,
  exportPercent,
}) => {
  const [customZipName, setCustomZipName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const baseName = (config.appName || 'app')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      setCustomZipName(`${baseName}-iconset`);
    }
  }, [isOpen, config.appName]);

  if (!isOpen) return null;

  const selectedSpecs = ALL_ICON_SIZES.filter((spec) => {
    if (spec.platform === 'ios' && config.selectedPlatforms.ios) return true;
    if (spec.platform === 'android' && config.selectedPlatforms.android) return true;
    if (spec.platform === 'web' && config.selectedPlatforms.web) return true;
    return false;
  });

  const handleStartExportAll = () => {
    if (selectedSpecs.length === 0) {
      alert('Lütfen en az bir platform seçin.');
      return;
    }
    onExport(undefined, customZipName);
  };

  const handleStartExportSingle = (platform: 'ios' | 'android' | 'web') => {
    const platformPrefix = platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'web';
    onExport(platform, `${customZipName}-${platformPrefix}`);
  };

  const hasAnyPlatformSelected =
    config.selectedPlatforms.ios ||
    config.selectedPlatforms.android ||
    config.selectedPlatforms.web;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #EDF2F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} color="#D90429" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                İkon Paketlerini Dışa Aktar
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                iOS, Android ve Web için optimize edilmiş simge setleri
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            style={{
              background: 'none',
              border: 'none',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Icon Overview Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {config.sourceImageUrl && (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: config.bgColor,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={config.sourceImageUrl}
                    alt="Icon"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {config.appName || 'Devtoo App'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {config.sourceImageWidth > 0 ? `${config.sourceImageWidth} × ${config.sourceImageHeight} px` : '1024 × 1024 px'} • %{config.paddingPercent} Boşluk
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedSpecs.length} Simge Seçili
            </span>
          </div>

          {/* Platform Selections */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} color="#D90429" />
              <span>Dışa Aktarılacak Platformlar</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. iOS Option Card */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: config.selectedPlatforms.ios ? '#FFFBFB' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={config.selectedPlatforms.ios}
                    onChange={(e) =>
                      onChangeConfig({
                        selectedPlatforms: { ...config.selectedPlatforms, ios: e.target.checked },
                      })
                    }
                    style={{ accentColor: '#D90429', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <img src={appleSvg} alt="Apple" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>iOS & iPadOS (Xcode)</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                        {IOS_ICON_SIZES.length} Boyut
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                      AppIcon.appiconset klasörü ve resmi Contents.json dosyası
                    </div>
                  </div>
                </label>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px', flexShrink: 0 }}
                  onClick={() => handleStartExportSingle('ios')}
                  disabled={isExporting || !config.sourceImageUrl}
                  title="Yalnızca iOS Xcode paketini (.ZIP) indir"
                >
                  <Download size={12} />
                  <span>Tekli İndir</span>
                </button>
              </div>

              {/* 2. Android Option Card */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: config.selectedPlatforms.android ? '#FFFBFB' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={config.selectedPlatforms.android}
                    onChange={(e) =>
                      onChangeConfig({
                        selectedPlatforms: { ...config.selectedPlatforms, android: e.target.checked },
                      })
                    }
                    style={{ accentColor: '#D90429', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <img src={androidSvg} alt="Android" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Android (Android Studio)</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                        {ANDROID_ICON_SIZES.length} Boyut
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                      res/mipmap-* (mdpi ... xxxhdpi) + Google Play 512px
                    </div>
                  </div>
                </label>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px', flexShrink: 0 }}
                  onClick={() => handleStartExportSingle('android')}
                  disabled={isExporting || !config.sourceImageUrl}
                  title="Yalnızca Android mipmap paketini (.ZIP) indir"
                >
                  <Download size={12} />
                  <span>Tekli İndir</span>
                </button>
              </div>

              {/* 3. Web & Favicon Option Card */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: config.selectedPlatforms.web ? '#FFFBFB' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={config.selectedPlatforms.web}
                    onChange={(e) =>
                      onChangeConfig({
                        selectedPlatforms: { ...config.selectedPlatforms, web: e.target.checked },
                      })
                    }
                    style={{ accentColor: '#D90429', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3B82F6',
                    }}
                  >
                    <Globe size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Web & PWA (Favicon Paketi)</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                        {WEB_ICON_SIZES.length} Boyut
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                      favicon.ico, apple-touch-icon.png, Web Manifest (192, 512px)
                    </div>
                  </div>
                </label>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px', flexShrink: 0 }}
                  onClick={() => handleStartExportSingle('web')}
                  disabled={isExporting || !config.sourceImageUrl}
                  title="Yalnızca Web Favicon paketini (.ZIP) indir"
                >
                  <Download size={12} />
                  <span>Tekli İndir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dosya Adı Ayarı */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings2 size={13} color="#D90429" />
              <span>Dosya Adı</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="input-text"
                value={customZipName}
                onChange={(e) => setCustomZipName(e.target.value)}
                placeholder="Örn: devtoo-app-icons"
                style={{ fontSize: '12px', paddingRight: '46px' }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              >
                .zip
              </span>
            </div>
          </div>

          {/* Canlı İlerleme Çubuğu */}
          {isExporting && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#FFF0F3',
                border: '1px solid #FECDD3',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#D90429',
                  marginBottom: '6px',
                }}
              >
                <span>{exportProgressText || 'Simgeler paketleniyor...'}</span>
                <span>%{exportPercent}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#FECDD3',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${exportPercent}%`,
                    height: '100%',
                    backgroundColor: '#D90429',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #EDF2F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#FAFAFA',
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isExporting}
          >
            İptal
          </button>

          <button
            type="button"
            className="btn-chili"
            onClick={handleStartExportAll}
            disabled={isExporting || !hasAnyPlatformSelected || !config.sourceImageUrl}
            style={{ padding: '8px 20px', minWidth: '130px', justifyContent: 'center' }}
          >
            <span>
              {isExporting
                ? 'Paketleniyor...'
                : `Tümünü İndir (.ZIP) [${selectedSpecs.length}]`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
