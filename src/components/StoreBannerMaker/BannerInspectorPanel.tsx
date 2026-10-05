import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Smartphone, 
  Type, 
  Award, 
  Upload, 
  Crop, 
  Trash2, 
  Maximize2,
  RotateCcw,
  Plus,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Shield,
  Shapes,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pipette,
  Crosshair
} from 'lucide-react';
import type { 
  StoreBannerConfig, 
  BannerPresetId, 
  BannerPattern,
  BannerDeviceConfig 
} from '../../types/storeBanner';
import type { ShapeLayer, ShapeType, TextLayer } from '../../types/mockup';
import { BANNER_PRESETS, BANNER_GRADIENTS, getPresetLayoutPatch } from '../../constants/bannerPresets';
import { DEVICE_MODELS } from '../../constants/devices';

const PHONE_MODELS = DEVICE_MODELS.filter((m) => m.category === 'phone');

const PALETTE_PRESETS = [
  '#D90429', '#EF233C', '#2B2D42', '#8D99AE', '#EDF2F4',
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#000000', '#FFFFFF'
];

interface BannerInspectorPanelProps {
  config: StoreBannerConfig;
  onChangeConfig: (updated: Partial<StoreBannerConfig>, recordHistory?: boolean) => void;
  onUploadDeviceScreenshot: (deviceId: string) => void;
  onCropDeviceScreenshot: (deviceId: string) => void;
  onUploadAppIcon: () => void;
  onUploadBgImage: () => void;
  onExport?: () => void;
  isExporting?: boolean;
  onShowToast?: (message: string) => void;
}

type TabType = 'presets' | 'background' | 'devices' | 'text' | 'branding';

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
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingScrollSectionRef = useRef<string | null>(null);

  // Auto-switch tab and scroll to relevant section when any canvas element is selected
  useEffect(() => {
    let targetTab: TabType | null = null;
    let targetSectionId: string | null = null;

    if (config.selectedShapeId) {
      targetTab = 'background';
      targetSectionId = 'section-banner-shapes';
    } else if (config.selectedDeviceId) {
      targetTab = 'devices';
      targetSectionId = 'section-banner-devices';
    } else if (config.selectedTextId) {
      targetTab = 'text';
      targetSectionId = 'section-banner-text-layers';
    } else if (config.selectedElementId) {
      switch (config.selectedElementId) {
        case 'app-icon':
          targetTab = 'branding';
          targetSectionId = 'section-banner-app-icon';
          break;
        case 'eyebrow':
          targetTab = 'branding';
          targetSectionId = 'section-banner-eyebrow';
          break;
        case 'store-badge':
          targetTab = 'branding';
          targetSectionId = 'section-banner-store-badges';
          break;
        case 'rating':
          targetTab = 'branding';
          targetSectionId = 'section-banner-rating';
          break;
        case 'title':
        case 'subtitle':
          targetTab = 'text';
          targetSectionId = 'section-banner-text-layers';
          break;
        default:
          break;
      }
    }

    if (targetTab && targetSectionId) {
      pendingScrollSectionRef.current = targetSectionId;
      setActiveTab((currentTab) => {
        if (currentTab !== targetTab) {
          return targetTab;
        }
        return currentTab;
      });

      const performScroll = () => {
        const secId = pendingScrollSectionRef.current;
        if (!secId) return;
        const targetEl = document.getElementById(secId);
        const container = scrollContainerRef.current;
        if (targetEl && container) {
          const containerRect = container.getBoundingClientRect();
          const elRect = targetEl.getBoundingClientRect();
          const offsetTop = elRect.top - containerRect.top + container.scrollTop - 14;

          container.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: 'smooth',
          });
        }
      };

      const t1 = setTimeout(performScroll, 50);
      const t2 = setTimeout(performScroll, 160);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [
    config.selectedShapeId,
    config.selectedDeviceId,
    config.selectedTextId,
    config.selectedElementId,
  ]);

  // Custom Dimensions input state with strict 5-digit limit
  const [customWidth, setCustomWidth] = useState<string>(config.width.toString());
  const [customHeight, setCustomHeight] = useState<string>(config.height.toString());

  useEffect(() => {
    setCustomWidth(config.width.toString());
    setCustomHeight(config.height.toString());
  }, [config.width, config.height, config.preset]);

  const handleCustomWidthChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 5);
    setCustomWidth(clean);
    if (clean.length > 0) {
      const num = parseInt(clean, 10);
      if (num > 0) {
        onChangeConfig({ width: num });
      }
    }
  };

  const handleCustomHeightChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 5);
    setCustomHeight(clean);
    if (clean.length > 0) {
      const num = parseInt(clean, 10);
      if (num > 0) {
        onChangeConfig({ height: num });
      }
    }
  };

  const handleWidthBlur = () => {
    const num = parseInt(customWidth, 10);
    if (!customWidth || isNaN(num) || num < 50) {
      setCustomWidth('1200');
      onChangeConfig({ width: 1200 });
    }
  };

  const handleHeightBlur = () => {
    const num = parseInt(customHeight, 10);
    if (!customHeight || isNaN(num) || num < 50) {
      setCustomHeight('600');
      onChangeConfig({ height: 600 });
    }
  };

  const handleResetCustomDimensions = () => {
    setCustomWidth('1200');
    setCustomHeight('600');
    const layoutPatch = getPresetLayoutPatch('custom', config.devices, config.textLayers);
    onChangeConfig({
      ...layoutPatch,
      width: 1200,
      height: 600,
    });
  };

  const enabledDevices = config.devices.filter((d) => d.enabled);
  const selectedDevice = config.devices.find((d) => d.id === config.selectedDeviceId && d.enabled) || enabledDevices[0] || config.devices[0];

  const handleUpdateDevice = (deviceId: string, updated: Partial<BannerDeviceConfig>) => {
    const updatedDevices = config.devices.map((d) => 
      d.id === deviceId ? { ...d, ...updated } : d
    );
    onChangeConfig({ devices: updatedDevices });
  };

  const handleAddDevice = () => {
    if (enabledDevices.length >= 5) return;

    const disabledIndex = config.devices.findIndex((d) => !d.enabled);
    if (disabledIndex !== -1) {
      const updatedDevices = [...config.devices];
      const count = enabledDevices.length + 1;
      updatedDevices[disabledIndex] = {
        ...updatedDevices[disabledIndex],
        enabled: true,
        offsetX: Math.round(500 + (count - 1) * 110),
        offsetY: 280 + (count % 2 === 0 ? 30 : 0),
        rotation: count % 2 === 0 ? 8 : -8,
      };
      onChangeConfig({
        devices: updatedDevices,
        deviceCount: updatedDevices.filter((d) => d.enabled).length,
        selectedDeviceId: updatedDevices[disabledIndex].id,
      });
      return;
    }

    const count = enabledDevices.length + 1;
    const newId = `banner-dev-${Date.now()}`;
    const newDevice: BannerDeviceConfig = {
      id: newId,
      enabled: true,
      deviceType: 'galaxy-s26-ultra',
      deviceColor: 'default',
      screenshotUrl: null,
      originalScreenshotUrl: null,
      cropData: null,
      scale: count === 1 ? 0.86 : 0.82,
      offsetX: count === 1 ? 860 : Math.round(Math.min(config.width - 160, 720 + (count - 1) * 95)),
      offsetY: count === 1 ? 315 : 315 + (count % 2 === 0 ? 30 : -20),
      rotation: count === 1 ? -5 : (count % 2 === 0 ? 8 : -8),
      perspectiveY: 0,
      shadowDepth: '3d-floating',
    };

    const newDevices = [...config.devices, newDevice];
    onChangeConfig({
      devices: newDevices,
      deviceCount: newDevices.filter((d) => d.enabled).length,
      selectedDeviceId: newId,
    });
  };

  const handleRemoveDevice = (deviceId: string) => {
    const updatedDevices = config.devices.map((d) => 
      d.id === deviceId ? { ...d, enabled: false } : d
    );
    const remaining = updatedDevices.filter((d) => d.enabled);
    onChangeConfig({
      devices: updatedDevices,
      deviceCount: remaining.length,
      selectedDeviceId: remaining[0]?.id || 'banner-dev-1',
    });
  };

  const handleSelectPreset = (presetId: BannerPresetId) => {
    const layoutPatch = getPresetLayoutPatch(presetId, config.devices, config.textLayers);
    onChangeConfig(layoutPatch);
  };

  const [isShapePickerOpen, setIsShapePickerOpen] = useState(false);
  const selectedShape = (config.shapeLayers || []).find((s) => s.id === config.selectedShapeId) || null;

  const handleAddShape = (type: ShapeType) => {
    const newId = `shape-${Date.now()}`;
    const shapes = config.shapeLayers || [];
    const lastShape = shapes[shapes.length - 1];

    const baseOffsetX = lastShape ? (lastShape.x || 0) + 30 : Math.round(config.width * 0.2);
    const baseOffsetY = lastShape ? (lastShape.y || 0) + 30 : Math.round(config.height * 0.3);

    const newShape: ShapeLayer = {
      id: newId,
      type,
      x: baseOffsetX,
      y: baseOffsetY,
      width: type === 'circle' ? 140 : type === 'star' || type === 'heart' || type === 'badge' ? 130 : 160,
      height: type === 'circle' ? 140 : type === 'star' || type === 'heart' || type === 'badge' ? 130 : 160,
      color: '#D90429',
      opacity: 100,
      rotation: 0,
      borderRadius: type === 'rounded-rectangle' ? 16 : 0,
    };

    onChangeConfig({
      shapeLayers: [...shapes, newShape],
      selectedShapeId: newId,
      selectedDeviceId: null,
      selectedElementId: null,
    });
    setIsShapePickerOpen(false);
  };

  const handleUpdateSelectedShape = (updated: Partial<ShapeLayer>) => {
    if (!selectedShape) return;
    onChangeConfig({
      shapeLayers: (config.shapeLayers || []).map((s) =>
        s.id === selectedShape.id ? { ...s, ...updated } : s
      ),
    });
  };

  const handleDeleteSelectedShape = (shapeId: string) => {
    const remaining = (config.shapeLayers || []).filter((s) => s.id !== shapeId);
    onChangeConfig({
      shapeLayers: remaining,
      selectedShapeId: remaining.length > 0 ? remaining[0].id : null,
    });
  };

  const textLayers = config.textLayers || [];
  const selectedTextLayer = textLayers.find((l) => l.id === config.selectedTextId) || textLayers[0] || null;

  const handleAddTextLayer = () => {
    const layers = config.textLayers || [];
    if (layers.length >= 20) {
      if (onShowToast) {
        onShowToast('En fazla 20 metin katmanı ekleyebilirsiniz.');
      } else {
        alert('En fazla 20 metin katmanı ekleyebilirsiniz.');
      }
      return;
    }

    const newId = `banner-text-${Date.now()}`;
    const lastLayer = layers[layers.length - 1];

    const baseX = lastLayer ? Math.min(config.width - 240, (lastLayer.x || 0) + 20) : 60;
    const baseY = lastLayer ? Math.min(config.height - 100, (lastLayer.y || 0) + 50) : 200;

    const newLayer: TextLayer = {
      id: newId,
      text: 'Yeni Metin',
      x: baseX,
      y: baseY,
      fontSize: 28,
      color: '#FFFFFF',
      fontFamily: 'outfit',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'left',
      width: 440,
      rotation: 0,
    };

    onChangeConfig({
      textLayers: [...layers, newLayer],
      selectedTextId: newId,
      selectedDeviceId: null,
      selectedShapeId: null,
      selectedElementId: null,
    });
  };

  const handleUpdateTextLayer = (updated: Partial<TextLayer>) => {
    if (!selectedTextLayer) return;
    onChangeConfig({
      textLayers: (config.textLayers || []).map((l) =>
        l.id === selectedTextLayer.id ? { ...l, ...updated } : l
      ),
    });
  };

  const handleDeleteTextLayer = (layerId: string) => {
    const remaining = (config.textLayers || []).filter((l) => l.id !== layerId);
    onChangeConfig({
      textLayers: remaining,
      selectedTextId: remaining.length > 0 ? remaining[0].id : null,
    });
  };

  return (
    <aside className="devtoo-inspector banner-inspector-panel">
      {/* Tab Navigation */}
      <div className="inspector-tabs" style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px 8px', gap: '4px', overflowX: 'auto' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'presets' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('presets')}
          title="Mağaza Boyutları"
          style={{
            flex: 1,
            padding: '7px 4px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: activeTab === 'presets' ? '1.5px solid #0F172A' : '1.5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'presets' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'presets' ? '#0F172A' : '#64748B',
            transition: 'all 0.15s ease',
          }}
        >
          <Maximize2 size={15} />
          <span>Boyut</span>
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
            border: activeTab === 'background' ? '1.5px solid #0F172A' : '1.5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'background' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'background' ? '#0F172A' : '#64748B',
            transition: 'all 0.15s ease',
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
            border: activeTab === 'devices' ? '1.5px solid #0F172A' : '1.5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'devices' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'devices' ? '#0F172A' : '#64748B',
            transition: 'all 0.15s ease',
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
            border: activeTab === 'text' ? '1.5px solid #0F172A' : '1.5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'text' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'text' ? '#0F172A' : '#64748B',
            transition: 'all 0.15s ease',
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
            border: activeTab === 'branding' ? '1.5px solid #0F172A' : '1.5px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'branding' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'branding' ? '#0F172A' : '#64748B',
            transition: 'all 0.15s ease',
          }}
        >
          <Award size={15} />
          <span>Rozetler</span>
        </button>
      </div>

      <div ref={scrollContainerRef} className="inspector-content" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {/* ========================================================================= */}
        {/* TAB 1: MAĞAZA BOYUTLARI                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'presets' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
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
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
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
                <div 
                  style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '8px' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                      Özel Boyut Ayarı
                    </span>
                    <button
                      type="button"
                      onClick={handleResetCustomDimensions}
                      title="Varsayılan boyuta sıfırla (1200×600)"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '5px',
                        padding: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Genişlik (px)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        className="input-field"
                        value={customWidth}
                        onChange={(e) => handleCustomWidthChange(e.target.value)}
                        onBlur={handleWidthBlur}
                        placeholder="1200"
                        style={{ 
                          width: '100%', 
                          padding: '6px 8px', 
                          borderRadius: '6px', 
                          border: '1px solid #CBD5E1', 
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Yükseklik (px)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        className="input-field"
                        value={customHeight}
                        onChange={(e) => handleCustomHeightChange(e.target.value)}
                        onBlur={handleHeightBlur}
                        placeholder="600"
                        style={{ 
                          width: '100%', 
                          padding: '6px 8px', 
                          borderRadius: '6px', 
                          border: '1px solid #CBD5E1', 
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                        border: '2px solid',
                        borderColor: config.bgGradient.from === g.from && config.bgGradient.to === g.to ? '#D90429' : '#E2E8F0',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#FFFFFF',
                        transition: 'border-color 0.15s ease',
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
                        border: isSelected ? '1px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
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

            {/* Background Shapes / Şekiller (Mockup Editor Özelliği) */}
            <div id="section-banner-shapes" className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', position: 'relative' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                  Arka Plan Şekilleri
                </span>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsShapePickerOpen(!isShapePickerOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      backgroundColor: '#D90429',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(217, 4, 41, 0.25)',
                    }}
                  >
                    <Plus size={12} color="#FFFFFF" />
                    <span>Şekil Ekle</span>
                  </button>

                  {/* Şekil Seçim Menüsü Popover */}
                  {isShapePickerOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        width: '210px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        zIndex: 100,
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #F1F5F9' }}>
                        <span>Temel Şekiller</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {[
                          { type: 'rectangle' as ShapeType, label: 'Dikdörtgen', icon: <Square size={16} /> },
                          { type: 'circle' as ShapeType, label: 'Daire', icon: <Circle size={16} /> },
                          { type: 'triangle' as ShapeType, label: 'Üçgen', icon: <Triangle size={16} /> },
                          { type: 'star' as ShapeType, label: 'Yıldız', icon: <Star size={16} /> },
                          { type: 'heart' as ShapeType, label: 'Kalp', icon: <Heart size={16} /> },
                          { type: 'badge' as ShapeType, label: 'Rozet', icon: <Shield size={16} /> },
                        ].map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '8px 4px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              color: '#334155',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F1F5F9';
                              e.currentTarget.style.borderColor = '#0F172A';
                              e.currentTarget.style.color = '#0F172A';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#F8FAFC';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                              e.currentTarget.style.color = '#334155';
                            }}
                            onClick={() => handleAddShape(item.type)}
                          >
                            {item.icon}
                            <span style={{ fontSize: '10px', fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Eklenen Şekillerin Çipleri */}
              {(config.shapeLayers || []).length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                    Eklenen Şekiller ({config.shapeLayers?.length})
                  </div>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {(config.shapeLayers || []).map((shape, index) => {
                      const isSelected = config.selectedShapeId === shape.id;
                      const labelMap: Record<ShapeType, string> = {
                        rectangle: 'Dikdörtgen',
                        'rounded-rectangle': 'Yuvarlak Kutu',
                        circle: 'Daire',
                        triangle: 'Üçgen',
                        star: 'Yıldız',
                        heart: 'Kalp',
                        badge: 'Rozet',
                      };
                      return (
                        <button
                          key={shape.id}
                          type="button"
                          className={`layer-chip-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            onChangeConfig({
                              selectedShapeId: shape.id,
                              selectedDeviceId: null,
                              selectedElementId: null,
                              selectedTextId: null,
                            });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #0F172A' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: '11px',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: shape.type === 'circle' ? '50%' : '2px',
                              backgroundColor: shape.color || '#D90429',
                              border: '1px solid rgba(0,0,0,0.15)',
                            }}
                          />
                          <span style={{ fontWeight: isSelected ? 600 : 400, color: '#0F172A' }}>
                            {labelMap[shape.type] || `Şekil ${index + 1}`}
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSelectedShape(shape.id);
                            }}
                            title="Bu şekli sil"
                            style={{ color: '#EF4444', fontWeight: 'bold', marginLeft: '2px', padding: '0 2px' }}
                          >
                            &times;
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seçili Şekil Ayarları */}
              {selectedShape && (
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Shapes size={12} color="#D90429" />
                      <span>Seçili Şekil Ayarları</span>
                    </span>
                    <button
                      type="button"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 4px',
                      }}
                      onClick={() => handleDeleteSelectedShape(selectedShape.id)}
                      title="Şekli Sil"
                    >
                      <Trash2 size={12} />
                      <span>Sil</span>
                    </button>
                  </div>

                  {/* Şekil Rengi */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '4px' }}>
                      <span>Şekil Rengi</span>
                      <span style={{ fontFamily: 'monospace' }}>{(selectedShape.color || '#D90429').toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {PALETTE_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          style={{
                            backgroundColor: color,
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: (selectedShape.color || '').toLowerCase() === color.toLowerCase() ? '2px solid #0F172A' : '1px solid #CBD5E1',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          onClick={() => handleUpdateSelectedShape({ color })}
                        />
                      ))}
                      <input
                        type="color"
                        value={selectedShape.color?.startsWith('#') && selectedShape.color.length === 7 ? selectedShape.color : '#D90429'}
                        style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #CBD5E1', padding: 0, cursor: 'pointer' }}
                        onChange={(e) => handleUpdateSelectedShape({ color: e.target.value })}
                        title="Özel Renk"
                      />
                    </div>
                  </div>

                  {/* Genişlik & Yükseklik */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Genişlik</span>
                        <span style={{ fontFamily: 'monospace' }}>{selectedShape.width}px</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={800}
                        step={5}
                        value={selectedShape.width}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSelectedShape({
                            width: val,
                            ...(selectedShape.type === 'circle' ? { height: val } : {}),
                          });
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                    {selectedShape.type !== 'circle' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                          <span>Yükseklik</span>
                          <span style={{ fontFamily: 'monospace' }}>{selectedShape.height}px</span>
                        </div>
                        <input
                          type="range"
                          min={30}
                          max={800}
                          step={5}
                          value={selectedShape.height}
                          onChange={(e) => handleUpdateSelectedShape({ height: Number(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Opaklık & Döndürme */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Opaklık</span>
                        <span style={{ fontFamily: 'monospace' }}>{selectedShape.opacity ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={selectedShape.opacity ?? 100}
                        onChange={(e) => handleUpdateSelectedShape({ opacity: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Döndürme</span>
                        <span style={{ fontFamily: 'monospace' }}>{selectedShape.rotation ?? 0}°</span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={5}
                        value={selectedShape.rotation ?? 0}
                        onChange={(e) => handleUpdateSelectedShape({ rotation: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Köşe Yuvarlama (Dikdörtgen için) */}
                  {(selectedShape.type === 'rectangle' || selectedShape.type === 'rounded-rectangle') && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Köşe Yuvarlama</span>
                        <span style={{ fontFamily: 'monospace' }}>{selectedShape.borderRadius ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={2}
                        value={selectedShape.borderRadius ?? 0}
                        onChange={(e) => handleUpdateSelectedShape({ borderRadius: Number(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
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
            {/* Devices on Screen & Add Device Button */}
            <div id="section-banner-devices" className="inspector-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                  Ekrandaki Cihazlar ({enabledDevices.length})
                </label>
                {enabledDevices.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddDevice}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      backgroundColor: '#D90429',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(217, 4, 41, 0.25)',
                    }}
                  >
                    <Plus size={12} color="#FFFFFF" />
                    <span>Cihaz Ekle</span>
                  </button>
                )}
              </div>

              {enabledDevices.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Henüz bir cihaz bulunmuyor.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {enabledDevices.map((dev) => {
                    const isSelected = selectedDevice?.id === dev.id;
                    const modelInfo = DEVICE_MODELS.find((m) => m.id === dev.deviceType);
                    return (
                      <div
                        key={dev.id}
                        onClick={() =>
                          onChangeConfig({
                            selectedDeviceId: dev.id,
                            selectedShapeId: null,
                            selectedElementId: null,
                            selectedTextId: null,
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Smartphone size={16} color={isSelected ? '#0F172A' : '#64748B'} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                              Cihaz {enabledDevices.findIndex((d) => d.id === dev.id) + 1}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                              {modelInfo?.name || dev.deviceType}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveDevice(dev.id);
                            }}
                            title="Cihazı Kaldır"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {enabledDevices.length > 0 && (
              <>

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
                      const modelInfo = PHONE_MODELS.find((m) => m.id === newType);
                      handleUpdateDevice(selectedDevice.id, {
                        deviceType: newType,
                        deviceColor: modelInfo?.colors[0]?.id || 'default',
                      });
                    }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  >
                    {PHONE_MODELS.map((m) => (
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

                {/* Shadow Depth */}
                <div className="inspector-section">
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Gölge Derinliği
                  </label>
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
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: METİN & TİPOGRAFİ                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'text' && (
          <div id="section-banner-text-layers" className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header with "+ Metin Ekle" button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Metin Katmanları
                </span>
                <span style={{ fontSize: '10px', backgroundColor: '#F1F5F9', color: '#64748B', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                  {textLayers.length}
                </span>
              </div>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFFFFF',
                  backgroundColor: '#D90429',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(217, 4, 41, 0.25)',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={handleAddTextLayer}
                title="Banner'a yeni metin katmanı ekle"
              >
                <Plus size={12} />
                <span>Metin Ekle</span>
              </button>
            </div>

            {/* Text Layers Selector Chips */}
            {textLayers.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {textLayers.map((layer, index) => {
                    const isSelected = selectedTextLayer?.id === layer.id;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        className={`layer-chip-btn ${isSelected ? 'active' : ''}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: isSelected ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#334155',
                          fontSize: '11px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 1px 4px rgba(217, 4, 41, 0.3)' : 'none',
                          flexShrink: 0,
                        }}
                        onClick={() => {
                          onChangeConfig({
                            selectedTextId: layer.id,
                            selectedDeviceId: null,
                            selectedShapeId: null,
                            selectedElementId: null,
                          });
                        }}
                      >
                        <Type size={11} color={isSelected ? '#FFFFFF' : '#64748B'} />
                        <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? '#FFFFFF' : '#334155' }}>
                          {layer.text.trim() ? layer.text : `Metin ${index + 1}`}
                        </span>
                        {textLayers.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTextLayer(layer.id);
                            }}
                            title="Bu metni sil"
                            style={{
                              marginLeft: '2px',
                              color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#94A3B8',
                              fontWeight: 700,
                              fontSize: '13px',
                              lineHeight: 1,
                              cursor: 'pointer',
                              padding: '0 2px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = isSelected ? 'rgba(255, 255, 255, 0.8)' : '#94A3B8')}
                          >
                            ×
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedTextLayer ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Text Input */}
                    <div className="control-group">
                      <div className="control-label" style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Metin İçeriği
                      </div>
                      <textarea
                        rows={3}
                        className="input-field"
                        dir="ltr"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          lineHeight: 1.4,
                          direction: 'ltr',
                        }}
                        value={selectedTextLayer.text}
                        onChange={(e) => handleUpdateTextLayer({ text: e.target.value })}
                        placeholder="Görselde görünecek metni yazın..."
                      />
                    </div>

                    {/* Word Format Ribbon */}
                    <div className="control-group">
                      <div className="control-label" style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Biçimlendirme
                      </div>
                      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
                        <button
                          type="button"
                          title="Kalın (Bold)"
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: selectedTextLayer.isBold ? '#D90429' : 'transparent',
                            color: selectedTextLayer.isBold ? '#FFFFFF' : '#475569',
                            boxShadow: selectedTextLayer.isBold ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateTextLayer({ isBold: !selectedTextLayer.isBold })}
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          title="İtalik (Italic)"
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: selectedTextLayer.isItalic ? '#D90429' : 'transparent',
                            color: selectedTextLayer.isItalic ? '#FFFFFF' : '#475569',
                            boxShadow: selectedTextLayer.isItalic ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateTextLayer({ isItalic: !selectedTextLayer.isItalic })}
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          title="Altı Çizili (Underline)"
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: selectedTextLayer.isUnderline ? '#D90429' : 'transparent',
                            color: selectedTextLayer.isUnderline ? '#FFFFFF' : '#475569',
                            boxShadow: selectedTextLayer.isUnderline ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateTextLayer({ isUnderline: !selectedTextLayer.isUnderline })}
                        >
                          <Underline size={14} />
                        </button>

                        <div style={{ width: '1px', backgroundColor: '#CBD5E1', margin: '2px 2px' }} />

                        <button
                          type="button"
                          title="Sola Hizala"
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: selectedTextLayer.textAlign === 'left' ? '#D90429' : 'transparent',
                            color: selectedTextLayer.textAlign === 'left' ? '#FFFFFF' : '#475569',
                            boxShadow: selectedTextLayer.textAlign === 'left' ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateTextLayer({ textAlign: 'left' })}
                        >
                          <AlignLeft size={14} />
                        </button>
                        <button
                          type="button"
                          title="Ortala"
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: (!selectedTextLayer.textAlign || selectedTextLayer.textAlign === 'center') ? '#D90429' : 'transparent',
                            color: (!selectedTextLayer.textAlign || selectedTextLayer.textAlign === 'center') ? '#FFFFFF' : '#475569',
                            boxShadow: (!selectedTextLayer.textAlign || selectedTextLayer.textAlign === 'center') ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateTextLayer({ textAlign: 'center' })}
                        >
                          <AlignCenter size={14} />
                        </button>
                        <button
                          type="button"
                          title="Sağa Hizala"
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: selectedTextLayer.textAlign === 'right' ? '#D90429' : 'transparent',
                            color: selectedTextLayer.textAlign === 'right' ? '#FFFFFF' : '#475569',
                            boxShadow: selectedTextLayer.textAlign === 'right' ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleUpdateTextLayer({ textAlign: 'right' })}
                        >
                          <AlignRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Yazı Tipi Ailesi */}
                    <div className="control-group">
                      <div className="control-label" style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Yazı Tipi
                      </div>
                      <select
                        className="select-field"
                        value={selectedTextLayer.fontFamily || 'outfit'}
                        onChange={(e) => handleUpdateTextLayer({ fontFamily: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                      >
                        {FONTS.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Metin Boyutu (Punto) */}
                    <div className="control-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        <span>Metin Boyutu</span>
                        <span style={{ fontFamily: 'monospace', color: '#D90429' }}>{selectedTextLayer.fontSize}px</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="range"
                          min="12"
                          max="96"
                          value={selectedTextLayer.fontSize}
                          onChange={(e) => handleUpdateTextLayer({ fontSize: Number(e.target.value) })}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="stepper-mini-btn"
                          title="Varsayılana Sıfırla (28px)"
                          onClick={() => handleUpdateTextLayer({ fontSize: 28 })}
                          style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                        >
                          28
                        </button>
                      </div>
                    </div>

                    {/* Satır Aralığı */}
                    <div className="control-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        <span>Satır Aralığı</span>
                        <span style={{ fontFamily: 'monospace', color: '#64748B' }}>
                          {selectedTextLayer.lineHeight !== undefined ? selectedTextLayer.lineHeight : 1.2}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="range"
                          min="0.8"
                          max="3.0"
                          step="0.05"
                          value={selectedTextLayer.lineHeight !== undefined ? selectedTextLayer.lineHeight : 1.2}
                          onChange={(e) => handleUpdateTextLayer({ lineHeight: Number(parseFloat(e.target.value).toFixed(2)) })}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="stepper-mini-btn"
                          title="Varsayılana Sıfırla (1.2)"
                          onClick={() => handleUpdateTextLayer({ lineHeight: 1.2 })}
                          style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                        >
                          1.2
                        </button>
                      </div>
                    </div>

                    {/* Metin Rengi */}
                    <div className="control-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        <span>Metin Rengi</span>
                        <span style={{ fontFamily: 'monospace', color: '#64748B' }}>{selectedTextLayer.color?.toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                        {PALETTE_PRESETS.map((color) => {
                          const isColorSelected = selectedTextLayer.color?.toLowerCase() === color.toLowerCase();
                          return (
                            <button
                              key={color}
                              type="button"
                              title={color}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                border: isColorSelected ? '2px solid #D90429' : '1px solid rgba(0,0,0,0.15)',
                                boxShadow: isColorSelected ? '0 0 0 2px rgba(217, 4, 41, 0.25)' : 'none',
                                cursor: 'pointer',
                                padding: 0,
                                flexShrink: 0,
                              }}
                              onClick={() => handleUpdateTextLayer({ color })}
                            />
                          );
                        })}

                        {/* Custom Color Pipette */}
                        <div
                          title="Özel Metin Rengi Seç"
                          style={{
                            position: 'relative',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: selectedTextLayer.color,
                            border: '1px solid rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Pipette size={11} color="#FFFFFF" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))', pointerEvents: 'none' }} />
                          <input
                            type="color"
                            value={selectedTextLayer.color?.startsWith('#') && selectedTextLayer.color.length === 7 ? selectedTextLayer.color : '#FFFFFF'}
                            onChange={(e) => handleUpdateTextLayer({ color: e.target.value })}
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
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Döndürme Açısı */}
                    <div className="control-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        <span>Döndürme Açısı</span>
                        <span style={{ fontFamily: 'monospace', color: '#64748B' }}>{selectedTextLayer.rotation || 0}°</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedTextLayer.rotation || 0}
                          onChange={(e) => handleUpdateTextLayer({ rotation: Number(e.target.value) })}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="stepper-mini-btn"
                          title="Döndürmeyi Sıfırla (0°)"
                          onClick={() => handleUpdateTextLayer({ rotation: 0 })}
                          style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                        >
                          0°
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          fontSize: '11px',
                          padding: '7px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          color: '#334155',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleUpdateTextLayer({ rotation: 0 })}
                      >
                        <Crosshair size={12} color="#D90429" />
                        <span>Açıyı Sıfırla (0°)</span>
                      </button>

                      {textLayers.length > 1 && (
                        <button
                          type="button"
                          style={{
                            fontSize: '11px',
                            padding: '7px 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            backgroundColor: '#D90429',
                            border: '1px solid #D90429',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDeleteTextLayer(selectedTextLayer.id)}
                          title="Bu metni sil"
                        >
                          <Trash2 size={12} color="#FFFFFF" />
                          <span style={{ color: '#FFFFFF' }}>Sil</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>
                  Henüz bir metin katmanı bulunmuyor.
                </p>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#FFFFFF',
                    backgroundColor: '#D90429',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={handleAddTextLayer}
                >
                  <Plus size={13} />
                  <span>İlk Metni Ekle</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MARKA & ROZETLER                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="inspector-tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* App Icon Badge */}
            <div id="section-banner-app-icon" className="inspector-section">
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

                  {/* Corner Rounding Slider */}
                  <div>
                    {(() => {
                      const currentRadius =
                        typeof config.appIconRadius === 'number'
                          ? config.appIconRadius
                          : config.appIconRadius === 'circle'
                          ? 50
                          : config.appIconRadius === 'round'
                          ? 22
                          : 22;

                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginBottom: '2px' }}>
                            <span>Köşe Yuvarlaklığı</span>
                            <span style={{ fontFamily: 'monospace', color: '#D90429', fontWeight: 600 }}>%{Math.round(currentRadius)}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={1}
                            value={currentRadius}
                            onChange={(e) => onChangeConfig({ appIconRadius: Number(e.target.value) })}
                            style={{ width: '100%', accentColor: '#D90429' }}
                          />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Eyebrow Pill Tag */}
            <div id="section-banner-eyebrow" className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B' }}>Yazı:</span>
                      <input
                        type="color"
                        value={config.eyebrowColor}
                        onChange={(e) => onChangeConfig({ eyebrowColor: e.target.value })}
                        style={{ width: '22px', height: '22px', padding: 0, borderRadius: '4px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748B' }}>{config.eyebrowColor}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B' }}>Etiket:</span>
                      <input
                        type="color"
                        value={config.eyebrowBgColor?.startsWith('#') ? config.eyebrowBgColor : '#D90429'}
                        onChange={(e) => onChangeConfig({ eyebrowBgColor: e.target.value })}
                        style={{ width: '22px', height: '22px', padding: 0, borderRadius: '4px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748B' }}>{config.eyebrowBgColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Store Badges */}
            <div id="section-banner-store-badges" className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Mağaza Rozetleri</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {(() => {
                  const isGooglePlayActive = config.showStoreBadge && (config.storeBadgeType === 'google-play' || config.storeBadgeType === 'both');
                  const isAppStoreActive = config.showStoreBadge && (config.storeBadgeType === 'app-store' || config.storeBadgeType === 'both');

                  const handleToggle = (type: 'google-play' | 'app-store') => {
                    if (type === 'google-play') {
                      if (isGooglePlayActive) {
                        if (isAppStoreActive) {
                          onChangeConfig({ storeBadgeType: 'app-store', showStoreBadge: true });
                        } else {
                          onChangeConfig({ showStoreBadge: false });
                        }
                      } else {
                        onChangeConfig({
                          storeBadgeType: isAppStoreActive ? 'both' : 'google-play',
                          showStoreBadge: true,
                        });
                      }
                    } else {
                      if (isAppStoreActive) {
                        if (isGooglePlayActive) {
                          onChangeConfig({ storeBadgeType: 'google-play', showStoreBadge: true });
                        } else {
                          onChangeConfig({ showStoreBadge: false });
                        }
                      } else {
                        onChangeConfig({
                          storeBadgeType: isGooglePlayActive ? 'both' : 'app-store',
                          showStoreBadge: true,
                        });
                      }
                    }
                  };

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggle('google-play')}
                        style={{
                          flex: 1,
                          padding: '7px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: isGooglePlayActive ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                          backgroundColor: isGooglePlayActive ? '#D90429' : '#FFFFFF',
                          color: isGooglePlayActive ? '#FFFFFF' : '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                          boxShadow: isGooglePlayActive ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                        }}
                        title={isGooglePlayActive ? 'Google Play rozetini gizle' : 'Google Play rozetini göster'}
                      >
                        <svg width="13" height="14" viewBox="0 0 466 511.98" fillRule="evenodd" clipRule="evenodd" style={{ flexShrink: 0 }}>
                          <path fill={isGooglePlayActive ? '#FFFFFF' : '#EA4335'} d="M199.9 237.8 1.4 470.17c7.22 24.57 30.16 41.81 55.8 41.81 11.16 0 20.93-2.79 29.3-8.37l244.16-139.46L199.9 237.8z"/>
                          <path fill={isGooglePlayActive ? '#FFFFFF' : '#FBBC04'} d="m433.91 205.1-104.65-60-111.61 110.22 113.01 108.83 104.64-58.6c18.14-9.77 30.7-29.3 30.7-50.23-1.4-20.93-13.95-40.46-32.09-50.22z"/>
                          <path fill={isGooglePlayActive ? '#FFFFFF' : '#34A853'} d="M199.42 273.45 329.27 145.1 87.9 8.37C79.53 2.79 68.36 0 57.2 0 30.7 0 6.98 18.14 1.4 41.86l198.02 231.59z"/>
                          <path fill={isGooglePlayActive ? '#FFFFFF' : '#4285F4'} d="M1.39 41.86C0 46.04 0 51.63 0 57.2v397.64c0 5.57 0 9.76 1.4 15.34l216.27-214.86L1.39 41.86z"/>
                        </svg>
                        <span>Google Play</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle('app-store')}
                        style={{
                          flex: 1,
                          padding: '7px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: isAppStoreActive ? '1.5px solid #D90429' : '1px solid #CBD5E1',
                          backgroundColor: isAppStoreActive ? '#D90429' : '#FFFFFF',
                          color: isAppStoreActive ? '#FFFFFF' : '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                          boxShadow: isAppStoreActive ? '0 1px 3px rgba(217, 4, 41, 0.25)' : 'none',
                        }}
                        title={isAppStoreActive ? 'App Store rozetini gizle' : 'App Store rozetini göster'}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.02-1.77.9-2.8-.88.04-1.94.59-2.57 1.33-.56.64-.99 1.68-.86 2.69.97.08 1.93-.49 2.53-1.22z"/>
                        </svg>
                        <span>App Store</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Rating Badge */}
            <div id="section-banner-rating" className="inspector-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>Kullanıcı Puanı Rozeti</span>
                <input
                  type="checkbox"
                  checked={config.showRating}
                  onChange={(e) => onChangeConfig({ showRating: e.target.checked })}
                />
              </div>

              {config.showRating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Puan Metni</label>
                    <input
                      type="text"
                      className="input-field"
                      value={config.ratingText}
                      onChange={(e) => onChangeConfig({ ratingText: e.target.value })}
                      placeholder="Örn: 4.9 ★★★★★ (10K+ Oy)"
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>

                  {/* Renk Seçiciler: Yıldız, Metin, Kutucuk */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '4px' }}>
                    {/* Yıldız Rengi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={10} fill={config.ratingStarColor || '#F59E0B'} color={config.ratingStarColor || '#F59E0B'} />
                        Yıldız
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="color"
                          value={config.ratingStarColor || '#F59E0B'}
                          onChange={(e) => onChangeConfig({ ratingStarColor: e.target.value })}
                          style={{ width: '24px', height: '24px', padding: 0, borderRadius: '4px', border: '1px solid #CBD5E1', cursor: 'pointer', flexShrink: 0 }}
                          title="Yıldız Rengi"
                        />
                        <span style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {config.ratingStarColor || '#F59E0B'}
                        </span>
                      </div>
                    </div>

                    {/* Metin Rengi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B' }}>Metin</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="color"
                          value={config.ratingTextColor || '#F8FAFC'}
                          onChange={(e) => onChangeConfig({ ratingTextColor: e.target.value })}
                          style={{ width: '24px', height: '24px', padding: 0, borderRadius: '4px', border: '1px solid #CBD5E1', cursor: 'pointer', flexShrink: 0 }}
                          title="Metin Rengi"
                        />
                        <span style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {config.ratingTextColor || '#F8FAFC'}
                        </span>
                      </div>
                    </div>

                    {/* Kutucuk Rengi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B' }}>Kutucuk</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="color"
                          value={config.ratingBgColor?.startsWith('#') ? config.ratingBgColor : '#1E293B'}
                          onChange={(e) => onChangeConfig({ ratingBgColor: e.target.value })}
                          style={{ width: '24px', height: '24px', padding: 0, borderRadius: '4px', border: '1px solid #CBD5E1', cursor: 'pointer', flexShrink: 0 }}
                          title="Kutucuk Rengi"
                        />
                        <span style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {config.ratingBgColor?.startsWith('#') ? config.ratingBgColor : 'Cam'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hızlı Şablon Butonları */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeConfig({
                          ratingBgColor: 'rgba(255, 255, 255, 0.12)',
                          ratingTextColor: '#F8FAFC',
                          ratingStarColor: '#F59E0B',
                          ratingBorderColor: 'rgba(255, 255, 255, 0.18)',
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                      title="Şeffaf cam efektine sıfırla"
                    >
                      <RotateCcw size={10} />
                      Şeffaf Cam
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeConfig({
                          ratingBgColor: '#0F172A',
                          ratingTextColor: '#FFFFFF',
                          ratingStarColor: '#F59E0B',
                          ratingBorderColor: '#334155',
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #334155',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      Koyu Kutu
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeConfig({
                          ratingBgColor: '#FFFFFF',
                          ratingTextColor: '#0F172A',
                          ratingStarColor: '#F59E0B',
                          ratingBorderColor: '#E2E8F0',
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        cursor: 'pointer',
                      }}
                    >
                      Açık Kutu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
