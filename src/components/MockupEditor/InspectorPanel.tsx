import React, { useRef } from 'react';
import type { MockupConfig, DeviceType, BackgroundType } from '../../types/mockup';
import { 
  Upload, 
  Trash2,
  Sliders
} from 'lucide-react';

interface InspectorPanelProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>) => void;
  onFileSelect: (file: File) => void;
}

const PALETTE_PRESETS = [
  '#FFFFFF',
  '#F8F9FA',
  '#0F172A',
  '#D90429', // Chili Red
  '#FFF0F3', // Subtle Red tint
  '#E2E8F0',
  '#1E293B',
  '#3B82F6',
  '#10B981',
];

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  config,
  onChangeConfig,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="#D90429" />
          <span>Tasarım Özellikleri</span>
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
          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', color: '#D90429' }}
            onClick={() => onChangeConfig({ screenshotUrl: null })}
          >
            <Trash2 size={14} />
            Görseli Kaldır
          </button>
        )}
      </div>

      {/* Section 2: Device Frame Selector */}
      <div className="inspector-section">
        <div className="section-label">Cihaz Çerçevesi</div>
        <div className="control-group">
          <div className="control-label">Cihaz Modeli</div>
          <select
            className="input-select"
            value={config.deviceType}
            onChange={(e) => onChangeConfig({ deviceType: e.target.value as DeviceType })}
          >
            <option value="iphone16pro">iPhone 16 Pro (Titanium)</option>
            <option value="pixel9pro">Google Pixel 9 Pro</option>
            <option value="ipadpro">iPad Pro / Tablet</option>
            <option value="minimal">Minimal Bezel</option>
          </select>
        </div>

        <div className="control-group">
          <div className="control-label">Çerçeve Rengi</div>
          <select
            className="input-select"
            value={config.deviceColor}
            onChange={(e) => onChangeConfig({ deviceColor: e.target.value as any })}
          >
            <option value="dark">Titanium Dark (Siyah)</option>
            <option value="natural">Natural Titanium</option>
            <option value="silver">Silver (Gümüş)</option>
            <option value="gold">Gold (Altın)</option>
          </select>
        </div>
      </div>

      {/* Section 3: Canvas Background */}
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
          <div className="control-label">Renk Seçimi</div>
          <div className="color-picker-row" style={{ flexWrap: 'wrap' }}>
            {PALETTE_PRESETS.map((color) => (
              <button
                key={color}
                className={`color-swatch-btn ${config.bgColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onChangeConfig({ bgColor: color })}
              />
            ))}
          </div>
        </div>

        <div className="control-group">
          <div className="control-label">Özel Hex Kodu</div>
          <input
            type="text"
            className="input-text"
            value={config.bgColor}
            onChange={(e) => onChangeConfig({ bgColor: e.target.value })}
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      {/* Section 4: Layout, Padding & Shadow */}
      <div className="inspector-section">
        <div className="section-label">Düzen ve Efektler</div>

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

      {/* Section 5: Store Headline */}
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

      {/* Section 6: Export Resolution Scale */}
      <div className="inspector-section">
        <div className="section-label">Dışa Aktarma Ölçeği</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map((scale) => (
            <button
              key={scale}
              className={`btn-secondary ${config.exportScale === scale ? 'selected' : ''}`}
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: config.exportScale === scale ? '#FFF0F3' : undefined,
                color: config.exportScale === scale ? '#D90429' : undefined,
                borderColor: config.exportScale === scale ? '#FFCCD5' : undefined,
                fontWeight: config.exportScale === scale ? 700 : 500
              }}
              onClick={() => onChangeConfig({ exportScale: scale as any })}
            >
              {scale}x {scale === 2 ? '(Önerilen)' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
