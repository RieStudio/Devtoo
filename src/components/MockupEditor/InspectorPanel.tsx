import React, { useState, useRef } from 'react';
import type { MockupConfig, DeviceType, BackgroundType, DeviceBrand, TextLayer, CanvasDeviceItem } from '../../types/mockup';
import { getMockupDevices } from '../../types/mockup';
import { DEVICE_MODELS } from '../../constants/devices';
import { 
  Upload, 
  Trash2,
  Sliders,
  Smartphone,
  Check,
  Pipette,
  Crop,
  Move,
  Maximize2,
  Crosshair,
  Layers,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Plus,
  RotateCw
} from 'lucide-react';

interface InspectorPanelProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>) => void;
  onFileSelect: (file: File) => void;
  onOpenCropModal: () => void;
}

const PALETTE_PRESETS = [
  '#0F172A', // Siyah
  '#FFFFFF', // Beyaz
  '#D90429', // Şili Kırmızısı
  '#3B82F6', // Mavi
  '#10B981', // Yeşil
  '#8B5CF6', // Mor
  '#F59E0B', // Turuncu
];

const TEXT_PALETTE_PRESETS = [
  '#0F172A', // Siyah
  '#FFFFFF', // Beyaz
  '#D90429', // Şili Kırmızısı
  '#3B82F6', // Mavi
  '#10B981', // Yeşil
  '#8B5CF6', // Mor
  '#F59E0B', // Turuncu
];

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  config,
  onChangeConfig,
  onFileSelect,
  onOpenCropModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerInputRef = useRef<HTMLInputElement>(null);
  const textColorPickerInputRef = useRef<HTMLInputElement>(null);

  const isDeviceOnly = config.exportMode === 'device-only';

  // Multi-Device Management
  const devices = getMockupDevices(config);
  const activeDeviceId = config.selectedDeviceId || devices[0]?.id || 'device-primary';
  const activeDevice = devices.find((d) => d.id === activeDeviceId) || devices[0] || {
    id: 'device-primary',
    deviceType: config.deviceType,
    deviceColor: config.deviceColor || 'default',
    screenshotUrl: config.screenshotUrl,
    screenshotScale: config.screenshotScale ?? 1,
    screenshotOffsetX: config.screenshotOffsetX ?? 0,
    screenshotOffsetY: config.screenshotOffsetY ?? 0,
    deviceScale: config.deviceScale ?? 1,
    deviceOffsetX: config.deviceOffsetX ?? 0,
    deviceOffsetY: config.deviceOffsetY ?? 0,
    deviceRotation: config.deviceRotation ?? 0,
    shadowDepth: config.shadowDepth ?? 'medium',
  };

  // Helper to update specific active device and sync top-level if needed
  const handleUpdateActiveDevice = (updated: Partial<CanvasDeviceItem>) => {
    const updatedDevices = devices.map((d) => (d.id === activeDevice.id ? { ...d, ...updated } : d));
    const firstDev = updatedDevices[0];
    onChangeConfig({
      devices: updatedDevices,
      selectedDeviceId: activeDevice.id,
      // Sync legacy properties with primary/active device
      ...(activeDevice.id === firstDev.id ? updated : {}),
    });
  };

  // Add a new device to the current screen (maximum 6 devices)
  const handleAddDevice = () => {
    if (devices.length >= 6) {
      alert('Bir ekrana en fazla 6 cihaz ekleyebilirsiniz.');
      return;
    }

    const newId = `device-${Date.now()}`;
    const lastDevice = devices[devices.length - 1];

    const baseOffsetX = lastDevice ? (lastDevice.deviceOffsetX ?? 0) + 36 : 0;
    const baseOffsetY = lastDevice ? (lastDevice.deviceOffsetY ?? 60) + 36 : 60;
    const baseScale = lastDevice ? (lastDevice.deviceScale ?? 1) : 1;

    const newDevice: CanvasDeviceItem = {
      id: newId,
      deviceType: lastDevice ? lastDevice.deviceType : 'iphone-17-pro-max',
      deviceColor: 'default',
      screenshotUrl: null,
      screenshotScale: 1,
      screenshotOffsetX: 0,
      screenshotOffsetY: 0,
      deviceScale: baseScale,
      deviceOffsetX: baseOffsetX,
      deviceOffsetY: baseOffsetY,
      deviceRotation: 0,
      shadowDepth: 'medium',
      borderRadius: 24,
    };

    const nextDevices = [...devices, newDevice];
    onChangeConfig({
      devices: nextDevices,
      selectedDeviceId: newId,
    });
  };

  // Remove a device from current screen (can remove all devices)
  const handleDeleteDevice = (deviceId: string) => {
    const remaining = devices.filter((d) => d.id !== deviceId);
    const nextSelectedId = remaining[0]?.id || null;
    onChangeConfig({
      devices: remaining,
      selectedDeviceId: nextSelectedId,
      ...(remaining[0] ? {
        deviceType: remaining[0].deviceType,
        deviceColor: remaining[0].deviceColor,
        screenshotUrl: remaining[0].screenshotUrl,
        screenshotScale: remaining[0].screenshotScale,
        screenshotOffsetX: remaining[0].screenshotOffsetX,
        screenshotOffsetY: remaining[0].screenshotOffsetY,
        deviceScale: remaining[0].deviceScale,
        deviceOffsetX: remaining[0].deviceOffsetX,
        deviceOffsetY: remaining[0].deviceOffsetY,
        deviceRotation: remaining[0].deviceRotation,
      } : {
        screenshotUrl: null,
        originalScreenshotUrl: null,
        cropData: null,
      }),
    });
  };

  // Active Brand tab state ('apple', 'samsung', 'google', 'other')
  const currentDeviceModel = DEVICE_MODELS.find((m) => m.id === activeDevice.deviceType) || DEVICE_MODELS[0];
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand>(currentDeviceModel.brand);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.target) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Filter models for selected brand tab
  const brandModels = DEVICE_MODELS.filter((m) => m.brand === selectedBrand);

  const handleSelectModel = (modelId: DeviceType) => {
    const modelDef = DEVICE_MODELS.find((m) => m.id === modelId);
    const defaultColor = modelDef?.colors[0].id || 'default';
    handleUpdateActiveDevice({
      deviceType: modelId,
      deviceColor: defaultColor,
    });
  };

  const selectedLayer = (config.textLayers || []).find((l) => l.id === config.selectedTextId) || null;

  const handleAddTextLayer = () => {
    const newId = `layer-${Date.now()}`;
    const layers = config.textLayers || [];
    const lastLayer = layers[layers.length - 1];

    const baseOffsetX = lastLayer ? (lastLayer.x || 0) + 20 : 0;
    const baseOffsetY = lastLayer ? (lastLayer.y || 0) + 32 : 0;

    const newLayer: TextLayer = {
      id: newId,
      text: 'Yeni Metin',
      x: baseOffsetX,
      y: baseOffsetY,
      fontSize: 22,
      color: '#0F172A',
      fontFamily: 'sans',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
    };
    onChangeConfig({
      textLayers: [...layers, newLayer],
      selectedTextId: newId,
      selectedTextIds: [newId],
    });
  };

  const selectedLayerIds = (config.selectedTextIds && config.selectedTextIds.length > 0)
    ? config.selectedTextIds
    : config.selectedTextId
    ? [config.selectedTextId]
    : [];

  const handleUpdateSelectedLayer = (updated: Partial<TextLayer>) => {
    if (!selectedLayer && selectedLayerIds.length === 0) return;
    const targetIds = selectedLayerIds.length > 0 ? selectedLayerIds : (selectedLayer ? [selectedLayer.id] : []);
    if (targetIds.length === 0) return;
    
    onChangeConfig({
      textLayers: (config.textLayers || []).map((l) =>
        targetIds.includes(l.id) ? { ...l, ...updated } : l
      ),
    });
  };

  const handleDeleteSelectedLayer = (layerId: string) => {
    const remaining = (config.textLayers || []).filter((l) => l.id !== layerId);
    onChangeConfig({
      textLayers: remaining,
      selectedTextId: remaining.length > 0 ? remaining[0].id : null,
      selectedTextIds: remaining.length > 0 ? [remaining[0].id] : [],
    });
  };

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="#D90429" />
          <span>Tasarım Özellikleri</span>
        </div>
      </div>

      {/* Section 0: Export Mode Selector (Full Visual vs Only Device) */}
      <div className="inspector-section">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} color="#D90429" />
          <span>Çıktı Modu</span>
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F3F5', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            className={`export-mode-tab ${!isDeviceOnly ? 'active' : ''}`}
            onClick={() => onChangeConfig({ exportMode: 'full-canvas' })}
          >
            <ImageIcon size={13} />
            <span>Tam Görsel</span>
          </button>
          <button
            type="button"
            className={`export-mode-tab ${isDeviceOnly ? 'active' : ''}`}
            onClick={() => onChangeConfig({ exportMode: 'device-only' })}
          >
            <Smartphone size={13} />
            <span>Sadece Cihaz</span>
          </button>
        </div>
      </div>

      {/* Section 0.5: Multi-Device Management (Add / Switch Devices) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
              <Smartphone size={13} color="#D90429" />
              <span>Cihazlar ({devices.length})</span>
            </div>
            <button
              type="button"
              className="btn-text-action"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: devices.length >= 6 ? '#94A3B8' : '#FFFFFF',
                backgroundColor: devices.length >= 6 ? '#F1F5F9' : '#0F172A',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 9px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: devices.length >= 6 ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              onClick={handleAddDevice}
              disabled={devices.length >= 6}
              title={devices.length >= 6 ? 'Maksimum 6 cihaza ulaşıldı' : 'Bu ekrana yeni bir cihaz ekleyin'}
            >
              <Plus size={12} />
              <span>Cihaz Ekle {devices.length >= 6 ? '(Maks. 6)' : ''}</span>
            </button>
          </div>

          {/* Device Tabs / Chips List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devices.map((dev, idx) => {
              const isSelected = dev.id === activeDevice.id;
              const devModel = DEVICE_MODELS.find((m) => m.id === dev.deviceType) || DEVICE_MODELS[0];
              return (
                <div
                  key={dev.id}
                  onClick={() => onChangeConfig({ selectedDeviceId: dev.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #D90429' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#D90429' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#1E293B',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={15} color={isSelected ? '#FFFFFF' : '#64748B'} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#FFFFFF' : '#1E293B' }}>
                        Cihaz {idx + 1}: {devModel.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#64748B' }}>
                        {dev.screenshotUrl ? 'Görsel yüklendi' : 'Görsel yok'} • {dev.deviceRotation ?? 0}°
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isSelected ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          padding: '2px 4px 2px 6px',
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#D90429' }}>
                          Seçili
                        </span>
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#D90429',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            opacity: 0.85,
                            transition: 'opacity 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDevice(dev.id);
                          }}
                          title="Bu cihazı kaldır"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#D90429')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDevice(dev.id);
                        }}
                        title="Bu cihazı kaldır"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {devices.length === 0 && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1.5px dashed #CBD5E1',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                  Bu ekranda henüz cihaz yok.
                </div>
                <button
                  type="button"
                  onClick={handleAddDevice}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  <span>Cihaz Ekle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 1: Screenshot Upload (Applies to active device) */}
      {devices.length > 0 && (
        <div className="inspector-section">
          <div className="section-label">
            <span>Ekran Görüntüsü</span>
            {devices.length > 1 && (
              <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748B', marginLeft: '6px' }}>
                ({DEVICE_MODELS.find((m) => m.id === activeDevice.deviceType)?.name})
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          <div
            className="dropzone-box"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload size={20} className="dropzone-icon" />
            <div className="dropzone-text">Görsel Yükle veya Sürükle</div>
            <div className="dropzone-sub">PNG, JPG, WebP desteklenir</div>
          </div>

          {activeDevice.screenshotUrl && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={onOpenCropModal}
              >
                <Crop size={14} color="#D90429" />
                <span>Görseli Kırp</span>
              </button>

              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: '#D90429' }}
                onClick={() => handleUpdateActiveDevice({ screenshotUrl: null, screenshotScale: 1, screenshotOffsetX: 0, screenshotOffsetY: 0 })}
              >
                <Trash2 size={14} />
                <span>Görseli Kaldır</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Categorized Device Selector (Apple, Samsung, Google, Other) */}
      {devices.length > 0 && (
        <div className="inspector-section">
          <div className="section-label">
            <span>Cihaz Modeli</span>
            {devices.length > 1 && (
              <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748B', marginLeft: '6px' }}>
                (Seçili Cihaz)
              </span>
            )}
          </div>

          {/* Brand Tabs */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F3F5', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'apple', label: 'Apple' },
              { id: 'samsung', label: 'Samsung' },
              { id: 'google', label: 'Google' },
            ].map((tab) => {
              const isTabActive = selectedBrand === tab.id;
              return (
                <button
                  key={tab.id}
                  style={{
                    flex: 1,
                    padding: '6px 2px',
                    fontSize: '11px',
                    fontWeight: isTabActive ? 700 : 500,
                    borderRadius: '6px',
                    border: isTabActive ? '1px solid #D90429' : '1px solid transparent',
                    backgroundColor: isTabActive ? '#D90429' : 'transparent',
                    color: isTabActive ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setSelectedBrand(tab.id as DeviceBrand)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Model Cards List for Active Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {brandModels.map((model) => {
              const isSelected = activeDevice.deviceType === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #D90429' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={16} color={isSelected ? '#FFFFFF' : '#64748B'} />
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#FFFFFF' : '#0F172A' }}>
                      {model.name}
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="#FFFFFF" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Canvas Background (Only in Full Visual Mode) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div className="section-label">Arka Plan (Canvas)</div>
          <div className="control-group">
            <div className="control-label">Desen / Doku</div>
            <select
              className="input-select"
              value={config.bgType}
              onChange={(e) => onChangeConfig({ bgType: e.target.value as BackgroundType })}
            >
              <option value="solid">Düz Renk</option>
              <option value="dots">Noktalı Izgara (Dot Matrix)</option>
              <option value="grid">Kare Izgara (Dev Grid)</option>
            </select>
          </div>

          <div className="control-group">
            <div className="control-label">
              <span>Renk Seçimi</span>
              <span className="control-value">{config.bgColor.toUpperCase()}</span>
            </div>
            
            {/* Tek Satırda Hazır Renkler ve Özel Renk Paleti Butonu */}
            <div className="color-picker-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {PALETTE_PRESETS.map((color) => (
                <button
                  key={color}
                  title={color}
                  className={`color-swatch-btn ${config.bgColor.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onChangeConfig({ bgColor: color })}
                />
              ))}

              {/* Gizli native color input */}
              <input
                ref={colorPickerInputRef}
                type="color"
                value={config.bgColor.startsWith('#') && config.bgColor.length === 7 ? config.bgColor : '#D90429'}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                onChange={(e) => onChangeConfig({ bgColor: e.target.value })}
              />

              {/* Renk Paleti Açma Butonu */}
              <button
                type="button"
                title="Özel Arka Plan Rengini Aç"
                className={`color-swatch-btn custom-palette-btn ${
                  !PALETTE_PRESETS.includes(config.bgColor.toUpperCase()) ? 'selected' : ''
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: !PALETTE_PRESETS.includes(config.bgColor.toUpperCase())
                    ? config.bgColor 
                    : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                  color: !PALETTE_PRESETS.includes(config.bgColor.toUpperCase()) ? '#FFFFFF' : '#334155',
                }}
                onClick={() => colorPickerInputRef.current?.click()}
              >
                <Pipette size={14} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))', color: '#FFFFFF' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Device Transform (Position & Scale) - Only in Full Canvas Mode */}
      {!isDeviceOnly && devices.length > 0 && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Move size={13} color="#D90429" />
              <span>Cihaz Konumu ve Boyutu</span>
            </div>
            {((activeDevice.deviceOffsetX ?? 0) !== 0 || (activeDevice.deviceOffsetY ?? 0) !== 0 || ((activeDevice.deviceScale ?? 1) !== 1) || ((activeDevice.deviceRotation ?? 0) !== 0)) && (
              <button
                className="btn-text-action"
                title="Konum ve Boyutu Sıfırla"
                onClick={() => handleUpdateActiveDevice({ deviceOffsetX: 0, deviceOffsetY: 0, deviceScale: 1, deviceRotation: 0 })}
              >
                Sıfırla
              </button>
            )}
          </div>

          {/* Device Scale Slider */}
          <div className="control-group">
            <div className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Maximize2 size={13} color="#64748B" />
                <span>Cihaz Boyutu</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>%</span>
                <input
                  type="number"
                  min="35"
                  max="220"
                  value={Math.round((activeDevice.deviceScale ?? 1) * 100)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) {
                      handleUpdateActiveDevice({ deviceScale: Math.max(0.35, Math.min(2.2, val / 100)) });
                    }
                  }}
                  style={{
                    width: '46px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'right',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <input
              type="range"
              min="0.35"
              max="2.2"
              step="0.01"
              value={activeDevice.deviceScale ?? 1}
              onChange={(e) => handleUpdateActiveDevice({ deviceScale: Number(e.target.value) })}
            />
          </div>

          {/* Device Horizontal Position (X) */}
          <div className="control-group">
            <div className="control-label">
              <span>Yatay Konum (X)</span>
              <span className="control-value">
                {(activeDevice.deviceOffsetX ?? 0) > 0 ? `+${activeDevice.deviceOffsetX}` : (activeDevice.deviceOffsetX ?? 0)}px
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="-350"
                max="350"
                value={activeDevice.deviceOffsetX ?? 0}
                onChange={(e) => handleUpdateActiveDevice({ deviceOffsetX: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button
                className="stepper-mini-btn"
                title="X Sıfırla (0px)"
                onClick={() => handleUpdateActiveDevice({ deviceOffsetX: 0 })}
              >
                0
              </button>
            </div>
          </div>

          {/* Device Vertical Position (Y) */}
          <div className="control-group">
            <div className="control-label">
              <span>Dikey Konum (Y)</span>
              <span className="control-value">
                {(activeDevice.deviceOffsetY ?? 0) > 0 ? `+${activeDevice.deviceOffsetY}` : (activeDevice.deviceOffsetY ?? 0)}px
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="-450"
                max="450"
                value={activeDevice.deviceOffsetY ?? 0}
                onChange={(e) => handleUpdateActiveDevice({ deviceOffsetY: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button
                className="stepper-mini-btn"
                title="Y Sıfırla (0px)"
                onClick={() => handleUpdateActiveDevice({ deviceOffsetY: 0 })}
              >
                0
              </button>
            </div>
          </div>

          {/* Device Rotation */}
          <div className="control-group">
            <div className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RotateCw size={13} color="#64748B" />
                <span>Cihaz Döndürme</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={activeDevice.deviceRotation ?? 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) {
                      handleUpdateActiveDevice({ deviceRotation: Math.max(-180, Math.min(180, val)) });
                    }
                  }}
                  style={{
                    width: '46px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'right',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>°</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="-180"
                max="180"
                value={activeDevice.deviceRotation ?? 0}
                onChange={(e) => handleUpdateActiveDevice({ deviceRotation: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button
                className="stepper-mini-btn"
                title="Döndürmeyi Sıfırla (0°)"
                onClick={() => handleUpdateActiveDevice({ deviceRotation: 0 })}
              >
                0°
              </button>
            </div>
          </div>

          {/* Quick alignment button */}
          <div style={{ marginTop: '2px' }}>
            <button
              className="btn-secondary"
              style={{ width: '100%', fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
              onClick={() => handleUpdateActiveDevice({ deviceOffsetX: 0, deviceOffsetY: 0, deviceRotation: 0 })}
            >
              <Crosshair size={12} color="#D90429" />
              <span>Merkeze ve Düz Konuma Getir</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 5: Shadow & Effects (Only in Full Canvas Mode) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div className="section-label">Gölge Efekti</div>

          <div className="control-group">
            <select
              className="input-select"
              value={activeDevice.shadowDepth || config.shadowDepth || 'medium'}
              onChange={(e) => handleUpdateActiveDevice({ shadowDepth: e.target.value as any })}
            >
              <option value="none">Gölge Yok</option>
              <option value="soft">Yumuşak Gölge</option>
              <option value="medium">Standart Gölge</option>
              <option value="dramatic">Derin Mağaza Gölgesi</option>
              <option value="chili-glow">Vurgulu Gölge</option>
            </select>
          </div>
        </div>
      )}

      {/* Section 6: Multi-Text Layers & Typography (Only in Full Visual Mode) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', fontSize: '11.5px', margin: 0 }}>
              <Type size={13} color="#D90429" />
              <span>Metin Katmanları</span>
            </div>
            <button
              type="button"
              className="btn-text-action"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                color: '#FFFFFF',
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '5px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onClick={handleAddTextLayer}
              title="Görsele yeni metin katmanı ekle"
            >
              <Plus size={11} />
              <span>Metin Ekle</span>
            </button>
          </div>

          {/* Text Layers Selector Chips */}
          {(config.textLayers || []).length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
                {(config.textLayers || []).map((layer, index) => {
                  const isSelected = selectedLayerIds.includes(layer.id);
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      className={`layer-chip-btn ${isSelected ? 'active' : ''}`}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey || e.shiftKey) {
                          const nextIds = selectedLayerIds.includes(layer.id)
                            ? selectedLayerIds.filter((id) => id !== layer.id)
                            : [...selectedLayerIds, layer.id];
                          onChangeConfig({
                            selectedTextIds: nextIds,
                            selectedTextId: nextIds[0] || null,
                          });
                        } else {
                          onChangeConfig({
                            selectedTextId: layer.id,
                            selectedTextIds: [layer.id],
                          });
                        }
                      }}
                    >
                      <Type size={11} />
                      <span className="layer-chip-text">{layer.text.trim() ? layer.text : `Metin ${index + 1}`}</span>
                      {(config.textLayers || []).length > 1 && (
                        <span
                          className="layer-chip-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSelectedLayer(layer.id);
                          }}
                          title="Bu metni sil"
                        >
                          ×
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedLayer ? (
                <>
                  {/* Text Input */}
                  <div className="control-group">
                    <div className="control-label">Metin İçeriği</div>
                    <textarea
                      rows={2}
                      className="input-text"
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      value={selectedLayer.text}
                      onChange={(e) => handleUpdateSelectedLayer({ text: e.target.value })}
                      placeholder="Görselde görünecek metni yazın..."
                    />
                  </div>

                  {/* Word Format Ribbon */}
                  <div className="control-group">
                    <div className="control-label">Biçimlendirme</div>
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F3F5', padding: '4px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        title="Kalın (Bold)"
                        className={`format-ribbon-btn ${selectedLayer.isBold ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ isBold: !selectedLayer.isBold })}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        title="İtalik (Italic)"
                        className={`format-ribbon-btn ${selectedLayer.isItalic ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ isItalic: !selectedLayer.isItalic })}
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        title="Altı Çizili (Underline)"
                        className={`format-ribbon-btn ${selectedLayer.isUnderline ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ isUnderline: !selectedLayer.isUnderline })}
                      >
                        <Underline size={14} />
                      </button>

                      <div style={{ width: '1px', backgroundColor: '#CBD5E1', margin: '0 2px' }} />

                      <button
                        type="button"
                        title="Sola Hizala"
                        className={`format-ribbon-btn ${selectedLayer.textAlign === 'left' ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ textAlign: 'left' })}
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button
                        type="button"
                        title="Ortala"
                        className={`format-ribbon-btn ${(!selectedLayer.textAlign || selectedLayer.textAlign === 'center') ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ textAlign: 'center' })}
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button
                        type="button"
                        title="Sağa Hizala"
                        className={`format-ribbon-btn ${selectedLayer.textAlign === 'right' ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ textAlign: 'right' })}
                      >
                        <AlignRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Yazı Tipi Ailesi */}
                  <div className="control-group">
                    <div className="control-label">Yazı Tipi</div>
                    <select
                      className="input-select"
                      value={selectedLayer.fontFamily || 'inter'}
                      onChange={(e) => handleUpdateSelectedLayer({ fontFamily: e.target.value })}
                    >
                      <option value="inter">Inter</option>
                      <option value="outfit">Outfit</option>
                      <option value="poppins">Poppins</option>
                      <option value="montserrat">Montserrat</option>
                      <option value="plus-jakarta">Plus Jakarta Sans</option>
                      <option value="roboto">Roboto</option>
                      <option value="open-sans">Open Sans</option>
                      <option value="lato">Lato</option>
                      <option value="raleway">Raleway</option>
                      <option value="nunito">Nunito</option>
                      <option value="rubik">Rubik</option>
                      <option value="space-grotesk">Space Grotesk</option>
                      <option value="syne">Syne</option>
                      <option value="bebas-neue">Bebas Neue</option>
                      <option value="anton">Anton</option>
                      <option value="russo-one">Russo One</option>
                      <option value="orbitron">Orbitron</option>
                      <option value="quicksand">Quicksand</option>
                      <option value="comfortaa">Comfortaa</option>
                      <option value="playfair">Playfair Display</option>
                      <option value="lora">Lora</option>
                      <option value="cinzel">Cinzel</option>
                      <option value="jetbrains-mono">JetBrains Mono</option>
                      <option value="fira-code">Fira Code</option>
                      <option value="caveat">Caveat</option>
                      <option value="dancing-script">Dancing Script</option>
                      <option value="pacifico">Pacifico</option>
                      <option value="permanent-marker">Permanent Marker</option>
                    </select>
                  </div>

                  {/* Font Size Slider */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>Metin Boyutu</span>
                      <span className="control-value">{selectedLayer.fontSize}px</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="10"
                        max="64"
                        value={selectedLayer.fontSize}
                        onChange={(e) => handleUpdateSelectedLayer({ fontSize: Number(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="stepper-mini-btn"
                        title="Varsayılana Sıfırla (24px)"
                        onClick={() => handleUpdateSelectedLayer({ fontSize: 24 })}
                      >
                        24
                      </button>
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>Metin Rengi</span>
                      <span className="control-value">{selectedLayer.color.toUpperCase()}</span>
                    </div>
                    <div className="color-picker-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {TEXT_PALETTE_PRESETS.map((color) => (
                        <button
                          key={color}
                          title={color}
                          className={`color-swatch-btn ${selectedLayer.color.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleUpdateSelectedLayer({ color })}
                        />
                      ))}

                      <input
                        ref={textColorPickerInputRef}
                        type="color"
                        value={selectedLayer.color.startsWith('#') && selectedLayer.color.length === 7 ? selectedLayer.color : '#0F172A'}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                        onChange={(e) => handleUpdateSelectedLayer({ color: e.target.value })}
                      />

                      <button
                        type="button"
                        title="Özel Metin Rengini Aç"
                        className={`color-swatch-btn custom-palette-btn ${
                          !TEXT_PALETTE_PRESETS.includes(selectedLayer.color.toUpperCase()) ? 'selected' : ''
                        }`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: !TEXT_PALETTE_PRESETS.includes(selectedLayer.color.toUpperCase())
                            ? selectedLayer.color 
                            : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                          color: !TEXT_PALETTE_PRESETS.includes(selectedLayer.color.toUpperCase()) ? '#FFFFFF' : '#334155',
                        }}
                        onClick={() => textColorPickerInputRef.current?.click()}
                      >
                        <Pipette size={14} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))', color: '#FFFFFF' }} />
                      </button>
                    </div>
                  </div>

                  {/* Position X & Y Sliders */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>Yatay Konum (X)</span>
                      <span className="control-value">{selectedLayer.x > 0 ? `+${selectedLayer.x}` : selectedLayer.x}px</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="-250"
                        max="250"
                        value={selectedLayer.x}
                        onChange={(e) => handleUpdateSelectedLayer({ x: Number(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="stepper-mini-btn"
                        title="X Sıfırla (0px)"
                        onClick={() => handleUpdateSelectedLayer({ x: 0 })}
                      >
                        0
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <div className="control-label">
                      <span>Dikey Konum (Y)</span>
                      <span className="control-value">{selectedLayer.y > 0 ? `+${selectedLayer.y}` : selectedLayer.y}px</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="-350"
                        max="350"
                        value={selectedLayer.y}
                        onChange={(e) => handleUpdateSelectedLayer({ y: Number(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="stepper-mini-btn"
                        title="Y Sıfırla (0px)"
                        onClick={() => handleUpdateSelectedLayer({ y: 0 })}
                      >
                        0
                      </button>
                    </div>
                  </div>

                  {/* Rotation Slider */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>Döndürme Açısı</span>
                      <span className="control-value">{selectedLayer.rotation || 0}°</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedLayer.rotation || 0}
                        onChange={(e) => handleUpdateSelectedLayer({ rotation: Number(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="stepper-mini-btn"
                        title="Döndürmeyi Sıfırla (0°)"
                        onClick={() => handleUpdateSelectedLayer({ rotation: 0 })}
                      >
                        0°
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                      onClick={() => handleUpdateSelectedLayer({ x: 0, y: 0, rotation: 0, width: undefined })}
                    >
                      <Crosshair size={12} color="#D90429" />
                      <span>Merkeze Ortala (0, 0)</span>
                    </button>

                    {(config.textLayers || []).length > 1 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 10px', justifyContent: 'center', color: '#EF4444' }}
                        onClick={() => handleDeleteSelectedLayer(selectedLayer.id)}
                        title="Bu metni sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '8px',
                  color: '#64748B',
                  textAlign: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}>
                  <Type size={20} color="#94A3B8" />
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    Seçili Metin Yok
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', maxWidth: '200px', lineHeight: '1.4' }}>
                    Düzenlemek için görseldeki bir metne veya yukarıdaki metin çiplerine tıklayın.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#64748B' }}>
              Henüz metin eklenmemiş.
              <button
                type="button"
                className="btn-chili"
                style={{ width: '100%', marginTop: '8px', justifyContent: 'center', fontSize: '12px' }}
                onClick={handleAddTextLayer}
              >
                <Plus size={13} />
                <span>İlk Metni Ekle</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
