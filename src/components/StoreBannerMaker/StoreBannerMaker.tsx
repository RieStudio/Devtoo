import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { StoreBannerConfig, BannerDeviceConfig } from '../../types/storeBanner';
import { INITIAL_BANNER_CONFIG } from '../../constants/bannerPresets';
import { BannerCanvasPreview } from './BannerCanvasPreview';
import { BannerInspectorPanel } from './BannerInspectorPanel';
import { ImageCropModal } from '../MockupEditor/ImageCropModal';

interface StoreBannerMakerProps {
  isVisible?: boolean;
  onRegisterExport?: (exportFn: () => void) => void;
  onRegisterUpload?: (uploadFn: () => void) => void;
  onExportStateChange?: (isExporting: boolean) => void;
  onShowToast?: (message: string) => void;
}

export const StoreBannerMaker: React.FC<StoreBannerMakerProps> = ({
  isVisible = true,
  onRegisterExport,
  onRegisterUpload,
  onExportStateChange,
  onShowToast,
}) => {
  const [config, setConfig] = useState<StoreBannerConfig>(INITIAL_BANNER_CONFIG);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Device crop state
  const [activeCropDeviceId, setActiveCropDeviceId] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Surface export ref for html-to-image
  const canvasExportRef = useRef<HTMLDivElement>(null);

  const handleUpdateConfig = (updated: Partial<StoreBannerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Upload file helper
  const openFilePicker = (accept: string, onSelected: (base64: string, file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onSelected(result, file);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Device Screenshot Upload
  const handleUploadDeviceScreenshot = useCallback((deviceId: string) => {
    openFilePicker('image/png,image/jpeg,image/webp', (base64) => {
      const updatedDevices = config.devices.map((d) => {
        if (d.id === deviceId) {
          return {
            ...d,
            screenshotUrl: base64,
            originalScreenshotUrl: base64,
            cropData: null,
          };
        }
        return d;
      }) as BannerDeviceConfig[];

      handleUpdateConfig({
        devices: updatedDevices,
        selectedDeviceId: deviceId,
      });

      if (onShowToast) onShowToast('Ekran görüntüsü cihaza yerleştirildi.');
    });
  }, [config.devices, onShowToast]);

  // Crop Device Screenshot
  const handleCropDeviceScreenshot = (deviceId: string) => {
    setActiveCropDeviceId(deviceId);
    setIsCropModalOpen(true);
  };

  // App Icon Upload
  const handleUploadAppIcon = () => {
    openFilePicker('image/png,image/jpeg,image/webp,image/svg+xml', (base64) => {
      handleUpdateConfig({ appIconUrl: base64, showAppIcon: true });
      if (onShowToast) onShowToast('Uygulama ikonu güncellendi.');
    });
  };

  // Background Image Upload
  const handleUploadBgImage = () => {
    openFilePicker('image/png,image/jpeg,image/webp', (base64) => {
      handleUpdateConfig({ bgImageUrl: base64, bgType: 'image' });
      if (onShowToast) onShowToast('Arka plan görseli uygulandı.');
    });
  };

  // Export Banner to PNG / JPEG
  const handlePerformExport = useCallback(async () => {
    if (!canvasExportRef.current) return;
    setIsExporting(true);
    if (onExportStateChange) onExportStateChange(true);

    try {
      const exportElement = canvasExportRef.current;
      const pixelRatio = config.exportScale || 1;

      // Google Play requires strictly 1024x500 without alpha or JPG
      const isGooglePlay = config.preset === 'google-play-feature';

      let dataUrl: string;
      let fileExt = 'png';

      if (isGooglePlay) {
        // High quality JPEG/PNG
        dataUrl = await toPng(exportElement, {
          quality: 1,
          pixelRatio: pixelRatio,
          cacheBust: true,
          style: {
            transform: 'none',
            borderRadius: '0px',
          },
        });
      } else {
        dataUrl = await toPng(exportElement, {
          quality: 0.98,
          pixelRatio: pixelRatio,
          cacheBust: true,
          style: {
            transform: 'none',
            borderRadius: '0px',
          },
        });
      }

      // Trigger download
      const link = document.createElement('a');
      const cleanTitle = (config.titleText || 'store-banner')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      link.download = `${cleanTitle}-${config.width}x${config.height}.${fileExt}`;
      link.href = dataUrl;
      link.click();

      if (onShowToast) {
        onShowToast(`Banner indirildi (${config.width * pixelRatio}×${config.height * pixelRatio} px)`);
      }
    } catch (err) {
      console.error('Banner export error:', err);
      if (onShowToast) onShowToast('Dışa aktarma sırasında bir hata oluştu.');
    } finally {
      setIsExporting(false);
      if (onExportStateChange) onExportStateChange(false);
    }
  }, [config, onExportStateChange, onShowToast]);

  // Register callbacks for top Header integration
  useEffect(() => {
    if (isVisible && onRegisterExport) {
      onRegisterExport(handlePerformExport);
    }
  }, [isVisible, onRegisterExport, handlePerformExport]);

  useEffect(() => {
    if (isVisible && onRegisterUpload) {
      const targetDevId = config.selectedDeviceId || config.devices[0]?.id || 'device-1';
      onRegisterUpload(() => handleUploadDeviceScreenshot(targetDevId));
    }
  }, [isVisible, onRegisterUpload, handleUploadDeviceScreenshot, config.selectedDeviceId, config.devices]);

  // Target device being cropped
  const cropTargetDevice = config.devices.find((d) => d.id === activeCropDeviceId) || config.devices[0];

  return (
    <div className="editor-container store-banner-container" style={{ display: isVisible ? 'flex' : 'none' }}>
      {/* Canvas Viewport */}
      <BannerCanvasPreview
        config={config}
        onChangeConfig={handleUpdateConfig}
        onUploadDeviceScreenshot={handleUploadDeviceScreenshot}
        onCropDeviceScreenshot={handleCropDeviceScreenshot}
        onUploadAppIcon={handleUploadAppIcon}
        canvasExportRef={canvasExportRef}
        isVisible={isVisible}
      />

      {/* Right Inspector Panel */}
      <BannerInspectorPanel
        config={config}
        onChangeConfig={handleUpdateConfig}
        onUploadDeviceScreenshot={handleUploadDeviceScreenshot}
        onCropDeviceScreenshot={handleCropDeviceScreenshot}
        onUploadAppIcon={handleUploadAppIcon}
        onUploadBgImage={handleUploadBgImage}
        onExport={handlePerformExport}
        isExporting={isExporting}
        onShowToast={onShowToast}
      />

      {/* Interactive Crop Modal for Device Screenshots */}
      {isCropModalOpen && cropTargetDevice && (cropTargetDevice.originalScreenshotUrl || cropTargetDevice.screenshotUrl) && (
        <ImageCropModal
          imageSrc={cropTargetDevice.originalScreenshotUrl || cropTargetDevice.screenshotUrl!}
          aspectRatio={9 / 19.5} // Standard mobile screen ratio
          initialCrop={cropTargetDevice.cropData}
          onCropComplete={(croppedDataUrl, cropDetails) => {
            const updatedDevices = config.devices.map((d) => {
              if (d.id === cropTargetDevice.id) {
                return {
                  ...d,
                  screenshotUrl: croppedDataUrl,
                  cropData: cropDetails,
                };
              }
              return d;
            }) as BannerDeviceConfig[];

            handleUpdateConfig({ devices: updatedDevices });
            setIsCropModalOpen(false);
            if (onShowToast) onShowToast('Görsel kırpıldı ve güncellendi.');
          }}
          onResetToOriginal={() => {
            const orig = cropTargetDevice.originalScreenshotUrl || cropTargetDevice.screenshotUrl;
            const updatedDevices = config.devices.map((d) => {
              if (d.id === cropTargetDevice.id) {
                return {
                  ...d,
                  screenshotUrl: orig,
                  cropData: null,
                };
              }
              return d;
            }) as BannerDeviceConfig[];

            handleUpdateConfig({ devices: updatedDevices });
            setIsCropModalOpen(false);
          }}
          onCancel={() => setIsCropModalOpen(false)}
        />
      )}
    </div>
  );
};
