import React, { useState, useEffect } from 'react';
import { Download, X, FileImage, Tag, Sparkles, Check, Info } from 'lucide-react';
import type { StoreBannerConfig } from '../../types/storeBanner';

interface BannerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: {
    scale: number;
    format: 'png' | 'jpeg';
    customFilename?: string;
  }) => Promise<void>;
  isExporting: boolean;
  config: StoreBannerConfig;
}

export const BannerExportModal: React.FC<BannerExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
  config,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg'>('png');
  const [selectedScale, setSelectedScale] = useState<number>(config.exportScale || 1);
  const [customFilename, setCustomFilename] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const cleanTitle = (config.titleText || 'store-banner')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      setCustomFilename(cleanTitle);
      setSelectedScale(config.exportScale || 1);
    }
  }, [isOpen, config.titleText, config.exportScale]);

  if (!isOpen) return null;

  const isGooglePlay = config.preset === 'google-play-feature';

  const scaleOptions = [
    {
      scale: 1,
      label: '1x',
      width: config.width,
      height: config.height,
      badge: isGooglePlay ? 'Resmi Boyut' : 'Standart',
    },
    {
      scale: 2,
      label: '2x',
      width: config.width * 2,
      height: config.height * 2,
      badge: 'Yüksek Çözünürlük',
    },
    {
      scale: 3,
      label: '3x',
      width: config.width * 3,
      height: config.height * 3,
      badge: 'Ultra Çözünürlük',
    },
  ];

  const handleStartExport = async () => {
    await onExport({
      scale: selectedScale,
      format: selectedFormat,
      customFilename: customFilename.trim() || undefined,
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
          maxWidth: '520px',
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
                Banner'ı İndir
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Mağaza boyut ve kalite standartlarına uygun görsel çıktısı
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
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Format Selection */}
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileImage size={14} color="#64748B" />
              <span>Dosya Formatı</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { id: 'png' as const, label: 'PNG', badge: 'Kayıpsız / Mağaza Standardı' },
                { id: 'jpeg' as const, label: 'JPEG', badge: 'Yüksek Kalite' },
              ].map((item) => {
                const isSelected = selectedFormat === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedFormat(item.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #D90429' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
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
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dosya Adı */}
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} color="#64748B" />
                <span>Dosya Adı</span>
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>İsteğe bağlı</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="store-banner"
                style={{
                  width: '100%',
                  padding: '9px 65px 9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              >
                .{selectedFormat === 'jpeg' ? 'jpg' : 'png'}
              </span>
            </div>
          </div>

          {/* Dışa Aktarma Kalitesi / Çözünürlüğü */}
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#64748B" />
              <span>Dışa Aktarma Kalitesi</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {scaleOptions.map((opt) => {
                const isSelected = selectedScale === opt.scale;
                return (
                  <button
                    key={opt.scale}
                    type="button"
                    onClick={() => setSelectedScale(opt.scale)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #D90429' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#D90429' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 4px rgba(217, 4, 41, 0.2)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#0F172A' }}>
                        {opt.label}
                      </span>
                      {isSelected && <Check size={14} color="#FFFFFF" />}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#64748B',
                      }}
                    >
                      {opt.width}×{opt.height}
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 600,
                        color: isSelected ? '#FFFFFF' : '#D90429',
                        marginTop: '2px',
                      }}
                    >
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mağaza Bilgilendirme Kutusu */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '11.5px',
              color: '#475569',
              lineHeight: '1.5',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <Info size={15} color="#D90429" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {isGooglePlay ? (
                <span>
                  Google Play Console, Öne Çıkan Grafik için <strong>kesinlikle 1024×500 px (1x)</strong> ve şeffaflıksız (opak) görsel zorunlu tutar. Mağazaya yüklemek için <strong>1x</strong> seçin. Portfolyo veya web tanıtımları için <strong>2x veya 3x</strong> çözünürlük kullanabilirsiniz.
                </span>
              ) : (
                <span>
                  Doğrudan mağaza yüklemeleri için <strong>1x</strong>, yüksek çözünürlüklü web ve tanıtım kullanımı için <strong>2x veya 3x</strong> çözünürlük önerilir.
                </span>
              )}
            </div>
          </div>
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
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleStartExport}
            disabled={isExporting}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#D90429',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '130px',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
              boxShadow: '0 2px 4px rgba(217, 4, 41, 0.25)',
            }}
          >
            <Download size={15} />
            <span>{isExporting ? 'Hazırlanıyor...' : `${selectedFormat.toUpperCase()} İndir`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
