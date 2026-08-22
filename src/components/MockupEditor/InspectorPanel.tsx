import React, { useState, useRef } from 'react';
import type { MockupConfig, DeviceType, BackgroundType, DeviceBrand } from '../../types/mockup';
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
  Image as ImageIcon
} from 'lucide-react';

interface InspectorPanelProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>) => void;
  onFileSelect: (file: File) => void;
  onOpenCropModal: () => void;
}

const PALETTE_PRESETS = [
  '#0F172A', // Siyah / Koyu Lacivert
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

  const isDeviceOnly = config.exportMode === 'device-only';

  // Active Brand tab state ('apple', 'samsung', 'google', 'other')
  const currentDeviceModel = DEVICE_MODELS.find((m) => m.id === config.deviceType) || DEVICE_MODELS[0];
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
    const defaultColor = modelDef?.colors[0].id || 'dark';
    onChangeConfig({
      deviceType: modelId,
      deviceColor: defaultColor,
    });
  };

  const isCustomColor = !PALETTE_PRESETS.includes(config.bgColor.toUpperCase()) && !PALETTE_PRESETS.includes(config.bgColor.toLowerCase());

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

      {/* Section 1: Screenshot Upload */}
      <div className="inspector-section">
        <div className="section-label">Ekran Görüntüsü</div>
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

        {config.screenshotUrl && (
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
              onClick={() => onChangeConfig({ screenshotUrl: null, screenshotScale: 1, screenshotOffsetX: 0, screenshotOffsetY: 0 })}
            >
              <Trash2 size={14} />
              <span>Görseli Kaldır</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 2: Categorized Device Selector (Apple, Samsung, Google, Other) */}
      <div className="inspector-section">
        <div className="section-label">Cihaz Seçimi</div>

        {/* Brand Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F3F5', padding: '3px', borderRadius: '8px' }}>
          {[
            { id: 'apple', label: 'Apple' },
            { id: 'samsung', label: 'Samsung' },
            { id: 'google', label: 'Google' },
            { id: 'other', label: 'Diğer' },
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
                  border: isTabActive ? '1px solid #FFCCD5' : '1px solid transparent',
                  backgroundColor: isTabActive ? '#FFFFFF' : 'transparent',
                  color: isTabActive ? '#D90429' : '#475569',
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
            const isSelected = config.deviceType === model.id;
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
                  backgroundColor: isSelected ? '#FFF0F3' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={16} color={isSelected ? '#D90429' : '#64748B'} />
                  <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#D90429' : '#0F172A' }}>
                    {model.name}
                  </div>
                </div>
                {isSelected && <Check size={16} color="#D90429" />}
              </div>
            );
          })}
        </div>
      </div>

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
                title="Özel Renk Paletini Aç"
                className={`color-swatch-btn custom-palette-btn ${isCustomColor ? 'selected' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCustomColor ? config.bgColor : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)',
                  color: isCustomColor ? '#FFFFFF' : '#334155',
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
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Move size={13} color="#D90429" />
              <span>Cihaz Konumu ve Boyutu</span>
            </div>
            {(config.deviceOffsetX !== 0 || config.deviceOffsetY !== 0 || (config.deviceScale && config.deviceScale !== 1)) && (
              <button
                className="btn-text-action"
                title="Konum ve Boyutu Sıfırla"
                onClick={() => onChangeConfig({ deviceOffsetX: 0, deviceOffsetY: 0, deviceScale: 1 })}
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
              <span className="control-value">%{Math.round((config.deviceScale ?? 1) * 100)}</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.0"
              step="0.01"
              value={config.deviceScale ?? 1}
              onChange={(e) => onChangeConfig({ deviceScale: Number(e.target.value) })}
            />
            {/* Quick scale buttons */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
              {[
                { label: '%75', val: 0.75 },
                { label: '%100', val: 1.0 },
                { label: '%125', val: 1.25 },
                { label: '%150', val: 1.5 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className={`scale-pill-btn ${(config.deviceScale ?? 1) === btn.val ? 'active' : ''}`}
                  onClick={() => onChangeConfig({ deviceScale: btn.val })}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Device Horizontal Position (X) */}
          <div className="control-group">
            <div className="control-label">
              <span>Yatay Konum (X)</span>
              <span className="control-value">
                {(config.deviceOffsetX ?? 0) > 0 ? `+${config.deviceOffsetX}` : (config.deviceOffsetX ?? 0)}px
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="-250"
                max="250"
                value={config.deviceOffsetX ?? 0}
                onChange={(e) => onChangeConfig({ deviceOffsetX: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button
                className="stepper-mini-btn"
                title="X Sıfırla (0px)"
                onClick={() => onChangeConfig({ deviceOffsetX: 0 })}
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
                {(config.deviceOffsetY ?? 0) > 0 ? `+${config.deviceOffsetY}` : (config.deviceOffsetY ?? 0)}px
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="-350"
                max="350"
                value={config.deviceOffsetY ?? 0}
                onChange={(e) => onChangeConfig({ deviceOffsetY: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button
                className="stepper-mini-btn"
                title="Y Sıfırla (0px)"
                onClick={() => onChangeConfig({ deviceOffsetY: 0 })}
              >
                0
              </button>
            </div>
          </div>

          {/* Quick alignment button */}
          <div style={{ marginTop: '2px' }}>
            <button
              className="btn-secondary"
              style={{ width: '100%', fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
              onClick={() => onChangeConfig({ deviceOffsetX: 0, deviceOffsetY: 0 })}
            >
              <Crosshair size={12} color="#D90429" />
              <span>Merkeze Ortala</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 5: Layout, Padding & Shadow */}
      <div className="inspector-section">
        <div className="section-label">Düzen ve Efektler</div>

        {!isDeviceOnly && (
          <div className="control-group">
            <div className="control-label">
              <span>İç Boşluk (Padding)</span>
              <span className="control-value">{config.padding}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={config.padding}
              onChange={(e) => onChangeConfig({ padding: Number(e.target.value) })}
            />
          </div>
        )}

        <div className="control-group">
          <div className="control-label">
            <span>Köşe Yuvarlatma</span>
            <span className="control-value">{config.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={config.borderRadius}
            onChange={(e) => onChangeConfig({ borderRadius: Number(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <div className="control-label">Gölge Efekti</div>
          <select
            className="input-select"
            value={config.shadowDepth}
            onChange={(e) => onChangeConfig({ shadowDepth: e.target.value as any })}
          >
            <option value="none">Gölge Yok</option>
            <option value="soft">Yumuşak Gölge</option>
            <option value="medium">Standart Gölge</option>
            <option value="dramatic">Derin Mağaza Gölgesi</option>
            <option value="chili-glow">Şili Biberi Vurgulu Gölge</option>
          </select>
        </div>
      </div>

      {/* Section 6: Store Headline (Only in Full Visual Mode) */}
      {!isDeviceOnly && (
        <div className="inspector-section">
          <div className="section-label">Mağaza Başlığı Katmanı</div>
          <div className="control-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="control-label">Başlık Göster</span>
            <input
              type="checkbox"
              checked={config.showHeadline}
              onChange={(e) => onChangeConfig({ showHeadline: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#D90429' }}
            />
          </div>

          {config.showHeadline && (
            <>
              <div className="control-group">
                <div className="control-label">Ana Başlık</div>
                <input
                  type="text"
                  className="input-text"
                  value={config.headlineText}
                  onChange={(e) => onChangeConfig({ headlineText: e.target.value })}
                  placeholder="Örn: En Hızlı Skor Takipçisi"
                />
              </div>

              <div className="control-group">
                <div className="control-label">Alt Açıklama Metni</div>
                <input
                  type="text"
                  className="input-text"
                  value={config.subtitleText}
                  onChange={(e) => onChangeConfig({ subtitleText: e.target.value })}
                  placeholder="Örn: Anlık istatistikler ve canlı bildirimler"
                />
              </div>

              <div className="control-group">
                <div className="control-label">Metin Rengi</div>
                <div className="color-picker-row">
                  <button
                    className={`color-swatch-btn ${config.textColor === '#0F172A' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#0F172A' }}
                    onClick={() => onChangeConfig({ textColor: '#0F172A' })}
                  />
                  <button
                    className={`color-swatch-btn ${config.textColor === '#FFFFFF' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#FFFFFF' }}
                    onClick={() => onChangeConfig({ textColor: '#FFFFFF' })}
                  />
                  <button
                    className={`color-swatch-btn ${config.textColor === '#D90429' ? 'selected' : ''}`}
                    style={{ backgroundColor: '#D90429' }}
                    onClick={() => onChangeConfig({ textColor: '#D90429' })}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
