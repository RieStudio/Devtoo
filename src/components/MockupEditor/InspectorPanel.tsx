import React, { useState, useRef, useEffect } from 'react';
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
  RotateCw,
  RotateCcw,
  Laptop,
  Tablet,
  Tv,
  Watch,
  ChevronDown,
  Shapes,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Shield
} from 'lucide-react';
import type { ShapeLayer, ShapeType } from '../../types/mockup';
import { useLanguage } from '../../i18n/LanguageContext';

interface InspectorPanelProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>) => void;
  onFileSelect: (file: File) => void;
  onOpenCropModal: () => void;
  onShowToast?: (message: string) => void;
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

interface AppleVariant {
  id: DeviceType;
  name: string;
}

interface AppleFamily {
  id: string;
  name: string;
  variants: AppleVariant[];
}

const APPLE_FAMILIES: AppleFamily[] = [
  {
    id: 'iphone-18',
    name: 'iPhone 18',
    variants: [
      { id: 'iphone-18-pro-max', name: 'iPhone 18 Pro Max' },
      { id: 'iphone-18-pro', name: 'iPhone 18 Pro' },
    ],
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    variants: [
      { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max' },
      { id: 'iphone-17-pro', name: 'iPhone 17 Pro' },
      { id: 'iphone-17', name: 'iPhone 17' },
    ],
  },
  {
    id: 'iphone-duo',
    name: 'iPhone Duo',
    variants: [
      { id: 'iphone-duo', name: 'iPhone Duo (Açık Ekran)' },
      { id: 'iphone-duo-closed', name: 'iPhone Duo (Kapak Ekranı)' },
      { id: 'iphone-duo-outer-open', name: 'iPhone Duo (Dış Görünüm)' },
    ],
  },
];

interface NumericBadgeInputProps {
  value: number;
  min: number;
  max: number;
  fallbackValue?: number;
  onChange: (val: number) => void;
  style?: React.CSSProperties;
}

const NumericBadgeInput: React.FC<NumericBadgeInputProps> = ({
  value,
  min,
  max,
  fallbackValue,
  onChange,
  style,
}) => {
  const [localText, setLocalText] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalText(String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    // Only allow valid numeric characters (+, -, digits)
    if (min < 0) {
      if (!/^-?\d*$/.test(text)) return;
    } else {
      if (!/^\d*$/.test(text)) return;
    }

    setLocalText(text);

    if (text === '' || text === '-') {
      return;
    }

    const num = Number(text);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localText === '' || localText === '-' || isNaN(Number(localText))) {
      const fallback = fallbackValue ?? (min > 0 ? min : 0);
      setLocalText(String(fallback));
      onChange(fallback);
      return;
    }

    const num = Number(localText);
    const clamped = Math.max(min, Math.min(max, num));
    setLocalText(String(clamped));
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      value={isFocused ? localText : value}
      onFocus={(e) => {
        setIsFocused(true);
        setLocalText(String(value));
        e.target.select();
      }}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={{
        ...style,
        borderColor: isFocused ? '#D90429' : (style?.borderColor || '#CBD5E1'),
      }}
    />
  );
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  config,
  onChangeConfig,
  onFileSelect,
  onOpenCropModal,
  onShowToast,
}) => {
  const { t, language } = useLanguage();
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
      alert(t.toasts.maxDevicesReachedCanvas);
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

  // Remove a device from current screen (cannot remove in device-only mode)
  const handleDeleteDevice = (deviceId: string) => {
    if (isDeviceOnly) return;
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

  // Active device model definition
  const currentDeviceModel = DEVICE_MODELS.find((m) => m.id === activeDevice.deviceType) || DEVICE_MODELS[0];

  // Device category mapping: 'phone', 'pc', 'tab', 'tv', 'watch'
  type OtherCategory = 'pc' | 'tab' | 'tv' | 'watch';
  const initialCategory = currentDeviceModel.category === 'phone' ? 'phone' : (currentDeviceModel.category as OtherCategory || 'phone');
  const [selectedCategory, setSelectedCategory] = useState<'phone' | OtherCategory>(initialCategory);
  
  const categoryLabels: Record<OtherCategory, string> = {
    pc: t.mockup.pc,
    tab: t.mockup.tablet,
    tv: t.mockup.tv,
    watch: t.mockup.watch,
  };
  const [otherCategoryName, setOtherCategoryName] = useState<string>(
    initialCategory !== 'phone' ? categoryLabels[initialCategory as OtherCategory] : ''
  );

  // Active Brand tab state ('apple', 'samsung', 'google')
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand>(currentDeviceModel.brand);

  // Other Devices category popup state
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const otherPopoverRef = useRef<HTMLDivElement>(null);

  // Shape Picker popup state
  const [isShapePickerOpen, setIsShapePickerOpen] = useState(false);
  const shapePopoverRef = useRef<HTMLDivElement>(null);
  const shapeColorPickerInputRef = useRef<HTMLInputElement>(null);

  // Color / Variant dropdown state
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Apple Family accordion / dropdown state
  const [expandedAppleFamily, setExpandedAppleFamily] = useState<string | null>(null);

  // Keep selectedCategory in sync if activeDevice changes
  useEffect(() => {
    if (currentDeviceModel) {
      if (currentDeviceModel.category && currentDeviceModel.category !== 'phone') {
        setSelectedCategory(currentDeviceModel.category as OtherCategory);
        setOtherCategoryName(categoryLabels[currentDeviceModel.category as OtherCategory]);
      } else {
        setSelectedCategory('phone');
        setSelectedBrand(currentDeviceModel.brand);
      }
    }
  }, [activeDevice.deviceType]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (otherPopoverRef.current && !otherPopoverRef.current.contains(event.target as Node)) {
        setIsOtherOpen(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownOpen(false);
      }
      if (shapePopoverRef.current && !shapePopoverRef.current.contains(event.target as Node)) {
        setIsShapePickerOpen(false);
      }
    };
    if (isOtherOpen || isColorDropdownOpen || isShapePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOtherOpen, isColorDropdownOpen, isShapePickerOpen]);

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

  // Filter models for phone brands or selected other categories
  const brandModels = DEVICE_MODELS.filter((m) => (m.category || 'phone') === 'phone' && m.brand === selectedBrand);
  const categoryModels = DEVICE_MODELS.filter((m) => m.category === selectedCategory);

  const handleSelectModel = (modelId: DeviceType) => {
    const modelDef = DEVICE_MODELS.find((m) => m.id === modelId);
    const defaultColor = modelDef?.colors[0]?.id || 'default';
    handleUpdateActiveDevice({
      deviceType: modelId,
      deviceColor: defaultColor,
    });
  };

  const selectedLayer = (config.textLayers || []).find((l) => l.id === config.selectedTextId) || null;

  const handleAddTextLayer = () => {
    const layers = config.textLayers || [];
    if (layers.length >= 20) {
      const msg = language === 'tr' ? 'En fazla 20 metin katmanı ekleyebilirsiniz.' : 'You can add up to 20 text layers.';
      if (onShowToast) {
        onShowToast(msg);
      } else {
        alert(msg);
      }
      return;
    }

    const newId = `layer-${Date.now()}`;
    const lastLayer = layers[layers.length - 1];

    const baseOffsetX = lastLayer ? (lastLayer.x || 0) + 20 : 0;
    const baseOffsetY = lastLayer ? (lastLayer.y || 0) + 32 : 0;

    const newLayer: TextLayer = {
      id: newId,
      text: language === 'tr' ? 'Yeni Metin' : 'New Text',
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

  // Shape Layers Management
  const selectedShape = (config.shapeLayers || []).find((s) => s.id === config.selectedShapeId) || null;

  const handleAddShape = (type: ShapeType) => {
    const newId = `shape-${Date.now()}`;
    const shapes = config.shapeLayers || [];
    const lastShape = shapes[shapes.length - 1];

    const baseOffsetX = lastShape ? (lastShape.x || 0) + 20 : 0;
    const baseOffsetY = lastShape ? (lastShape.y || 0) + 20 : 0;

    const newShape: ShapeLayer = {
      id: newId,
      type,
      x: baseOffsetX,
      y: baseOffsetY,
      width: type === 'circle' ? 120 : type === 'star' || type === 'heart' || type === 'badge' ? 110 : 130,
      height: type === 'circle' ? 120 : type === 'star' || type === 'heart' || type === 'badge' ? 110 : 130,
      color: '#D90429',
      opacity: 100,
      rotation: 0,
      borderRadius: type === 'rounded-rectangle' ? 16 : 0,
    };

    onChangeConfig({
      shapeLayers: [...shapes, newShape],
      selectedShapeId: newId,
      selectedTextId: null,
      selectedTextIds: [],
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

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="#D90429" />
          <span>{t.mockup.designProperties}</span>
        </div>
      </div>

      {/* Section 0: Export Mode Selector (Full Visual vs Only Device) */}
      <div className="inspector-section">
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} color="#D90429" />
          <span>{t.mockup.exportMode}</span>
        </div>

        <div className="export-mode-tab-group">
          <button
            type="button"
            className={`export-mode-tab ${!isDeviceOnly ? 'active' : ''}`}
            onClick={() => onChangeConfig({ exportMode: 'full-canvas' })}
          >
            <ImageIcon size={13} />
            <span>{t.mockup.fullCanvas}</span>
          </button>
          <button
            type="button"
            className={`export-mode-tab ${isDeviceOnly ? 'active' : ''}`}
            onClick={() => {
              if (devices.length === 0) {
                handleAddDevice();
              }
              onChangeConfig({ exportMode: 'device-only' });
            }}
          >
            <Smartphone size={13} />
            <span>{t.mockup.deviceOnly}</span>
          </button>
        </div>
      </div>

      {/* Section 0.5: Multi-Device Management (Add / Switch Devices) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
              <Smartphone size={13} color="#D90429" />
              <span>{t.mockup.devices(devices.length)}</span>
            </div>
            {devices.length > 0 && (
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
                title={devices.length >= 6 ? t.mockup.maxDevicesReached : t.mockup.addDevice}
              >
                <Plus size={12} />
                <span>{devices.length >= 6 ? t.mockup.addDeviceWithMax : t.mockup.addDevice}</span>
              </button>
            )}
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
                        {t.mockup.deviceTabLabel(idx + 1, devModel.name)}
                      </div>
                      <div style={{ fontSize: '10.5px', color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#64748B' }}>
                        {dev.screenshotUrl ? t.mockup.imageUploaded : t.mockup.noImage} • {dev.deviceRotation ?? 0}°
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
                          {t.common.selected}
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
                          title={t.mockup.removeDevice}
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
                        title={t.mockup.removeDevice}
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
                  {t.mockup.noDeviceYet}
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
                  <span>{t.mockup.addDevice}</span>
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
            <span>{t.mockup.screenshot}</span>
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
            <div className="dropzone-text">{t.mockup.uploadOrDrag}</div>
            <div className="dropzone-sub">{t.mockup.formatsSupported}</div>
          </div>

          {activeDevice.screenshotUrl && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={onOpenCropModal}
              >
                <Crop size={14} color="#D90429" />
                <span>{t.mockup.cropImage}</span>
              </button>

              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: '#D90429' }}
                onClick={() => handleUpdateActiveDevice({ screenshotUrl: null, screenshotScale: 1, screenshotOffsetX: 0, screenshotOffsetY: 0 })}
              >
                <Trash2 size={14} />
                <span>{t.mockup.removeImage}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Categorized Device Selector (Apple, Samsung, Google, Other) */}
      {devices.length > 0 && (
        <div className="inspector-section">
          <div className="section-label">
            <span>{t.mockup.deviceModel}</span>
            {devices.length > 1 && (
              <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748B', marginLeft: '6px' }}>
                {t.mockup.selectedDeviceText}
              </span>
            )}
          </div>

          {/* Brand Tabs with 'Diğer' Button */}
          <div className="brand-tabs-group">
            {[
              { id: 'apple', label: t.mockup.apple },
              { id: 'samsung', label: t.mockup.samsung },
              { id: 'google', label: t.mockup.google },
            ].map((tab) => {
              const isTabActive = selectedCategory === 'phone' && selectedBrand === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`brand-tab-btn ${isTabActive ? 'active' : ''}`}
                  onClick={() => {
                    setIsOtherOpen(false);
                    setSelectedCategory('phone');
                    setSelectedBrand(tab.id as DeviceBrand);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Diğer Butonu */}
            <div style={{ flex: 1, position: 'relative' }} ref={otherPopoverRef}>
              <button
                type="button"
                className={`brand-tab-btn-other ${isOtherOpen || selectedCategory !== 'phone' ? 'active' : ''}`}
                style={{
                  fontSize: selectedCategory === 'watch' ? '10px' : '11px',
                  letterSpacing: selectedCategory === 'watch' ? '-0.2px' : 'normal',
                }}
                onClick={() => setIsOtherOpen((prev) => !prev)}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCategory !== 'phone' ? otherCategoryName : t.mockup.otherCategory}
                </span>
                <ChevronDown size={11} style={{ flexShrink: 0, transform: isOtherOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {/* Diğer Cihazlar Küçük Pencere / Popover */}
              {isOtherOpen && (
                <div className="other-devices-popover">
                  <div className="other-devices-popover-header">
                    {t.mockup.otherDeviceTypes}
                  </div>

                  {[
                    { id: 'pc', label: t.mockup.pc, icon: Laptop },
                    { id: 'tab', label: t.mockup.tablet, icon: Tablet },
                    { id: 'tv', label: t.mockup.tv, icon: Tv },
                    { id: 'watch', label: t.mockup.watch, icon: Watch },
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`other-device-category-btn ${selectedCategory === item.id ? 'active' : ''}`}
                        onClick={() => {
                          const catId = item.id as OtherCategory;
                          setSelectedCategory(catId);
                          setOtherCategoryName(item.label);
                          const firstModel = DEVICE_MODELS.find((m) => m.category === catId);
                          if (firstModel) {
                            handleSelectModel(firstModel.id);
                          }
                          setIsOtherOpen(false);
                        }}
                      >
                        <IconComponent size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Model Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {selectedCategory === 'phone' ? (
              selectedBrand === 'apple' ? (
                /* Grouped Apple Families with Dropdown Selection */
                APPLE_FAMILIES.map((family) => {
                  const isFamilyActive = family.variants.some((v) => v.id === activeDevice.deviceType);
                  const activeVariant = family.variants.find((v) => v.id === activeDevice.deviceType) || family.variants[0];
                  const isOpen = expandedAppleFamily !== null ? expandedAppleFamily === family.id : isFamilyActive;

                  return (
                    <div
                      key={family.id}
                      className={`apple-family-card ${isFamilyActive ? 'is-selected' : ''}`}
                    >
                      <div
                        className="apple-family-header"
                        onClick={() => {
                          if (!isFamilyActive) {
                            handleSelectModel(activeVariant.id);
                            setExpandedAppleFamily(family.id);
                          } else {
                            setExpandedAppleFamily((prev) => (prev === family.id ? '' : family.id));
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Smartphone size={16} className="device-model-card-icon" />
                          <div className="device-model-card-name">
                            {family.name}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ChevronDown
                            size={14}
                            className="apple-chevron"
                            style={{
                              transform: isOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                          {isFamilyActive && <Check size={16} color="#D90429" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="apple-family-dropdown">
                          {family.variants.map((variant) => {
                            const isVariantSelected = activeDevice.deviceType === variant.id;
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                className={`apple-variant-btn ${isVariantSelected ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectModel(variant.id);
                                }}
                              >
                                <span className="apple-variant-title">{variant.name}</span>
                                {isVariantSelected && <Check size={14} color="#FFFFFF" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                /* Other Brands (Samsung, Google) standard card list */
                brandModels.map((model) => {
                  const isSelected = activeDevice.deviceType === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      className={`device-model-card ${isSelected ? 'is-selected' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Smartphone size={16} className="device-model-card-icon" />
                        <div className="device-model-card-name">
                          {model.name}
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="#FFFFFF" />}
                    </div>
                  );
                })
              )
            ) : (
              categoryModels.map((model) => {
                const CategoryIcon = 
                  selectedCategory === 'pc' ? Laptop :
                  selectedCategory === 'tab' ? Tablet :
                  selectedCategory === 'tv' ? Tv : Watch;
                const isSelected = activeDevice.deviceType === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`device-model-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CategoryIcon size={16} className="device-model-card-icon" />
                      <div className="device-model-card-name">
                        {model.name}
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="#FFFFFF" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Color / Variant Selector if device has multiple color options */}
          {currentDeviceModel && currentDeviceModel.colors.length > 1 && (() => {
            const isSmartWatch = currentDeviceModel.category === 'watch';
            const colorSectionTitle = isSmartWatch ? t.mockup.caseBandColor : t.mockup.caseColor;
            const activeColorObj = currentDeviceModel.colors.find((c) => c.id === activeDevice.deviceColor) || currentDeviceModel.colors[0];

            return (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', position: 'relative' }} ref={colorDropdownRef}>
                <div className="control-label" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>{colorSectionTitle}</span>
                </div>

                {/* Butona Basarak Renk Seçme Tetikleyici Butonu */}
                <button
                  type="button"
                  className={`device-color-trigger-btn ${isColorDropdownOpen ? 'is-open' : ''}`}
                  onClick={() => setIsColorDropdownOpen((prev) => !prev)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: activeColorObj.hex,
                        border: '1.5px solid rgba(0,0,0,0.15)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: isSmartWatch ? '11px' : '12px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        textAlign: 'left',
                      }}
                      title={activeColorObj.name}
                    >
                      {activeColorObj.name}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    color={isColorDropdownOpen ? 'var(--chili-primary)' : 'var(--text-muted)'}
                    style={{
                      flexShrink: 0,
                      transform: isColorDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>

                {/* Açılır Renk Seçenekleri Menüsü */}
                {isColorDropdownOpen && (
                  <div className="device-color-dropdown-menu">
                    {currentDeviceModel.colors.map((c) => {
                      const isColorActive = (activeDevice.deviceColor || currentDeviceModel.colors[0].id) === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`device-color-option-btn ${isColorActive ? 'active' : ''}`}
                          style={{
                            fontSize: isSmartWatch ? '10.5px' : '11.5px',
                          }}
                          onClick={() => {
                            handleUpdateActiveDevice({ deviceColor: c.id });
                            setIsColorDropdownOpen(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
                            <span
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: c.hex,
                                border: '1px solid rgba(0,0,0,0.15)',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                              }}
                              title={c.name}
                            >
                              {c.name}
                            </span>
                          </div>
                          {isColorActive && <Check size={13} color="var(--chili-primary)" style={{ flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Section 3: Canvas Background (Only in Full Visual Mode) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div className="section-label" style={{ marginBottom: 0 }}>{t.mockup.background}</div>
            
            {/* Şekil Ekle Popover Wrapper */}
            <div style={{ position: 'relative' }} ref={shapePopoverRef}>
              <button
                type="button"
                className="btn-text-action"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFFFFF',
                  backgroundColor: isShapePickerOpen ? '#1E293B' : '#0F172A',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => setIsShapePickerOpen(!isShapePickerOpen)}
                title={t.mockup.addShape}
              >
                <Plus size={11} />
                <span>{t.mockup.addShape}</span>
              </button>

              {/* Ufak Pencere / Popover */}
              {isShapePickerOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E2E8F0',
                    padding: '10px',
                    zIndex: 100,
                    animation: 'toastSlideDown 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>{t.mockup.basicShapes}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { type: 'rectangle' as ShapeType, label: t.mockup.shapes.square, icon: <Square size={18} /> },
                      { type: 'circle' as ShapeType, label: t.mockup.shapes.circle, icon: <Circle size={18} /> },
                      { type: 'triangle' as ShapeType, label: t.mockup.shapes.triangle, icon: <Triangle size={18} /> },
                      { type: 'star' as ShapeType, label: t.mockup.shapes.star, icon: <Star size={18} /> },
                      { type: 'heart' as ShapeType, label: t.mockup.shapes.heart, icon: <Heart size={18} /> },
                      { type: 'badge' as ShapeType, label: t.mockup.shapes.badge, icon: <Shield size={18} /> },
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

          {/* Arka Plan Şekilleri Seçim Çipleri */}
          {(config.shapeLayers || []).length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                {t.mockup.addedComponents(config.shapeLayers?.length || 0)}
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {(config.shapeLayers || []).map((shape, index) => {
                  const isSelected = config.selectedShapeId === shape.id;
                  const labelMap: Record<ShapeType, string> = {
                    rectangle: t.mockup.shapes.square,
                    'rounded-rectangle': t.mockup.shapes.roundedRect,
                    circle: t.mockup.shapes.circle,
                    triangle: t.mockup.shapes.triangle,
                    star: t.mockup.shapes.star,
                    heart: t.mockup.shapes.heart,
                    badge: t.mockup.shapes.badge,
                  };
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      className={`layer-chip-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        onChangeConfig({
                          selectedShapeId: shape.id,
                          selectedTextId: null,
                          selectedTextIds: [],
                        });
                      }}
                      style={{ flexShrink: 0 }}
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
                      <span className="layer-chip-text">{labelMap[shape.type] || `Şekil ${index + 1}`}</span>
                      <span
                        className="layer-chip-del"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSelectedShape(shape.id);
                        }}
                        title={t.common.delete}
                      >
                        &times;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seçili Şekil Düzenleme Kontrolleri */}
          {selectedShape ? (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Shapes size={12} color="#D90429" />
                  <span>{t.mockup.selectedComponentSettings}</span>
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
                  title={t.common.delete}
                >
                  <Trash2 size={12} />
                  <span>{t.common.delete}</span>
                </button>
              </div>

              {/* Şekil Rengi */}
              <div className="control-group" style={{ marginBottom: '8px' }}>
                <div className="control-label">
                  <span>{t.mockup.componentColor}</span>
                  <span className="control-value">{selectedShape.color.toUpperCase()}</span>
                </div>
                <div className="color-picker-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {PALETTE_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      className={`color-swatch-btn ${selectedShape.color.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`}
                      style={{ backgroundColor: color, width: '22px', height: '22px' }}
                      onClick={() => handleUpdateSelectedShape({ color })}
                    />
                  ))}

                  {/* Özel Renk Seç Butonu ve Üstünde Açılan Native Color Picker */}
                  <div
                    title="Özel Renk Seç"
                    className="color-swatch-btn custom-palette-btn"
                    style={{
                      position: 'relative',
                      width: '22px',
                      height: '22px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      margin: 0,
                    }}
                  >
                    <Pipette size={11} style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))', pointerEvents: 'none' }} />
                    <input
                      ref={shapeColorPickerInputRef}
                      type="color"
                      value={selectedShape.color.startsWith('#') && selectedShape.color.length === 7 ? selectedShape.color : '#D90429'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        margin: 0,
                        border: 'none',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                      onChange={(e) => handleUpdateSelectedShape({ color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Genişlik & Yükseklik Sliderları */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div className="control-group" style={{ marginBottom: 0 }}>
                  <div className="control-label" style={{ fontSize: '11px' }}>
                    <span>{t.common.width}</span>
                    <span className="control-value">{selectedShape.width}px</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={600}
                    step={2}
                    value={selectedShape.width}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleUpdateSelectedShape({
                        width: val,
                        ...(selectedShape.type === 'circle' ? { height: val } : {}),
                      });
                    }}
                    className="input-range"
                  />
                </div>

                <div className="control-group" style={{ marginBottom: 0 }}>
                  <div className="control-label" style={{ fontSize: '11px' }}>
                    <span>{t.common.height}</span>
                    <span className="control-value">{selectedShape.height}px</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={600}
                    step={2}
                    value={selectedShape.height}
                    disabled={selectedShape.type === 'circle'}
                    onChange={(e) => handleUpdateSelectedShape({ height: Number(e.target.value) })}
                    className="input-range"
                  />
                </div>
              </div>

              {/* Saydamlık & Döndürme */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                <div className="control-group" style={{ marginBottom: 0 }}>
                  <div className="control-label" style={{ fontSize: '11px' }}>
                    <span>{t.mockup.opacity}</span>
                    <span className="control-value">%{selectedShape.opacity ?? 100}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={selectedShape.opacity ?? 100}
                    onChange={(e) => handleUpdateSelectedShape({ opacity: Number(e.target.value) })}
                    className="input-range"
                  />
                </div>

                <div className="control-group" style={{ marginBottom: 0 }}>
                  <div className="control-label" style={{ fontSize: '11px' }}>
                    <span>{t.common.rotation}</span>
                    <span className="control-value">{selectedShape.rotation ?? 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={selectedShape.rotation ?? 0}
                    onChange={(e) => handleUpdateSelectedShape({ rotation: Number(e.target.value) })}
                    className="input-range"
                  />
                </div>
              </div>

              {/* Dikdörtgen ve Üçgen için Köşeleri Yuvarlaştır Çubuğu */}
              {(selectedShape.type === 'rectangle' || selectedShape.type === 'triangle') && (
                <div className="control-group" style={{ marginBottom: '6px' }}>
                  <div className="control-label" style={{ fontSize: '11px' }}>
                    <span>{t.mockup.roundCorners}</span>
                    <span className="control-value">{selectedShape.borderRadius ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={selectedShape.type === 'triangle' ? 60 : 120}
                    step={1}
                    value={selectedShape.borderRadius ?? 0}
                    onChange={(e) => handleUpdateSelectedShape({ borderRadius: Number(e.target.value) })}
                    className="input-range"
                  />
                </div>
              )}

              {/* Orijinale Getir Butonu */}
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', fontSize: '11px', padding: '5px 8px', justifyContent: 'center', marginTop: '4px' }}
                onClick={() => {
                  const defaultSize = selectedShape.type === 'circle' ? 120 : selectedShape.type === 'star' || selectedShape.type === 'heart' || selectedShape.type === 'badge' ? 110 : 130;
                  handleUpdateSelectedShape({
                    x: 0,
                    y: 0,
                    rotation: 0,
                    width: defaultSize,
                    height: defaultSize,
                    opacity: 100,
                    borderRadius: 0,
                  });
                }}
                title={t.mockup.restoreOriginalTooltip}
              >
                <RotateCcw size={12} color="#0F172A" />
                <span>{t.mockup.restoreOriginal}</span>
              </button>
            </div>
          ) : null}

          <div className="control-group">
            <div className="control-label">{t.mockup.patternTexture}</div>
            <select
              className="input-select"
              value={config.bgType}
              onChange={(e) => onChangeConfig({ bgType: e.target.value as BackgroundType })}
            >
              <option value="solid">{t.mockup.patterns.solid}</option>
              <option value="dots">{t.mockup.patterns.dots}</option>
              <option value="grid">{t.mockup.patterns.grid}</option>
            </select>
          </div>

          <div className="control-group">
            <div className="control-label">{t.mockup.shadowEffect}</div>
            <select
              className="input-select"
              value={activeDevice.shadowDepth || config.shadowDepth || 'medium'}
              onChange={(e) => handleUpdateActiveDevice({ shadowDepth: e.target.value as any })}
            >
              <option value="none">{t.mockup.shadowDepths.none}</option>
              <option value="soft">{t.mockup.shadowDepths.soft}</option>
              <option value="medium">{t.mockup.shadowDepths.medium}</option>
              <option value="dramatic">{t.mockup.shadowDepths.dramatic}</option>
              <option value="chili-glow">{t.mockup.shadowDepths.chiliGlow}</option>
            </select>
          </div>

          <div className="control-group">
            <div className="control-label">
              <span>{t.mockup.colorSelection}</span>
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

              {/* Renk Paleti Açma Butonu ve Üstünde Açılan Native Color Picker */}
              <div
                title={t.mockup.openCustomBgColor}
                className={`color-swatch-btn custom-palette-btn ${
                  !PALETTE_PRESETS.includes(config.bgColor.toUpperCase()) ? 'selected' : ''
                }`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: !PALETTE_PRESETS.includes(config.bgColor.toUpperCase())
                    ? config.bgColor 
                    : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                  color: !PALETTE_PRESETS.includes(config.bgColor.toUpperCase()) ? '#FFFFFF' : '#334155',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  margin: 0,
                }}
              >
                <Pipette size={14} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))', color: '#FFFFFF', pointerEvents: 'none' }} />
                <input
                  ref={colorPickerInputRef}
                  type="color"
                  value={config.bgColor.startsWith('#') && config.bgColor.length === 7 ? config.bgColor : '#D90429'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    border: 'none',
                  }}
                  onChange={(e) => onChangeConfig({ bgColor: e.target.value })}
                />
              </div>
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
              <span>{t.mockup.deviceTransform}</span>
            </div>
            {((activeDevice.deviceOffsetX ?? 0) !== 0 || (activeDevice.deviceOffsetY ?? 0) !== 0 || ((activeDevice.deviceScale ?? 1) !== 1) || ((activeDevice.deviceRotation ?? 0) !== 0)) && (
              <button
                className="btn-text-action"
                title={t.mockup.resetTransform}
                onClick={() => handleUpdateActiveDevice({ deviceOffsetX: 0, deviceOffsetY: 0, deviceScale: 1, deviceRotation: 0 })}
              >
                {t.common.reset}
              </button>
            )}
          </div>

          {/* Device Scale Slider */}
          <div className="control-group">
            <div className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Maximize2 size={13} color="#64748B" />
                <span>{t.mockup.deviceScale}</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>%</span>
                <NumericBadgeInput
                  key={`scale-${activeDevice.id}`}
                  value={Math.round((activeDevice.deviceScale ?? 1) * 100)}
                  min={35}
                  max={220}
                  fallbackValue={100}
                  onChange={(val) => {
                    handleUpdateActiveDevice({ deviceScale: val / 100 });
                  }}
                  style={{
                    width: '52px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
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
              <span>{t.mockup.horizontalPosX}</span>
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
                title="X (0px)"
                onClick={() => handleUpdateActiveDevice({ deviceOffsetX: 0 })}
              >
                0
              </button>
            </div>
          </div>

          {/* Device Vertical Position (Y) */}
          <div className="control-group">
            <div className="control-label">
              <span>{t.mockup.verticalPosY}</span>
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
                title="Y (0px)"
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
                <span>{t.mockup.deviceRotationLabel}</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <NumericBadgeInput
                  key={`rot-${activeDevice.id}`}
                  value={activeDevice.deviceRotation ?? 0}
                  min={-180}
                  max={180}
                  fallbackValue={0}
                  onChange={(val) => {
                    handleUpdateActiveDevice({ deviceRotation: val });
                  }}
                  style={{
                    width: '52px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
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
                title="0°"
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
              <span>{t.mockup.centerAndLevel}</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 6: Multi-Text Layers & Typography (Only in Full Visual Mode) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', fontSize: '11.5px', margin: 0 }}>
              <Type size={13} color="#D90429" />
              <span>{t.mockup.textLayers}</span>
              <span style={{ fontSize: '10px', backgroundColor: '#F1F5F9', color: '#64748B', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                {(config.textLayers || []).length}
              </span>
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
              title={t.mockup.addText}
            >
              <Plus size={11} />
              <span>{t.mockup.addText}</span>
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
                      <span className="layer-chip-text">{layer.text.trim() ? layer.text : `${language === 'tr' ? 'Metin' : 'Text'} ${index + 1}`}</span>
                      {(config.textLayers || []).length > 1 && (
                        <span
                          className="layer-chip-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSelectedLayer(layer.id);
                          }}
                          title={t.mockup.deleteLayer}
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
                    <div className="control-label">{t.mockup.textContent}</div>
                    <textarea
                      rows={2}
                      className="input-text"
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      value={selectedLayer.text}
                      onChange={(e) => handleUpdateSelectedLayer({ text: e.target.value })}
                      placeholder={t.mockup.textPlaceholder}
                    />
                  </div>

                  {/* Word Format Ribbon */}
                  <div className="control-group">
                    <div className="control-label">{t.mockup.formatting}</div>
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F3F5', padding: '4px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        title={t.mockup.bold}
                        className={`format-ribbon-btn ${selectedLayer.isBold ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ isBold: !selectedLayer.isBold })}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        title={t.mockup.italic}
                        className={`format-ribbon-btn ${selectedLayer.isItalic ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ isItalic: !selectedLayer.isItalic })}
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        title={t.mockup.underline}
                        className={`format-ribbon-btn ${selectedLayer.isUnderline ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ isUnderline: !selectedLayer.isUnderline })}
                      >
                        <Underline size={14} />
                      </button>

                      <div style={{ width: '1px', backgroundColor: '#CBD5E1', margin: '0 2px' }} />

                      <button
                        type="button"
                        title={t.mockup.alignLeft}
                        className={`format-ribbon-btn ${selectedLayer.textAlign === 'left' ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ textAlign: 'left' })}
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button
                        type="button"
                        title={t.mockup.alignCenter}
                        className={`format-ribbon-btn ${(!selectedLayer.textAlign || selectedLayer.textAlign === 'center') ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ textAlign: 'center' })}
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button
                        type="button"
                        title={t.mockup.alignRight}
                        className={`format-ribbon-btn ${selectedLayer.textAlign === 'right' ? 'active' : ''}`}
                        onClick={() => handleUpdateSelectedLayer({ textAlign: 'right' })}
                      >
                        <AlignRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Yazı Tipi Ailesi */}
                  <div className="control-group">
                    <div className="control-label">{t.mockup.fontFamily}</div>
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
                      <span>{t.mockup.fontSize}</span>
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
                        title="24px"
                        onClick={() => handleUpdateSelectedLayer({ fontSize: 24 })}
                      >
                        24
                      </button>
                    </div>
                  </div>

                  {/* Satırlar Arası Uzaklık (Line Height) Slider & Manual Input */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>{t.mockup.lineSpacing}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min="0.8"
                          max="3.0"
                          step="0.05"
                          value={selectedLayer.lineHeight !== undefined ? Number(selectedLayer.lineHeight.toFixed(2)) : 1.2}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              handleUpdateSelectedLayer({ lineHeight: Math.max(0.5, Math.min(4.0, Number(val.toFixed(2)))) });
                            }
                          }}
                          style={{
                            width: '52px',
                            padding: '2px 4px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            textAlign: 'center',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#1E293B',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="0.8"
                        max="3.0"
                        step="0.05"
                        value={selectedLayer.lineHeight !== undefined ? selectedLayer.lineHeight : 1.2}
                        onChange={(e) => handleUpdateSelectedLayer({ lineHeight: Number(parseFloat(e.target.value).toFixed(2)) })}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="stepper-mini-btn"
                        title="1.2"
                        onClick={() => handleUpdateSelectedLayer({ lineHeight: 1.2 })}
                      >
                        1.2
                      </button>
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>{t.mockup.textColor}</span>
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

                      {/* Özel Metin Rengi Açma Butonu ve Üstünde Açılan Native Color Picker */}
                      <div
                        title={t.mockup.openCustomBgColor}
                        className={`color-swatch-btn custom-palette-btn ${
                          !TEXT_PALETTE_PRESETS.includes(selectedLayer.color.toUpperCase()) ? 'selected' : ''
                        }`}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: !TEXT_PALETTE_PRESETS.includes(selectedLayer.color.toUpperCase())
                            ? selectedLayer.color 
                            : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                          color: !TEXT_PALETTE_PRESETS.includes(selectedLayer.color.toUpperCase()) ? '#FFFFFF' : '#334155',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          margin: 0,
                        }}
                      >
                        <Pipette size={14} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))', color: '#FFFFFF', pointerEvents: 'none' }} />
                        <input
                          ref={textColorPickerInputRef}
                          type="color"
                          value={selectedLayer.color.startsWith('#') && selectedLayer.color.length === 7 ? selectedLayer.color : '#0F172A'}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            padding: 0,
                            margin: 0,
                            border: 'none',
                          }}
                          onChange={(e) => handleUpdateSelectedLayer({ color: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Position X & Y Sliders */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>{t.mockup.horizontalPosX}</span>
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
                        title="X (0px)"
                        onClick={() => handleUpdateSelectedLayer({ x: 0 })}
                      >
                        0
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <div className="control-label">
                      <span>{t.mockup.verticalPosY}</span>
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
                        title="Y (0px)"
                        onClick={() => handleUpdateSelectedLayer({ y: 0 })}
                      >
                        0
                      </button>
                    </div>
                  </div>

                  {/* Rotation Slider */}
                  <div className="control-group">
                    <div className="control-label">
                      <span>{t.mockup.deviceRotationLabel}</span>
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
                        title="0°"
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
                      <span>{t.mockup.centerText}</span>
                    </button>

                    {(config.textLayers || []).length > 1 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 10px', justifyContent: 'center', color: '#EF4444' }}
                        onClick={() => handleDeleteSelectedLayer(selectedLayer.id)}
                        title={t.mockup.deleteLayer}
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
                    {t.mockup.noSelectedText}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', maxWidth: '200px', lineHeight: '1.4' }}>
                    {t.mockup.clickToEditText}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#64748B' }}>
              {t.mockup.noTextYet}
              <button
                type="button"
                className="btn-chili"
                style={{ width: '100%', marginTop: '8px', justifyContent: 'center', fontSize: '12px' }}
                onClick={handleAddTextLayer}
              >
                <Plus size={13} />
                <span>{t.mockup.addFirstText}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
