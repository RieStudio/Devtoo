import React, { useState, useEffect, useCallback } from 'react';
import type { IconResizerConfig } from '../../types/iconResizer';
import { ALL_ICON_SIZES } from '../../constants/iconSizes';
import { exportIconZipBundle } from '../../utils/iconGenerator';
import { IconCanvasPreview } from './IconCanvasPreview';
import { IconInspectorPanel } from './IconInspectorPanel';
import { IconExportModal } from './IconExportModal';
import { ImageCropModal } from '../MockupEditor/ImageCropModal';

const DEFAULT_ICON_CONFIG: IconResizerConfig = {
  sourceImageUrl: null,
  sourceImageName: '',
  sourceImageWidth: 0,
  sourceImageHeight: 0,
  appName: 'Devtoo App',
  bgColor: '#FFFFFF',
  isTransparentBg: false,
  paddingPercent: 8,
  previewCornerRadius: 'squircle',
  selectedPlatforms: {
    ios: true,
    android: true,
    web: true,
  },
  previewDevice: 'iphone',
  previewDarkMode: false,
};

interface AppIconResizerProps {
  isVisible?: boolean;
  onRegisterExport?: (exportFn: () => void) => void;
  onRegisterUpload?: (uploadFn: () => void) => void;
  onRegisterCrop?: (cropFn: () => void) => void;
  onExportStateChange?: (isExporting: boolean) => void;
  onHasImageChange?: (hasImage: boolean) => void;
}

export const AppIconResizer: React.FC<AppIconResizerProps> = ({ 
  isVisible = true,
  onRegisterExport,
  onRegisterUpload,
  onRegisterCrop,
  onExportStateChange,
  onHasImageChange,
}) => {
  const [config, setConfig] = useState<IconResizerConfig>(DEFAULT_ICON_CONFIG);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>('');
  const [exportPercent, setExportPercent] = useState<number>(0);

  const handleUpdateConfig = (updated: Partial<IconResizerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.src = result;
      img.onload = () => {
        setOriginalImageUrl(result);
        handleUpdateConfig({
          sourceImageUrl: result,
          sourceImageName: file.name,
          sourceImageWidth: img.width,
          sourceImageHeight: img.height,
        });
      };
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
      }
    };
    input.click();
  }, []);

  const selectedSpecs = ALL_ICON_SIZES.filter((spec) => {
    if (spec.platform === 'ios' && config.selectedPlatforms.ios) return true;
    if (spec.platform === 'android' && config.selectedPlatforms.android) return true;
    if (spec.platform === 'web' && config.selectedPlatforms.web) return true;
    return false;
  });

  const handleExport = useCallback(async (platformFilter?: 'ios' | 'android' | 'web', customZipName?: string) => {
    if (!config.sourceImageUrl) {
      handleTriggerUpload();
      return;
    }

    const specsToExport = platformFilter
      ? ALL_ICON_SIZES.filter((s) => s.platform === platformFilter)
      : selectedSpecs;

    if (specsToExport.length === 0) {
      alert('Lütfen en az bir platform seçin.');
      return;
    }

    setIsExporting(true);
    setExportPercent(5);
    setExportProgressText('Görsel yükleniyor...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.sourceImageUrl;

    img.onload = async () => {
      try {
        await exportIconZipBundle(
          img,
          specsToExport,
          {
            bgColor: config.bgColor,
            isTransparentBg: config.isTransparentBg,
            paddingPercent: config.paddingPercent,
            appName: config.appName,
            customZipName,
          },
          (pct, statusText) => {
            setExportPercent(pct);
            setExportProgressText(statusText);
          }
        );
      } catch (err) {
        console.error('Export error:', err);
        alert('Dışa aktarma sırasında bir hata oluştu.');
      } finally {
        setTimeout(() => {
          setIsExporting(false);
          setExportProgressText('');
          setExportPercent(0);
        }, 1000);
      }
    };
  }, [config, selectedSpecs, handleTriggerUpload]);

  // Synchronize export & upload triggers with Header / parent
  useEffect(() => {
    onRegisterExport?.(() => {
      if (!config.sourceImageUrl) {
        handleTriggerUpload();
        return;
      }
      setIsExportModalOpen(true);
    });
  }, [onRegisterExport, config.sourceImageUrl, handleTriggerUpload]);

  useEffect(() => {
    onRegisterUpload?.(handleTriggerUpload);
  }, [onRegisterUpload, handleTriggerUpload]);

  useEffect(() => {
    onRegisterCrop?.(() => {
      if (config.sourceImageUrl) {
        setIsCropModalOpen(true);
      }
    });
  }, [onRegisterCrop, config.sourceImageUrl]);

  useEffect(() => {
    onExportStateChange?.(isExporting);
  }, [isExporting, onExportStateChange]);

  useEffect(() => {
    onHasImageChange?.(!!config.sourceImageUrl);
  }, [config.sourceImageUrl, onHasImageChange]);

  return (
    <div className="editor-container icon-resizer-container" style={{ display: isVisible ? 'flex' : 'none' }}>
      {/* Sol / Orta Canvas Alanı */}
      <IconCanvasPreview
        config={config}
        onChangeConfig={handleUpdateConfig}
        onFileSelect={handleFileSelect}
      />

      {/* Sağ Ayarlar Paneli */}
      <IconInspectorPanel
        config={config}
        onChangeConfig={handleUpdateConfig}
        onTriggerUpload={handleTriggerUpload}
        onOpenCropModal={() => setIsCropModalOpen(true)}
      />

      {/* 1:1 Kare Kırpma Modalı */}
      {isCropModalOpen && (originalImageUrl || config.sourceImageUrl) && (
        <ImageCropModal
          imageSrc={originalImageUrl || config.sourceImageUrl!}
          aspectRatio={1}
          onCropComplete={(croppedBase64) => {
            handleUpdateConfig({
              sourceImageUrl: croppedBase64,
            });
            setIsCropModalOpen(false);
          }}
          onResetToOriginal={() => {
            if (originalImageUrl) {
              handleUpdateConfig({ sourceImageUrl: originalImageUrl });
            }
            setIsCropModalOpen(false);
          }}
          onCancel={() => setIsCropModalOpen(false)}
        />
      )}

      {/* Dışa Aktarma Seçenekleri Modalı */}
      <IconExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        onChangeConfig={handleUpdateConfig}
        onExport={handleExport}
        isExporting={isExporting}
        exportProgressText={exportProgressText}
        exportPercent={exportPercent}
      />
    </div>
  );
};
