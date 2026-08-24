import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import type { MockupConfig } from './types/mockup';
import { DEVICE_MODELS } from './constants/devices';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MockupCanvas } from './components/MockupEditor/MockupCanvas';
import { InspectorPanel } from './components/MockupEditor/InspectorPanel';
import { ImageCropModal } from './components/MockupEditor/ImageCropModal';

const INITIAL_CONFIG: MockupConfig = {
  exportMode: 'full-canvas',
  preset: 'appstore-6.7',
  width: 1290,
  height: 2796,
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
      y: -230,
      fontSize: 26,
      color: '#0F172A',
      fontFamily: 'sans',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    {
      id: 'layer-2',
      text: 'Açıklama',
      x: 0,
      y: -190,
      fontSize: 15,
      color: '#64748B',
      fontFamily: 'sans',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      letterSpacing: 0,
    }
  ],
  exportScale: 2,
};

export function App() {
  const [activeTool, setActiveTool] = useState<string>('mockup-editor');
  const [config, setConfig] = useState<MockupConfig>(INITIAL_CONFIG);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const deviceFrameRef = useRef<HTMLDivElement>(null);

  // Undo / Redo History Stacks
  const historyRef = useRef<MockupConfig[]>([JSON.parse(JSON.stringify(INITIAL_CONFIG))]);
  const historyIndexRef = useRef<number>(0);
  const clipboardRef = useRef<{ type: 'layers'; data: typeof INITIAL_CONFIG.textLayers } | null>(null);

  // Helper to extract content-relevant state (excluding pure active selection pointers)
  const getContentSnapshot = (cfg: MockupConfig) => {
    return JSON.stringify({
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
      padding: cfg.padding,
      borderRadius: cfg.borderRadius,
      shadowDepth: cfg.shadowDepth,
      frameRotation: cfg.frameRotation,
      showHeadline: cfg.showHeadline,
      textLayers: cfg.textLayers,
    });
  };

  const handleUpdateConfig = (updated: Partial<MockupConfig>, recordHistory = true) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      if (recordHistory) {
        const prevSnap = getContentSnapshot(historyRef.current[historyIndexRef.current] || prev);
        const nextSnap = getContentSnapshot(next);

        // Only record history entry if meaningful visual/content properties changed
        if (prevSnap !== nextSnap) {
          const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
          newHist.push(JSON.parse(JSON.stringify(next)));
          if (newHist.length > 60) newHist.shift();
          historyRef.current = newHist;
          historyIndexRef.current = newHist.length - 1;
        }
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setConfig(targetState);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setConfig(targetState);
    }
  };

  // Global Keyboard Shortcuts (Undo, Redo, Copy, Cut, Paste, Delete, Select All)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is actively typing in an input, textarea, or contentEditable element, let default native behavior handle it
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );

      const isCtrl = e.ctrlKey || e.metaKey;

      // Undo: Ctrl + Z
      if (isCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isTyping) {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      // Redo: Ctrl + Y or Ctrl + Shift + Z
      if ((isCtrl && e.key.toLowerCase() === 'y') || (isCtrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
        if (!isTyping) {
          e.preventDefault();
          handleRedo();
        }
        return;
      }

      // Select All text layers: Ctrl + A (when not typing)
      if (isCtrl && e.key.toLowerCase() === 'a' && !isTyping) {
        e.preventDefault();
        const allIds = (config.textLayers || []).map((l) => l.id);
        if (allIds.length > 0) {
          handleUpdateConfig({
            selectedTextIds: allIds,
            selectedTextId: allIds[0],
          });
        }
        return;
      }

      // Copy: Ctrl + C
      if (isCtrl && e.key.toLowerCase() === 'c' && !isTyping) {
        const activeIds = config.selectedTextIds && config.selectedTextIds.length > 0
          ? config.selectedTextIds
          : config.selectedTextId
          ? [config.selectedTextId]
          : [];

        if (activeIds.length > 0) {
          const selectedLayers = (config.textLayers || []).filter((l) => activeIds.includes(l.id));
          if (selectedLayers.length > 0) {
            clipboardRef.current = {
              type: 'layers',
              data: JSON.parse(JSON.stringify(selectedLayers)),
            };
          }
        }
        return;
      }

      // Cut: Ctrl + X
      if (isCtrl && e.key.toLowerCase() === 'x' && !isTyping) {
        const activeIds = config.selectedTextIds && config.selectedTextIds.length > 0
          ? config.selectedTextIds
          : config.selectedTextId
          ? [config.selectedTextId]
          : [];

        if (activeIds.length > 0) {
          e.preventDefault();
          const selectedLayers = (config.textLayers || []).filter((l) => activeIds.includes(l.id));
          clipboardRef.current = {
            type: 'layers',
            data: JSON.parse(JSON.stringify(selectedLayers)),
          };
          const remaining = (config.textLayers || []).filter((l) => !activeIds.includes(l.id));
          handleUpdateConfig({
            textLayers: remaining,
            selectedTextId: remaining[0]?.id || null,
            selectedTextIds: remaining[0] ? [remaining[0].id] : [],
          });
        }
        return;
      }

      // Paste: Ctrl + V (Paste copied text layer directly below the source text)
      if (isCtrl && e.key.toLowerCase() === 'v' && !isTyping) {
        if (clipboardRef.current && clipboardRef.current.type === 'layers') {
          e.preventDefault();
          const now = Date.now();
          const clonedLayers = clipboardRef.current.data.map((layer, idx) => {
            // Place right below the copied text (vertical offset by its fontSize + line gap)
            const verticalOffset = Math.max(30, (layer.fontSize || 24) + 16);
            return {
              ...layer,
              id: `layer-paste-${now}-${idx}`,
              x: layer.x, // keep horizontal alignment intact
              y: layer.y + verticalOffset, // place directly below
            };
          });

          const nextTextLayers = [...(config.textLayers || []), ...clonedLayers];
          const newSelectedIds = clonedLayers.map((l) => l.id);

          handleUpdateConfig({
            textLayers: nextTextLayers,
            selectedTextIds: newSelectedIds,
            selectedTextId: newSelectedIds[0],
          });
        }
        return;
      }

      // Delete / Backspace: Remove selected text layers or screenshot if device is selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        const activeIds = config.selectedTextIds && config.selectedTextIds.length > 0
          ? config.selectedTextIds
          : config.selectedTextId
          ? [config.selectedTextId]
          : [];

        if (activeIds.length > 0) {
          e.preventDefault();
          const remaining = (config.textLayers || []).filter((l) => !activeIds.includes(l.id));
          handleUpdateConfig({
            textLayers: remaining,
            selectedTextId: remaining[0]?.id || null,
            selectedTextIds: remaining[0] ? [remaining[0].id] : [],
          });
        } else if (config.screenshotUrl) {
          // If no text is selected but screenshot is active, remove screenshot on Delete
          e.preventDefault();
          handleUpdateConfig({
            screenshotUrl: null,
            cropData: null,
            screenshotScale: 1,
            screenshotOffsetX: 0,
            screenshotOffsetY: 0,
          });
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const rawUrl = e.target.result as string;
        handleUpdateConfig({ 
          screenshotUrl: rawUrl,
          originalScreenshotUrl: rawUrl,
          cropData: null,
          screenshotScale: 1,
          screenshotOffsetX: 0,
          screenshotOffsetY: 0
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

  const handleExportPng = async (overrideMode?: 'full-canvas' | 'device-only') => {
    const targetMode = overrideMode || config.exportMode;
    const targetElement = targetMode === 'device-only' ? deviceFrameRef.current : exportRef.current;

    if (!targetElement) return;

    try {
      setIsExporting(true);
      const pixelRatio = config.exportScale || 2;
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
        ? `devtoo-${config.deviceType}-transparent-${Date.now()}.png`
        : `devtoo-mockup-${config.preset}-${Date.now()}.png`;
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

  // Get current device target aspect ratio for cropper
  const currentModel = DEVICE_MODELS.find(m => m.id === config.deviceType) || DEVICE_MODELS[0];
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
            config={config}
            onChangeConfig={handleUpdateConfig}
            onUploadImageClick={handleTriggerUpload}
            exportRef={exportRef}
            deviceFrameRef={deviceFrameRef}
            isExporting={isExporting}
          />

          <InspectorPanel
            config={config}
            onChangeConfig={handleUpdateConfig}
            onFileSelect={handleFileSelect}
            onOpenCropModal={() => setIsCropModalOpen(true)}
          />
        </div>
      </div>

      {/* Interactive Crop Modal */}
      {isCropModalOpen && (config.originalScreenshotUrl || config.screenshotUrl) && (
        <ImageCropModal
          imageSrc={config.originalScreenshotUrl || config.screenshotUrl!}
          aspectRatio={targetAspect}
          initialCrop={config.cropData as any}
          onCropComplete={(croppedDataUrl, cropDetails) => {
            handleUpdateConfig({
              screenshotUrl: croppedDataUrl,
              cropData: cropDetails,
              screenshotScale: 1,
              screenshotOffsetX: 0,
              screenshotOffsetY: 0
            });
            setIsCropModalOpen(false);
          }}
          onResetToOriginal={() => {
            handleUpdateConfig({
              screenshotUrl: config.originalScreenshotUrl || config.screenshotUrl,
              cropData: null,
              screenshotScale: 1,
              screenshotOffsetX: 0,
              screenshotOffsetY: 0
            });
            setIsCropModalOpen(false);
          }}
          onCancel={() => setIsCropModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
