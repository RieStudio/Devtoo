import React, { useState } from 'react';
import { 
  Layout, 
  Palette, 
  Smartphone, 
  Type, 
  Award, 
  Upload, 
  Crop, 
  Trash2, 
  Check, 
  Sparkles,
  Download
} from 'lucide-react';
import type { 
  StoreBannerConfig, 
  BannerPresetId, 
  BannerPattern,
  BannerDeviceConfig 
} from '../../types/storeBanner';
import { BANNER_PRESETS, BANNER_GRADIENTS } from '../../constants/bannerPresets';
import { BANNER_TEMPLATES } from '../../constants/bannerTemplates';
import { DEVICE_MODELS } from '../../constants/devices';

interface BannerInspectorPanelProps {
  config: StoreBannerConfig;
  onChangeConfig: (updated: Partial<StoreBannerConfig>) => void;
  onUploadDeviceScreenshot: (deviceId: string) => void;
  onCropDeviceScreenshot: (deviceId: string) => void;
  onUploadAppIcon: () => void;
  onUploadBgImage: () => void;
  onExport: () => void;
  isExporting: boolean;
}

type TabType = 'templates' | 'background' | 'devices' | 'text' | 'branding';

const FONTS = [
  { id: 'outfit', name: 'Outfit (Modern & Temiz)' },
  { id: 'inter', name: 'Inter (Standart & Net)' },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans (SaaS & Tech)' },
  { id: 'poppins', name: 'Poppins (Geometrik)' },
  { id: 'montserrat', name: 'Montserrat (Cesur & Güçlü)' },
  { id: 'space-grotesk', name: 'Space Grotesk (Teknolojik)' },
  { id: 'bebas-neue', name: 'Bebas Neue (Büyük & Vurgulu)' },
  { id: 'syne', name: 'Syne (Kreatif & Trend)' },
  { id: 'roboto', name: 'Roboto (Google Klasik)' },
];

export const BannerInspectorPanel: React.FC<BannerInspectorPanelProps> = ({
  config,
  onChangeConfig,
  onUploadDeviceScreenshot,
  onCropDeviceScreenshot,
  onUploadAppIcon,
  onUploadBgImage,
  onExport,
  isExporting,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const selectedDevice = config.devices.find((d) => d.id === config.selectedDeviceId) || config.devices[0];

  const handleUpdateDevice = (deviceId: string, updated: Partial<BannerDeviceConfig>) => {
    const updatedDevices = config.devices.map((d) => 
      d.id === deviceId ? { ...d, ...updated } : d
    ) as [BannerDeviceConfig, BannerDeviceConfig];
    onChangeConfig({ devices: updatedDevices });
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = BANNER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    onChangeConfig({
      ...template.configPatch,
      templateId,
    });
  };

  const handleSelectPreset = (presetId: BannerPresetId) => {
    const preset = BANNER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChangeConfig({
      preset: presetId,
      width: preset.width,
      height: preset.height,
    });
  };

  return (
    <aside className="devtoo-inspector banner-inspector-panel">
      {/* Tab Navigation */}
      <div className="inspector-tabs" style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px 8px', gap: '4px', overflowX: 'auto' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'templates' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('templates')}
          title="Şablonlar & Boyut"
          style={{
            flex: 1,
            padding: '7px 4px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'templates' ? '#FFF0F3' : 'transparent',
            color: activeTab === 'templates' ? '#D90429' : '#64748B',
          }}
        >
          <Layout size={15} />
          <span>Şablon</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'background' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('background')}
          title="Arka Plan"
          style={{
            flex: 1,
            padding: '7px 4px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'background' ? '#FFF0F3' : 'transparent',
            color: activeTab === 'background' ? '#D90429' : '#64748B',
          }}
        >
          <Palette size={15} />
          <span>Arka Plan</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'devices' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('devices')}
          title="Mockup Cihazlar"
          style={{
            flex: 1,
            padding: '7px 4px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'devices' ? '#FFF0F3' : 'transparent',
            color: activeTab === 'devices' ? '#D90429' : '#64748B',
          }}
        >
          <Smartphone size={15} />
          <span>Cihazlar</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'text' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('text')}
          title="Metin & Tipografi"
          style={{
            flex: 1,
            padding: '7px 4px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'text' ? '#FFF0F3' : 'transparent',
            color: activeTab === 'text' ? '#D90429' : '#64748B',
          }}
        >
          <Type size={15} />
          <span>Metin</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'branding' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('branding')}
          title="Marka & Rozetler"
          style={{
            flex: 1,
            padding: '7px 4px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'branding' ? '#FFF0F3' : 'transparent',
            color: activeTab === 'branding' ? '#D90429' : '#64748B',
          }}
        >
          <Award size={15} />
          <span>Rozetler</span>
        </button>
      </div>

      <div className="inspector-content" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* ========================================================================= */}
        {/* TAB 1: ŞABLONLAR & BOYUT                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'templates' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Templates */}
            <div className="inspector-section">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <Sparkles size={14} color="#D90429" />
                <span>Hazır Düzen Şablonları</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {BANNER_TEMPLATES.map((tmpl) => {
                  const isSelected = config.templateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#FFF0F3' : '#FFFFFF',
                        color: isSelected ? '#D90429' : '#1E293B',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{tmpl.name}</span>
                        {isSelected && <Check size={13} color="#D90429" />}
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748B', lineHeight: 1.3 }}>
                        {tmpl.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presets */}
            <div className="inspector-section">
              <div className="section-title" style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Mağaza Boyut Önayarı
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {BANNER_PRESETS.map((p) => {
                  const isSelected = config.preset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#FFF0F3' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#D90429' : '#0F172A' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                          {p.description}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? '#D90429' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.width}×{p.height}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Custom Dimensions if selected */}
              {config.preset === 'custom' && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Genişlik (px)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={config.width}
                      onChange={(e) => onChangeConfig({ width: Math.max(100, Number(e.target.value) || 1024) })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Yükseklik (px)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={config.height}
                      onChange={(e) => onChangeConfig({ height: Math.max(100, Number(e.target.value) || 500) })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Export Action */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                Hızlı Dışa Aktarma
              </div>
              <button
                type="button"
                className="btn-chili"
                onClick={onExport}
                disabled={isExporting}
                style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
              >
                <Download size={15} />
                <span>{isExporting ? 'Oluşturuluyor...' : 'Bannerı İndir (.PNG)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ARKA PLAN                                                          */}
        {/* ========================================================================= */}
        {activeTab === 'background' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Background Type */}
            <div className="inspector-section">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Arka Plan Türü
              </label>
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                {(['gradient', 'solid', 'image'] as const).map((bgType) => (
                  <button
                    key={bgType}
                    type="button"
                    onClick={() => onChangeConfig({ bgType })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: config.bgType === bgType ? '#FFFFFF' : 'transparent',
                      color: config.bgType === bgType ? '#D90429' : '#64748B',
                      boxShadow: config.bgType === bgType ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {bgType === 'gradient' ? 'Gradyan' : bgType === 'solid' ? 'Düz Renk' : 'Görsel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Options */}
            {config.bgType === 'gradient' && (
              <div className="inspector-section">
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Hazır Gradyan Paletleri
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {BANNER_GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        onChangeConfig({
                          bgGradient: {
                            ...config.bgGradient,
                            from: g.from,
                            to: g.to,
                            angle: g.angle,
                          },
                        })
                      }
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: config.bgGradient.from === g.from && config.bgGradient.to === g.to ? '2px solid #D90429' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#FFFFFF',
                      }}
                      title={g.name}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '24px',
                          borderRadius: '4px',
                          background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                        }}
                      />
                      <span style={{ fontSize: '10px', color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                        {g.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Gradient Controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Başlangıç</label>
                    <input
                      type="color"
                      value={config.bgGradient.from}
                      onChange={(e) =>
                        onChangeConfig({
                          bgGradient: { ...config.bgGradient, from: e.target.value },
                        })
                      }
                      style={{ width: '100%', height: '32px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Bitiş</label>
                    <input
                      type="color"
                      value={config.bgGradient.to}
                      onChange={(e) =>
                        onChangeConfig({
                          bgGradient: { ...config.bgGradient, to: e.target.value },
                        })
                      }
                      style={{ width: '100%', height: '32px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Gradient Angle Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                    <span>Açı</span>
                    <span style={{ fontFamily: 'monospace' }}>{config.bgGradient.angle}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={config.bgGradient.angle}
                    onChange={(e) =>
                      onChangeConfig({
                        bgGradient: { ...config.bgGradient, angle: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* Solid Color Options */}
            {config.bgType === 'solid' && (
              <div className="inspector-section">
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Renk Seçimi
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => onChangeConfig({ bgColor: e.target.value })}
                    style={{ width: '48px', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => onChangeConfig({ bgColor: e.target.value })}
                    style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            )}

            {/* Image Background */}
            {config.bgType === 'image' && (
              <div className="inspector-section">
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Özel Arka Plan Görseli
                </label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onUploadBgImage}
                  style={{ width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}
                >
                  <Upload size={14} />
                  <span>{config.bgImageUrl ? 'Görseli Değiştir' : 'Arka Plan Görseli Yükle'}</span>
                </button>

                {config.bgImageUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                        <span>Bulanıklık (Blur)</span>
                        <span style={{ fontFamily: 'monospace' }}>{config.bgImageBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={config.bgImageBlur}
                        onChange={(e) => onChangeConfig({ bgImageBlur: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                        <span>Karartma Oranı</span>
                        <span style={{ fontFamily: 'monospace' }}>{Math.round(config.bgImageDim * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={0.9}
                        step={0.05}
                        value={config.bgImageDim}
                        onChange={(e) => onChangeConfig({ bgImageDim: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pattern Overlays */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Doku & Işıltı Deseni
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {[
                  { id: 'none', label: 'Yok' },
                  { id: 'mesh-glow', label: 'Mesh Işıltısı' },
                  { id: 'dots', label: 'Nokta Izgarası' },
                  { id: 'grid', label: 'Mimari Izgara' },
                  { id: 'diagonal-stripes', label: 'Çizgiler' },
                ].map((p) => {
                  const isSelected = config.bgPattern === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChangeConfig({ bgPattern: p.id as BannerPattern })}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#FFF0F3' : '#FFFFFF',
                        color: isSelected ? '#D90429' : '#475569',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {config.bgPattern !== 'none' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                    <span>Desen Opaklığı</span>
                    <span style={{ fontFamily: 'monospace' }}>{Math.round(config.bgPatternOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.5}
                    step={0.02}
                    value={config.bgPatternOpacity}
                    onChange={(e) => onChangeConfig({ bgPatternOpacity: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CİHAZLAR (MOCKUP)                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'devices' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Device Count Selector */}
            <div className="inspector-section">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Cihaz Sayısı
              </label>
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                {[
                  { count: 0, label: 'Cihaz Yok' },
                  { count: 1, label: '1 Cihaz' },
                  { count: 2, label: '2 Cihaz' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => {
                      const updatedDevs = [...config.devices] as [BannerDeviceConfig, BannerDeviceConfig];
                      if (item.count === 0) {
                        updatedDevs[0].enabled = false;
                        updatedDevs[1].enabled = false;
                      } else if (item.count === 1) {
                        updatedDevs[0].enabled = true;
                        updatedDevs[1].enabled = false;
                      } else {
                        updatedDevs[0].enabled = true;
                        updatedDevs[1].enabled = true;
                      }
                      onChangeConfig({
                        deviceCount: item.count as 0 | 1 | 2,
                        devices: updatedDevs,
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: config.deviceCount === item.count ? '#FFFFFF' : 'transparent',
                      color: config.deviceCount === item.count ? '#D90429' : '#64748B',
                      boxShadow: config.deviceCount === item.count ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {config.deviceCount > 0 && (
              <>
                {/* Active Device Selector if 2 devices */}
                {config.deviceCount === 2 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ selectedDeviceId: 'banner-dev-1' })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: config.selectedDeviceId === 'banner-dev-1' ? '2px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: config.selectedDeviceId === 'banner-dev-1' ? '#FFF0F3' : '#FFFFFF',
                        color: config.selectedDeviceId === 'banner-dev-1' ? '#D90429' : '#1E293B',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cihaz 1 (Ön)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ selectedDeviceId: 'banner-dev-2' })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: config.selectedDeviceId === 'banner-dev-2' ? '2px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: config.selectedDeviceId === 'banner-dev-2' ? '#FFF0F3' : '#FFFFFF',
                        color: config.selectedDeviceId === 'banner-dev-2' ? '#D90429' : '#1E293B',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cihaz 2 (Arka)
                    </button>
                  </div>
                )}

                {/* Device Model Selector */}
                <div className="inspector-section">
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Cihaz Modeli
                  </label>
                  <select
                    className="select-field"
                    value={selectedDevice.deviceType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const modelInfo = DEVICE_MODELS.find((m) => m.id === newType);
                      handleUpdateDevice(selectedDevice.id, {
                        deviceType: newType,
                        deviceColor: modelInfo?.colors[0]?.id || 'default',
                      });
                    }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  >
                    {DEVICE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.brand.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Screenshot Upload & Crop */}
                <div className="inspector-section">
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Ekran Görüntüsü
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onUploadDeviceScreenshot(selectedDevice.id)}
                      style={{ flex: 1, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11.5px' }}
                    >
                      <Upload size={13} />
                      <span>{selectedDevice.screenshotUrl ? 'Görseli Değiştir' : 'Yükle'}</span>
                    </button>

                    {selectedDevice.screenshotUrl && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onCropDeviceScreenshot(selectedDevice.id)}
                        title="Kırp"
                        style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Crop size={14} />
                      </button>
                    )}

                    {selectedDevice.screenshotUrl && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleUpdateDevice(selectedDevice.id, { screenshotUrl: null, originalScreenshotUrl: null, cropData: null })}
                        title="Kaldır"
                        style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Transform Sliders */}
                <div className="inspector-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                      <span>Yatay Konum (X)</span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedDevice.offsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={config.width}
                      value={selectedDevice.offsetX}
                      onChange={(e) => handleUpdateDevice(selectedDevice.id, { offsetX: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                      <span>Dikey Konum (Y)</span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedDevice.offsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={config.height + 200}
                      value={selectedDevice.offsetY}
                      onChange={(e) => handleUpdateDevice(selectedDevice.id, { offsetY: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                      <span>Boyut (Ölçek)</span>
                      <span style={{ fontFamily: 'monospace' }}>{Math.round(selectedDevice.scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.4}
                      max={1.4}
                      step={0.02}
                      value={selectedDevice.scale}
                      onChange={(e) => handleUpdateDevice(selectedDevice.id, { scale: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                      <span>Döndürme Açısı</span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedDevice.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-45}
                      max={45}
                      value={selectedDevice.rotation}
                      onChange={(e) => handleUpdateDevice(selectedDevice.id, { rotation: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Shadow Depth */}
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Gölge Derinliği</label>
                    <select
                      className="select-field"
                      value={selectedDevice.shadowDepth}
                      onChange={(e) => handleUpdateDevice(selectedDevice.id, { shadowDepth: e.target.value as any })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    >
                      <option value="none">Gölge Yok</option>
                      <option value="soft">Hafif Yumuşak</option>
                      <option value="medium">Orta Derinlik</option>
                      <option value="deep">Derin Karartı</option>
                      <option value="3d-floating">3D Havada Süzülen</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: METİN & TİPOGRAFİ                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'text' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Alignment Buttons */}
            <div className="inspector-section">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Metin Hizalaması
              </label>
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                {[
                  { id: 'left', label: 'Sola Hizalı' },
                  { id: 'center', label: 'Ortala' },
                  { id: 'right', label: 'Sağa Hizalı' },
                ].map((align) => (
                  <button
                    key={align.id}
                    type="button"
                    onClick={() => onChangeConfig({ textAlignment: align.id as any })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: config.textAlignment === align.id ? '#FFFFFF' : 'transparent',
                      color: config.textAlignment === align.id ? '#D90429' : '#64748B',
                      boxShadow: config.textAlignment === align.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {align.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Controls */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Ana Başlık</span>
                <input
                  type="checkbox"
                  checked={config.showTitle}
                  onChange={(e) => onChangeConfig({ showTitle: e.target.checked })}
                />
              </div>

              {config.showTitle && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    rows={2}
                    className="input-field"
                    value={config.titleText}
                    onChange={(e) => onChangeConfig({ titleText: e.target.value })}
                    placeholder="Uygulamanızın Başlığı"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', resize: 'vertical' }}
                  />

                  {/* Font Family */}
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Yazı Tipi</label>
                    <select
                      className="select-field"
                      value={config.titleFontFamily}
                      onChange={(e) => onChangeConfig({ titleFontFamily: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    >
                      {FONTS.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Size & Color */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Punto</span>
                        <span style={{ fontFamily: 'monospace' }}>{config.titleFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={24}
                        max={72}
                        value={config.titleFontSize}
                        onChange={(e) => onChangeConfig({ titleFontSize: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>Renk</span>
                      <input
                        type="color"
                        value={config.titleColor}
                        onChange={(e) => onChangeConfig({ titleColor: e.target.value })}
                        style={{ width: '36px', height: '32px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subtitle Controls */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Alt Başlık & Açıklama</span>
                <input
                  type="checkbox"
                  checked={config.showSubtitle}
                  onChange={(e) => onChangeConfig({ showSubtitle: e.target.checked })}
                />
              </div>

              {config.showSubtitle && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={config.subtitleText}
                    onChange={(e) => onChangeConfig({ subtitleText: e.target.value })}
                    placeholder="Uygulamanızı anlatan kısa ve etkileyici açıklama..."
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', resize: 'vertical' }}
                  />

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Punto</span>
                        <span style={{ fontFamily: 'monospace' }}>{config.subtitleFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={32}
                        value={config.subtitleFontSize}
                        onChange={(e) => onChangeConfig({ subtitleFontSize: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>Renk</span>
                      <input
                        type="color"
                        value={config.subtitleColor}
                        onChange={(e) => onChangeConfig({ subtitleColor: e.target.value })}
                        style={{ width: '36px', height: '32px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Position Offsets */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Metin Grubu Konumu & Genişliği
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                    <span>Yatay Konum (X)</span>
                    <span style={{ fontFamily: 'monospace' }}>{config.textOffsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={config.width - 200}
                    value={config.textOffsetX}
                    onChange={(e) => onChangeConfig({ textOffsetX: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                    <span>Dikey Kaydırma (Y)</span>
                    <span style={{ fontFamily: 'monospace' }}>{config.textOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min={-200}
                    max={200}
                    value={config.textOffsetY}
                    onChange={(e) => onChangeConfig({ textOffsetY: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                    <span>Maksimum Genişlik</span>
                    <span style={{ fontFamily: 'monospace' }}>{config.textMaxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={260}
                    max={config.width - 100}
                    value={config.textMaxWidth}
                    onChange={(e) => onChangeConfig({ textMaxWidth: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MARKA & ROZETLER                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* App Icon Badge */}
            <div className="inspector-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Uygulama İkonu</span>
                <input
                  type="checkbox"
                  checked={config.showAppIcon}
                  onChange={(e) => onChangeConfig({ showAppIcon: e.target.checked })}
                />
              </div>

              {config.showAppIcon && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onUploadAppIcon}
                    style={{ width: '100%', padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11.5px' }}
                  >
                    <Upload size={13} />
                    <span>{config.appIconUrl ? 'İkon Görselini Değiştir' : 'İkon Yükle (PNG/JPEG)'}</span>
                  </button>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                      <span>İkon Boyutu</span>
                      <span style={{ fontFamily: 'monospace' }}>{config.appIconSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={48}
                      max={120}
                      value={config.appIconSize}
                      onChange={(e) => onChangeConfig({ appIconSize: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Corner Shape */}
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Köşe Şekli</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['squircle', 'round', 'circle'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => onChangeConfig({ appIconRadius: r })}
                          style={{
                            flex: 1,
                            padding: '5px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: config.appIconRadius === r ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                            backgroundColor: config.appIconRadius === r ? '#FFF0F3' : '#FFFFFF',
                            color: config.appIconRadius === r ? '#D90429' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {r === 'squircle' ? 'iOS Squircle' : r === 'round' ? 'Yuvarlatılmış' : 'Daire'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Eyebrow Pill Tag */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Vurgu Etiketi (Pill)</span>
                <input
                  type="checkbox"
                  checked={config.showEyebrow}
                  onChange={(e) => onChangeConfig({ showEyebrow: e.target.checked })}
                />
              </div>

              {config.showEyebrow && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={config.eyebrowText}
                    onChange={(e) => onChangeConfig({ eyebrowText: e.target.value })}
                    placeholder="Örn: YENİ SÜRÜM YAYINDA"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>Yazı Rengi</span>
                      <input
                        type="color"
                        value={config.eyebrowColor}
                        onChange={(e) => onChangeConfig({ eyebrowColor: e.target.value })}
                        style={{ width: '100%', height: '30px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Store Badges */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Mağaza Rozetleri</span>
                <input
                  type="checkbox"
                  checked={config.showStoreBadge}
                  onChange={(e) => onChangeConfig({ showStoreBadge: e.target.checked })}
                />
              </div>

              {config.showStoreBadge && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { id: 'google-play', label: 'Google Play' },
                    { id: 'app-store', label: 'App Store' },
                    { id: 'both', label: 'Her İkisi' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onChangeConfig({ storeBadgeType: s.id as any })}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: config.storeBadgeType === s.id ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                        backgroundColor: config.storeBadgeType === s.id ? '#FFF0F3' : '#FFFFFF',
                        color: config.storeBadgeType === s.id ? '#D90429' : '#475569',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Badge */}
            <div className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Kullanıcı Puanı Rozeti</span>
                <input
                  type="checkbox"
                  checked={config.showRating}
                  onChange={(e) => onChangeConfig({ showRating: e.target.checked })}
                />
              </div>

              {config.showRating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={config.ratingText}
                    onChange={(e) => onChangeConfig({ ratingText: e.target.value })}
                    placeholder="Örn: 4.9 ★★★★★ (10K+ Oy)"
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
