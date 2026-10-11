import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { StoreBannerConfig, BannerDeviceConfig } from '../../types/storeBanner';
import { INITIAL_BANNER_CONFIG } from '../../constants/bannerPresets';
import { BannerCanvasPreview } from './BannerCanvasPreview';
import { BannerInspectorPanel } from './BannerInspectorPanel';
import { BannerExportModal } from './BannerExportModal';
import { ImageCropModal } from '../MockupEditor/ImageCropModal';

interface StoreBannerMakerProps {
  isVisible?: boolean;
  onRegisterExport?: (exportFn: () => void) => void;
  onRegisterUpload?: (uploadFn: () => void) => void;
  onRegisterUndo?: (undoFn: () => void) => void;
  onRegisterRedo?: (redoFn: () => void) => void;
  onHistoryStateChange?: (canUndo: boolean, canRedo: boolean) => void;
  onExportStateChange?: (isExporting: boolean) => void;
  onShowToast?: (message: string) => void;
}

export const StoreBannerMaker: React.FC<StoreBannerMakerProps> = ({
  isVisible = true,
  onRegisterExport,
  onRegisterUpload,
  onRegisterUndo,
  onRegisterRedo,
  onHistoryStateChange,
  onExportStateChange,
  onShowToast,
}) => {
  const [config, setConfig] = useState<StoreBannerConfig>(INITIAL_BANNER_CONFIG);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Device crop state
  const [activeCropDeviceId, setActiveCropDeviceId] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Surface export ref for html-to-image
  const canvasExportRef = useRef<HTMLDivElement>(null);

  // Undo / Redo History Stacks
  const historyRef = useRef<StoreBannerConfig[]>([JSON.parse(JSON.stringify(INITIAL_BANNER_CONFIG))]);
  const historyIndexRef = useRef<number>(0);
  const [, setHistoryTick] = useState<number>(0);

  // Helper to extract content-relevant state (ignores selection-only IDs)
  const getBannerSnapshot = (cfg: StoreBannerConfig) => {
    const { selectedShapeId, selectedTextId, selectedDeviceId, selectedElementId, ...rest } = cfg;
    return JSON.stringify(rest);
  };

  const notifyHistoryState = useCallback(() => {
    const undoable = historyIndexRef.current > 0;
    const redoable = historyIndexRef.current < historyRef.current.length - 1;
    setHistoryTick((t) => t + 1);
    onHistoryStateChange?.(undoable, redoable);
  }, [onHistoryStateChange]);

  const handleUpdateConfig = useCallback((updated: Partial<StoreBannerConfig>, recordHistory = true) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };

      if (recordHistory) {
        const prevSnap = getBannerSnapshot(historyRef.current[historyIndexRef.current] || prev);
        const nextSnap = getBannerSnapshot(next);

        if (prevSnap !== nextSnap) {
          const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
          newHist.push(JSON.parse(JSON.stringify(next)));
          if (newHist.length > 60) newHist.shift();
          historyRef.current = newHist;
          historyIndexRef.current = newHist.length - 1;
          setTimeout(() => notifyHistoryState(), 0);
        }
      }
      return next;
    });
  }, [notifyHistoryState]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const target = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setConfig(target);
      notifyHistoryState();
    }
  }, [notifyHistoryState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const target = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setConfig(target);
      notifyHistoryState();
    }
  }, [notifyHistoryState]);

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

  // Open Export Modal
  const handleOpenExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  // Export Banner to PNG or JPEG with pristine store-compliant quality
  const handlePerformExport = useCallback(async (options?: {
    scale?: number;
    format?: 'png' | 'jpeg';
    customFilename?: string;
  }) => {
    if (!canvasExportRef.current) return;
    setIsExporting(true);
    if (onExportStateChange) onExportStateChange(true);

    try {
      // 1. Allow React state updates to flush into the DOM before capturing (ensures borders/guides are hidden)
      await new Promise((resolve) => setTimeout(resolve, 80));

      const exportElement = canvasExportRef.current;

      // 2. Ensure all custom web fonts (Outfit, Inter etc.) are fully rendered
      if (document.fonts) {
        await document.fonts.ready;
      }

      // 3. Ensure all images inside the banner surface are completely loaded & decoded
      const images = Array.from(exportElement.querySelectorAll('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      const exportScale = options?.scale || config.exportScale || 1;
      const exportFormat = options?.format || 'png';
      const baseWidth = config.width;
      const baseHeight = config.height;
      const targetWidth = Math.round(baseWidth * exportScale);
      const targetHeight = Math.round(baseHeight * exportScale);

      // Store-specific requirements:
      // Google Play: Strictly 1024x500 px, 24-bit PNG or JPEG without alpha channel (no transparency allowed).
      // App Store Promo: Strictly 1920x1080 px, RGB color space, no transparency.
      // App Store Today: Strictly 1080x1350 px, RGB color space, no transparency.
      // Custom: Exact config.width x config.height px.
      const isGooglePlay = config.preset === 'google-play-feature';
      const isAppStore = config.preset === 'appstore-promo' || config.preset === 'appstore-today';

      // Capture direct native rasterization at exact requested scale (zero downsample blur)
      const rawDataUrl = await toPng(exportElement, {
        cacheBust: true,
        width: baseWidth,
        height: baseHeight,
        canvasWidth: targetWidth,
        canvasHeight: targetHeight,
        pixelRatio: exportScale,
        style: {
          transform: 'none',
          borderRadius: '0px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          margin: '0',
        },
      });

      // Post-process through offscreen canvas:
      // 1. Enforce strict 24-bit opaque RGB (alpha: false) for Google Play & App Store to prevent console upload rejections
      // 2. Exact 1:1 pixel fidelity with no artificial blurring or multi-pass resampling
      const finalDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // For Google Play and App Store, alpha: false ensures strictly 24-bit opaque RGB
          const needsOpaque = isGooglePlay || isAppStore || exportFormat === 'jpeg';
          const ctx = canvas.getContext('2d', { alpha: !needsOpaque });

          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (needsOpaque) {
            // Fill background with solid theme color or fallback to prevent any transparent alpha pixels
            ctx.fillStyle = config.bgColor || '#0F172A';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          // Draw directly 1:1 onto target dimensions without multi-stage downsampling blur
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
          resolve(canvas.toDataURL(mimeType, exportFormat === 'jpeg' ? 0.95 : 1.0));
        };
        img.onerror = () => reject(new Error('Banner render hatası'));
        img.src = rawDataUrl;
      });

      // Trigger download with descriptive store-compliant filename
      const link = document.createElement('a');
      let filename = options?.customFilename;

      if (!filename) {
        const cleanTitle = (config.titleText || 'store-banner')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');

        let presetSuffix = '';
        if (isGooglePlay) {
          presetSuffix = 'google-play-feature';
        } else if (config.preset === 'appstore-promo') {
          presetSuffix = 'appstore-promo';
        } else if (config.preset === 'appstore-today') {
          presetSuffix = 'appstore-today';
        } else {
          presetSuffix = 'banner';
        }

        const scaleTag = exportScale > 1 ? `@${exportScale}x` : '';
        filename = `${cleanTitle}-${presetSuffix}-${targetWidth}x${targetHeight}${scaleTag}`;
      }

      const ext = exportFormat === 'jpeg' ? 'jpg' : 'png';
      link.download = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
      link.href = finalDataUrl;
      link.click();

      setIsExportModalOpen(false);
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
      onRegisterExport(handleOpenExportModal);
    }
  }, [isVisible, onRegisterExport, handleOpenExportModal]);

  useEffect(() => {
    if (isVisible && onRegisterUpload) {
      const targetDevId = config.selectedDeviceId || config.devices[0]?.id || 'device-1';
      onRegisterUpload(() => handleUploadDeviceScreenshot(targetDevId));
    }
  }, [isVisible, onRegisterUpload, handleUploadDeviceScreenshot, config.selectedDeviceId, config.devices]);

  useEffect(() => {
    if (isVisible) {
      onRegisterUndo?.(handleUndo);
      onRegisterRedo?.(handleRedo);
      notifyHistoryState();
    }
  }, [isVisible, onRegisterUndo, onRegisterRedo, notifyHistoryState, handleUndo, handleRedo]);

  // Global Keyboard Shortcuts (Undo / Redo) for Store Banner Maker
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isTyping) {
          e.preventDefault();
          handleUndo();
        }
      } else if (
        (isCtrl && e.key.toLowerCase() === 'y') ||
        (isCtrl && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isTyping) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleUndo, handleRedo]);

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
        isExporting={isExporting}
      />

      {/* Right Inspector Panel */}
      <BannerInspectorPanel
        config={config}
        onChangeConfig={handleUpdateConfig}
        onUploadDeviceScreenshot={handleUploadDeviceScreenshot}
        onCropDeviceScreenshot={handleCropDeviceScreenshot}
        onUploadAppIcon={handleUploadAppIcon}
        onUploadBgImage={handleUploadBgImage}
        onExport={handleOpenExportModal}
        isExporting={isExporting}
        onShowToast={onShowToast}
      />

      {/* Banner Export Quality & Format Modal */}
      <BannerExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handlePerformExport}
        isExporting={isExporting}
        config={config}
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
