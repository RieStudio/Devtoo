import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MockupConfig } from '../../types/mockup';
import { getMockupDevices } from '../../types/mockup';
import { DeviceFrame } from './DeviceFrame';
import { 
  Move, 
  Maximize2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Trash2, 
  Plus, 
  Smartphone 
} from 'lucide-react';

interface MockupCanvasProps {
  screens: MockupConfig[];
  activeScreenId: string;
  onSelectScreen: (id: string) => void;
  onAddScreen: () => void;
  onDuplicateScreen: (id: string) => void;
  onDeleteScreen: (id: string) => void;
  onUpdateScreenTitle?: (id: string, title: string) => void;
  onTransferDevice?: (
    sourceScreenId: string,
    targetScreenId: string,
    newOffsetX: number,
    newOffsetY: number,
    newScale: number,
    newRotation: number,
    deviceId?: string
  ) => void;
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>, recordHistory?: boolean) => void;
  onCommitHistory?: () => void;
  onUploadImageClick: () => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
  screenRefs?: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  deviceFrameRef?: React.RefObject<HTMLDivElement | null>;
  isExporting?: boolean;
}

type DragMode =
  | 'move'
  | 'group-move'
  | 'group-rotate'
  | 'device-rotate'
  | 'resize-nw'
  | 'resize-ne'
  | 'resize-sw'
  | 'resize-se'
  | 'text-move'
  | 'text-rotate'
  | 'text-resize-left'
  | 'text-resize-right'
  | 'text-corner-nw'
  | 'text-corner-ne'
  | 'text-corner-sw'
  | 'text-corner-se'
  | null;

const getFontFamilyCss = (family: string) => {
  switch (family) {
    case 'outfit':
      return '"Outfit", sans-serif';
    case 'poppins':
      return '"Poppins", sans-serif';
    case 'montserrat':
      return '"Montserrat", sans-serif';
    case 'plus-jakarta':
    case 'display':
      return '"Plus Jakarta Sans", "Inter", sans-serif';
    case 'space-grotesk':
      return '"Space Grotesk", sans-serif';
    case 'bebas-neue':
      return '"Bebas Neue", sans-serif';
    case 'anton':
      return '"Anton", sans-serif';
    case 'russo-one':
      return '"Russo One", sans-serif';
    case 'comfortaa':
      return '"Comfortaa", cursive';
    case 'quicksand':
    case 'rounded':
      return '"Quicksand", sans-serif';
    case 'playfair':
      return '"Playfair Display", Georgia, serif';
    case 'lora':
    case 'serif':
      return '"Lora", Georgia, "Times New Roman", serif';
    case 'cinzel':
      return '"Cinzel", Georgia, serif';
    case 'roboto':
      return '"Roboto", sans-serif';
    case 'open-sans':
      return '"Open Sans", sans-serif';
    case 'lato':
      return '"Lato", sans-serif';
    case 'raleway':
      return '"Raleway", sans-serif';
    case 'nunito':
      return '"Nunito", sans-serif';
    case 'rubik':
      return '"Rubik", sans-serif';
    case 'syne':
      return '"Syne", sans-serif';
    case 'orbitron':
      return '"Orbitron", sans-serif';
    case 'jetbrains-mono':
    case 'mono':
      return '"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace';
    case 'fira-code':
      return '"Fira Code", monospace';
    case 'caveat':
      return '"Caveat", cursive';
    case 'dancing-script':
      return '"Dancing Script", cursive';
    case 'pacifico':
      return '"Pacifico", cursive';
    case 'permanent-marker':
      return '"Permanent Marker", cursive';
    case 'inter':
    case 'sans':
    default:
      return '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif';
  }
};

interface EditableCanvasTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  isExporting?: boolean;
  isEditing?: boolean;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  style?: React.CSSProperties;
}

const EditableCanvasText: React.FC<EditableCanvasTextProps> = ({
  value,
  onChange,
  className,
  placeholder,
  isExporting = false,
  isEditing = false,
  onStopEditing,
  style,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== value) {
      contentRef.current.innerText = value || '';
    }
  }, [value]);

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      // Place cursor at the end for typing rather than selecting all text
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false); // collapse to end
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText || '';
    onChange(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      onStopEditing?.();
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable={!isExporting && isEditing}
      suppressContentEditableWarning
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      className={`editable-canvas-text ${className} ${isEditing ? 'is-editing' : ''}`}
      style={{
        ...style,
        cursor: isEditing ? 'text' : 'inherit',
        userSelect: isEditing ? 'text' : 'none',
        pointerEvents: isEditing ? 'auto' : 'none',
      }}
      data-placeholder={placeholder}
      onInput={handleInput}
      onPaste={handlePaste}
      onBlur={onStopEditing}
      onKeyDown={handleKeyDown}
      title={!isExporting ? (isEditing ? undefined : 'Düzenlemek için tıklayın') : undefined}
    />
  );
};

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  screens,
  activeScreenId,
  onSelectScreen,
  onAddScreen,
  onDuplicateScreen,
  onDeleteScreen,
  onUpdateScreenTitle,
  onTransferDevice,
  config,
  onChangeConfig,
  onUploadImageClick,
  exportRef,
  screenRefs,
  deviceFrameRef,
  isExporting = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [snappedGaps, setSnappedGaps] = useState<Set<number>>(new Set());

  const toggleGapSnap = (gapIndex: number) => {
    setSnappedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(gapIndex)) {
        next.delete(gapIndex);
      } else {
        next.add(gapIndex);
      }
      return next;
    });
  };

  const zoomRef = useRef<number>(1);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    panRef.current = panOffset;
  }, [panOffset]);

  // Center the content on first mount using absolute positioning
  useEffect(() => {
    const viewportEl = viewportRef.current;
    const containerEl = containerRef.current;
    if (!viewportEl || !containerEl) return;

    const vpW = viewportEl.clientWidth;
    const vpH = viewportEl.clientHeight;
    const contentW = containerEl.scrollWidth;
    const contentH = containerEl.scrollHeight;

    const initialX = Math.round((vpW - contentW) / 2);
    const initialY = Math.round((vpH - contentH) / 2);

    panRef.current = { x: initialX, y: initialY };
    setPanOffset({ x: initialX, y: initialY });
    setIsReady(true);
  }, []);

  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editingScreenTitle, setEditingScreenTitle] = useState<string>('');
  const panStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<{ showVertical: boolean; showHorizontal: boolean }>({
    showVertical: false,
    showHorizontal: false,
  });

  const isDeviceOnly = config.exportMode === 'device-only';
  const [isDeviceSelected, setIsDeviceSelected] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const startPosRef = useRef<{
    clientX: number;
    clientY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    initialScale: number;
  }>({
    clientX: 0,
    clientY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
    initialScale: 1,
  });

  const rotateCenterRef = useRef<{
    centerX: number;
    centerY: number;
    startRotation: number;
    startPointerAngle: number;
  }>({
    centerX: 0,
    centerY: 0,
    startRotation: 0,
    startPointerAngle: 0,
  });

  const groupDragRef = useRef<{
    startX: number;
    startY: number;
    initialLayers: Array<{ id: string; x: number; y: number; rotation: number }>;
    initialDeviceOffsetX: number;
    initialDeviceOffsetY: number;
    centerX: number;
    centerY: number;
    startAngle: number;
  }>({
    startX: 0,
    startY: 0,
    initialLayers: [],
    initialDeviceOffsetX: 0,
    initialDeviceOffsetY: 0,
    centerX: 0,
    centerY: 0,
    startAngle: 0,
  });

  // Synchronous ref to track whether the drag threshold has been crossed and startPosRef re-anchored
  const dragStartedRef = useRef<boolean>(false);

  // Determine outer container dimensions for responsive fit (9:16 portrait: 378px by 672px)
  const getCanvasDimensions = (cfg: MockupConfig = config) => {
    const isLandscape = cfg.width > cfg.height;
    const isSquare = cfg.width === cfg.height;

    if (isLandscape) {
      return { width: '672px', minHeight: '378px' };
    }
    if (isSquare) {
      return { width: '450px', minHeight: '450px' };
    }
    return { width: '378px', minHeight: '672px' };
  };

  const currentScreens = (screens && screens.length > 0) ? screens : [config];
  const effectiveZoom = zoomLevel;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = Math.min(2.5, Number((zoomLevel + 0.15).toFixed(2)));
    setZoomLevel(newZoom);
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = Math.max(0.25, Number((zoomLevel - 0.15).toFixed(2)));
    setZoomLevel(newZoom);
  };

  const handleZoomReset100 = (e: React.MouseEvent) => {
    e.stopPropagation();
    const viewportEl = viewportRef.current;
    const containerEl = containerRef.current;
    if (viewportEl && containerEl) {
      const vpW = viewportEl.clientWidth;
      const vpH = viewportEl.clientHeight;
      // Content dimensions at zoom=1: use natural size divided by current zoom to get base size
      const currentZ = zoomRef.current;
      const contentW = containerEl.getBoundingClientRect().width / currentZ;
      const contentH = containerEl.getBoundingClientRect().height / currentZ;
      const initialX = Math.round((vpW - contentW) / 2);
      const initialY = Math.round((vpH - contentH) / 2);
      zoomRef.current = 1;
      panRef.current = { x: initialX, y: initialY };
      setZoomLevel(1);
      setPanOffset({ x: initialX, y: initialY });
    } else {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Multi-Device Setup for active screen
  const activeDevices = getMockupDevices(config);
  const activeDevId = config.selectedDeviceId || activeDevices[0]?.id || 'device-primary';
  const activeSelectedDevice = activeDevices.find((d) => d.id === activeDevId) || activeDevices[0];

  const currentScale = activeSelectedDevice?.deviceScale ?? 1;
  const currentOffsetX = activeSelectedDevice?.deviceOffsetX ?? 0;
  const currentOffsetY = activeSelectedDevice?.deviceOffsetY ?? 0;
  const currentDeviceRotation = activeSelectedDevice?.deviceRotation ?? 0;

  // Handle pointer down on device frame or resize handle
  const handlePointerDown = (e: React.PointerEvent, mode: DragMode, targetDeviceId?: string) => {
    e.stopPropagation();
    e.preventDefault();

    const devId = targetDeviceId || activeDevId;
    const targetDev = activeDevices.find((d) => d.id === devId) || activeSelectedDevice;

    const currentSelectedIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
    const isMultiSelectedWithDevice = isDeviceSelected && currentSelectedIds.length > 0 && mode === 'move';

    if (isMultiSelectedWithDevice) {
      handleGroupMovePointerDown(e);
      return;
    }

    setDragMode(mode);
    setDragMoved(false);
    dragStartedRef.current = false;
    setIsDeviceSelected(true);

    if (config.selectedDeviceId !== devId || config.selectedTextId || (config.selectedTextIds && config.selectedTextIds.length > 0)) {
      onChangeConfig({
        selectedDeviceId: devId,
        selectedTextId: null,
        selectedTextIds: [],
      });
    }

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: targetDev.deviceOffsetX ?? 0,
      initialOffsetY: targetDev.deviceOffsetY ?? 0,
      initialScale: targetDev.deviceScale ?? 1,
    };
  };

  // Handle pointer down on device ROTATE button/handle
  const handleDeviceRotatePointerDown = (e: React.PointerEvent, deviceEl: HTMLElement | null, targetDeviceId?: string) => {
    e.stopPropagation();
    e.preventDefault();

    const devId = targetDeviceId || activeDevId;
    const targetDev = activeDevices.find((d) => d.id === devId) || activeSelectedDevice;

    let cx = e.clientX;
    let cy = e.clientY + 50;

    if (deviceEl) {
      const rect = deviceEl.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    const initialAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    rotateCenterRef.current = {
      centerX: cx,
      centerY: cy,
      startRotation: targetDev.deviceRotation ?? 0,
      startPointerAngle: initialAngle,
    };

    setDragMode('device-rotate');
    setDragMoved(false);
    setIsDeviceSelected(true);
    if (config.selectedDeviceId !== devId) {
      onChangeConfig({
        selectedDeviceId: devId,
      });
    }
  };

  // Handle pointer down on text layer drag handle
  const handleTextPointerDown = (e: React.PointerEvent, layerId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const layer = (config.textLayers || []).find((l) => l.id === layerId);
    if (!layer) return;

    const currentSelectedIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
    const isMultiSelected = (currentSelectedIds.length > 1 && currentSelectedIds.includes(layerId)) || (currentSelectedIds.includes(layerId) && isDeviceSelected);

    if (isMultiSelected) {
      handleGroupMovePointerDown(e);
      return;
    }

    setDragMode('text-move');
    setDraggingTextId(layerId);
    setDragMoved(false);
    setIsDeviceSelected(false);

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: layer.x,
      initialOffsetY: layer.y,
      initialScale: 1,
    };
  };

  // Handle pointer down on text layer ROTATE handle
  const handleTextRotatePointerDown = (e: React.PointerEvent, layerId: string, layerEl: HTMLElement | null) => {
    e.stopPropagation();
    e.preventDefault();

    const layer = (config.textLayers || []).find((l) => l.id === layerId);
    if (!layer) return;

    let cx = e.clientX;
    let cy = e.clientY + 40;

    if (layerEl) {
      const rect = layerEl.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    const initialAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    rotateCenterRef.current = {
      centerX: cx,
      centerY: cy,
      startRotation: layer.rotation || 0,
      startPointerAngle: initialAngle,
    };

    setDragMode('text-rotate');
    setDraggingTextId(layerId);
    setDragMoved(false);
    onChangeConfig({ selectedTextId: layerId });
  };

  // Group Move Handler
  const handleGroupMovePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const selectedIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
    const initialLayers = (config.textLayers || [])
      .filter((l) => selectedIds.includes(l.id))
      .map((l) => ({ id: l.id, x: l.x, y: l.y, rotation: l.rotation || 0 }));

    groupDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLayers,
      initialDeviceOffsetX: config.deviceOffsetX ?? 0,
      initialDeviceOffsetY: config.deviceOffsetY ?? 0,
      centerX: 0,
      centerY: 0,
      startAngle: 0,
    };

    setDragMode('group-move');
    setDragMoved(false);
  };

  // Group Rotate Handler
  const handleGroupRotatePointerDown = (e: React.PointerEvent, groupEl: HTMLElement | null) => {
    e.stopPropagation();
    e.preventDefault();

    const selectedIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
    const initialLayers = (config.textLayers || [])
      .filter((l) => selectedIds.includes(l.id))
      .map((l) => ({ id: l.id, x: l.x, y: l.y, rotation: l.rotation || 0 }));

    let cx = e.clientX;
    let cy = e.clientY + 40;

    if (groupEl) {
      const rect = groupEl.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    groupDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLayers,
      initialDeviceOffsetX: config.deviceOffsetX ?? 0,
      initialDeviceOffsetY: config.deviceOffsetY ?? 0,
      centerX: cx,
      centerY: cy,
      startAngle,
    };

    setDragMode('group-rotate');
    setDragMoved(false);
  };

  const textResizeRef = useRef<{
    initialWidth: number;
    startX: number;
    startY: number;
    rotation: number;
  }>({
    initialWidth: 300,
    startX: 0,
    startY: 0,
    rotation: 0,
  });

  const handleTextWidthResizeStart = (
    e: React.PointerEvent,
    layerId: string,
    side: 'left' | 'right',
    currentWidth: number,
    rotation: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    textResizeRef.current = {
      initialWidth: currentWidth || 300,
      startX: e.clientX,
      startY: e.clientY,
      rotation: rotation || 0,
    };

    setDragMode(side === 'left' ? 'text-resize-left' : 'text-resize-right');
    setDraggingTextId(layerId);
    setDragMoved(false);
    onChangeConfig({ selectedTextId: layerId });
  };

  const textCornerResizeRef = useRef<{
    startX: number;
    startY: number;
    initialFontSize: number;
    initialWidth: number;
    initialHeight: number;
    rotation: number;
    corner: 'nw' | 'ne' | 'sw' | 'se';
    initialLayers: Array<{ id: string; fontSize: number; width: number }>;
  }>({
    startX: 0,
    startY: 0,
    initialFontSize: 24,
    initialWidth: 300,
    initialHeight: 60,
    rotation: 0,
    corner: 'se',
    initialLayers: [],
  });

  const handleTextCornerResizeStart = (
    e: React.PointerEvent,
    layerId: string,
    corner: 'nw' | 'ne' | 'sw' | 'se',
    currentFontSize: number,
    currentWidth: number | undefined,
    wrapEl: HTMLElement | null,
    rotation: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    let rectW = currentWidth || 300;
    let rectH = 60;

    if (wrapEl) {
      const rect = wrapEl.getBoundingClientRect();
      rectW = wrapEl.offsetWidth || rect.width;
      rectH = wrapEl.offsetHeight || rect.height;
    }

    const activeIds = (config.selectedTextIds && config.selectedTextIds.includes(layerId))
      ? config.selectedTextIds
      : [layerId];

    const initialLayers = (config.textLayers || [])
      .filter((l) => activeIds.includes(l.id))
      .map((l) => ({
        id: l.id,
        fontSize: l.fontSize,
        width: l.width || 300,
      }));

    textCornerResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialFontSize: currentFontSize,
      initialWidth: rectW,
      initialHeight: rectH,
      rotation: rotation || 0,
      corner,
      initialLayers,
    };

    setDragMode(`text-corner-${corner}` as DragMode);
    setDraggingTextId(layerId);
    setDragMoved(false);
    onChangeConfig({ selectedTextId: layerId });
  };

  // Canvas pointer down on background (Pan canvas only when clicking outside of any mockup screen)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.mockup-render-box') ||
      target.closest('.free-text-layer') ||
      target.closest('.layer-drag-bar') ||
      target.closest('.device-interactive-container') ||
      target.closest('.canvas-quick-toolbar') ||
      target.closest('.preset-selector-bar') ||
      target.closest('.canvas-bottom-zoom-toolbar') ||
      target.closest('.mockup-screen-header') ||
      target.closest('.screen-action-btn') ||
      target.closest('.add-screen-placeholder-card')
    ) {
      return;
    }

    // Only initiate canvas panning when clicking on the empty background area outside images
    setIsDeviceSelected(false);
    setEditingTextId(null);
    onChangeConfig({
      selectedTextId: null,
      selectedTextIds: [],
    });

    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
    setIsPanning(true);
    setDragMoved(false);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Handle Canvas background panning to shift focus across screens
      if (isPanning) {
        const deltaX = e.clientX - panStartRef.current.startX;
        const deltaY = e.clientY - panStartRef.current.startY;
        if (Math.hypot(deltaX, deltaY) > 3) {
          setDragMoved(true);
          setPanOffset({
            x: Math.round(panStartRef.current.initialPanX + deltaX),
            y: Math.round(panStartRef.current.initialPanY + deltaY),
          });
        }
        return;
      }

      if (selectionBox && exportRef.current) {
        const rect = exportRef.current.getBoundingClientRect();
        // Adjust for canvas scale (effectiveZoom) so cursor matches internal coordinates exactly
        const curX = (e.clientX - rect.left) / effectiveZoom;
        const curY = (e.clientY - rect.top) / effectiveZoom;

        setSelectionBox((prev) => (prev ? { ...prev, currentX: curX, currentY: curY } : null));

        const boxLeft = Math.min(selectionBox.startX, curX);
        const boxRight = Math.max(selectionBox.startX, curX);
        const boxTop = Math.min(selectionBox.startY, curY);
        const boxBottom = Math.max(selectionBox.startY, curY);

        if (Math.hypot(curX - selectionBox.startX, curY - selectionBox.startY) > 4) {
          setDragMoved(true);

          const textEls = exportRef.current.querySelectorAll('.free-text-layer');
          const hitTextIds: string[] = [];
          textEls.forEach((el) => {
            const elRect = el.getBoundingClientRect();
            // Scaled relative to unzoomed container coordinates
            const elL = (elRect.left - rect.left) / effectiveZoom;
            const elR = (elRect.right - rect.left) / effectiveZoom;
            const elT = (elRect.top - rect.top) / effectiveZoom;
            const elB = (elRect.bottom - rect.top) / effectiveZoom;

            const intersects = !(boxLeft > elR || boxRight < elL || boxTop > elB || boxBottom < elT);
            if (intersects) {
              const layerKey = el.getAttribute('data-layer-id');
              if (layerKey) {
                hitTextIds.push(layerKey);
              }
            }
          });

          if (hitTextIds.length > 0) {
            onChangeConfig({
              selectedTextIds: hitTextIds,
              selectedTextId: hitTextIds[0],
            });
          } else {
            onChangeConfig({
              selectedTextIds: [],
              selectedTextId: null,
            });
          }
        }
        return;
      }

      if (!dragMode) return;

      const rawDeltaX = e.clientX - startPosRef.current.clientX;
      const rawDeltaY = e.clientY - startPosRef.current.clientY;
      const dist = Math.hypot(rawDeltaX, rawDeltaY);

      if (!dragStartedRef.current) {
        if (dist < 4) return; // Below threshold — ignore micro-movement

        // Threshold crossed for the first time: re-anchor so delta starts from 0
        dragStartedRef.current = true;
        let initialX = currentOffsetX;
        let initialY = currentOffsetY;

        if (dragMode === 'text-move' && draggingTextId) {
          const l = (config.textLayers || []).find((t) => t.id === draggingTextId);
          if (l) {
            initialX = l.x;
            initialY = l.y;
          }
        }

        startPosRef.current = {
          ...startPosRef.current,
          clientX: e.clientX,
          clientY: e.clientY,
          initialOffsetX: initialX,
          initialOffsetY: initialY,
          initialScale: currentScale,
        };
        setDragMoved(true);
        return; // Apply movement on the NEXT frame so delta is 0 initially
      }

      const deltaX = rawDeltaX / effectiveZoom;
      const deltaY = rawDeltaY / effectiveZoom;
      setDragMoved(true);

      if (dragMode === 'group-move') {
        const { startX, startY, initialLayers, initialDeviceOffsetX, initialDeviceOffsetY } = groupDragRef.current;
        let dX = (e.clientX - startX) / effectiveZoom;
        let dY = (e.clientY - startY) / effectiveZoom;

        const xPositions: number[] = [];
        const yPositions: number[] = [];

        if (initialLayers.length > 0) {
          initialLayers.forEach((l) => {
            xPositions.push(l.x + dX);
            yPositions.push(l.y + dY);
          });
        }
        if (isDeviceSelected) {
          xPositions.push(initialDeviceOffsetX + dX);
          yPositions.push(initialDeviceOffsetY + dY);
        }

        let groupCenterX = 0;
        let groupCenterY = 0;

        if (xPositions.length > 0) {
          const minX = Math.min(...xPositions);
          const maxX = Math.max(...xPositions);
          const minY = Math.min(...yPositions);
          const maxY = Math.max(...yPositions);
          groupCenterX = (minX + maxX) / 2;
          groupCenterY = (minY + maxY) / 2;
        }

        const snapX = Math.abs(groupCenterX) <= 4;
        const snapY = Math.abs(groupCenterY) <= 4;

        if (snapX) dX = dX - groupCenterX;
        if (snapY) dY = dY - groupCenterY;

        setAlignmentGuides({
          showVertical: snapX,
          showHorizontal: snapY,
        });

        const updated: Partial<MockupConfig> = {};
        if (initialLayers.length > 0) {
          const canvasDim = getCanvasDimensions(config);
          const canvasW = parseInt(canvasDim.width, 10) || 400;
          const canvasH = parseInt(canvasDim.minHeight, 10) || 640;

          const initMap = new Map(initialLayers.map((l) => [l.id, l]));
          updated.textLayers = (config.textLayers || []).map((l) => {
            const init = initMap.get(l.id);
            if (init) {
              const halfW = Math.round((l.width || 200) / 2);
              const maxX = Math.max(0, canvasW / 2 - halfW - 8);
              const minX = -maxX;
              const maxY = Math.max(0, canvasH / 2 - 20);
              const minY = -maxY;

              const clampedX = Math.max(minX, Math.min(maxX, Math.round(init.x + dX)));
              const clampedY = Math.max(minY, Math.min(maxY, Math.round(init.y + dY)));
              return { ...l, x: clampedX, y: clampedY };
            }
            return l;
          });
        }
        if (isDeviceSelected) {
          updated.deviceOffsetX = Math.round(initialDeviceOffsetX + dX);
          updated.deviceOffsetY = Math.round(initialDeviceOffsetY + dY);
        }
        onChangeConfig(updated, false);
      } else if (dragMode === 'group-rotate') {
        const { centerX, centerY, startAngle, initialLayers } = groupDragRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startAngle;

        const updated: Partial<MockupConfig> = {};
        if (initialLayers.length > 0) {
          const initMap = new Map(initialLayers.map((l) => [l.id, l]));
          updated.textLayers = (config.textLayers || []).map((l) => {
            const init = initMap.get(l.id);
            if (init) {
              let newRot = Math.round((init.rotation + deltaAngle) % 360);
              if (newRot < -180) newRot += 360;
              if (newRot > 180) newRot -= 360;
              if (Math.abs(newRot) < 3) newRot = 0;
              return { ...l, rotation: newRot };
            }
            return l;
          });
        }
        onChangeConfig(updated, false);
      } else if (dragMode === 'move') {
        let newOffsetX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        let newOffsetY = Math.round(startPosRef.current.initialOffsetY + deltaY);

        const snapX = Math.abs(newOffsetX) <= 4;
        const snapY = Math.abs(newOffsetY) <= 4;

        if (snapX) newOffsetX = 0;
        if (snapY) newOffsetY = 0;

        setAlignmentGuides({
          showVertical: snapX,
          showHorizontal: snapY,
        });

        const targetDevId = config.selectedDeviceId || activeDevices[0]?.id || 'device-primary';
        const updatedDevices = activeDevices.map((d) =>
          d.id === targetDevId ? { ...d, deviceOffsetX: newOffsetX, deviceOffsetY: newOffsetY } : d
        );

        onChangeConfig({
          devices: updatedDevices,
          deviceOffsetX: newOffsetX,
          deviceOffsetY: newOffsetY,
        }, false);
      } else if (dragMode === 'text-move' && draggingTextId) {
        let newX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        let newY = Math.round(startPosRef.current.initialOffsetY + deltaY);

        // Clamp text within canvas dimensions so it cannot be dragged outside
        const canvasDim = getCanvasDimensions(config);
        const canvasW = parseInt(canvasDim.width, 10) || 400;
        const canvasH = parseInt(canvasDim.minHeight, 10) || 640;
        const targetLayer = (config.textLayers || []).find((l) => l.id === draggingTextId);
        const layerW = targetLayer?.width || 200;
        const halfLayerW = Math.round(layerW / 2);

        const maxX = Math.max(0, canvasW / 2 - halfLayerW - 8);
        const minX = -maxX;
        const maxY = Math.max(0, canvasH / 2 - 20);
        const minY = -maxY;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        const snapX = Math.abs(newX) <= 4;
        const snapY = Math.abs(newY) <= 4;

        if (snapX) newX = 0;
        if (snapY) newY = 0;

        setAlignmentGuides({
          showVertical: snapX,
          showHorizontal: snapY,
        });

        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === draggingTextId ? { ...l, x: newX, y: newY } : l
          ),
        }, false);
      } else if (dragMode === 'device-rotate') {
        const { centerX, centerY, startRotation, startPointerAngle } = rotateCenterRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startPointerAngle;
        let newRot = Math.round((startRotation + deltaAngle) % 360);
        if (newRot < -180) newRot += 360;
        if (newRot > 180) newRot -= 360;

        // Snap to 0, 45, 90, -45, -90, 180
        if (Math.abs(newRot) < 3) newRot = 0;
        if (Math.abs(newRot - 45) < 3) newRot = 45;
        if (Math.abs(newRot + 45) < 3) newRot = -45;
        if (Math.abs(newRot - 90) < 3) newRot = 90;
        if (Math.abs(newRot + 90) < 3) newRot = -90;
        if (Math.abs(Math.abs(newRot) - 180) < 3) newRot = 180;

        const targetDevId = config.selectedDeviceId || activeDevices[0]?.id || 'device-primary';
        const updatedDevices = activeDevices.map((d) =>
          d.id === targetDevId ? { ...d, deviceRotation: newRot } : d
        );

        onChangeConfig({
          devices: updatedDevices,
          deviceRotation: newRot,
        }, false);
      } else if (dragMode === 'text-rotate' && draggingTextId) {
        const { centerX, centerY, startRotation, startPointerAngle } = rotateCenterRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startPointerAngle;
        let newRot = Math.round((startRotation + deltaAngle) % 360);
        if (newRot < -180) newRot += 360;
        if (newRot > 180) newRot -= 360;

        if (Math.abs(newRot) < 3) newRot = 0;
        if (Math.abs(newRot - 90) < 3) newRot = 90;
        if (Math.abs(newRot + 90) < 3) newRot = -90;

        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === draggingTextId ? { ...l, rotation: newRot } : l
          ),
        }, false);
      } else if ((dragMode === 'text-resize-left' || dragMode === 'text-resize-right') && draggingTextId) {
        const dX = e.clientX - textResizeRef.current.startX;
        const dY = e.clientY - textResizeRef.current.startY;
        const rad = (textResizeRef.current.rotation || 0) * (Math.PI / 180);
        const projectedDelta = dX * Math.cos(rad) + dY * Math.sin(rad);

        const currentLayer = (config.textLayers || []).find((l) => l.id === draggingTextId);
        const currentLayerX = currentLayer?.x || 0;
        const canvasBoundWidth = exportRef.current?.offsetWidth || 600;
        const maxWidthAllowed = Math.max(60, (canvasBoundWidth / 2 - Math.abs(currentLayerX)) * 2);

        const multiplier = dragMode === 'text-resize-right' ? 2 : -2;
        const newW = Math.max(40, Math.min(maxWidthAllowed, Math.round(textResizeRef.current.initialWidth + projectedDelta * multiplier)));

        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === draggingTextId ? { ...l, width: newW } : l
          ),
        }, false);
      } else if (dragMode.startsWith('text-corner-') && draggingTextId) {
        const { startX, startY, initialFontSize, initialWidth, initialHeight, rotation, corner, initialLayers } = textCornerResizeRef.current;
        const dX = e.clientX - startX;
        const dY = e.clientY - startY;

        const rad = (rotation || 0) * (Math.PI / 180);
        const localDX = dX * Math.cos(rad) + dY * Math.sin(rad);
        const localDY = -dX * Math.sin(rad) + dY * Math.cos(rad);

        const signX = corner === 'se' || corner === 'ne' ? 1 : -1;
        const signY = corner === 'se' || corner === 'sw' ? 1 : -1;

        const currentLayer = (config.textLayers || []).find((l) => l.id === draggingTextId);
        const currentLayerX = currentLayer?.x || 0;
        const canvasBoundWidth = exportRef.current?.offsetWidth || 600;
        const maxWidthAllowed = Math.max(60, (canvasBoundWidth / 2 - Math.abs(currentLayerX)) * 2);

        const diagonalDelta = (localDX * signX + localDY * signY) / 2;
        const initialHypot = Math.max(40, Math.hypot(initialWidth, initialHeight));
        const unboundedScaleFactor = Math.max(0.15, (initialHypot + diagonalDelta * 2) / initialHypot);

        const maxScaleFactorFromWidth = maxWidthAllowed / Math.max(40, initialWidth);
        const scaleFactor = Math.min(unboundedScaleFactor, Math.max(0.15, maxScaleFactorFromWidth));

        const updatedConfig: Partial<MockupConfig> = {};

        if (initialLayers && initialLayers.length > 0) {
          const idMap = new Map(initialLayers.map((il) => [il.id, il]));
          updatedConfig.textLayers = (config.textLayers || []).map((l) => {
            const initL = idMap.get(l.id);
            if (initL) {
              const layerFontSize = Math.max(8, Math.min(300, Math.round(initL.fontSize * scaleFactor)));
              const exactRatio = layerFontSize / Math.max(8, initL.fontSize);
              const layerW = Math.max(40, Math.min(maxWidthAllowed, Math.ceil(initL.width * exactRatio) + Math.ceil(scaleFactor * 2)));
              return { ...l, fontSize: layerFontSize, width: layerW };
            }
            return l;
          });
        } else {
          const newFontSize = Math.max(8, Math.min(300, Math.round(initialFontSize * scaleFactor)));
          const exactRatio = newFontSize / initialFontSize;
          const newWidth = Math.max(40, Math.min(maxWidthAllowed, Math.ceil(initialWidth * exactRatio) + Math.ceil(scaleFactor * 2)));
          updatedConfig.textLayers = (config.textLayers || []).map((l) =>
            l.id === draggingTextId ? { ...l, fontSize: newFontSize, width: newWidth } : l
          );
        }

        onChangeConfig(updatedConfig, false);
      } else if (dragMode.startsWith('resize-')) {
        let scaleDelta = 0;
        const sensitivity = 0.005;

        if (dragMode === 'resize-se') {
          scaleDelta = (deltaX + deltaY) * sensitivity;
        } else if (dragMode === 'resize-sw') {
          scaleDelta = (-deltaX + deltaY) * sensitivity;
        } else if (dragMode === 'resize-ne') {
          scaleDelta = (deltaX - deltaY) * sensitivity;
        } else if (dragMode === 'resize-nw') {
          scaleDelta = (-deltaX - deltaY) * sensitivity;
        }

        const newScale = Math.min(
          Math.max(Number((startPosRef.current.initialScale + scaleDelta).toFixed(2)), 0.35),
          2.2
        );

        const targetDevId = config.selectedDeviceId || activeDevices[0]?.id || 'device-primary';
        const updatedDevices = activeDevices.map((d) =>
          d.id === targetDevId ? { ...d, deviceScale: newScale } : d
        );

        onChangeConfig({
          devices: updatedDevices,
          deviceScale: newScale,
        }, false);
      }
    },
    [dragMode, draggingTextId, config.textLayers, config.selectedTextId, isDeviceSelected, selectionBox, isPanning, effectiveZoom, onChangeConfig, exportRef]
  );

  const handlePointerUp = useCallback(() => {
    setAlignmentGuides({ showVertical: false, showHorizontal: false });
    if (isPanning) {
      setIsPanning(false);
    }
    if (selectionBox) {
      setSelectionBox(null);
    }
    if (dragMode) {
      const wasDraggingDevice = dragMode === 'move' || dragMode.startsWith('resize-') || dragMode === 'device-rotate';

      // Auto-transfer device to another screen if its center crossed into that screen
      if (wasDraggingDevice && dragMoved && screens && screens.length > 1 && onTransferDevice) {
        const activeIdx = screens.findIndex((s) => s.id === activeScreenId);
        if (activeIdx !== -1) {
          const screenWidths = screens.map((s) => parseInt(getCanvasDimensions(s).width, 10) || 400);
          const screenCenters: number[] = [];
          let currentAcc = 0;
          for (let i = 0; i < screenWidths.length; i++) {
            if (i === 0) {
              screenCenters.push(screenWidths[0] / 2);
              currentAcc = screenWidths[0];
            } else {
              screenCenters.push(currentAcc + screenWidths[i] / 2);
              currentAcc += screenWidths[i];
            }
          }

          const targetDevId = config.selectedDeviceId || activeDevices[0]?.id || 'device-primary';
          const targetDev = activeDevices.find((d) => d.id === targetDevId) || activeSelectedDevice;

          const devOffsetX = targetDev?.deviceOffsetX ?? config.deviceOffsetX ?? 0;
          const devOffsetY = targetDev?.deviceOffsetY ?? config.deviceOffsetY ?? 0;
          const devScale = targetDev?.deviceScale ?? config.deviceScale ?? 1;
          const devRotation = targetDev?.deviceRotation ?? config.deviceRotation ?? 0;

          const deviceGlobalX = screenCenters[activeIdx] + devOffsetX;

          let targetIdx = activeIdx;
          let accLeft = 0;
          for (let i = 0; i < screenWidths.length; i++) {
            const accRight = accLeft + screenWidths[i];
            if (deviceGlobalX >= accLeft && deviceGlobalX <= accRight) {
              targetIdx = i;
              break;
            }
            accLeft = accRight;
          }

          if (targetIdx !== activeIdx && screens[targetIdx]) {
            const newOffsetX = Math.round(deviceGlobalX - screenCenters[targetIdx]);
            onTransferDevice(
              screens[activeIdx].id || activeScreenId,
              screens[targetIdx].id || screens[targetIdx].screenTitle || `screen-${targetIdx}`,
              newOffsetX,
              devOffsetY,
              devScale,
              devRotation,
              targetDevId
            );
            setDragMode(null);
            setDraggingTextId(null);
            return;
          }
        }
      }

      setDragMode(null);
      setDraggingTextId(null);
      if (dragMoved) {
        onChangeConfig({}, true);
      }
    }
  }, [dragMode, dragMoved, isPanning, selectionBox, screens, activeScreenId, config, onTransferDevice, onChangeConfig]);

  useEffect(() => {
    if (dragMode || selectionBox || isPanning) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragMode, selectionBox, isPanning, handlePointerMove, handlePointerUp]);

  const handleCanvasClick = () => {
    if (!dragMoved) {
      setEditingTextId(null);
      onChangeConfig({
        selectedTextId: null,
        selectedTextIds: [],
      });
      setIsDeviceSelected(false);
    }
  };

  const handleDeviceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTextId(null);
    setIsDeviceSelected(true);
    if (config.selectedTextId || (config.selectedTextIds && config.selectedTextIds.length > 0)) {
      onChangeConfig({
        selectedTextId: null,
        selectedTextIds: [],
      });
    }
    if (!dragMoved && !config.screenshotUrl) {
      onUploadImageClick();
    }
  };

  const viewportRef = useRef<HTMLDivElement>(null);

  // Native Trackpad Pinch, 2-Finger Pan & Mouse Wheel Handler with Cursor-Anchored Zoom
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const rect = viewportEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const applyZoom = (newZoom: number) => {
        newZoom = Math.min(2.5, Math.max(0.15, newZoom));
        if (Math.abs(newZoom - currentZoom) < 0.001) return;
        const worldX = (mouseX - currentPan.x) / currentZoom;
        const worldY = (mouseY - currentPan.y) / currentZoom;
        const newPanX = Math.round(mouseX - worldX * newZoom);
        const newPanY = Math.round(mouseY - worldY * newZoom);
        zoomRef.current = newZoom;
        panRef.current = { x: newPanX, y: newPanY };
        setZoomLevel(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
      };

      // deltaMode 0 = pixel (trackpad), 1 = line (mouse wheel), 2 = page
      const isMouseWheel = e.deltaMode === 1 || e.deltaMode === 2 || (e.deltaMode === 0 && Math.abs(e.deltaY) >= 100 && Math.abs(e.deltaX) === 0 && Number.isInteger(e.deltaY));
      const isPinch = e.ctrlKey || e.metaKey;

      if (isPinch) {
        // Trackpad pinch-to-zoom (smooth, exponential — same formula as Figma)
        const factor = Math.exp(-e.deltaY * 0.006);
        applyZoom(Number((currentZoom * factor).toFixed(3)));
      } else if (isMouseWheel) {
        // Standard mouse wheel → cursor-anchored zoom (Figma/Sketch/AdobeXD standard)
        // 1.12x per notch when zooming in, 0.89x when zooming out
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        applyZoom(Number((currentZoom * factor).toFixed(3)));
      } else {
        // Trackpad 2-finger pan (pixel-precise natural scroll)
        const newPanX = Math.round(currentPan.x - e.deltaX);
        const newPanY = Math.round(currentPan.y - e.deltaY);
        panRef.current = { x: newPanX, y: newPanY };
        setPanOffset({ x: newPanX, y: newPanY });
      }
    };

    viewportEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewportEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div 
      ref={viewportRef}
      className="canvas-viewport" 
      onPointerDown={handleCanvasPointerDown} 
      onClick={handleCanvasClick}
    >
      {/* Floating Bottom Zoom Toolbar */}
      {!isExporting && (
        <div className="canvas-bottom-zoom-toolbar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="zoom-btn"
            title="Uzaklaştır"
            onClick={handleZoomOut}
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            className="zoom-btn zoom-percentage-text"
            title="Varsayılan Boyuta Dön (%100)"
            onClick={handleZoomReset100}
          >
            %{Math.round(effectiveZoom * 100)}
          </button>

          <button
            type="button"
            className="zoom-btn"
            title="Yakınlaştır"
            onClick={handleZoomIn}
          >
            <ZoomIn size={14} />
          </button>
        </div>
      )}

      {/* Multi-Screen Scaled Container with Pan & Zoom — absolutely positioned for accurate cursor-anchored zoom */}
      <div
        ref={containerRef}
        className={`canvas-zoom-container ${isPanning ? 'is-panning' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${effectiveZoom})`,
          transformOrigin: '0 0',
          transition: isPanning || !isReady ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isReady ? 1 : 0,
        }}
      >
        {currentScreens.map((screenCfg, screenIndex) => {
          const isThisActiveScreen = screenCfg.id === activeScreenId || (!screenCfg.id && screenIndex === 0);
          const screenDims = getCanvasDimensions(screenCfg);

          const isGapSnapped = snappedGaps.has(screenIndex);
          const hasNextScreen = screenIndex < currentScreens.length - 1;

          return (
            <div
              key={screenCfg.id || `screen-${screenIndex}`}
              className={`mockup-screen-wrapper ${isThisActiveScreen ? 'is-active-screen' : ''} ${isGapSnapped ? 'gap-snapped' : ''}`}
              style={{
                marginRight: hasNextScreen ? (isGapSnapped ? '6px' : '48px') : '0px',
                transition: isPanning ? 'none' : 'margin-right 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (screenCfg.id && screenCfg.id !== activeScreenId) {
                  onSelectScreen?.(screenCfg.id);
                }
              }}
            >
              {/* Screen Top Header Card with Index & Actions */}
              {!isExporting && (
                <div className="mockup-screen-header">
                  <div className="mockup-screen-title">
                    <Smartphone size={13} color="#64748B" />
                    {editingScreenId === (screenCfg.id || `screen-${screenIndex}`) ? (
                      <input
                        type="text"
                        className="screen-title-inline-input"
                        autoFocus
                        value={editingScreenTitle}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditingScreenTitle(e.target.value)}
                        onBlur={() => {
                          const newName = editingScreenTitle.trim() || `Ekran ${screenIndex + 1}`;
                          if (screenCfg.id) {
                            onUpdateScreenTitle?.(screenCfg.id, newName);
                          }
                          setEditingScreenId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newName = editingScreenTitle.trim() || `Ekran ${screenIndex + 1}`;
                            if (screenCfg.id) {
                              onUpdateScreenTitle?.(screenCfg.id, newName);
                            }
                            setEditingScreenId(null);
                          } else if (e.key === 'Escape') {
                            setEditingScreenId(null);
                          }
                        }}
                      />
                    ) : (
                      <span
                        className="screen-title-clickable"
                        title="İsmi değiştirmek için tıklayın"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (screenCfg.id && screenCfg.id !== activeScreenId) {
                            onSelectScreen?.(screenCfg.id);
                          }
                          setEditingScreenId(screenCfg.id || `screen-${screenIndex}`);
                          setEditingScreenTitle(screenCfg.screenTitle || `Ekran ${screenIndex + 1}`);
                        }}
                      >
                        {screenCfg.screenTitle || `Ekran ${screenIndex + 1}`}
                      </span>
                    )}

                    {isThisActiveScreen && (
                      <span style={{ fontSize: '10px', backgroundColor: '#0F172A', color: '#FFF', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                        Seçili
                      </span>
                    )}
                  </div>

                  <div className="mockup-screen-actions">
                    <button
                      type="button"
                      className="screen-action-btn"
                      title="Yeni Ekran Ekle"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddScreen?.();
                      }}
                    >
                      <Plus size={14} />
                    </button>

                    <button
                      type="button"
                      className="screen-action-btn"
                      title="Bu Ekranı Çoğalt"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (screenCfg.id) onDuplicateScreen?.(screenCfg.id);
                      }}
                    >
                      <Copy size={13} />
                    </button>

                    {currentScreens.length > 1 && (
                      <button
                        type="button"
                        className="screen-action-btn delete"
                        title="Bu Ekranı Sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (screenCfg.id) onDeleteScreen?.(screenCfg.id);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Circular >< Snap Button Between Screen Headers */}
                  {hasNextScreen && (
                    <button
                      type="button"
                      className={`screen-gap-snap-btn ${isGapSnapped ? 'is-snapped' : ''}`}
                      title={isGapSnapped ? 'Ekran aralığını aç (48px)' : 'Ekranları birbirine yaklaştır (Panorama görünümü)'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGapSnap(screenIndex);
                      }}
                    >
                      {isGapSnapped ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="7 8 3 12 7 16" />
                          <polyline points="17 8 21 12 17 16" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="4 8 8 12 4 16" />
                          <polyline points="20 8 16 12 20 16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Render Box for HTML-to-Image Export */}
              <div
                ref={(el) => {
                  if (isThisActiveScreen && exportRef) {
                    (exportRef as any).current = el;
                  }
                  if (screenRefs && screenCfg.id) {
                    screenRefs.current.set(screenCfg.id, el);
                  }
                }}
                className={`mockup-render-box ${
                  isDeviceOnly 
                    ? 'mode-device-only-clean' 
                    : screenCfg.bgType !== 'solid' ? `bg-${screenCfg.bgType}` : ''
                }`}
                style={{
                  width: isDeviceOnly ? 'auto' : screenDims.width,
                  height: isDeviceOnly ? 'auto' : screenDims.minHeight,
                  minHeight: isDeviceOnly ? 'auto' : screenDims.minHeight,
                  aspectRatio: isDeviceOnly ? undefined : `${screenCfg.width} / ${screenCfg.height}`,
                  backgroundColor: isDeviceOnly ? 'transparent' : screenCfg.bgColor,
                  boxShadow: isDeviceOnly ? 'none' : undefined,
                  border: isDeviceOnly ? 'none' : undefined,
                  padding: isDeviceOnly ? '0px' : `${screenCfg.padding}px`,
                  transform: isDeviceOnly ? 'none' : `rotate(${screenCfg.frameRotation}deg)`,
                  overflow: isDeviceOnly ? 'visible' : 'hidden',
                }}
                onPointerDown={(e) => {
                  const target = e.target as HTMLElement;
                  // If clicking on text, drag handles, device container, or buttons, let them handle it
                  if (
                    target.closest('.free-text-layer') ||
                    target.closest('.layer-drag-bar') ||
                    target.closest('.device-interactive-container') ||
                    target.closest('.device-transform-gizmo') ||
                    target.closest('.resize-handle') ||
                    target.closest('.device-rotate-pill') ||
                    target.closest('.group-selection-border') ||
                    target.closest('.selection-floating-bar')
                  ) {
                    return;
                  }

                  if (!isThisActiveScreen && screenCfg.id) {
                    onSelectScreen?.(screenCfg.id);
                  }

                  // Immediately deselect device and stop text editing on background click
                  setIsDeviceSelected(false);
                  setEditingTextId(null);
                  onChangeConfig({
                    selectedTextId: null,
                    selectedTextIds: [],
                  });

                  const rect = e.currentTarget.getBoundingClientRect();
                  const startX = (e.clientX - rect.left) / effectiveZoom;
                  const startY = (e.clientY - rect.top) / effectiveZoom;

                  setSelectionBox({
                    startX,
                    startY,
                    currentX: startX,
                    currentY: startY,
                  });
                  setDragMoved(false);
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  // If clicking on an element (text, device, handles), do not clear
                  if (
                    target.closest('.free-text-layer') ||
                    target.closest('.layer-drag-bar') ||
                    target.closest('.device-interactive-container') ||
                    target.closest('.device-transform-gizmo') ||
                    target.closest('.resize-handle') ||
                    target.closest('.device-rotate-pill') ||
                    target.closest('.group-selection-border') ||
                    target.closest('.selection-floating-bar')
                  ) {
                    return;
                  }

                  // Clicking on empty area within the mockup box deselects all components
                  if (!dragMoved) {
                    setEditingTextId(null);
                    setIsDeviceSelected(false);
                    onChangeConfig({
                      selectedTextId: null,
                      selectedTextIds: [],
                    });
                  }
                }}
              >
                {/* Visual Marquee Selection Box (Only for active screen) */}
                {isThisActiveScreen && selectionBox && (
                  <div
                    className="canvas-selection-box"
                    style={{
                      left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
                      top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
                      width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
                      height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
                    }}
                  />
                )}

                {/* Center Alignment Guide Lines (Canva Style Magnet Guides) */}
                {!isExporting && isThisActiveScreen && alignmentGuides.showVertical && (
                  <div className="alignment-guide-line alignment-guide-line-v" title="Dikey Merkez Doğrultusu" />
                )}
                {!isExporting && isThisActiveScreen && alignmentGuides.showHorizontal && (
                  <div className="alignment-guide-line alignment-guide-line-h" title="Yatay Merkez Doğrultusu" />
                )}

                {/* Unified Move & Rotate toolbar when multiple items are selected */}
                {!isExporting && !isDeviceOnly && isThisActiveScreen && (
                  ((screenCfg.selectedTextIds && screenCfg.selectedTextIds.length > 1) || (screenCfg.selectedTextId && isDeviceSelected))
                ) && (() => {
                  const selIds = screenCfg.selectedTextIds || (screenCfg.selectedTextId ? [screenCfg.selectedTextId] : []);
                  const activeLayers = (screenCfg.textLayers || []).filter((l) => selIds.includes(l.id));

                  let minRelY = 0;
                  let avgRelX = 0;
                  if (activeLayers.length > 0) {
                    minRelY = Math.min(...activeLayers.map((l) => l.y));
                    avgRelX = activeLayers.reduce((sum, l) => sum + l.x, 0) / activeLayers.length;
                  } else if (isDeviceSelected) {
                    minRelY = (screenCfg.deviceOffsetY ?? 0) - 180;
                    avgRelX = screenCfg.deviceOffsetX ?? 0;
                  }

                  const canvasHalfH = (exportRef.current?.offsetHeight || 600) / 2;
                  const rawTopPx = canvasHalfH + minRelY - 42;
                  const clampedTopPx = Math.max(12, rawTopPx);

                  return (
                    <div
                      className="unified-group-toolbar"
                      style={{
                        top: `${clampedTopPx}px`,
                        left: `calc(50% + ${avgRelX}px)`,
                        transform: 'translateX(-50%)',
                        transition: dragMode === 'group-move' ? 'none' : 'top 0.1s ease-out, left 0.1s ease-out',
                      }}
                      title="Seçili tüm öğeleri taşımak veya döndürmek için sürükleyin"
                    >
                      <div
                        className="layer-move-handle"
                        onPointerDown={handleGroupMovePointerDown}
                        title="Seçili tüm öğeleri birlikte taşımak için sürükleyin"
                      >
                        <Move size={13} color="#D90429" />
                      </div>

                      <div className="layer-drag-bar-divider" />

                      <div
                        className={`layer-rotate-btn ${(activeLayers[0]?.rotation || 0) !== 0 || dragMode === 'group-rotate' ? 'active' : ''}`}
                        title="Seçili tüm metinleri birlikte döndürmek için sürükleyin"
                        onPointerDown={(e) => handleGroupRotatePointerDown(e, exportRef.current)}
                        onClick={(e) => {
                          if (!dragMoved) {
                            e.stopPropagation();
                            const selIds = screenCfg.selectedTextIds || (screenCfg.selectedTextId ? [screenCfg.selectedTextId] : []);
                            onChangeConfig({
                              textLayers: (screenCfg.textLayers || []).map((l) =>
                                selIds.includes(l.id) ? { ...l, rotation: ((l.rotation || 0) + 15) % 360 } : l
                              ),
                            });
                          }
                        }}
                      >
                        <RotateCw size={10} />
                        <span>{activeLayers[0]?.rotation || 0}°</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Free Floating Draggable Multi-Text Layers */}
                {!isDeviceOnly && screenCfg.showHeadline && (screenCfg.textLayers || []).map((layer) => {
                  const isSelected = isThisActiveScreen && (screenCfg.selectedTextId === layer.id || (screenCfg.selectedTextIds || []).includes(layer.id));
                  const isMultiSelected = (screenCfg.selectedTextIds && screenCfg.selectedTextIds.length > 1) || ((screenCfg.selectedTextIds || []).length >= 1 && isDeviceSelected);
                  const isDraggingThis = isThisActiveScreen && dragMode === 'text-move' && draggingTextId === layer.id;

                  const canvasH = screenCfg.width > screenCfg.height ? 380 : screenCfg.width === screenCfg.height ? 440 : 640;
                  const isTouchingTopBorder = layer.y <= -(canvasH / 2 - 45);

                  return (
                    <div
                      key={layer.id}
                      data-layer-id={layer.id}
                      className={`free-text-layer ${isSelected ? 'is-selected' : ''} ${isDraggingThis ? 'is-dragging' : ''}`}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${layer.x}px), calc(-50% + ${layer.y}px))`,
                        transition: dragMode ? 'none' : 'transform 0.1s ease-out',
                        zIndex: isSelected ? 20 : 15,
                        fontFamily: getFontFamilyCss(layer.fontFamily),
                      }}
                      onPointerDown={(e) => {
                        if (!isThisActiveScreen) {
                          if (screenCfg.id) onSelectScreen?.(screenCfg.id);
                          return;
                        }
                        if (editingTextId === layer.id) return;
                        const target = e.target as HTMLElement;
                        if (target.closest('.text-corner-handle') || target.closest('.text-border-handle') || target.closest('.layer-rotate-btn')) {
                          return;
                        }
                        handleTextPointerDown(e, layer.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isThisActiveScreen && screenCfg.id) {
                          onSelectScreen?.(screenCfg.id);
                        }
                        setIsDeviceSelected(false);

                        if (dragMoved) return;

                        if (screenCfg.selectedTextId === layer.id && (!screenCfg.selectedTextIds || screenCfg.selectedTextIds.length <= 1) && editingTextId !== layer.id) {
                          setEditingTextId(layer.id);
                        } else if (screenCfg.selectedTextId !== layer.id) {
                          setEditingTextId(null);
                          window.getSelection()?.removeAllRanges();
                          onChangeConfig({ selectedTextId: layer.id, selectedTextIds: [layer.id] });
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (!isThisActiveScreen && screenCfg.id) {
                          onSelectScreen?.(screenCfg.id);
                        }
                        setIsDeviceSelected(false);
                        setEditingTextId(layer.id);
                        onChangeConfig({ selectedTextId: layer.id, selectedTextIds: [layer.id] });
                      }}
                    >
                      {/* Individual Drag & Rotate Handle Bar */}
                      {!isExporting && isSelected && !isMultiSelected && (
                        <div
                          className={`layer-drag-bar ${isTouchingTopBorder ? 'bar-at-bottom' : 'bar-at-top'} ${
                            dragMode === 'text-rotate' && draggingTextId === layer.id ? 'is-rotating' : ''
                          }`}
                          title="Taşımak veya döndürmek için sürükleyin"
                        >
                          <div
                            className="layer-move-handle"
                            onPointerDown={(e) => handleTextPointerDown(e, layer.id)}
                            title="Metni taşımak için basılı tutup sürükleyin"
                          >
                            <Move size={12} />
                          </div>

                          <div className="layer-drag-bar-divider" />

                          <div
                            className={`layer-rotate-btn ${(layer.rotation || 0) !== 0 ? 'active' : ''}`}
                            title="Döndürmek için basılı tutup sürükleyin (veya tıklayın)"
                            onPointerDown={(e) => handleTextRotatePointerDown(e, layer.id, e.currentTarget.closest('.free-text-layer'))}
                            onClick={(e) => {
                              if (!dragMoved) {
                                e.stopPropagation();
                                const nextRot = ((layer.rotation || 0) + 15) % 360;
                                onChangeConfig({
                                  textLayers: (screenCfg.textLayers || []).map((l) =>
                                    l.id === layer.id ? { ...l, rotation: nextRot } : l
                                  ),
                                  selectedTextId: layer.id,
                                });
                              }
                            }}
                          >
                            <RotateCw size={10} />
                            <span>{(layer.rotation || 0)}°</span>
                          </div>
                        </div>
                      )}

                      {/* Rotated text wrapper */}
                      <div
                        className={`free-text-rotated-wrap ${
                          (dragMode === 'text-resize-left' || dragMode === 'text-resize-right') && draggingTextId === layer.id
                            ? 'is-resizing-width'
                            : ''
                        }`}
                        style={{
                          width: layer.width ? `${layer.width}px` : 'max-content',
                          maxWidth: '100%',
                          transform: `rotate(${layer.rotation || 0}deg)`,
                          transformOrigin: 'center center',
                          position: 'relative',
                        }}
                      >
                        {isSelected && !isExporting && (
                          <>
                            <div
                              className="text-corner-handle handle-nw"
                              title="Köşeden ölçeklendir"
                              onPointerDown={(e) => {
                                const wrapEl = e.currentTarget.closest('.free-text-rotated-wrap') as HTMLElement;
                                handleTextCornerResizeStart(e, layer.id, 'nw', layer.fontSize, layer.width, wrapEl, layer.rotation || 0);
                              }}
                            />
                            <div
                              className="text-corner-handle handle-ne"
                              title="Köşeden ölçeklendir"
                              onPointerDown={(e) => {
                                const wrapEl = e.currentTarget.closest('.free-text-rotated-wrap') as HTMLElement;
                                handleTextCornerResizeStart(e, layer.id, 'ne', layer.fontSize, layer.width, wrapEl, layer.rotation || 0);
                              }}
                            />
                            <div
                              className="text-corner-handle handle-sw"
                              title="Köşeden ölçeklendir"
                              onPointerDown={(e) => {
                                const wrapEl = e.currentTarget.closest('.free-text-rotated-wrap') as HTMLElement;
                                handleTextCornerResizeStart(e, layer.id, 'sw', layer.fontSize, layer.width, wrapEl, layer.rotation || 0);
                              }}
                            />
                            <div
                              className="text-corner-handle handle-se"
                              title="Köşeden ölçeklendir"
                              onPointerDown={(e) => {
                                const wrapEl = e.currentTarget.closest('.free-text-rotated-wrap') as HTMLElement;
                                handleTextCornerResizeStart(e, layer.id, 'se', layer.fontSize, layer.width, wrapEl, layer.rotation || 0);
                              }}
                            />

                            <div
                              className="text-border-handle handle-left"
                              title="Genişliği ayarla"
                              onPointerDown={(e) => {
                                const wrapEl = e.currentTarget.closest('.free-text-rotated-wrap') as HTMLElement;
                                const curW = layer.width || wrapEl?.offsetWidth || 300;
                                handleTextWidthResizeStart(e, layer.id, 'left', curW, layer.rotation || 0);
                              }}
                            />
                            <div
                              className="text-border-handle handle-right"
                              title="Genişliği ayarla"
                              onPointerDown={(e) => {
                                const wrapEl = e.currentTarget.closest('.free-text-rotated-wrap') as HTMLElement;
                                const curW = layer.width || wrapEl?.offsetWidth || 300;
                                handleTextWidthResizeStart(e, layer.id, 'right', curW, layer.rotation || 0);
                              }}
                            />
                          </>
                        )}

                        <EditableCanvasText
                          value={layer.text}
                          isEditing={isThisActiveScreen && editingTextId === layer.id}
                          onStartEditing={() => {
                            if (!isThisActiveScreen && screenCfg.id) onSelectScreen?.(screenCfg.id);
                            setEditingTextId(layer.id);
                          }}
                          onStopEditing={() => setEditingTextId(null)}
                          onChange={(val) => {
                            onChangeConfig({
                              textLayers: (screenCfg.textLayers || []).map((l) =>
                                l.id === layer.id ? { ...l, text: val } : l
                              ),
                              selectedTextId: layer.id,
                            });
                          }}
                          className="free-text-input"
                          placeholder="Metin yazın..."
                          isExporting={isExporting}
                          style={{
                            fontSize: `${layer.fontSize}px`,
                            color: layer.color,
                            fontWeight: layer.isBold ? 800 : 400,
                            fontStyle: layer.isItalic ? 'italic' : 'normal',
                            textDecoration: layer.isUnderline ? 'underline' : 'none',
                            textAlign: layer.textAlign || 'center',
                            letterSpacing: `${layer.letterSpacing ?? 0}px`,
                            width: '100%',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Seamless Multi-Screen Panorama Bleed: Render overflowing devices from neighbor screens */}
                {!isDeviceOnly && currentScreens.map((otherScreenCfg, otherIndex) => {
                  if (otherIndex === screenIndex) return null;

                  const otherDevices = getMockupDevices(otherScreenCfg);
                  const otherIsActiveScreen = otherScreenCfg.id === activeScreenId || (!otherScreenCfg.id && otherIndex === 0);

                  // Calculate cumulative distance between screen centers
                  let distance = 0;
                  if (otherIndex < screenIndex) {
                    for (let k = otherIndex; k < screenIndex; k++) {
                      const dim = getCanvasDimensions(currentScreens[k]);
                      distance += parseInt(dim.width, 10);
                    }
                  } else {
                    for (let k = screenIndex; k < otherIndex; k++) {
                      const dim = getCanvasDimensions(currentScreens[k]);
                      distance += parseInt(dim.width, 10);
                    }
                  }

                  const currentCanvasWidth = parseInt(screenDims.width, 10) || 400;

                  return otherDevices.map((otherDev, otherDevIdx) => {
                    const isSelectedInActive = otherIsActiveScreen && otherDev.id === activeDevId;
                    const otherScale = isSelectedInActive ? currentScale : (otherDev.deviceScale ?? 1);
                    const otherOffsetX = isSelectedInActive ? currentOffsetX : (otherDev.deviceOffsetX ?? 0);
                    const otherOffsetY = isSelectedInActive ? currentOffsetY : (otherDev.deviceOffsetY ?? 0);
                    const otherRotation = isSelectedInActive ? currentDeviceRotation : (otherDev.deviceRotation ?? 0);

                    const overflowOffsetX = otherIndex < screenIndex 
                      ? otherOffsetX - distance 
                      : otherOffsetX + distance;

                    // Only render if within visual range of this screen
                    if (Math.abs(overflowOffsetX) > currentCanvasWidth * 2.5) {
                      return null;
                    }

                    return (
                      <div
                        key={`overflow-bleed-${otherScreenCfg.id || otherIndex}-${otherDev.id || otherDevIdx}`}
                        className="device-interactive-container overflow-bleed-device"
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: `translate(calc(-50% + ${overflowOffsetX}px), calc(-50% + ${otherOffsetY}px)) scale(${otherScale}) rotate(${otherRotation}deg)`,
                          transformOrigin: 'center center',
                          pointerEvents: 'none',
                          zIndex: 10 + otherDevIdx,
                          touchAction: 'none',
                        }}
                        aria-hidden="true"
                      >
                        <div className="device-frame-capture-target">
                          <DeviceFrame
                            deviceType={otherDev.deviceType}
                            deviceColor={otherDev.deviceColor}
                            screenshotUrl={otherDev.screenshotUrl}
                            screenshotScale={otherDev.screenshotScale}
                            screenshotOffsetX={otherDev.screenshotOffsetX}
                            screenshotOffsetY={otherDev.screenshotOffsetY}
                            borderRadius={otherDev.borderRadius ?? otherScreenCfg.borderRadius ?? 24}
                            shadowDepth={otherDev.shadowDepth ?? otherScreenCfg.shadowDepth ?? 'medium'}
                            onUploadClick={() => {}}
                            presetWidth={otherScreenCfg.width}
                            presetHeight={otherScreenCfg.height}
                            isDeviceOnly={false}
                          />
                        </div>
                      </div>
                    );
                  });
                })}

                {/* Interactive Devices for this screen */}
                {getMockupDevices(screenCfg).map((screenDev, devIdx) => {
                  const isThisDeviceActive = isThisActiveScreen && screenDev.id === activeDevId;
                  const devScale = isThisDeviceActive ? currentScale : (screenDev.deviceScale ?? 1);
                  const devOffsetX = isThisDeviceActive ? currentOffsetX : (screenDev.deviceOffsetX ?? 0);
                  const devOffsetY = isThisDeviceActive ? currentOffsetY : (screenDev.deviceOffsetY ?? 0);
                  const devRotation = isThisDeviceActive ? currentDeviceRotation : (screenDev.deviceRotation ?? 0);
                  const isDevSelected = !isDeviceOnly && isThisActiveScreen && isDeviceSelected && isThisDeviceActive;

                  return (
                    <div
                      key={screenDev.id || `screen-dev-${devIdx}`}
                      className={`device-interactive-container ${
                        isDevSelected ? 'is-device-selected' : ''
                      } ${!isDeviceOnly && isThisActiveScreen && isThisDeviceActive && (dragMode === 'move' || dragMode?.startsWith('resize-') || dragMode === 'device-rotate') ? 'is-dragging' : ''}`}
                      style={{
                        position: isDeviceOnly ? 'relative' : 'absolute',
                        left: isDeviceOnly ? undefined : '50%',
                        top: isDeviceOnly ? undefined : '50%',
                        transform: isDeviceOnly 
                          ? 'none' 
                          : `translate(calc(-50% + ${devOffsetX}px), calc(-50% + ${devOffsetY}px)) scale(${devScale}) rotate(${devRotation}deg)`,
                        transformOrigin: 'center center',
                        cursor: dragMode === 'move' && isThisDeviceActive ? 'grabbing' : 'default',
                        transition: dragMode && isThisDeviceActive ? 'none' : 'transform 0.15s ease-out',
                        touchAction: isDeviceOnly ? 'auto' : 'none',
                        zIndex: isThisDeviceActive ? 14 : 12 + devIdx,
                      }}
                      onPointerDown={isDeviceOnly ? undefined : (e) => {
                        if (!isThisActiveScreen && screenCfg.id) {
                          onSelectScreen?.(screenCfg.id);
                        }
                        handlePointerDown(e, 'move', screenDev.id);
                      }}
                      onClick={(e) => {
                        if (!isThisActiveScreen && screenCfg.id) {
                          onSelectScreen?.(screenCfg.id);
                        }
                        handleDeviceClick(e);
                        if (config.selectedDeviceId !== screenDev.id) {
                          onChangeConfig({ selectedDeviceId: screenDev.id });
                        }
                      }}
                    >
                      <div
                        ref={isThisDeviceActive ? deviceFrameRef : undefined}
                        className="device-frame-capture-target"
                      >
                        <DeviceFrame
                          deviceType={screenDev.deviceType}
                          deviceColor={screenDev.deviceColor}
                          screenshotUrl={screenDev.screenshotUrl}
                          screenshotScale={screenDev.screenshotScale}
                          screenshotOffsetX={screenDev.screenshotOffsetX}
                          screenshotOffsetY={screenDev.screenshotOffsetY}
                          borderRadius={screenDev.borderRadius ?? screenCfg.borderRadius ?? 24}
                          shadowDepth={screenDev.shadowDepth ?? screenCfg.shadowDepth ?? 'medium'}
                          onUploadClick={() => {
                            if (!isThisActiveScreen && screenCfg.id) {
                              onSelectScreen?.(screenCfg.id);
                            }
                            if (config.selectedDeviceId !== screenDev.id) {
                              onChangeConfig({ selectedDeviceId: screenDev.id });
                            }
                            onUploadImageClick();
                          }}
                          presetWidth={screenCfg.width}
                          presetHeight={screenCfg.height}
                          isDeviceOnly={isDeviceOnly}
                        />
                      </div>

                      {/* Transform Gizmo only on active selected device */}
                      {!isExporting && !isDeviceOnly && isThisActiveScreen && isDevSelected && (() => {
                        // Calculate if device top edge is near or beyond canvas top edge
                        const canvasHeight = parseInt(screenDims.minHeight, 10) || 540;
                        const approxDeviceHeight = (260 / (389 / 800)) * devScale; // ~535px scaled
                        const topEdgeY = (canvasHeight / 2) + devOffsetY - (approxDeviceHeight / 2);
                        const isTopEdgeNearTop = topEdgeY <= 40;

                        return (
                          <div
                            className="device-transform-gizmo"
                            style={{
                              opacity: 1,
                              pointerEvents: 'auto',
                            }}
                          >
                            {/* Device Rotate Pill (Placed at top normally, or bottom if near top edge) */}
                            <div
                              className={`device-rotate-pill ${isTopEdgeNearTop ? 'position-bottom' : ''}`}
                              style={isTopEdgeNearTop ? { top: 'auto', bottom: '-34px' } : undefined}
                              title="Döndürmek için sürükleyin veya 15° çevirmek için tıklayın"
                              onPointerDown={(e) => {
                                const deviceEl = e.currentTarget.closest('.device-interactive-container') as HTMLElement;
                                handleDeviceRotatePointerDown(e, deviceEl, screenDev.id);
                              }}
                              onClick={(e) => {
                                if (!dragMoved) {
                                  e.stopPropagation();
                                  const newRot = ((devRotation + 15) % 360);
                                  const updatedDevs = activeDevices.map((d) =>
                                    d.id === screenDev.id ? { ...d, deviceRotation: newRot } : d
                                  );
                                  onChangeConfig({ devices: updatedDevs, deviceRotation: newRot });
                                }
                              }}
                            >
                              <RotateCw size={11} />
                              <span>{devRotation}°</span>
                            </div>

                            {/* Quick Delete Pill on Canvas */}
                            <div
                              className="device-delete-pill"
                              style={isTopEdgeNearTop ? { top: 'auto', bottom: '-34px' } : undefined}
                              title="Bu cihazı tuvalden sil (Delete tuşuyla da silebilirsiniz)"
                              onClick={(e) => {
                                e.stopPropagation();
                                const remainingDevs = activeDevices.filter((d) => d.id !== screenDev.id);
                                const nextSelectedDevId = remainingDevs[0]?.id || null;
                                onChangeConfig({
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
                              }}
                            >
                              <Trash2 size={11} />
                            </div>

                          <div
                            className="resize-handle handle-nw"
                            title="Boyutlandır"
                            onPointerDown={(e) => handlePointerDown(e, 'resize-nw', screenDev.id)}
                          />
                          <div
                            className="resize-handle handle-ne"
                            title="Boyutlandır"
                            onPointerDown={(e) => handlePointerDown(e, 'resize-ne', screenDev.id)}
                          />
                          <div
                            className="resize-handle handle-sw"
                            title="Boyutlandır"
                            onPointerDown={(e) => handlePointerDown(e, 'resize-sw', screenDev.id)}
                          />
                          <div
                            className="resize-handle handle-se"
                            title="Boyutlandır"
                            onPointerDown={(e) => handlePointerDown(e, 'resize-se', screenDev.id)}
                          />

                          {dragMode && dragMode !== 'move' && (
                            <div className="transform-floating-pill">
                              {dragMode === 'device-rotate' ? (
                                <>
                                  <RotateCw size={12} />
                                  <span>{devRotation}°</span>
                                </>
                              ) : dragMode === 'text-move' ? (
                                <>
                                  <Move size={12} />
                                  <span>Metin Taşınıyor</span>
                                </>
                              ) : (
                                <>
                                  <Maximize2 size={12} />
                                  <span>%{Math.round(devScale * 100)}</span>
                                </>
                              )}
                            </div>
                          )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* End of screens */}
      </div>
    </div>
  );
};

