import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { AlertCircle, X } from 'lucide-react';
import type { MockupConfig } from './types/mockup';
import { getMockupDevices } from './types/mockup';
import { DEVICE_MODELS } from './constants/devices';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MockupCanvas } from './components/MockupEditor/MockupCanvas';
import { InspectorPanel } from './components/MockupEditor/InspectorPanel';
import { ImageCropModal } from './components/MockupEditor/ImageCropModal';

const INITIAL_CONFIG: MockupConfig = {
  id: 'screen-1',
  screenTitle: 'Ekran 1',
  exportMode: 'full-canvas',
  preset: 'appstore-6.7',
  width: 1080,
  height: 1920,
  bgType: 'solid',
  bgColor: '#FFF0F3',
  patternOpacity: 0.1,
  deviceType: 'iphone-17-pro-max',
  deviceColor: 'default',
  screenshotUrl: null,
  screenshotScale: 1,
  screenshotOffsetX: 0,
  screenshotOffsetY: 0,
  deviceScale: 1,
  deviceOffsetX: 0,
  deviceOffsetY: 60,
  deviceRotation: 0,
  devices: [
    {
      id: 'device-1',
      deviceType: 'iphone-17-pro-max',
      deviceColor: 'default',
      screenshotUrl: null,
      screenshotScale: 1,
      screenshotOffsetX: 0,
      screenshotOffsetY: 0,
      deviceScale: 1,
      deviceOffsetX: 0,
      deviceOffsetY: 60,
      deviceRotation: 0,
      shadowDepth: 'medium',
      borderRadius: 24,
    },
  ],
  selectedDeviceId: 'device-1',
  padding: 32,
  borderRadius: 24,
  shadowDepth: 'medium',
  frameRotation: 0,
  showHeadline: true,
  selectedTextId: null,
  textLayers: [
    {
      id: 'layer-1',
      text: 'Uygulamanızın Adı',
      x: 0,
      y: -260,
      fontSize: 26,
      color: '#0F172A',
      fontFamily: 'outfit',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      letterSpacing: -0.5,
      rotation: 0,
      width: 320,
    },
    {
      id: 'layer-2',
      text: 'Açıklama',
      x: 0,
      y: -220,
      fontSize: 14,
      color: '#475569',
      fontFamily: 'outfit',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      letterSpacing: 0,
      rotation: 0,
      width: 320,
    },
  ],
  exportScale: 2,
};

export function App() {
  const [activeTool, setActiveTool] = useState<string>('mockup-editor');
  const [screens, setScreens] = useState<MockupConfig[]>([INITIAL_CONFIG]);
  const [activeScreenId, setActiveScreenId] = useState<string>(INITIAL_CONFIG.id || 'screen-1');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimeoutRef = useRef<any>(null);
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const exportRef = useRef<HTMLDivElement>(null);
  const deviceFrameRef = useRef<HTMLDivElement>(null);
  const screenRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Currently active screen config object
  const activeScreenConfig = screens.find((s) => s.id === activeScreenId) || screens[0] || INITIAL_CONFIG;

  // Undo / Redo History Stacks for entire screen set
  const historyRef = useRef<MockupConfig[][]>([[JSON.parse(JSON.stringify(INITIAL_CONFIG))]]);
  const historyIndexRef = useRef<number>(0);
  const clipboardRef = useRef<{ type: 'layers'; data: typeof INITIAL_CONFIG.textLayers } | null>(null);

  // Helper to extract content-relevant state
  const getScreensSnapshot = (screensList: MockupConfig[]) => {
    return JSON.stringify(screensList.map((cfg) => ({
      id: cfg.id,
      exportMode: cfg.exportMode,
      preset: cfg.preset,
      width: cfg.width,
      height: cfg.height,
      bgType: cfg.bgType,
      bgColor: cfg.bgColor,
      patternOpacity: cfg.patternOpacity,
      deviceType: cfg.deviceType,
      deviceColor: cfg.deviceColor,
      screenshotUrl: cfg.screenshotUrl,
      screenshotScale: cfg.screenshotScale,
      screenshotOffsetX: cfg.screenshotOffsetX,
      screenshotOffsetY: cfg.screenshotOffsetY,
      deviceScale: cfg.deviceScale,
      deviceOffsetX: cfg.deviceOffsetX,
      deviceOffsetY: cfg.deviceOffsetY,
      deviceRotation: cfg.deviceRotation,
      devices: cfg.devices,
      selectedDeviceId: cfg.selectedDeviceId,
      padding: cfg.padding,
      borderRadius: cfg.borderRadius,
      shadowDepth: cfg.shadowDepth,
      frameRotation: cfg.frameRotation,
      showHeadline: cfg.showHeadline,
      textLayers: cfg.textLayers,
    })));
  };

  const handleUpdateConfig = (updated: Partial<MockupConfig>, recordHistory = true) => {
    setScreens((prevScreens) => {
      const nextScreens = prevScreens.map((s) => {
        if (s.id === activeScreenId || (!s.id && prevScreens.indexOf(s) === 0)) {
          return { ...s, ...updated };
        }
        return s;
      });

      if (recordHistory) {
        const prevSnap = getScreensSnapshot(historyRef.current[historyIndexRef.current] || prevScreens);
        const nextSnap = getScreensSnapshot(nextScreens);

        if (prevSnap !== nextSnap) {
          const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
          newHist.push(JSON.parse(JSON.stringify(nextScreens)));
          if (newHist.length > 60) newHist.shift();
          historyRef.current = newHist;
          historyIndexRef.current = newHist.length - 1;
        }
      }
      return nextScreens;
    });
  };

  const handleUpdateScreenTitle = (screenId: string, newTitle: string) => {
    setScreens((prevScreens) => {
      const nextScreens = prevScreens.map((s) => {
        if (s.id === screenId) {
          return { ...s, screenTitle: newTitle };
        }
        return s;
      });
      return nextScreens;
    });
  };

  const handleAddScreen = () => {
    if (screens.length >= 10) {
      showToast('En fazla 10 ekran ekleyebilirsiniz.');
      return;
    }

    const newScreenId = `screen-${Date.now()}`;
    const newScreenIndex = screens.length + 1;
    const newScreen: MockupConfig = {
      ...JSON.parse(JSON.stringify(INITIAL_CONFIG)),
      id: newScreenId,
      screenTitle: `Ekran ${newScreenIndex}`,
      selectedTextId: null,
      selectedTextIds: [],
    };

    setScreens((prev) => {
      const updated = [...prev, newScreen];
      const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHist.push(JSON.parse(JSON.stringify(updated)));
      if (newHist.length > 60) newHist.shift();
      historyRef.current = newHist;
      historyIndexRef.current = newHist.length - 1;
      return updated;
    });
  };

  const handleDuplicateScreen = (screenId: string) => {
    if (screens.length >= 10) {
      showToast('En fazla 10 ekran ekleyebilirsiniz.');
      return;
    }

    const targetScreen = screens.find((s) => s.id === screenId);
    if (!targetScreen) return;

    const newScreenId = `screen-${Date.now()}`;
    const newScreenIndex = screens.length + 1;
    const duplicated: MockupConfig = {
      ...JSON.parse(JSON.stringify(targetScreen)),
      id: newScreenId,
      screenTitle: `Ekran ${newScreenIndex} (Kopya)`,
      selectedTextId: null,
      selectedTextIds: [],
    };

    // Append duplicated screen to the very end of screens array
    const updatedScreens = [...screens, duplicated];

    setScreens(updatedScreens);
    setActiveScreenId(newScreenId);

    const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHist.push(JSON.parse(JSON.stringify(updatedScreens)));
    if (newHist.length > 60) newHist.shift();
    historyRef.current = newHist;
    historyIndexRef.current = newHist.length - 1;
  };

  const handleDeleteScreen = (screenId: string) => {
    if (screens.length <= 1) return;

    const remaining = screens.filter((s) => s.id !== screenId);
    setScreens(remaining);

    if (activeScreenId === screenId) {
      setActiveScreenId(remaining[0]?.id || 'screen-1');
    }

    const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHist.push(JSON.parse(JSON.stringify(remaining)));
    if (newHist.length > 60) newHist.shift();
    historyRef.current = newHist;
    historyIndexRef.current = newHist.length - 1;
  };

  const handleTransferDevice = (
    sourceScreenId: string,
    targetScreenId: string,
    newOffsetX: number,
    newOffsetY: number,
    newScale: number,
    newRotation: number,
    deviceId?: string
  ) => {
    setScreens((prevScreens) => {
      const source = prevScreens.find((s) => s.id === sourceScreenId);
      const target = prevScreens.find((s) => s.id === targetScreenId);
      if (!source || !target) return prevScreens;

      const sourceDevs = getMockupDevices(source);
      const targetDevId = deviceId || source.selectedDeviceId || sourceDevs[0]?.id || 'device-primary';
      const movingDev = sourceDevs.find((d) => d.id === targetDevId) || sourceDevs[0];
      if (!movingDev) return prevScreens;

      // Transfer moving device data with new transformed properties
      const transferredDev: typeof movingDev = {
        ...movingDev,
        id: `device-${Date.now()}`,
        deviceOffsetX: newOffsetX,
        deviceOffsetY: newOffsetY,
        deviceScale: newScale,
        deviceRotation: newRotation,
      };

      // Remaining devices in source screen
      const remainingSourceDevs = sourceDevs.filter((d) => d.id !== movingDev.id);

      // Devices in target screen + transferred device
      const targetDevs = getMockupDevices(target);
      if (targetDevs.length >= 6) {
        showToast('Hedef ekranda en fazla 6 cihaz bulunabilir.');
        return prevScreens;
      }
      const nextTargetDevs = [...targetDevs, transferredDev];

      const nextScreens = prevScreens.map((s) => {
        if (s.id === targetScreenId) {
          return {
            ...s,
            devices: nextTargetDevs,
            selectedDeviceId: transferredDev.id,
            // Sync primary attributes if target was empty/single
            deviceType: transferredDev.deviceType,
            deviceColor: transferredDev.deviceColor,
            screenshotUrl: transferredDev.screenshotUrl,
            originalScreenshotUrl: transferredDev.originalScreenshotUrl,
            cropData: transferredDev.cropData,
            screenshotScale: transferredDev.screenshotScale,
            screenshotOffsetX: transferredDev.screenshotOffsetX,
            screenshotOffsetY: transferredDev.screenshotOffsetY,
            deviceScale: transferredDev.deviceScale,
            deviceOffsetX: transferredDev.deviceOffsetX,
            deviceOffsetY: transferredDev.deviceOffsetY,
            deviceRotation: transferredDev.deviceRotation,
          };
        }
        if (s.id === sourceScreenId) {
          if (remainingSourceDevs.length > 0) {
            const nextPrimary = remainingSourceDevs[0];
            return {
              ...s,
              devices: remainingSourceDevs,
              selectedDeviceId: nextPrimary.id,
              deviceType: nextPrimary.deviceType,
              deviceColor: nextPrimary.deviceColor,
              screenshotUrl: nextPrimary.screenshotUrl,
              originalScreenshotUrl: nextPrimary.originalScreenshotUrl,
              cropData: nextPrimary.cropData,
              screenshotScale: nextPrimary.screenshotScale,
              screenshotOffsetX: nextPrimary.screenshotOffsetX,
              screenshotOffsetY: nextPrimary.screenshotOffsetY,
              deviceScale: nextPrimary.deviceScale,
              deviceOffsetX: nextPrimary.deviceOffsetX,
              deviceOffsetY: nextPrimary.deviceOffsetY,
              deviceRotation: nextPrimary.deviceRotation,
            };
          } else {
            // Source screen now has 0 devices (device moved to target screen)
            return {
              ...s,
              devices: [],
              selectedDeviceId: null,
              screenshotUrl: null,
              originalScreenshotUrl: null,
              cropData: null,
            };
          }
        }
        return s;
      });

      const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHist.push(JSON.parse(JSON.stringify(nextScreens)));
      if (newHist.length > 60) newHist.shift();
      historyRef.current = newHist;
      historyIndexRef.current = newHist.length - 1;

      return nextScreens;
    });

    setActiveScreenId(targetScreenId);
    const targetTitle = screens.find((s) => s.id === targetScreenId)?.screenTitle || 'Yeni ekrana';
    showToast(`Cihaz ${targetTitle} aktarıldı`);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setScreens(targetState);
      if (!targetState.some((s: MockupConfig) => s.id === activeScreenId)) {
        setActiveScreenId(targetState[0]?.id || 'screen-1');
      }
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setScreens(targetState);
      if (!targetState.some((s: MockupConfig) => s.id === activeScreenId)) {
        setActiveScreenId(targetState[0]?.id || 'screen-1');
      }
    }
  };

  // Global Keyboard Shortcuts (Undo, Redo, Copy, Cut, Paste, Delete, Select All)
  useEffect(() => {
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

      // Ctrl + A: Select All text layers
      if (isCtrl && e.key.toLowerCase() === 'a' && !isTyping) {
        e.preventDefault();
        const allIds = (activeScreenConfig.textLayers || []).map((l) => l.id);
        if (allIds.length > 0) {
          handleUpdateConfig({
            selectedTextIds: allIds,
            selectedTextId: allIds[0],
          });
        }
      }

      // Copy: Ctrl + C
      if (isCtrl && e.key.toLowerCase() === 'c' && !isTyping) {
        const activeIds = activeScreenConfig.selectedTextIds && activeScreenConfig.selectedTextIds.length > 0
          ? activeScreenConfig.selectedTextIds
          : activeScreenConfig.selectedTextId
          ? [activeScreenConfig.selectedTextId]
          : [];

        if (activeIds.length > 0) {
          e.preventDefault();
          const selectedLayers = (activeScreenConfig.textLayers || []).filter((l) => activeIds.includes(l.id));
          if (selectedLayers.length > 0) {
            clipboardRef.current = {
              type: 'layers',
              data: JSON.parse(JSON.stringify(selectedLayers)),
            };
          }
        }
      }

      // Cut: Ctrl + X
      if (isCtrl && e.key.toLowerCase() === 'x' && !isTyping) {
        const activeIds = activeScreenConfig.selectedTextIds && activeScreenConfig.selectedTextIds.length > 0
          ? activeScreenConfig.selectedTextIds
          : activeScreenConfig.selectedTextId
          ? [activeScreenConfig.selectedTextId]
          : [];

        if (activeIds.length > 0) {
          e.preventDefault();
          const selectedLayers = (activeScreenConfig.textLayers || []).filter((l) => activeIds.includes(l.id));
          if (selectedLayers.length > 0) {
            clipboardRef.current = {
              type: 'layers',
              data: JSON.parse(JSON.stringify(selectedLayers)),
            };
            const remaining = (activeScreenConfig.textLayers || []).filter((l) => !activeIds.includes(l.id));
            handleUpdateConfig({
              textLayers: remaining,
              selectedTextId: remaining[0]?.id || null,
              selectedTextIds: remaining[0] ? [remaining[0].id] : [],
            });
          }
        }
      }

      // Paste: Ctrl + V
      if (isCtrl && e.key.toLowerCase() === 'v' && !isTyping) {
        if (clipboardRef.current && clipboardRef.current.type === 'layers') {
          e.preventDefault();
          const clonedLayers = clipboardRef.current.data.map((l) => ({
            ...l,
            id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            x: l.x + 20,
            y: l.y + 20,
          }));

          const updatedLayers = [...(activeScreenConfig.textLayers || []), ...clonedLayers];
          const newSelectedIds = clonedLayers.map((l) => l.id);

          handleUpdateConfig({
            textLayers: updatedLayers,
            selectedTextIds: newSelectedIds,
            selectedTextId: newSelectedIds[0],
          });
        }
      }

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        const activeIds = activeScreenConfig.selectedTextIds && activeScreenConfig.selectedTextIds.length > 0
          ? activeScreenConfig.selectedTextIds
          : activeScreenConfig.selectedTextId
          ? [activeScreenConfig.selectedTextId]
          : [];

        if (activeIds.length > 0) {
          e.preventDefault();
          const remaining = (activeScreenConfig.textLayers || []).filter((l) => !activeIds.includes(l.id));
          handleUpdateConfig({
            textLayers: remaining,
            selectedTextId: remaining[0]?.id || null,
            selectedTextIds: remaining[0] ? [remaining[0].id] : [],
          });
        } else if (activeScreenConfig.selectedDeviceId) {
          // Delete selected device from screen
          e.preventDefault();
          const currentDevs = getMockupDevices(activeScreenConfig);
          const remainingDevs = currentDevs.filter((d) => d.id !== activeScreenConfig.selectedDeviceId);
          const nextSelectedDevId = remainingDevs[0]?.id || null;

          handleUpdateConfig({
            devices: remainingDevs,
            selectedDeviceId: nextSelectedDevId,
            ...(remainingDevs[0] ? {
              deviceType: remainingDevs[0].deviceType,
              deviceColor: remainingDevs[0].deviceColor,
              screenshotUrl: remainingDevs[0].screenshotUrl,
              screenshotScale: remainingDevs[0].screenshotScale,
              screenshotOffsetX: remainingDevs[0].screenshotOffsetX,
              screenshotOffsetY: remainingDevs[0].screenshotOffsetY,
              deviceScale: remainingDevs[0].deviceScale,
              deviceOffsetX: remainingDevs[0].deviceOffsetX,
              deviceOffsetY: remainingDevs[0].deviceOffsetY,
              deviceRotation: remainingDevs[0].deviceRotation,
            } : {
              screenshotUrl: null,
              originalScreenshotUrl: null,
              cropData: null,
            }),
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screens, activeScreenId, activeScreenConfig]);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const rawUrl = e.target.result as string;
        const currentDevs = getMockupDevices(activeScreenConfig);
        const targetDevId = activeScreenConfig.selectedDeviceId || currentDevs[0]?.id || 'device-primary';
        const updatedDevs = currentDevs.map((d) =>
          d.id === targetDevId
            ? {
                ...d,
                screenshotUrl: rawUrl,
                originalScreenshotUrl: rawUrl,
                cropData: null,
                screenshotScale: 1,
                screenshotOffsetX: 0,
                screenshotOffsetY: 0,
              }
            : d
        );

        handleUpdateConfig({
          devices: updatedDevs,
          screenshotUrl: rawUrl,
          originalScreenshotUrl: rawUrl,
          cropData: null,
          screenshotScale: 1,
          screenshotOffsetX: 0,
          screenshotOffsetY: 0,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    };
    input.click();
  };

  // Export Active Screen
  const handleExportPng = async (overrideMode?: 'full-canvas' | 'device-only') => {
    const targetMode = overrideMode || activeScreenConfig.exportMode;
    const targetElement = targetMode === 'device-only' ? deviceFrameRef.current : exportRef.current;

    if (!targetElement) return;

    try {
      setIsExporting(true);
      const pixelRatio = activeScreenConfig.exportScale || 2;
      const dataUrl = await toPng(targetElement, {
        cacheBust: true,
        pixelRatio: pixelRatio,
        backgroundColor: targetMode === 'device-only' ? undefined : undefined,
        style: targetMode === 'device-only' ? {
          background: 'transparent',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        } : undefined,
      });

      const link = document.createElement('a');
      const filename = targetMode === 'device-only'
        ? `devtoo-${activeScreenConfig.deviceType}-transparent-${Date.now()}.png`
        : `devtoo-mockup-${activeScreenConfig.preset}-${Date.now()}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Dışa aktarma hatası:', err);
      alert('Görsel dışa aktarılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export All Screens in a single ZIP archive
  const handleExportAllPng = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();

      for (let i = 0; i < screens.length; i++) {
        const s = screens[i];
        const targetElement = s.id ? screenRefs.current.get(s.id) : null;
        if (targetElement) {
          const pixelRatio = s.exportScale || 2;
          const dataUrl = await toPng(targetElement, {
            cacheBust: true,
            pixelRatio: pixelRatio,
          });

          // Convert Data URL base64 to binary buffer for JSZip
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const screenFileName = `ekran-${i + 1}-${s.preset || 'mockup'}.png`;
          zip.file(screenFileName, base64Data, { base64: true });
        }
      }

      // Generate ZIP blob and trigger single download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `devtoo-mockups-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Toplu dışa aktarma hatası:', err);
      showToast('Görseller ZIP olarak indirilirken bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentScreenDevices = getMockupDevices(activeScreenConfig);
  const activeSelectedDevId = activeScreenConfig.selectedDeviceId || currentScreenDevices[0]?.id || 'device-primary';
  const activeSelectedDev = currentScreenDevices.find((d) => d.id === activeSelectedDevId) || currentScreenDevices[0];

  const currentModel = DEVICE_MODELS.find(m => m.id === (activeSelectedDev?.deviceType || activeScreenConfig.deviceType)) || DEVICE_MODELS[0];
  const targetAspect = currentModel.defaultRatio;

  return (
    <div className="devtoo-layout">
      {/* Sol Sabit Menü (Sidebar) */}
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Ana Çalışma Alanı (Workspace) */}
      <div className="main-workspace">
        {/* Üst Navigasyon Barı */}
        <Header
          onExport={handleExportPng}
          onExportAll={handleExportAllPng}
          screenCount={screens.length}
          onUploadClick={handleTriggerUpload}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndexRef.current > 0}
          canRedo={historyIndexRef.current < historyRef.current.length - 1}
          isExporting={isExporting}
        />

        {/* Editör & Sağ Inspector Alanı */}
        <div className="editor-container">
          <MockupCanvas
            screens={screens}
            activeScreenId={activeScreenId}
            onSelectScreen={setActiveScreenId}
            onAddScreen={handleAddScreen}
            onDuplicateScreen={handleDuplicateScreen}
            onDeleteScreen={handleDeleteScreen}
            onUpdateScreenTitle={handleUpdateScreenTitle}
            onTransferDevice={handleTransferDevice}
            config={activeScreenConfig}
            onChangeConfig={handleUpdateConfig}
            onUploadImageClick={handleTriggerUpload}
            exportRef={exportRef}
            screenRefs={screenRefs}
            deviceFrameRef={deviceFrameRef}
            isExporting={isExporting}
          />

          <InspectorPanel
            config={activeScreenConfig}
            onChangeConfig={handleUpdateConfig}
            onFileSelect={handleFileSelect}
            onOpenCropModal={() => setIsCropModalOpen(true)}
          />
        </div>
      </div>

      {/* Interactive Crop Modal */}
      {isCropModalOpen && (activeSelectedDev?.originalScreenshotUrl || activeSelectedDev?.screenshotUrl || activeScreenConfig.originalScreenshotUrl || activeScreenConfig.screenshotUrl) && (
        <ImageCropModal
          imageSrc={activeSelectedDev?.originalScreenshotUrl || activeSelectedDev?.screenshotUrl || activeScreenConfig.originalScreenshotUrl || activeScreenConfig.screenshotUrl!}
          aspectRatio={targetAspect}
          initialCrop={(activeSelectedDev?.cropData || activeScreenConfig.cropData) as any}
          onCropComplete={(croppedDataUrl, cropDetails) => {
            const updatedDevs = currentScreenDevices.map((d) =>
              d.id === activeSelectedDev.id
                ? {
                    ...d,
                    screenshotUrl: croppedDataUrl,
                    cropData: cropDetails,
                    screenshotScale: 1,
                    screenshotOffsetX: 0,
                    screenshotOffsetY: 0,
                  }
                : d
            );
            handleUpdateConfig({
              devices: updatedDevs,
              screenshotUrl: croppedDataUrl,
              cropData: cropDetails,
              screenshotScale: 1,
              screenshotOffsetX: 0,
              screenshotOffsetY: 0,
            });
            setIsCropModalOpen(false);
          }}
          onResetToOriginal={() => {
            const origUrl = activeSelectedDev?.originalScreenshotUrl || activeSelectedDev?.screenshotUrl || activeScreenConfig.originalScreenshotUrl || activeScreenConfig.screenshotUrl;
            const updatedDevs = currentScreenDevices.map((d) =>
              d.id === activeSelectedDev.id
                ? {
                    ...d,
                    screenshotUrl: origUrl,
                    cropData: null,
                    screenshotScale: 1,
                    screenshotOffsetX: 0,
                    screenshotOffsetY: 0,
                  }
                : d
            );
            handleUpdateConfig({
              devices: updatedDevs,
              screenshotUrl: origUrl,
              cropData: null,
              screenshotScale: 1,
              screenshotOffsetX: 0,
              screenshotOffsetY: 0,
            });
            setIsCropModalOpen(false);
          }}
          onCancel={() => setIsCropModalOpen(false)}
        />
      )}

      {/* Elegant Toast Alert Notification */}
      {toastMessage && (
        <div className="app-toast-container">
          <div className="app-toast-box">
            <div className="toast-icon-wrap">
              <AlertCircle size={18} />
            </div>
            <span className="toast-message">{toastMessage}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToastMessage(null)}
              title="Kapat"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
