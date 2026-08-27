import React, { useState } from 'react';
import { Download, X, FileImage, Layers, Check, Sparkles } from 'lucide-react';
import appleSvg from '../../assets/apple.svg';
import googlePlaySvg from '../../assets/googleplay.svg';

export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'webp';

export type ExportPresetCategory = 'playstore' | 'appstore' | 'general';

export interface ExportPresetOption {
  id: string;
  category: ExportPresetCategory;
  title: string;
  width: number;
  height: number;
  badge: string;
  scaleFactor: number;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: {
    format: ExportFormat;
    targetWidth: number;
    targetHeight: number;
    scale: number;
    quality: number;
    scope: 'active' | 'all';
  }) => void;
  screenCount: number;
  activeScreenTitle: string;
  canvasWidth?: number;
  canvasHeight?: number;
  isExporting: boolean;
}

interface FormatOption {
  id: ExportFormat;
  label: string;
  ext: string;
  badge?: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'png',
    label: 'PNG',
    ext: '.png',
    badge: 'Kayıpsız',
  },
  {
    id: 'jpeg',
    label: 'JPEG / JPG',
    ext: '.jpg',
  },
  {
    id: 'webp',
    label: 'WEBP',
    ext: '.webp',
  },
  {
    id: 'svg',
    label: 'SVG',
    ext: '.svg',
    badge: 'Vektör',
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  screenCount,
  activeScreenTitle,
  canvasWidth = 1080,
  canvasHeight = 1920,
  isExporting,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<ExportPresetCategory>('playstore');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('playstore-1x');
  const [exportScope, setExportScope] = useState<'active' | 'all'>('active');

  if (!isOpen) return null;

  // Compute preset list dynamically with current canvas ratio
  const isLandscape = canvasWidth > canvasHeight;

  // Preset definitions tailored for App Store, Google Play & Presentation
  const PRESET_OPTIONS: ExportPresetOption[] = [
    // 1. Google Play
    {
      id: 'playstore-1x',
      category: 'playstore',
      title: '1x',
      width: isLandscape ? 1920 : 1080,
      height: isLandscape ? 1080 : 1920,
      scaleFactor: 1,
      badge: isLandscape ? '1920 × 1080 px' : '1080 × 1920 px',
    },
    {
      id: 'playstore-2x',
      category: 'playstore',
      title: '2x',
      width: isLandscape ? 3840 : 2160,
      height: isLandscape ? 2160 : 3840,
      scaleFactor: 2,
      badge: isLandscape ? '3840 × 2160 px' : '2160 × 3840 px',
    },

    // 2. App Store
    {
      id: 'appstore-1x',
      category: 'appstore',
      title: '1x',
      width: isLandscape ? 2796 : 1290,
      height: isLandscape ? 1290 : 2796,
      scaleFactor: 1,
      badge: isLandscape ? '2796 × 1290 px' : '1290 × 2796 px',
    },
    {
      id: 'appstore-retina',
      category: 'appstore',
      title: '2x',
      width: isLandscape ? 2868 : 1320,
      height: isLandscape ? 1320 : 2868,
      scaleFactor: 2,
      badge: isLandscape ? '2868 × 1320 px' : '1320 × 2868 px',
    },

    // 3. Genel
    {
      id: 'general-1x',
      category: 'general',
      title: '1x',
      width: canvasWidth,
      height: canvasHeight,
      scaleFactor: 1,
      badge: `${canvasWidth} × ${canvasHeight} px`,
    },
    {
      id: 'general-2x',
      category: 'general',
      title: '2x',
      width: canvasWidth * 3,
      height: canvasHeight * 3,
      scaleFactor: 3,
      badge: `${canvasWidth * 3} × ${canvasHeight * 3} px`,
    },
    {
      id: 'general-3x',
      category: 'general',
      title: '3x',
      width: isLandscape ? 16384 : 9215,
      height: isLandscape ? 9215 : 16384,
      scaleFactor: 8.53,
      badge: isLandscape ? '16384 × 9215 px' : '9215 × 16384 px',
    },
  ];

  const categoryPresets = PRESET_OPTIONS.filter((p) => p.category === selectedPresetCategory);
  const activePreset = PRESET_OPTIONS.find((p) => p.id === selectedPresetId) || categoryPresets[0] || PRESET_OPTIONS[0];

  const handleStartExport = () => {
    onExport({
      format: selectedFormat,
      targetWidth: activePreset.width,
      targetHeight: activePreset.height,
      scale: activePreset.scaleFactor,
      quality: 0.88,
      scope: screenCount > 1 ? exportScope : 'active',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          width: '100%',
          maxWidth: '540px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
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
                Görseli İndir
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                App Store ve Play Store için optimize edilmiş hazır şablonlar
              </div>
            </div>
          </div>
          <button
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
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: 'calc(85vh - 130px)', overflowY: 'auto' }}>
          {/* Scope Selector (Only if multiple screens exist) */}
          {screenCount > 1 && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="#64748B" />
                <span>İndirme Kapsamı</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setExportScope('active')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: exportScope === 'active' ? '1px solid #D90429' : '1px solid #E2E8F0',
                    backgroundColor: exportScope === 'active' ? '#D90429' : '#FFFFFF',
                    color: exportScope === 'active' ? '#FFFFFF' : '#0F172A',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: exportScope === 'active' ? '#FFFFFF' : '#0F172A' }}>
                      Seçili Ekran
                    </span>
                    {exportScope === 'active' && <Check size={16} color="#FFFFFF" />}
                  </div>
                  <span style={{ fontSize: '11px', color: exportScope === 'active' ? 'rgba(255, 255, 255, 0.85)' : '#64748B' }}>
                    {activeScreenTitle}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: exportScope === 'all' ? '1px solid #D90429' : '1px solid #E2E8F0',
                    backgroundColor: exportScope === 'all' ? '#D90429' : '#FFFFFF',
                    color: exportScope === 'all' ? '#FFFFFF' : '#0F172A',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: exportScope === 'all' ? '#FFFFFF' : '#0F172A' }}>
                      Tüm Ekranlar ({screenCount})
                    </span>
                    {exportScope === 'all' && <Check size={16} color="#FFFFFF" />}
                  </div>
                  <span style={{ fontSize: '11px', color: exportScope === 'all' ? 'rgba(255, 255, 255, 0.85)' : '#64748B' }}>
                    ZIP Arşivi Olarak
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Format Selection Grid */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileImage size={14} color="#64748B" />
              <span>Dosya Formatı</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {FORMAT_OPTIONS.map((item) => {
                const isSelected = selectedFormat === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedFormat(item.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #D90429' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 4px rgba(217, 4, 41, 0.2)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#0F172A' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 500, color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#94A3B8' }}>
                      {item.badge ? item.badge : item.ext}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Category Tabs & Resolution Grid (Disabled/Hidden if SVG is selected) */}
          {selectedFormat !== 'svg' && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#64748B" />
                <span>Mağaza & Çözünürlük Şablonları</span>
              </div>

              {/* Category Segmented Tabs */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F3F5', padding: '3px', borderRadius: '10px', marginBottom: '10px' }}>
                {[
                  {
                    id: 'playstore' as const,
                    label: 'Google Play',
                    renderIcon: () => (
                      <img
                        src={googlePlaySvg}
                        alt="Google Play"
                        style={{
                          width: '13px',
                          height: '13px',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                  {
                    id: 'appstore' as const,
                    label: 'App Store',
                    renderIcon: () => (
                      <img
                        src={appleSvg}
                        alt="App Store"
                        style={{
                          width: '13px',
                          height: '13px',
                          display: 'inline-block',
                        }}
                      />
                    ),
                  },
                  {
                    id: 'general' as const,
                    label: 'Genel',
                    renderIcon: () => null,
                  },
                ].map((tab) => {
                  const isActive = selectedPresetCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetCategory(tab.id);
                        const firstInCategory = PRESET_OPTIONS.find((p) => p.category === tab.id);
                        if (firstInCategory) setSelectedPresetId(firstInCategory.id);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        fontSize: '11.5px',
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: '7px',
                        border: isActive ? '1px solid #D90429' : '1px solid transparent',
                        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                        color: isActive ? '#0F172A' : '#64748B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                      }}
                    >
                      {tab.renderIcon()}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Presets Cards for Active Category */}
              <div style={{ display: 'grid', gridTemplateColumns: categoryPresets.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '10px' }}>
                {categoryPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        border: isSelected ? '1px solid #D90429' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(217, 4, 41, 0.2)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#0F172A' }}>
                          {preset.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: isSelected ? '#FFFFFF' : '#D90429',
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
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
            onClick={handleStartExport}
            disabled={isExporting}
            style={{ padding: '8px 20px', minWidth: '130px', justifyContent: 'center' }}
          >
            <Download size={15} />
            <span>{isExporting ? 'Hazırlanıyor...' : `${selectedFormat.toUpperCase()} İndir`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

