import React, { useRef } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Pipette, 
  Smartphone, 
  Globe
} from 'lucide-react';
import appleSvg from '../../assets/apple.svg';
import androidSvg from '../../assets/android.svg';
import type { IconResizerConfig, CornerRadiusType } from '../../types/iconResizer';
import { IOS_ICON_SIZES, ANDROID_ICON_SIZES, WEB_ICON_SIZES, ALL_ICON_SIZES } from '../../constants/iconSizes';

interface IconInspectorPanelProps {
  config: IconResizerConfig;
  onChangeConfig: (updated: Partial<IconResizerConfig>) => void;
  onTriggerUpload: () => void;
  onOpenCropModal?: () => void;
}

const COLOR_PRESETS = [
  '#FFFFFF', // Beyaz
  '#000000', // Siyah
  '#D90429', // Chili Kırmızı
  '#0F172A', // Slate Koyu
  '#3B82F6', // Mavi
  '#10B981', // Yeşil
  '#8B5CF6', // Mor
  '#F59E0B', // Turuncu
];

export const IconInspectorPanel: React.FC<IconInspectorPanelProps> = ({
  config,
  onChangeConfig,
  onTriggerUpload,
  onOpenCropModal,
}) => {
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const selectedSpecs = ALL_ICON_SIZES.filter((spec) => {
    if (spec.platform === 'ios' && config.selectedPlatforms.ios) return true;
    if (spec.platform === 'android' && config.selectedPlatforms.android) return true;
    if (spec.platform === 'web' && config.selectedPlatforms.web) return true;
    return false;
  });

  return (
    <aside className="devtoo-inspector">
      <div className="inspector-content">
        {/* Section 1: Kaynak Görsel Detayı (Sadece görsel yüklüyken gösterilir) */}
        {config.sourceImageUrl && (
          <div className="inspector-section">
            <div className="icon-source-card">
              <div className="source-thumb-box">
                <img src={config.sourceImageUrl} alt="Kaynak Görsel" className="source-thumb-img" />
              </div>
              <div className="source-meta-box">
                <div className="source-meta-title" title={config.sourceImageName}>
                  {config.sourceImageName || 'app-icon.png'}
                </div>
                <div className="source-meta-res">
                  {config.sourceImageWidth > 0 && config.sourceImageHeight > 0
                    ? `${config.sourceImageWidth} × ${config.sourceImageHeight} px`
                    : '1024 × 1024 px (Önerilen)'}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={onTriggerUpload}
                    style={{ fontSize: '11px', color: '#D90429', fontWeight: 600 }}
                  >
                    Görseli Değiştir
                  </button>
                  {onOpenCropModal && (
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={onOpenCropModal}
                      style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}
                    >
                      Kırp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Uygulama Bilgisi */}
        <div className="inspector-section">
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={13} color="#D90429" />
            <span>Uygulama Adı</span>
          </div>

          <input
            type="text"
            className="input-text"
            placeholder="Örn: Devtoo App"
            value={config.appName}
            onChange={(e) => onChangeConfig({ appName: e.target.value })}
            style={{ fontSize: '12px' }}
          />
          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
            Cihaz önizlemelerinde ve ZIP arşiv adında kullanılır.
          </div>
        </div>

        {/* Section 3: İkon Özelleştirme */}
        <div className="inspector-section">
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={13} color="#D90429" />
            <span>İkon Düzenleme</span>
          </div>

          {/* Arka Plan Dolgusu (Transparent or Solid) */}
          <div className="control-group" style={{ marginBottom: '10px' }}>
            <div className="control-label">
              <span>Arka Plan Dolgusu</span>
              <span className="control-value">
                {config.isTransparentBg ? 'Saydam' : config.bgColor.toUpperCase()}
              </span>
            </div>

            {/* Saydam / Renkli Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              <button
                type="button"
                className={`btn-secondary ${config.isTransparentBg ? 'selected' : ''}`}
                style={{
                  fontSize: '11.5px',
                  padding: '6px 8px',
                  justifyContent: 'center',
                  borderColor: config.isTransparentBg ? '#D90429' : '#CBD5E1',
                  backgroundColor: config.isTransparentBg ? '#D90429' : '#FFFFFF',
                  color: config.isTransparentBg ? '#FFFFFF' : '#334155',
                  fontWeight: config.isTransparentBg ? 700 : 500,
                  boxShadow: config.isTransparentBg ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => onChangeConfig({ isTransparentBg: true })}
              >
                Saydam (PNG)
              </button>
              <button
                type="button"
                className={`btn-secondary ${!config.isTransparentBg ? 'selected' : ''}`}
                style={{
                  fontSize: '11.5px',
                  padding: '6px 8px',
                  justifyContent: 'center',
                  borderColor: !config.isTransparentBg ? '#D90429' : '#CBD5E1',
                  backgroundColor: !config.isTransparentBg ? '#D90429' : '#FFFFFF',
                  color: !config.isTransparentBg ? '#FFFFFF' : '#334155',
                  fontWeight: !config.isTransparentBg ? 700 : 500,
                  boxShadow: !config.isTransparentBg ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => onChangeConfig({ isTransparentBg: false })}
              >
                Düz Renk
              </button>
            </div>

            {/* Solid Color Palette (if not transparent) */}
            {!config.isTransparentBg && (
              <div className="color-picker-row" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    title={color}
                    type="button"
                    className={`color-swatch-btn ${config.bgColor.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onChangeConfig({ bgColor: color })}
                  />
                ))}

                {/* Custom Color Pipette Button */}
                <div
                  title="Özel Arka Plan Rengi Seç"
                  className={`color-swatch-btn custom-palette-btn ${
                    !COLOR_PRESETS.includes(config.bgColor.toUpperCase()) ? 'selected' : ''
                  }`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: !COLOR_PRESETS.includes(config.bgColor.toUpperCase())
                      ? config.bgColor
                      : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                >
                  <Pipette size={13} style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))', pointerEvents: 'none' }} />
                  <input
                    ref={colorPickerRef}
                    type="color"
                    value={config.bgColor.startsWith('#') && config.bgColor.length === 7 ? config.bgColor : '#FFFFFF'}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                    onChange={(e) => onChangeConfig({ bgColor: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* İç Kenar Boşluğu (Padding / Inset) Slider */}
          <div className="control-group" style={{ marginBottom: '10px' }}>
            <div className="control-label">
              <span>İç Boşluk (Padding)</span>
              <span className="control-value">%{config.paddingPercent}</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={config.paddingPercent}
              onChange={(e) => onChangeConfig({ paddingPercent: Number(e.target.value) })}
            />
          </div>

          {/* Önizleme Maske Biçimi (Corner Radius) - iPhone ve Studio Display (web) seçildiğinde gizlenir */}
          {config.previewDevice !== 'iphone' && config.previewDevice !== 'web' && (
            <div className="control-group">
              <div className="control-label">
                <span>Önizleme Maske Tipi</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {(
                  [
                    { id: 'squircle', label: 'Squircle (iOS)' },
                    { id: 'circle', label: 'Daire (Android)' },
                    { id: 'rounded', label: 'Yuvarlak' },
                    { id: 'square', label: 'Kare (Ham)' },
                  ] as { id: CornerRadiusType; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`btn-secondary ${config.previewCornerRadius === item.id ? 'selected' : ''}`}
                    style={{
                      fontSize: '11px',
                      padding: '6px 6px',
                      justifyContent: 'center',
                      borderColor: config.previewCornerRadius === item.id ? '#D90429' : '#CBD5E1',
                      backgroundColor: config.previewCornerRadius === item.id ? '#D90429' : '#FFFFFF',
                      color: config.previewCornerRadius === item.id ? '#FFFFFF' : '#334155',
                      fontWeight: config.previewCornerRadius === item.id ? 700 : 500,
                      boxShadow: config.previewCornerRadius === item.id ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => onChangeConfig({ previewCornerRadius: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Platform Seçimi */}
        <div className="inspector-section">
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, overflow: 'hidden' }}>
              <ShieldCheck size={13} color="#D90429" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Dışa Aktarılacak Platformlar</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#D90429', whiteSpace: 'nowrap', flexShrink: 0, padding: '2px 6px', backgroundColor: 'rgba(217, 4, 41, 0.08)', borderRadius: '4px' }}>
              {selectedSpecs.length} Simge
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* iOS */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: config.selectedPlatforms.ios ? '#F8FAFC' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.selectedPlatforms.ios}
                  onChange={(e) =>
                    onChangeConfig({
                      selectedPlatforms: { ...config.selectedPlatforms, ios: e.target.checked },
                    })
                  }
                  style={{ accentColor: '#D90429', width: '15px', height: '15px' }}
                />
                <img src={appleSvg} alt="Apple" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>iOS & Apple</div>
                  <div style={{ fontSize: '10.5px', color: '#64748B' }}>Xcode AppIcon.appiconset + Contents.json</div>
                </div>
              </div>
              <span className="badge-preview">{IOS_ICON_SIZES.length}</span>
            </label>

            {/* Android */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: config.selectedPlatforms.android ? '#F8FAFC' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.selectedPlatforms.android}
                  onChange={(e) =>
                    onChangeConfig({
                      selectedPlatforms: { ...config.selectedPlatforms, android: e.target.checked },
                    })
                  }
                  style={{ accentColor: '#D90429', width: '15px', height: '15px' }}
                />
                <img src={androidSvg} alt="Android" style={{ width: '15px', height: '14px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Android</div>
                  <div style={{ fontSize: '10.5px', color: '#64748B' }}>res/mipmap-* + Play Store 512px</div>
                </div>
              </div>
              <span className="badge-preview">{ANDROID_ICON_SIZES.length}</span>
            </label>

            {/* Web */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: config.selectedPlatforms.web ? '#F8FAFC' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.selectedPlatforms.web}
                  onChange={(e) =>
                    onChangeConfig({
                      selectedPlatforms: { ...config.selectedPlatforms, web: e.target.checked },
                    })
                  }
                  style={{ accentColor: '#D90429', width: '15px', height: '15px' }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Web & Favicon</div>
                  <div style={{ fontSize: '10.5px', color: '#64748B' }}>Favicons, PWA, Apple Touch Icon</div>
                </div>
              </div>
              <span className="badge-preview">{WEB_ICON_SIZES.length}</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};
