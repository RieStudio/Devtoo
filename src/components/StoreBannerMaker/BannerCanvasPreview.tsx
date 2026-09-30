import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ShieldCheck, 
  Upload, 
  Crop, 
  Trash2, 
  Star,
  Layout,
  RotateCw,
  Move
} from 'lucide-react';
import type { StoreBannerConfig, BannerDeviceConfig } from '../../types/storeBanner';
import type { ShapeType } from '../../types/mockup';
import { DeviceFrame } from '../MockupEditor/DeviceFrame';
import { BANNER_PRESETS } from '../../constants/bannerPresets';
import { renderShapeSvgContent } from '../MockupEditor/MockupCanvas';

type CanvasDragMode = 
  | 'none' 
  | 'move' 
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
  | 'element-move'
  | 'element-resize-nw'
  | 'element-resize-ne'
  | 'element-resize-sw'
  | 'element-resize-se'
  | 'shape-move'
  | 'shape-rotate'
  | 'shape-resize-nw'
  | 'shape-resize-ne'
  | 'shape-resize-sw'
  | 'shape-resize-se';

const getFontFamilyCss = (fontFamily?: string) => {
  if (!fontFamily) return 'inherit';
  switch (fontFamily) {
    case 'outfit': return "'Outfit', sans-serif";
    case 'inter': return "'Inter', sans-serif";
    case 'poppins': return "'Poppins', sans-serif";
    case 'montserrat': return "'Montserrat', sans-serif";
    case 'plus-jakarta':
    case 'plus-jakarta-sans': return "'Plus Jakarta Sans', sans-serif";
    case 'roboto': return "'Roboto', sans-serif";
    case 'space-grotesk': return "'Space Grotesk', sans-serif";
    case 'bebas-neue': return "'Bebas Neue', sans-serif";
    case 'syne': return "'Syne', sans-serif";
    default: return `'${fontFamily}', sans-serif`;
  }
};

interface EditableCanvasTextProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'p' | 'span';
  isEditing?: boolean;
  onStopEditing?: () => void;
}

const EditableCanvasText: React.FC<EditableCanvasTextProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  style,
  as: Component = 'span',
  isEditing = false,
  onStopEditing,
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
      range.collapse(false);
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
      contentRef.current?.blur();
      onStopEditing?.();
    }
  };

  return (
    <Component
      ref={contentRef as any}
      contentEditable={isEditing}
      suppressContentEditableWarning
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      className={`editable-canvas-text ${className} ${isEditing ? 'is-editing' : ''}`}
      style={{
        cursor: isEditing ? 'text' : 'inherit',
        userSelect: isEditing ? 'text' : 'none',
        pointerEvents: isEditing ? 'auto' : 'none',
        outline: 'none',
        borderRadius: '4px',
        display: 'inline-block',
        minWidth: '30px',
        ...style,
      }}
      data-placeholder={placeholder}
      onBlur={onStopEditing}
      onInput={handleInput}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      title={isEditing ? undefined : 'Düzenlemek için tıklayın'}
    >
      {value}
    </Component>
  );
};

interface BannerCanvasPreviewProps {
  config: StoreBannerConfig;
  onChangeConfig: (updated: Partial<StoreBannerConfig>) => void;
  onUploadDeviceScreenshot: (deviceId: string) => void;
  onCropDeviceScreenshot: (deviceId: string) => void;
  onUploadAppIcon: () => void;
  canvasExportRef: React.RefObject<HTMLDivElement | null>;
  isVisible?: boolean;
  isExporting?: boolean;
}

export const BannerCanvasPreview: React.FC<BannerCanvasPreviewProps> = ({
  config,
  onChangeConfig,
  onUploadDeviceScreenshot,
  onCropDeviceScreenshot,
  onUploadAppIcon,
  canvasExportRef,
  isVisible = true,
  isExporting = false,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);

  // Device & text canvas interaction states
  const [dragMode, setDragMode] = useState<CanvasDragMode>('none');
  const [activeDragDeviceId, setActiveDragDeviceId] = useState<string | null>(null);
  const [activeDragElementId, setActiveDragElementId] = useState<string | null>(null);
  const [activeDragShapeId, setActiveDragShapeId] = useState<string | null>(null);
  const [activeDragTextId, setActiveDragTextId] = useState<string | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<{ showVertical: boolean; showHorizontal: boolean }>({
    showVertical: false,
    showHorizontal: false,
  });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const dragMovedRef = useRef<boolean>(false);

  const shapeResizeRef = useRef<{
    shapeId: string;
    corner: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startShapeX: number;
    startShapeY: number;
    startRot: number;
    type: ShapeType;
  } | null>(null);

  const elementResizeRef = useRef<{
    elementId: string;
    corner: 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    initialScale: number;
    initialSize: number;
  } | null>(null);

  const getElementPos = useCallback((elementId: string): { x: number; y: number } => {
    if (config.elementPositions?.[elementId]) {
      return config.elementPositions[elementId];
    }
    const isCenter = config.textAlignment === 'center';
    const canvasW = config.width || 1024;
    const baseX = config.textOffsetX ?? (isCenter ? 0 : 80);
    const iconSize = config.appIconSize ?? 72;

    const canvasH = config.height || 500;

    switch (elementId) {
      case 'app-icon':
        return isCenter
          ? { x: Math.round((canvasW - 248) / 2), y: Math.round(canvasH * 0.17) }
          : { x: baseX, y: 85 };
      case 'eyebrow':
        return isCenter
          ? { x: Math.round((canvasW - 248) / 2) + iconSize + 16, y: Math.round(canvasH * 0.17) + 18 }
          : { x: config.showAppIcon ? baseX + iconSize + 18 : baseX, y: 103 };
      case 'title':
        return isCenter
          ? { x: Math.round((canvasW - (config.textMaxWidth ?? 480)) / 2), y: Math.round(canvasH * 0.37) }
          : { x: baseX, y: 185 };
      case 'subtitle':
        return isCenter
          ? { x: Math.round((canvasW - 560) / 2), y: Math.round(canvasH * 0.512) }
          : { x: baseX, y: 256 };
      case 'store-badge':
        return isCenter
          ? { x: Math.round((canvasW - 354) / 2), y: Math.round(canvasH * 0.68) }
          : { x: baseX, y: 340 };
      case 'rating':
        return isCenter
          ? { x: Math.round((canvasW - 354) / 2) + 149, y: Math.round(canvasH * 0.68) + 3 }
          : { x: config.showStoreBadge ? (config.storeBadgeType === 'both' ? baseX + 295 : baseX + 156) : baseX, y: 343 };
      default:
        return { x: baseX, y: 85 };
    }
  }, [
    config.elementPositions,
    config.textAlignment,
    config.width,
    config.textOffsetX,
    config.height,
    config.textOffsetY,
    config.appIconSize,
    config.textMaxWidth,
    config.titleFontSize,
    config.subtitleFontSize,
    config.showAppIcon,
    config.showStoreBadge,
    config.storeBadgeType,
  ]);

  const calculateSmartSnap = useCallback((
    candX: number,
    candY: number,
    width: number,
    height: number
  ): { snappedX: number; snappedY: number; showVertical: boolean; showHorizontal: boolean } => {
    const candCenterX = candX + width / 2;
    const candCenterY = candY + height / 2;

    const canvasCenterX = config.width / 2;
    const canvasCenterY = config.height / 2;

    const SNAP_THRESHOLD = 8;
    const snapX = Math.abs(candCenterX - canvasCenterX) <= SNAP_THRESHOLD;
    const snapY = Math.abs(candCenterY - canvasCenterY) <= SNAP_THRESHOLD;

    const snappedX = snapX ? Math.round(canvasCenterX - width / 2) : candX;
    const snappedY = snapY ? Math.round(canvasCenterY - height / 2) : candY;

    return { snappedX, snappedY, showVertical: snapX, showHorizontal: snapY };
  }, [config.width, config.height]);

  const startPosRef = useRef<{
    clientX: number;
    clientY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    initialScale: number;
    initialWidth?: number;
    initialHeight?: number;
  }>({
    clientX: 0,
    clientY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
    initialScale: 1,
    initialWidth: 0,
    initialHeight: 0,
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

  const zoomRef = useRef<number>(zoomLevel);
  const panRef = useRef<{ x: number; y: number }>(panOffset);

  useEffect(() => {
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    panRef.current = panOffset;
  }, [panOffset]);

  const panStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Calculate natural centered zoom and pan to fit viewport comfortably
  const centerContentInViewport = useCallback((targetZoom?: number) => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const vpW = viewportEl.clientWidth;
    const vpH = viewportEl.clientHeight;
    if (vpW <= 0 || vpH <= 0) return;

    // Account for 48px top screen-header and padding around card
    const cardWidth = config.width;
    const cardHeight = config.height + 48; // includes header

    const padding = 80;
    const availableWidth = vpW - padding;
    const availableHeight = vpH - padding;

    let computedZoom = targetZoom;
    if (computedZoom === undefined) {
      const scaleX = availableWidth / cardWidth;
      const scaleY = availableHeight / cardHeight;
      computedZoom = Math.min(scaleX, scaleY, 1.1);
      computedZoom = Math.max(0.2, Number(computedZoom.toFixed(2)));
    }

    const scaledWidth = cardWidth * computedZoom;
    const scaledHeight = cardHeight * computedZoom;

    const initialX = Math.round((vpW - scaledWidth) / 2);
    const initialY = Math.round((vpH - scaledHeight) / 2);

    zoomRef.current = computedZoom;
    panRef.current = { x: initialX, y: initialY };
    setZoomLevel(computedZoom);
    setPanOffset({ x: initialX, y: initialY });
    setIsReady(true);
  }, [config.width, config.height]);

  // Center on first mount, when becoming visible, and on preset dimension changes
  useEffect(() => {
    centerContentInViewport();
  }, [centerContentInViewport]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        centerContentInViewport();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isVisible, centerContentInViewport]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      centerContentInViewport();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerContentInViewport]);

  // Viewport ResizeObserver to handle container tab switching
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          centerContentInViewport();
        }
      }
    });

    ro.observe(viewportEl);
    return () => ro.disconnect();
  }, [centerContentInViewport]);

  // Zoom Button Controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = Math.min(2.5, Number((zoomLevel + 0.15).toFixed(2)));
    setZoomLevel(newZoom);
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = Math.max(0.2, Number((zoomLevel - 0.15).toFixed(2)));
    setZoomLevel(newZoom);
  };

  const handleZoomReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    centerContentInViewport();
  };

  // Figma/Sketch standard cursor-anchored wheel zoom & trackpad 2-finger pan
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

      const isMouseWheel = e.deltaMode === 1 || e.deltaMode === 2 || (e.deltaMode === 0 && Math.abs(e.deltaY) >= 100 && Math.abs(e.deltaX) === 0 && Number.isInteger(e.deltaY));
      const isPinch = e.ctrlKey || e.metaKey;

      if (isPinch) {
        const factor = Math.exp(-e.deltaY * 0.006);
        applyZoom(Number((currentZoom * factor).toFixed(3)));
      } else if (isMouseWheel) {
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        applyZoom(Number((currentZoom * factor).toFixed(3)));
      } else {
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

  // Pointer Down for Panning
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.device-interactive-container') ||
      target.closest('.device-transform-gizmo') ||
      target.closest('.device-rotate-pill') ||
      target.closest('.device-delete-pill') ||
      target.closest('.resize-handle') ||
      target.closest('.store-banner-surface') ||
      target.closest('.mockup-screen-header') ||
      target.closest('.canvas-bottom-zoom-toolbar') ||
      target.closest('.canvas-top-right-toolbar') ||
      target.closest('.btn-pill-action')
    ) {
      return;
    }

    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
    setIsPanning(true);
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isPanning) return;
      const deltaX = e.clientX - panStartRef.current.startX;
      const deltaY = e.clientY - panStartRef.current.startY;
      if (Math.hypot(deltaX, deltaY) > 3) {
        setPanOffset({
          x: Math.round(panStartRef.current.initialPanX + deltaX),
          y: Math.round(panStartRef.current.initialPanY + deltaY),
        });
      }
    };

    const handleGlobalPointerUp = () => {
      if (isPanning) {
        setIsPanning(false);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isPanning]);

  // Handle pointer down on device frame or resize handle
  const handleDevicePointerDown = (e: React.PointerEvent, mode: CanvasDragMode, deviceId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const targetDev = config.devices.find((d) => d.id === deviceId);
    if (!targetDev) return;

    setDragMode(mode);
    setActiveDragDeviceId(deviceId);
    dragMovedRef.current = false;

    setEditingTextId(null);
    setEditingElementId(null);
    onChangeConfig({
      selectedDeviceId: deviceId,
      selectedElementId: null,
      selectedShapeId: null,
      selectedTextId: null,
    });

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: targetDev.offsetX,
      initialOffsetY: targetDev.offsetY,
      initialScale: targetDev.scale,
    };
  };

  // Handle pointer down on an independent element layer (app-icon, eyebrow, title, subtitle, store-badge, rating)
  const handleElementPointerDown = (e: React.PointerEvent, elementId: string) => {
    const target = e.target as HTMLElement;
    if (
      target.isContentEditable ||
      target.closest('[contenteditable="true"]') ||
      target.closest('.resize-handle') ||
      target.closest('.text-corner-handle')
    ) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    setDragMode('element-move');
    setActiveDragElementId(elementId);
    dragMovedRef.current = false;
    setEditingTextId(null);
    onChangeConfig({
      selectedElementId: elementId,
      selectedDeviceId: null,
      selectedShapeId: null,
      selectedTextId: null,
    });

    const layerEl = (e.currentTarget.closest('.banner-element-layer') as HTMLElement) || (e.currentTarget as HTMLElement);
    const pos = getElementPos(elementId);
    const measuredW = layerEl ? layerEl.offsetWidth : 0;
    const measuredH = layerEl ? layerEl.offsetHeight : 0;

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: pos.x,
      initialOffsetY: pos.y,
      initialScale: config.elementScales?.[elementId] || 1,
      initialWidth: measuredW,
      initialHeight: measuredH,
    };
  };

  // Handle pointer down on branding element corner resize (app-icon, store-badge, rating, eyebrow)
  const handleElementCornerResizeStart = (
    e: React.PointerEvent,
    elementId: string,
    corner: 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const layerEl = (e.currentTarget.closest('.banner-element-layer') as HTMLElement) || (e.currentTarget.parentElement as HTMLElement);
    const pos = getElementPos(elementId);
    const initialW = layerEl ? layerEl.offsetWidth : 120;
    const initialH = layerEl ? layerEl.offsetHeight : 44;
    const initialScale = config.elementScales?.[elementId] || 1.0;
    const initialSize = config.appIconSize ?? 72;

    elementResizeRef.current = {
      elementId,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
      initialW,
      initialH,
      initialScale,
      initialSize,
    };

    setDragMode(`element-resize-${corner}` as CanvasDragMode);
    setActiveDragElementId(elementId);
    dragMovedRef.current = false;
    onChangeConfig({
      selectedElementId: elementId,
      selectedDeviceId: null,
      selectedShapeId: null,
      selectedTextId: null,
    });
  };

  // Handle pointer down on text layer
  const handleTextPointerDown = (e: React.PointerEvent, textId: string) => {
    if (editingTextId === textId) return;
    const target = e.target as HTMLElement;
    if (
      target.isContentEditable || 
      target.closest('[contenteditable="true"]') || 
      target.closest('.text-corner-handle') || 
      target.closest('.layer-rotate-btn') ||
      target.closest('.layer-delete-btn')
    ) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    const layer = (config.textLayers || []).find((l) => l.id === textId);
    if (!layer) return;

    setDragMode('text-move');
    setActiveDragTextId(textId);
    dragMovedRef.current = false;

    // Seçim pointerDown anında değil, mouse bırakıldığında onClick ile yapılacak
    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: layer.x,
      initialOffsetY: layer.y,
      initialScale: 1,
    };
  };

  // Handle pointer down on text rotate
  const handleTextRotatePointerDown = (e: React.PointerEvent, textId: string, textEl: HTMLElement | null) => {
    e.stopPropagation();
    e.preventDefault();

    const layer = (config.textLayers || []).find((l) => l.id === textId);
    if (!layer) return;

    let cx = e.clientX;
    let cy = e.clientY + 50;
    if (textEl) {
      const rect = textEl.getBoundingClientRect();
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
    setActiveDragTextId(textId);
    dragMovedRef.current = false;
    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: layer.x,
      initialOffsetY: layer.y,
      initialScale: 1,
    };
    if (config.selectedTextId !== textId) {
      onChangeConfig({
        selectedTextId: textId,
        selectedDeviceId: null,
        selectedShapeId: null,
        selectedElementId: null,
      });
    }
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

    const layer = (config.textLayers || []).find((l) => l.id === layerId);

    textResizeRef.current = {
      initialWidth: currentWidth || 300,
      startX: e.clientX,
      startY: e.clientY,
      rotation: rotation || 0,
    };

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: layer?.x || 0,
      initialOffsetY: layer?.y || 0,
      initialScale: 1,
    };

    setDragMode(side === 'left' ? 'text-resize-left' : 'text-resize-right');
    setActiveDragTextId(layerId);
    dragMovedRef.current = false;
  };

  const textCornerResizeRef = useRef<{
    startX: number;
    startY: number;
    initialFontSize: number;
    initialWidth: number;
    initialHeight: number;
    rotation: number;
    corner: 'nw' | 'ne' | 'sw' | 'se';
    initialX: number;
    initialY: number;
  }>({
    startX: 0,
    startY: 0,
    initialFontSize: 24,
    initialWidth: 300,
    initialHeight: 60,
    rotation: 0,
    corner: 'se',
    initialX: 0,
    initialY: 0,
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
      rectW = wrapEl.offsetWidth || 300;
      rectH = wrapEl.offsetHeight || 60;
    }

    const currentLayer = (config.textLayers || []).find((l) => l.id === layerId);

    textCornerResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialFontSize: currentFontSize || 28,
      initialWidth: rectW,
      initialHeight: rectH,
      rotation: rotation || 0,
      corner,
      initialX: currentLayer?.x || 0,
      initialY: currentLayer?.y || 0,
    };

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: currentLayer?.x || 0,
      initialOffsetY: currentLayer?.y || 0,
      initialScale: 1,
    };

    setDragMode(`text-corner-${corner}` as CanvasDragMode);
    setActiveDragTextId(layerId);
    dragMovedRef.current = false;
  };

  // Handle pointer down on shape layer
  const handleShapePointerDown = (e: React.PointerEvent, shapeId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const shape = (config.shapeLayers || []).find((s) => s.id === shapeId);
    if (!shape) return;

    setDragMode('shape-move');
    setActiveDragShapeId(shapeId);
    dragMovedRef.current = false;
    setEditingTextId(null);
    setEditingElementId(null);
    onChangeConfig({
      selectedShapeId: shapeId,
      selectedDeviceId: null,
      selectedElementId: null,
      selectedTextId: null,
    });

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: shape.x,
      initialOffsetY: shape.y,
      initialScale: 1,
    };
  };

  // Handle pointer down on shape rotate
  const handleShapeRotatePointerDown = (e: React.PointerEvent, shapeId: string, shapeEl: HTMLElement | null) => {
    e.stopPropagation();
    e.preventDefault();

    const shape = (config.shapeLayers || []).find((s) => s.id === shapeId);
    if (!shape) return;

    let cx = e.clientX;
    let cy = e.clientY + 50;
    if (shapeEl) {
      const rect = shapeEl.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    const initialAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotateCenterRef.current = {
      centerX: cx,
      centerY: cy,
      startRotation: shape.rotation || 0,
      startPointerAngle: initialAngle,
    };

    setDragMode('shape-rotate');
    setActiveDragShapeId(shapeId);
    dragMovedRef.current = false;
    setEditingTextId(null);
    setEditingElementId(null);
    onChangeConfig({
      selectedShapeId: shapeId,
      selectedDeviceId: null,
      selectedElementId: null,
      selectedTextId: null,
    });
  };

  // Handle pointer down on shape corner resize
  const handleShapeCornerResizeStart = (
    e: React.PointerEvent,
    shapeId: string,
    corner: 'nw' | 'ne' | 'sw' | 'se',
    shapeX: number,
    shapeY: number,
    shapeW: number,
    shapeH: number,
    shapeRot: number,
    type: ShapeType
  ) => {
    e.stopPropagation();
    e.preventDefault();

    shapeResizeRef.current = {
      shapeId,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startW: shapeW,
      startH: shapeH,
      startShapeX: shapeX,
      startShapeY: shapeY,
      startRot: shapeRot,
      type,
    };

    setDragMode(`shape-resize-${corner}` as CanvasDragMode);
    setActiveDragShapeId(shapeId);
    dragMovedRef.current = false;
    setEditingTextId(null);
    setEditingElementId(null);
    onChangeConfig({
      selectedShapeId: shapeId,
      selectedDeviceId: null,
      selectedElementId: null,
      selectedTextId: null,
    });
  };

  // Handle pointer down on device ROTATE pill
  const handleDeviceRotatePointerDown = (e: React.PointerEvent, deviceEl: HTMLElement | null, deviceId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const targetDev = config.devices.find((d) => d.id === deviceId);
    if (!targetDev) return;

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
      startRotation: targetDev.rotation,
      startPointerAngle: initialAngle,
    };

    setDragMode('device-rotate');
    setActiveDragDeviceId(deviceId);
    dragMovedRef.current = false;

    setEditingTextId(null);
    setEditingElementId(null);
    onChangeConfig({
      selectedDeviceId: deviceId,
      selectedElementId: null,
      selectedShapeId: null,
      selectedTextId: null,
    });
  };

  // Global pointer move & up for device move, rotate, resize, text & shape move
  useEffect(() => {
    if (dragMode === 'none') return;

    const handlePointerMove = (e: PointerEvent) => {
      const currentZoom = zoomRef.current || 1;
      const deltaX = (e.clientX - startPosRef.current.clientX) / currentZoom;
      const deltaY = (e.clientY - startPosRef.current.clientY) / currentZoom;

      if (Math.hypot(deltaX, deltaY) > 2) {
        dragMovedRef.current = true;
      }

      if (dragMode === 'element-move' && activeDragElementId) {
        const s = config.elementScales?.[activeDragElementId] || 1;
        let elemW = (startPosRef.current.initialWidth || 0) * s;
        let elemH = (startPosRef.current.initialHeight || 0) * s;

        if (elemW <= 0) {
          if (activeDragElementId === 'app-icon') {
            elemW = config.appIconSize ?? 72;
            elemH = elemW;
          } else if (activeDragElementId === 'store-badge') {
            elemW = (config.storeBadgeType === 'both' ? 260 : 130) * s;
            elemH = 44 * s;
          } else if (activeDragElementId === 'rating') {
            elemW = 240 * s;
            elemH = 36 * s;
          } else if (activeDragElementId === 'eyebrow') {
            elemW = 120 * s;
            elemH = 28 * s;
          } else {
            elemW = 140;
            elemH = 40;
          }
        }
        const rawX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        const rawY = Math.round(startPosRef.current.initialOffsetY + deltaY);
        const snap = calculateSmartSnap(rawX, rawY, elemW, elemH);

        onChangeConfig({
          elementPositions: {
            ...(config.elementPositions || {}),
            [activeDragElementId]: { x: snap.snappedX, y: snap.snappedY },
          },
        });
        setAlignmentGuides({ showVertical: snap.showVertical, showHorizontal: snap.showHorizontal });
        return;
      }

      if (dragMode.startsWith('element-resize-') && activeDragElementId && elementResizeRef.current) {
        dragMovedRef.current = true;
        const info = elementResizeRef.current;
        const deltaX = (e.clientX - info.startX) / currentZoom;
        const deltaY = (e.clientY - info.startY) / currentZoom;

        // Preserve aspect ratio by projecting along corner diagonal
        let delta = 0;
        if (info.corner === 'se') {
          delta = (deltaX + deltaY) / 2;
        } else if (info.corner === 'sw') {
          delta = (-deltaX + deltaY) / 2;
        } else if (info.corner === 'ne') {
          delta = (deltaX - deltaY) / 2;
        } else if (info.corner === 'nw') {
          delta = (-deltaX - deltaY) / 2;
        }

        if (activeDragElementId === 'app-icon') {
          const newSize = Math.max(32, Math.min(360, Math.round(info.initialSize + delta)));
          const sizeDiff = newSize - info.initialSize;

          let newX = info.initialX;
          let newY = info.initialY;

          if (info.corner === 'sw') {
            newX = Math.round(info.initialX - sizeDiff);
          } else if (info.corner === 'ne') {
            newY = Math.round(info.initialY - sizeDiff);
          } else if (info.corner === 'nw') {
            newX = Math.round(info.initialX - sizeDiff);
            newY = Math.round(info.initialY - sizeDiff);
          }

          onChangeConfig({
            appIconSize: newSize,
            elementPositions: {
              ...(config.elementPositions || {}),
              ['app-icon']: { x: newX, y: newY },
            },
          });
          return;
        } else {
          // For store-badge, rating, eyebrow
          const baseDim = Math.max(info.initialW, 60);
          const newScale = Math.max(0.35, Math.min(3.5, Number((info.initialScale + delta / baseDim).toFixed(3))));
          const scaleDiff = newScale - (info.initialScale || 1);
          const wDiff = info.initialW * scaleDiff;
          const hDiff = info.initialH * scaleDiff;

          let newX = info.initialX;
          let newY = info.initialY;

          if (info.corner === 'sw') {
            newX = Math.round(info.initialX - wDiff);
          } else if (info.corner === 'ne') {
            newY = Math.round(info.initialY - hDiff);
          } else if (info.corner === 'nw') {
            newX = Math.round(info.initialX - wDiff);
            newY = Math.round(info.initialY - hDiff);
          }

          onChangeConfig({
            elementScales: {
              ...(config.elementScales || {}),
              [activeDragElementId]: newScale,
            },
            elementPositions: {
              ...(config.elementPositions || {}),
              [activeDragElementId]: { x: newX, y: newY },
            },
          });
          return;
        }
      }

      if (dragMode === 'text-move' && activeDragTextId) {
        const targetLayer = (config.textLayers || []).find((l) => l.id === activeDragTextId);
        const tW = targetLayer?.width || 360;
        const tH = (targetLayer?.fontSize || 28) * 1.35;
        const rawX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        const rawY = Math.round(startPosRef.current.initialOffsetY + deltaY);
        const snap = calculateSmartSnap(rawX, rawY, tW, tH);

        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === activeDragTextId ? { ...l, x: snap.snappedX, y: snap.snappedY } : l
          ),
        });
        setAlignmentGuides({ showVertical: snap.showVertical, showHorizontal: snap.showHorizontal });
        return;
      }

      if (dragMode === 'text-rotate' && activeDragTextId) {
        const { centerX, centerY, startRotation, startPointerAngle } = rotateCenterRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startPointerAngle;
        let newRot = Math.round((startRotation + deltaAngle) % 360);
        if (newRot < -180) newRot += 360;
        if (newRot > 180) newRot -= 360;
        if (Math.abs(newRot) < 3) newRot = 0;
        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === activeDragTextId ? { ...l, rotation: newRot } : l
          ),
        });
        return;
      }

      if ((dragMode === 'text-resize-left' || dragMode === 'text-resize-right') && activeDragTextId) {
        dragMovedRef.current = true;
        const dX = (e.clientX - textResizeRef.current.startX) / currentZoom;
        const dY = (e.clientY - textResizeRef.current.startY) / currentZoom;
        const rad = (textResizeRef.current.rotation || 0) * (Math.PI / 180);
        const projectedDelta = dX * Math.cos(rad) + dY * Math.sin(rad);

        const currentLayer = (config.textLayers || []).find((l) => l.id === activeDragTextId);
        const currentLayerX = currentLayer?.x || 0;
        const canvasBoundWidth = config.width || 1200;
        const maxWidthAllowed = Math.max(60, canvasBoundWidth - Math.max(0, currentLayerX));

        const multiplier = dragMode === 'text-resize-right' ? 2 : -2;
        const newW = Math.max(40, Math.min(maxWidthAllowed, Math.round(textResizeRef.current.initialWidth + projectedDelta * multiplier)));

        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === activeDragTextId ? { ...l, width: newW } : l
          ),
        });
        return;
      }

      if (dragMode.startsWith('text-corner-') && activeDragTextId) {
        dragMovedRef.current = true;
        const { startX, startY, initialFontSize, initialWidth, initialHeight, rotation, corner, initialX, initialY } = textCornerResizeRef.current;
        const dX = (e.clientX - startX) / currentZoom;
        const dY = (e.clientY - startY) / currentZoom;

        const rad = (rotation || 0) * (Math.PI / 180);
        const localDX = dX * Math.cos(rad) + dY * Math.sin(rad);
        const localDY = -dX * Math.sin(rad) + dY * Math.cos(rad);

        const signX = corner === 'se' || corner === 'ne' ? 1 : -1;
        const signY = corner === 'se' || corner === 'sw' ? 1 : -1;

        const canvasBoundWidth = config.width || 1200;
        const diagonalDelta = (localDX * signX + localDY * signY) / 2;
        const initialHypot = Math.max(40, Math.hypot(initialWidth, initialHeight));
        const scaleFactor = Math.max(0.2, Math.min(4.0, (initialHypot + diagonalDelta * 2) / initialHypot));

        const newFontSize = Math.max(8, Math.min(300, Math.round(initialFontSize * scaleFactor)));
        const exactRatio = newFontSize / Math.max(8, initialFontSize);
        const newWidth = Math.max(40, Math.min(canvasBoundWidth, Math.round(initialWidth * exactRatio)));

        let newX = initialX;
        let newY = initialY;
        const deltaW = newWidth - initialWidth;
        const deltaH = Math.round((initialHeight * exactRatio) - initialHeight);

        if (corner === 'nw') {
          newX = Math.round(initialX - deltaW);
          newY = Math.round(initialY - deltaH);
        } else if (corner === 'ne') {
          newY = Math.round(initialY - deltaH);
        } else if (corner === 'sw') {
          newX = Math.round(initialX - deltaW);
        }

        onChangeConfig({
          textLayers: (config.textLayers || []).map((l) =>
            l.id === activeDragTextId ? { ...l, fontSize: newFontSize, width: newWidth, x: newX, y: newY } : l
          ),
        });
        return;
      }

      if (dragMode === 'shape-move' && activeDragShapeId) {
        const shape = (config.shapeLayers || []).find((s) => s.id === activeDragShapeId);
        const sW = shape?.width || 100;
        const sH = shape?.height || 100;
        const rawX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        const rawY = Math.round(startPosRef.current.initialOffsetY + deltaY);
        const snap = calculateSmartSnap(rawX, rawY, sW, sH);

        onChangeConfig({
          shapeLayers: (config.shapeLayers || []).map((s) =>
            s.id === activeDragShapeId ? { ...s, x: snap.snappedX, y: snap.snappedY } : s
          ),
        });
        setAlignmentGuides({ showVertical: snap.showVertical, showHorizontal: snap.showHorizontal });
        return;
      }

      if (dragMode === 'shape-rotate' && activeDragShapeId) {
        const { centerX, centerY, startRotation, startPointerAngle } = rotateCenterRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startPointerAngle;
        let newRot = Math.round((startRotation + deltaAngle) % 360);
        if (newRot < -180) newRot += 360;
        if (newRot > 180) newRot -= 360;
        if (Math.abs(newRot) < 3) newRot = 0;
        onChangeConfig({
          shapeLayers: (config.shapeLayers || []).map((s) =>
            s.id === activeDragShapeId ? { ...s, rotation: newRot } : s
          ),
        });
        return;
      }

      if (dragMode.startsWith('shape-resize-') && activeDragShapeId && shapeResizeRef.current) {
        const info = shapeResizeRef.current;
        const rad = (info.startRot * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const rawDx = (e.clientX - info.startX) / currentZoom;
        const rawDy = (e.clientY - info.startY) / currentZoom;

        const localDx = rawDx * cos + rawDy * sin;
        const localDy = -rawDx * sin + rawDy * cos;

        let newW = info.startW;
        let newH = info.startH;

        if (info.corner === 'se') {
          newW = Math.max(30, Math.round(info.startW + localDx));
          newH = Math.max(30, Math.round(info.startH + localDy));
        } else if (info.corner === 'sw') {
          newW = Math.max(30, Math.round(info.startW - localDx));
          newH = Math.max(30, Math.round(info.startH + localDy));
        } else if (info.corner === 'ne') {
          newW = Math.max(30, Math.round(info.startW + localDx));
          newH = Math.max(30, Math.round(info.startH - localDy));
        } else if (info.corner === 'nw') {
          newW = Math.max(30, Math.round(info.startW - localDx));
          newH = Math.max(30, Math.round(info.startH - localDy));
        }

        if (info.type === 'circle') {
          const side = Math.max(newW, newH);
          newW = side;
          newH = side;
        }

        onChangeConfig({
          shapeLayers: (config.shapeLayers || []).map((s) =>
            s.id === activeDragShapeId ? { ...s, width: newW, height: newH } : s
          ),
        });
        return;
      }

      if (!activeDragDeviceId) return;
      const targetDev = config.devices.find((d) => d.id === activeDragDeviceId);
      if (!targetDev) return;

      if (dragMode === 'move') {
        const candOffsetX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        const candOffsetY = Math.round(startPosRef.current.initialOffsetY + deltaY);

        const snapX = Math.abs(candOffsetX) <= 8;
        const snapY = Math.abs(candOffsetY) <= 8;

        const snappedOffsetX = snapX ? 0 : candOffsetX;
        const snappedOffsetY = snapY ? 0 : candOffsetY;

        const updated = config.devices.map((d) =>
          d.id === activeDragDeviceId
            ? { ...d, offsetX: Math.round(snappedOffsetX), offsetY: Math.round(snappedOffsetY) }
            : d
        );
        onChangeConfig({ devices: updated });
        setAlignmentGuides({ showVertical: snapX, showHorizontal: snapY });
      } else if (dragMode === 'device-rotate') {
        const { centerX, centerY, startRotation, startPointerAngle } = rotateCenterRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startPointerAngle;
        let newRot = Math.round((startRotation + deltaAngle) % 360);
        if (newRot < -180) newRot += 360;
        if (newRot > 180) newRot -= 360;

        // Snapping: 0, 45, 90, -45, -90, 180
        if (Math.abs(newRot) < 3) newRot = 0;
        if (Math.abs(newRot - 45) < 3) newRot = 45;
        if (Math.abs(newRot + 45) < 3) newRot = -45;
        if (Math.abs(newRot - 90) < 3) newRot = 90;
        if (Math.abs(newRot + 90) < 3) newRot = -90;
        if (Math.abs(Math.abs(newRot) - 180) < 3) newRot = 180;

        const updated = config.devices.map((d) =>
          d.id === activeDragDeviceId ? { ...d, rotation: newRot } : d
        );
        onChangeConfig({ devices: updated });
      } else if (dragMode.startsWith('resize-')) {
        let scaleDelta = 0;
        const sensitivity = 0.0035;

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
          Math.max(Number((startPosRef.current.initialScale + scaleDelta).toFixed(2)), 0.2),
          2.5
        );

        const updated = config.devices.map((d) =>
          d.id === activeDragDeviceId ? { ...d, scale: newScale } : d
        );
        onChangeConfig({ devices: updated });
      }
    };

    const handlePointerUp = () => {
      setDragMode('none');
      setActiveDragDeviceId(null);
      setActiveDragElementId(null);
      setActiveDragShapeId(null);
      setActiveDragTextId(null);
      shapeResizeRef.current = null;
      elementResizeRef.current = null;
      setAlignmentGuides({ showVertical: false, showHorizontal: false });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    dragMode,
    activeDragDeviceId,
    activeDragElementId,
    activeDragShapeId,
    activeDragTextId,
    config.devices,
    config.shapeLayers,
    config.textLayers,
    config.elementPositions,
    config.elementScales,
    config.width,
    config.height,
    config.storeBadgeType,
    config.appIconSize,
    calculateSmartSnap,
    onChangeConfig
  ]);

  // Keyboard shortcut: Delete or Backspace to remove selected device
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && config.selectedDeviceId) {
        e.preventDefault();
        const remaining = config.devices.filter((d) => d.id !== config.selectedDeviceId);
        onChangeConfig({
          devices: remaining,
          deviceCount: remaining.length,
          selectedDeviceId: remaining[0]?.id || null,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.selectedDeviceId, config.devices, onChangeConfig]);

  const currentPreset = BANNER_PRESETS.find((p) => p.id === config.preset);

  // Compute background style
  const getCanvasBackground = (): React.CSSProperties => {
    if (config.bgType === 'solid') {
      return { backgroundColor: config.bgColor };
    }
    if (config.bgType === 'gradient') {
      const { from, to, angle, type } = config.bgGradient;
      if (type === 'radial') {
        return { background: `radial-gradient(circle at 60% 40%, ${from} 0%, ${to} 100%)` };
      }
      return { background: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` };
    }
    return { backgroundColor: config.bgColor };
  };

  // Render Pattern Overlay
  const renderPatternOverlay = () => {
    if (config.bgPattern === 'none') return null;

    if (config.bgPattern === 'dots') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
            opacity: config.bgPatternOpacity,
            pointerEvents: 'none',
          }}
        />
      );
    }

    if (config.bgPattern === 'grid') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            opacity: config.bgPatternOpacity,
            pointerEvents: 'none',
          }}
        />
      );
    }

    if (config.bgPattern === 'diagonal-stripes') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 2px, transparent 0, transparent 16px)`,
            opacity: config.bgPatternOpacity,
            pointerEvents: 'none',
          }}
        />
      );
    }

    if (config.bgPattern === 'mesh-glow') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            opacity: config.bgPatternOpacity,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '15%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(217, 4, 41, 0.7) 0%, rgba(217, 4, 41, 0) 70%)',
              filter: 'blur(75px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-5%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79, 70, 229, 0.6) 0%, rgba(79, 70, 229, 0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '5%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0) 70%)',
              filter: 'blur(70px)',
            }}
          />
        </div>
      );
    }

    return null;
  };

  const getShadowStyle = (shadowDepth: BannerDeviceConfig['shadowDepth']) => {
    switch (shadowDepth) {
      case 'soft':
        return 'drop-shadow(0 15px 30px rgba(0,0,0,0.35))';
      case 'medium':
        return 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))';
      case 'deep':
        return 'drop-shadow(0 40px 80px rgba(0,0,0,0.65))';
      case '3d-floating':
        return 'drop-shadow(-20px 40px 60px rgba(0,0,0,0.55)) drop-shadow(0 10px 20px rgba(0,0,0,0.3))';
      default:
        return 'none';
    }
  };

  // Render each device
  const renderDevice = (device: BannerDeviceConfig, index: number) => {
    if (!device.enabled) return null;
    const isSelected = config.selectedDeviceId === device.id;
    const isCurrentDragging = dragMode !== 'none' && activeDragDeviceId === device.id;
    const invScale = 1 / Math.max(0.1, device.scale);

    return (
      <div
        key={device.id}
        className={`device-interactive-container ${isSelected ? 'is-device-selected' : ''} ${
          isCurrentDragging ? 'is-dragging' : ''
        }`}
        onPointerDown={(e) => {
          handleDevicePointerDown(e, 'move', device.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setEditingTextId(null);
          setEditingElementId(null);
          onChangeConfig({
            selectedDeviceId: device.id,
            selectedElementId: null,
            selectedShapeId: null,
            selectedTextId: null,
          });
        }}
        style={{
          position: 'absolute',
          left: `${device.offsetX}px`,
          top: `${device.offsetY}px`,
          transform: `
            translate(-50%, -50%) 
            rotate(${device.rotation}deg) 
            scale(${device.scale})
          `,
          transformOrigin: 'center center',
          filter: getShadowStyle(device.shadowDepth),
          cursor: dragMode === 'move' && isCurrentDragging ? 'grabbing' : 'grab',
          zIndex: isSelected ? 35 : 20 + index,
          transition: isCurrentDragging ? 'none' : 'outline 0.15s ease, filter 0.2s ease',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
        title={`Cihaz ${index + 1} (${device.deviceType}) - Taşımak için sürükleyin`}
      >
        <DeviceFrame
          deviceType={device.deviceType as any}
          deviceColor={device.deviceColor}
          screenshotUrl={device.screenshotUrl}
          borderRadius={24}
          shadowDepth="none"
          onUploadClick={() => onUploadDeviceScreenshot(device.id)}
          presetWidth={config.width}
          presetHeight={config.height}
        />

        {/* Transform Gizmo when device is selected */}
        {isSelected && (
          <div
            className="device-transform-gizmo"
            style={{
              opacity: 1,
              pointerEvents: 'auto',
            }}
          >
            {/* Device Rotate Pill */}
            <div
              className="device-rotate-pill"
              title="Döndürmek için sürükleyin veya 15° çevirmek için tıklayın"
              style={{
                top: 0,
                transform: `translate(-50%, calc(-100% - 10px)) scale(${invScale})`,
                transformOrigin: 'center bottom',
              }}
              onPointerDown={(e) => {
                const deviceEl = e.currentTarget.closest('.device-interactive-container') as HTMLElement;
                handleDeviceRotatePointerDown(e, deviceEl, device.id);
              }}
              onClick={(e) => {
                if (!dragMovedRef.current) {
                  e.stopPropagation();
                  const newRot = ((device.rotation + 15) % 360);
                  const updatedDevs = config.devices.map((d) =>
                    d.id === device.id ? { ...d, rotation: newRot } : d
                  );
                  onChangeConfig({ devices: updatedDevs });
                }
              }}
            >
              <RotateCw size={11} />
              <span>{device.rotation}°</span>
            </div>

            {/* Quick Delete Pill */}
            <div
              className="device-delete-pill"
              title="Bu cihazı tuvalden sil (Delete tuşuyla da silebilirsiniz)"
              style={{
                top: 0,
                transform: `translateY(calc(-100% - 10px)) scale(${invScale})`,
                transformOrigin: 'center bottom',
              }}
              onClick={(e) => {
                e.stopPropagation();
                const remaining = config.devices.filter((d) => d.id !== device.id);
                onChangeConfig({
                  devices: remaining,
                  deviceCount: remaining.length,
                  selectedDeviceId: remaining[0]?.id || null,
                });
              }}
            >
              <Trash2 size={11} />
            </div>

            {/* Resize Handles */}
            <div
              className="resize-handle handle-nw"
              title="Boyutlandır"
              style={{ transform: `scale(${invScale})`, transformOrigin: 'center center' }}
              onPointerDown={(e) => handleDevicePointerDown(e, 'resize-nw', device.id)}
            />
            <div
              className="resize-handle handle-ne"
              title="Boyutlandır"
              style={{ transform: `scale(${invScale})`, transformOrigin: 'center center' }}
              onPointerDown={(e) => handleDevicePointerDown(e, 'resize-ne', device.id)}
            />
            <div
              className="resize-handle handle-sw"
              title="Boyutlandır"
              style={{ transform: `scale(${invScale})`, transformOrigin: 'center center' }}
              onPointerDown={(e) => handleDevicePointerDown(e, 'resize-sw', device.id)}
            />
            <div
              className="resize-handle handle-se"
              title="Boyutlandır"
              style={{ transform: `scale(${invScale})`, transformOrigin: 'center center' }}
              onPointerDown={(e) => handleDevicePointerDown(e, 'resize-se', device.id)}
            />

            {/* Floating indicator while dragging/resizing/rotating */}
            {dragMode !== 'none' && isCurrentDragging && (
              <div
                className="transform-floating-pill"
                style={{
                  bottom: 0,
                  transform: `translate(-50%, calc(100% + 10px)) scale(${invScale})`,
                  transformOrigin: 'center top',
                }}
              >
                {dragMode === 'device-rotate' ? (
                  <>
                    <RotateCw size={12} />
                    <span>{device.rotation}°</span>
                  </>
                ) : dragMode === 'move' ? (
                  <>
                    <Move size={12} />
                    <span>X: {device.offsetX}, Y: {device.offsetY}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={12} />
                    <span>%{Math.round(device.scale * 100)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating Quick Action Pill for Selected Device */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: `translate(-50%, calc(100% + 14px)) scale(${invScale})`,
              transformOrigin: 'center top',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              borderRadius: '999px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn-pill-action"
              onClick={() => onUploadDeviceScreenshot(device.id)}
              title="Ekran Görüntüsü Yükle / Değiştir"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              <Upload size={12} color="#D90429" />
              <span>{device.screenshotUrl ? 'Görseli Değiştir' : 'Görsel Yükle'}</span>
            </button>

            {device.screenshotUrl && (
              <button
                type="button"
                className="btn-pill-action"
                onClick={() => onCropDeviceScreenshot(device.id)}
                title="Kırp"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Crop size={12} />
                <span>Kırp</span>
              </button>
            )}

            {device.screenshotUrl && (
              <button
                type="button"
                className="btn-pill-action"
                onClick={() => {
                  const updatedDevs = [...config.devices];
                  const idx = updatedDevs.findIndex((d) => d.id === device.id);
                  if (idx !== -1) {
                    updatedDevs[idx] = {
                      ...updatedDevs[idx],
                      screenshotUrl: null,
                      originalScreenshotUrl: null,
                      cropData: null,
                    };
                    onChangeConfig({ devices: updatedDevs });
                  }
                }}
                title="Ekran görüntüsünü kaldır"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={viewportRef}
      className="canvas-viewport" 
      onPointerDown={handleCanvasPointerDown}
      style={{
        cursor: isPanning ? 'grabbing' : 'grab',
      }}
    >
      {/* Floating Top-Right Controls (Safe Zone Guide Toggle) */}
      <div 
        className="canvas-top-right-toolbar" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowSafeZone(!showSafeZone)}
          title="Google Play / App Store Güvenli Alan Kılavuzunu Göster/Gizle"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: showSafeZone ? '#FFF1F2' : '#FFFFFF',
            color: showSafeZone ? '#D90429' : '#475569',
            border: showSafeZone ? '1.5px solid #D90429' : '1px solid #CBD5E1',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={14} color={showSafeZone ? '#D90429' : '#64748B'} />
          <span>Güvenli Alan</span>
        </button>
      </div>

      {/* Floating Bottom-Center Zoom Toolbar (Identical to MockupEditor) */}
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
          title="Otomatik Sığdır / Varsayılan Boyut"
          onClick={handleZoomReset}
        >
          %{Math.round(zoomLevel * 100)}
        </button>

        <button
          type="button"
          className="zoom-btn"
          title="Yakınlaştır"
          onClick={handleZoomIn}
        >
          <ZoomIn size={14} />
        </button>

        <div className="zoom-divider" />

        <button
          type="button"
          className="zoom-btn"
          title="Ekrana Sığdır"
          onClick={handleZoomReset}
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Absolutely Positioned Scaled Container with Pan & Zoom */}
      <div
        ref={containerRef}
        className={`canvas-zoom-container ${isPanning ? 'is-panning' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
          transition: isPanning || !isReady ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isReady ? 1 : 0,
        }}
      >
        {/* Screen Card Wrapper with Top Header */}
        <div 
          className="mockup-screen-wrapper is-active-screen" 
          style={{ width: `${config.width}px` }}
        >
          {/* Mockup Screen Header Card (Exact styling from Mockup Editor) */}
          <div className="mockup-screen-header">
            <div className="mockup-screen-title">
              <Layout size={13} color="#64748B" />
              <span className="screen-title-clickable" title="Mağaza Bannerı">
                {currentPreset?.name || 'Store Banner'}
              </span>

              <span style={{ fontSize: '10px', backgroundColor: '#0F172A', color: '#FFF', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'monospace' }}>
                {config.width} × {config.height} px
              </span>

              {config.preset === 'google-play-feature' && (
                <span style={{ fontSize: '10px', backgroundColor: '#059669', color: '#FFF', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  Google Play Standardı
                </span>
              )}
            </div>
          </div>

          {/* THE BANNER RENDER SURFACE (Target of html-to-image export) */}
          <div
            ref={canvasExportRef}
            id="store-banner-export-surface"
            className="mockup-render-box store-banner-surface"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                !target.closest('.device-interactive-container') &&
                !target.closest('.banner-element-layer') &&
                !target.closest('.free-shape-layer') &&
                !target.closest('.free-text-layer')
              ) {
                setEditingTextId(null);
                setEditingElementId(null);
                onChangeConfig({
                  selectedDeviceId: null,
                  selectedElementId: null,
                  selectedShapeId: null,
                  selectedTextId: null,
                });
              }
            }}
            style={{
              width: `${config.width}px`,
              height: `${config.height}px`,
              minHeight: `${config.height}px`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              ...getCanvasBackground(),
            }}
          >
            {/* Background Image Layer if present */}
            {config.bgType === 'image' && config.bgImageUrl && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${config.bgImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `blur(${config.bgImageBlur}px)`,
                  transform: config.bgImageBlur > 0 ? 'scale(1.05)' : 'none',
                  zIndex: 1,
                }}
              />
            )}

            {/* Background Dim Overlay */}
            {config.bgType === 'image' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: `rgba(0, 0, 0, ${config.bgImageDim})`,
                  zIndex: 2,
                }}
              />
            )}

            {/* Background Texture / Pattern */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
              {renderPatternOverlay()}
            </div>

            {/* Google Play / App Store Safe Zone Overlay Guide */}
            {showSafeZone && (
              <div
                style={{
                  position: 'absolute',
                  top: `${Math.round(config.height * 0.055)}px`,
                  bottom: `${Math.round(config.height * 0.055)}px`,
                  left: `${Math.round(config.width * 0.045)}px`,
                  right: `${Math.round(config.width * 0.045)}px`,
                  border: '2px dashed rgba(217, 4, 41, 0.75)',
                  backgroundColor: 'rgba(217, 4, 41, 0.03)',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                  zIndex: 90,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: '8px 12px',
                }}
              >
                <div style={{
                  backgroundColor: 'rgba(217, 4, 41, 0.88)',
                  color: '#FFFFFF',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                  <ShieldCheck size={12} />
                  <span>Güvenli Alan (Önemli metin ve logolar bu sınır içinde kalmalıdır)</span>
                </div>
              </div>
            )}

            {/* Symmetrical Center Alignment Guide Lines (Mockup Editor Style) */}
            {!isExporting && alignmentGuides.showVertical && (
              <div
                className="alignment-guide-line alignment-guide-line-v"
                title="Dikey Merkez Doğrultusu (Enine Simetrik)"
                style={{ zIndex: 999 }}
              />
            )}
            {!isExporting && alignmentGuides.showHorizontal && (
              <div
                className="alignment-guide-line alignment-guide-line-h"
                title="Yatay Merkez Doğrultusu (Boyuna Simetrik)"
                style={{ zIndex: 999 }}
              />
            )}

            {/* BACKGROUND FREE SHAPES (Mockup Editor Özelliği) */}
            {(config.shapeLayers || []).map((shape) => {
              const isSelected = config.selectedShapeId === shape.id;
              const isDraggingThis = dragMode === 'shape-move' && activeDragShapeId === shape.id;

              return (
                <div
                  key={shape.id}
                  data-shape-id={shape.id}
                  className={`free-shape-layer ${isSelected ? 'is-selected' : ''} ${isDraggingThis ? 'is-dragging' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${shape.x}px`,
                    top: `${shape.y}px`,
                    width: `${shape.width}px`,
                    height: `${shape.height}px`,
                    transition: dragMode.startsWith('shape-') ? 'none' : 'transform 0.1s ease-out',
                    zIndex: isSelected ? 35 : 12,
                    opacity: (shape.opacity ?? 100) / 100,
                  }}
                  onPointerDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.shape-corner-handle') || target.closest('.shape-rotate-btn') || target.closest('.shape-delete-btn')) {
                      return;
                    }
                    handleShapePointerDown(e, shape.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragMovedRef.current) return;
                    setEditingTextId(null);
                    setEditingElementId(null);
                    onChangeConfig({
                      selectedShapeId: shape.id,
                      selectedDeviceId: null,
                      selectedElementId: null,
                      selectedTextId: null,
                    });
                  }}
                >
                  {/* Shape Drag & Rotate Handle Bar - Mockup Studio White Style */}
                  {isSelected && (
                    <div
                      className="layer-drag-bar shape-drag-bar bar-at-top"
                      title="Bileşeni taşımak veya döndürmek için sürükleyin"
                      style={{
                        position: 'absolute',
                        top: '-36px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(8px)',
                        color: '#334155',
                        border: '1px solid #E2E8F0',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        zIndex: 60,
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                      }}
                    >
                      <div
                        className="layer-move-handle"
                        onPointerDown={(e) => handleShapePointerDown(e, shape.id)}
                        title="Bileşeni taşımak için basılı tutup sürükleyin"
                        style={{
                          cursor: 'move',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px 4px',
                          borderRadius: '12px',
                          color: '#475569',
                        }}
                      >
                        <Move size={12} />
                      </div>

                      <div style={{ width: '1px', height: '12px', backgroundColor: '#E2E8F0' }} />

                      <div
                        className={`layer-rotate-btn shape-rotate-btn ${(shape.rotation || 0) !== 0 ? 'active' : ''}`}
                        title="Döndürmek için basılı tutup sürükleyin"
                        onPointerDown={(e) => handleShapeRotatePointerDown(e, shape.id, e.currentTarget.closest('.free-shape-layer'))}
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextRot = ((shape.rotation || 0) + 15) % 360;
                          onChangeConfig({
                            shapeLayers: (config.shapeLayers || []).map((s) =>
                              s.id === shape.id ? { ...s, rotation: nextRot } : s
                            ),
                            selectedShapeId: shape.id,
                          });
                        }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 4px',
                          borderRadius: '12px',
                          color: (shape.rotation || 0) !== 0 ? '#D90429' : '#475569',
                        }}
                      >
                        <RotateCw size={11} />
                        <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>{shape.rotation || 0}°</span>
                      </div>

                      <div style={{ width: '1px', height: '12px', backgroundColor: '#E2E8F0' }} />

                      <div
                        className="shape-delete-btn"
                        title="Şekli Sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          const remaining = (config.shapeLayers || []).filter((s) => s.id !== shape.id);
                          onChangeConfig({
                            shapeLayers: remaining,
                            selectedShapeId: remaining.length > 0 ? remaining[0].id : null,
                          });
                        }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#EF4444',
                          padding: '2px 4px',
                          borderRadius: '12px',
                        }}
                      >
                        <Trash2 size={12} />
                      </div>
                    </div>
                  )}

                  {/* Rotated Shape Wrapper with Resize Handles */}
                  <div
                    className="free-shape-rotated-wrap"
                    style={{
                      width: `${shape.width}px`,
                      height: `${shape.height}px`,
                      transform: `rotate(${shape.rotation || 0}deg)`,
                      transformOrigin: 'center center',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <>
                        <div
                          className="text-corner-handle shape-corner-handle handle-nw"
                          title="Köşeden boyutlandır"
                          onPointerDown={(e) =>
                            handleShapeCornerResizeStart(e, shape.id, 'nw', shape.x, shape.y, shape.width, shape.height, shape.rotation || 0, shape.type)
                          }
                        />
                        <div
                          className="text-corner-handle shape-corner-handle handle-ne"
                          title="Köşeden boyutlandır"
                          onPointerDown={(e) =>
                            handleShapeCornerResizeStart(e, shape.id, 'ne', shape.x, shape.y, shape.width, shape.height, shape.rotation || 0, shape.type)
                          }
                        />
                        <div
                          className="text-corner-handle shape-corner-handle handle-sw"
                          title="Köşeden boyutlandır"
                          onPointerDown={(e) =>
                            handleShapeCornerResizeStart(e, shape.id, 'sw', shape.x, shape.y, shape.width, shape.height, shape.rotation || 0, shape.type)
                          }
                        />
                        <div
                          className="text-corner-handle shape-corner-handle handle-se"
                          title="Köşeden boyutlandır"
                          onPointerDown={(e) =>
                            handleShapeCornerResizeStart(e, shape.id, 'se', shape.x, shape.y, shape.width, shape.height, shape.rotation || 0, shape.type)
                          }
                        />
                      </>
                    )}
                    {renderShapeSvgContent(shape)}
                  </div>
                </div>
              );
            })}

            {/* ========================================================================= */}
            {/* INDEPENDENT MOVABLE & EDITABLE TEXT / BRANDING ELEMENTS                     */}
            {/* ========================================================================= */}

            {/* 1. App Icon Layer */}
            {config.showAppIcon && (() => {
              const isAppIconSelected = !isExporting && config.selectedElementId === 'app-icon';
              return (
                <div
                  className={`banner-element-layer ${isAppIconSelected ? 'is-selected' : ''}`}
                  onPointerDown={(e) => handleElementPointerDown(e, 'app-icon')}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragMovedRef.current) return;
                    setEditingTextId(null);
                    setEditingElementId(null);
                    onChangeConfig({
                      selectedElementId: 'app-icon',
                      selectedDeviceId: null,
                      selectedShapeId: null,
                      selectedTextId: null,
                    });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onUploadAppIcon();
                  }}
                  style={{
                    position: 'absolute',
                    left: `${getElementPos('app-icon').x}px`,
                    top: `${getElementPos('app-icon').y}px`,
                    zIndex: config.selectedElementId === 'app-icon' ? 50 : 35,
                    cursor: dragMode === 'element-move' && activeDragElementId === 'app-icon' ? 'grabbing' : 'grab',
                    outline: isAppIconSelected ? '1.5px dashed #D90429' : '1px dashed transparent',
                    outlineOffset: '4px',
                    borderRadius: '8px',
                    padding: '2px',
                    transition: dragMode === 'element-move' ? 'none' : 'outline 0.15s ease',
                  }}
                  title="Uygulama İkonu - Taşımak için sürükleyin, köşelerinden boyutlandırın, değiştirmek için çift tıklayın"
                >
                  {isAppIconSelected && (
                    <>
                      <div
                        className="text-corner-handle handle-nw"
                        title="Köşeden boyutlandır"
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'app-icon', 'nw')}
                      />
                      <div
                        className="text-corner-handle handle-ne"
                        title="Köşeden boyutlandır"
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'app-icon', 'ne')}
                      />
                      <div
                        className="text-corner-handle handle-sw"
                        title="Köşeden boyutlandır"
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'app-icon', 'sw')}
                      />
                      <div
                        className="text-corner-handle handle-se"
                        title="Köşeden boyutlandır"
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'app-icon', 'se')}
                      />
                    </>
                  )}
                  <div
                    style={{
                      width: `${config.appIconSize}px`,
                      height: `${config.appIconSize}px`,
                      borderRadius:
                        typeof config.appIconRadius === 'number'
                          ? `${config.appIconRadius}%`
                          : config.appIconRadius === 'circle'
                          ? '50%'
                          : config.appIconRadius === 'round'
                          ? '22%'
                          : '22.37%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35), 0 0 0 1.5px rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      pointerEvents: 'auto',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {config.appIconUrl ? (
                      <img
                        src={config.appIconUrl}
                        alt="App Icon"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #D90429 0%, #EF233C 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: `${Math.round(config.appIconSize * 0.42)}px`,
                          fontWeight: 800,
                          userSelect: 'none',
                        }}
                      >
                        🌶️
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 2. Eyebrow Pill Tag */}
            {config.showEyebrow && (() => {
              const isEyebrowSelected = !isExporting && config.selectedElementId === 'eyebrow';
              const eyebrowScale = config.elementScales?.['eyebrow'] || 1;
              return (
                <div
                  className={`banner-element-layer ${isEyebrowSelected ? 'is-selected' : ''}`}
                  onPointerDown={(e) => {
                    if (editingElementId === 'eyebrow') return;
                    handleElementPointerDown(e, 'eyebrow');
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragMovedRef.current) return;
                    if (config.selectedElementId === 'eyebrow' && editingElementId !== 'eyebrow') {
                      setEditingElementId('eyebrow');
                    } else if (config.selectedElementId !== 'eyebrow') {
                      setEditingElementId(null);
                      onChangeConfig({ selectedElementId: 'eyebrow', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingElementId('eyebrow');
                    onChangeConfig({ selectedElementId: 'eyebrow', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                  }}
                  style={{
                    position: 'absolute',
                    left: `${getElementPos('eyebrow').x}px`,
                    top: `${getElementPos('eyebrow').y}px`,
                    transform: eyebrowScale !== 1 ? `scale(${eyebrowScale})` : undefined,
                    transformOrigin: 'top left',
                    zIndex: config.selectedElementId === 'eyebrow' ? 50 : 35,
                    cursor: editingElementId === 'eyebrow' ? 'text' : dragMode === 'element-move' && activeDragElementId === 'eyebrow' ? 'grabbing' : 'grab',
                    outline: isEyebrowSelected ? '1.5px dashed #D90429' : '1px dashed transparent',
                    outlineOffset: '4px',
                    borderRadius: '999px',
                    padding: '2px',
                    display: 'inline-flex',
                    transition: dragMode === 'element-move' ? 'none' : 'outline 0.15s ease',
                  }}
                  title="Vurgu Etiketi - Taşımak için sürükleyin, köşelerinden boyutlandırın, düzenlemek için tıklayın"
                >
                  {isEyebrowSelected && (
                    <>
                      <div
                        className="text-corner-handle handle-nw"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / eyebrowScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'eyebrow', 'nw')}
                      />
                      <div
                        className="text-corner-handle handle-ne"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / eyebrowScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'eyebrow', 'ne')}
                      />
                      <div
                        className="text-corner-handle handle-sw"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / eyebrowScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'eyebrow', 'sw')}
                      />
                      <div
                        className="text-corner-handle handle-se"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / eyebrowScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'eyebrow', 'se')}
                      />
                    </>
                  )}
                  <EditableCanvasText
                    as="span"
                    value={config.eyebrowText}
                    isEditing={editingElementId === 'eyebrow'}
                    onStopEditing={() => setEditingElementId(null)}
                    onChange={(val) => onChangeConfig({ eyebrowText: val })}
                    placeholder="VURGU ETİKETİ"
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: config.eyebrowColor,
                      backgroundColor: config.eyebrowBgColor,
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${config.eyebrowColor}33`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              );
            })()}

            {/* 3. DYNAMIC TEXT LAYERS (Mockup Studio Özelliği) */}
            {(config.textLayers || []).length > 0 ? (
              (config.textLayers || []).map((layer) => {
                const isSelected = config.selectedTextId === layer.id;
                const isDraggingThis = dragMode === 'text-move' && activeDragTextId === layer.id;

                return (
                  <div
                    key={layer.id}
                    data-layer-id={layer.id}
                    className={`free-text-layer ${isSelected ? 'is-selected' : ''} ${isDraggingThis ? 'is-dragging' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${layer.x}px`,
                      top: `${layer.y}px`,
                      zIndex: isSelected ? 48 : 36,
                      fontFamily: getFontFamilyCss(layer.fontFamily),
                      cursor: editingTextId === layer.id ? 'text' : dragMode === 'text-move' && activeDragTextId === layer.id ? 'grabbing' : 'grab',
                      transition: dragMode.startsWith('text-') ? 'none' : 'outline 0.1s ease',
                    }}
                    onPointerDown={(e) => {
                      if (editingTextId === layer.id) return;
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('.text-corner-handle') || 
                        target.closest('.text-border-handle') || 
                        target.closest('.layer-rotate-btn') || 
                        target.closest('.layer-delete-btn')
                      ) {
                        return;
                      }
                      handleTextPointerDown(e, layer.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragMovedRef.current) return;

                      if (config.selectedTextId === layer.id && editingTextId !== layer.id) {
                        // Seçiliyken tekrar tıklayınca -> DÜZENLEME MODUNA GEÇ
                        setEditingTextId(layer.id);
                      } else if (config.selectedTextId !== layer.id) {
                        // İlk tıklamada -> SEÇ
                        setEditingTextId(null);
                        window.getSelection()?.removeAllRanges();
                        onChangeConfig({
                          selectedTextId: layer.id,
                          selectedDeviceId: null,
                          selectedShapeId: null,
                          selectedElementId: null,
                        });
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTextId(layer.id);
                      onChangeConfig({
                        selectedTextId: layer.id,
                        selectedDeviceId: null,
                        selectedShapeId: null,
                        selectedElementId: null,
                      });
                    }}
                  >
                    {/* Individual Drag & Rotate Handle Bar - Mockup Studio White Style */}
                    {isSelected && (
                      <div
                        className="layer-drag-bar bar-at-top"
                        title="Taşımak veya döndürmek için sürükleyin"
                        style={{
                          position: 'absolute',
                          top: '-36px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(8px)',
                          color: '#334155',
                          border: '1px solid #E2E8F0',
                          padding: '3px 8px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                          zIndex: 100,
                          whiteSpace: 'nowrap',
                          pointerEvents: 'auto',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          className="layer-move-handle"
                          onPointerDown={(e) => handleTextPointerDown(e, layer.id)}
                          title="Metni taşımak için basılı tutup sürükleyin"
                          style={{
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px 4px',
                            borderRadius: '12px',
                            color: '#475569',
                          }}
                        >
                          <Move size={12} />
                        </div>

                        <div style={{ width: '1px', height: '12px', backgroundColor: '#E2E8F0' }} />

                        <div
                          className={`layer-rotate-btn ${(layer.rotation || 0) !== 0 ? 'active' : ''}`}
                          title="Döndürmek için sürükleyin veya tıklayın"
                          onPointerDown={(e) => handleTextRotatePointerDown(e, layer.id, e.currentTarget.closest('.free-text-layer'))}
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextRot = ((layer.rotation || 0) + 15) % 360;
                            onChangeConfig({
                              textLayers: (config.textLayers || []).map((l) =>
                                l.id === layer.id ? { ...l, rotation: nextRot } : l
                              ),
                            });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            borderRadius: '12px',
                            color: (layer.rotation || 0) !== 0 ? '#D90429' : '#475569',
                          }}
                        >
                          <RotateCw size={11} />
                          <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>{layer.rotation || 0}°</span>
                        </div>

                        {(config.textLayers || []).length > 1 && (
                          <>
                            <div style={{ width: '1px', height: '12px', backgroundColor: '#E2E8F0' }} />
                            <button
                              type="button"
                              className="layer-delete-btn"
                              title="Metni sil"
                              onClick={(e) => {
                                e.stopPropagation();
                                const remaining = (config.textLayers || []).filter((l) => l.id !== layer.id);
                                onChangeConfig({
                                  textLayers: remaining,
                                  selectedTextId: remaining[0]?.id || null,
                                });
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Rotated text wrapper with Corner & Border resize handles */}
                    <div
                      className={`free-text-rotated-wrap ${
                        (dragMode === 'text-resize-left' || dragMode === 'text-resize-right') && activeDragTextId === layer.id
                          ? 'is-resizing-width'
                          : ''
                      }`}
                      style={{
                        width: layer.width ? `${layer.width}px` : 'max-content',
                        maxWidth: '100%',
                        transform: `rotate(${layer.rotation || 0}deg)`,
                        transformOrigin: 'center center',
                        position: 'relative',
                        outline: isSelected ? '1.5px dashed #D90429' : '1px dashed transparent',
                        outlineOffset: '4px',
                        borderRadius: '4px',
                        padding: '2px',
                        display: 'flex',
                        justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                      }}
                    >
                      {isSelected && (
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
                        as="span"
                        value={layer.text}
                        isEditing={editingTextId === layer.id}
                        onStopEditing={() => setEditingTextId(null)}
                        onChange={(val) => {
                          onChangeConfig({
                            textLayers: (config.textLayers || []).map((l) =>
                              l.id === layer.id ? { ...l, text: val } : l
                            ),
                            selectedTextId: layer.id,
                          });
                        }}
                        placeholder="Metin yazın..."
                        style={{
                          fontSize: `${layer.fontSize}px`,
                          color: layer.color,
                          fontWeight: layer.isBold ? 800 : 400,
                          fontStyle: layer.isItalic ? 'italic' : 'normal',
                          textDecoration: layer.isUnderline ? 'underline' : 'none',
                          textAlign: layer.textAlign || 'left',
                          lineHeight: layer.lineHeight !== undefined ? layer.lineHeight : 1.2,
                          display: 'block',
                          width: '100%',
                          wordBreak: 'break-word',
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* Fallback Legacy Title Headline */}
                {config.showTitle && (
                  <div
                    className={`banner-element-layer ${config.selectedElementId === 'title' ? 'is-selected' : ''}`}
                    onPointerDown={(e) => {
                      if (editingElementId === 'title') return;
                      handleElementPointerDown(e, 'title');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragMovedRef.current) return;
                      if (config.selectedElementId === 'title' && editingElementId !== 'title') {
                        setEditingElementId('title');
                      } else if (config.selectedElementId !== 'title') {
                        setEditingElementId(null);
                        onChangeConfig({ selectedElementId: 'title', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingElementId('title');
                      onChangeConfig({ selectedElementId: 'title', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                    }}
                    style={{
                      position: 'absolute',
                      left: `${getElementPos('title').x}px`,
                      top: `${getElementPos('title').y}px`,
                      maxWidth: `${config.textMaxWidth}px`,
                      zIndex: config.selectedElementId === 'title' ? 50 : 35,
                      cursor: editingElementId === 'title' ? 'text' : dragMode === 'element-move' && activeDragElementId === 'title' ? 'grabbing' : 'grab',
                      outline: config.selectedElementId === 'title' ? '1.5px dashed #D90429' : '1px dashed transparent',
                      outlineOffset: '4px',
                      borderRadius: '6px',
                      padding: '2px',
                      textAlign: config.textAlignment,
                      transition: dragMode === 'element-move' ? 'none' : 'outline 0.15s ease',
                    }}
                    title="Başlık - Taşımak için sürükleyin, düzenlemek için tıklayın"
                  >
                    <EditableCanvasText
                      as="h1"
                      value={config.titleText}
                      isEditing={editingElementId === 'title'}
                      onStopEditing={() => setEditingElementId(null)}
                      onChange={(val) => onChangeConfig({ titleText: val })}
                      placeholder="Başlık yazın..."
                      style={{
                        margin: 0,
                        fontSize: `${config.titleFontSize}px`,
                        fontWeight: config.titleFontWeight,
                        fontFamily: `var(--font-${config.titleFontFamily}, 'Outfit', sans-serif)`,
                        color: config.titleColor,
                        lineHeight: 1.15,
                        letterSpacing: '-0.025em',
                        textShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        wordBreak: 'break-word',
                      }}
                    />
                  </div>
                )}

                {/* Fallback Legacy Subtitle Description */}
                {config.showSubtitle && (
                  <div
                    className={`banner-element-layer ${config.selectedElementId === 'subtitle' ? 'is-selected' : ''}`}
                    onPointerDown={(e) => {
                      if (editingElementId === 'subtitle') return;
                      handleElementPointerDown(e, 'subtitle');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dragMovedRef.current) return;
                      if (config.selectedElementId === 'subtitle' && editingElementId !== 'subtitle') {
                        setEditingElementId('subtitle');
                      } else if (config.selectedElementId !== 'subtitle') {
                        setEditingElementId(null);
                        onChangeConfig({ selectedElementId: 'subtitle', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingElementId('subtitle');
                      onChangeConfig({ selectedElementId: 'subtitle', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                    }}
                    style={{
                      position: 'absolute',
                      left: `${getElementPos('subtitle').x}px`,
                      top: `${getElementPos('subtitle').y}px`,
                      maxWidth: `${config.textMaxWidth}px`,
                      zIndex: config.selectedElementId === 'subtitle' ? 50 : 35,
                      cursor: editingElementId === 'subtitle' ? 'text' : dragMode === 'element-move' && activeDragElementId === 'subtitle' ? 'grabbing' : 'grab',
                      outline: config.selectedElementId === 'subtitle' ? '1.5px dashed #D90429' : '1px dashed transparent',
                      outlineOffset: '4px',
                      borderRadius: '6px',
                      padding: '2px',
                      textAlign: config.textAlignment,
                      transition: dragMode === 'element-move' ? 'none' : 'outline 0.15s ease',
                    }}
                    title="Alt Başlık - Taşımak için sürükleyin, düzenlemek için tıklayın"
                  >
                    <EditableCanvasText
                      as="p"
                      value={config.subtitleText}
                      isEditing={editingElementId === 'subtitle'}
                      onStopEditing={() => setEditingElementId(null)}
                      onChange={(val) => onChangeConfig({ subtitleText: val })}
                      placeholder="Açıklama yazın..."
                      style={{
                        margin: 0,
                        fontSize: `${config.subtitleFontSize}px`,
                        fontWeight: config.subtitleFontWeight,
                        fontFamily: `var(--font-${config.subtitleFontFamily}, 'Outfit', sans-serif)`,
                        color: config.subtitleColor,
                        lineHeight: 1.5,
                        letterSpacing: '-0.01em',
                        opacity: 0.92,
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        wordBreak: 'break-word',
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* 5. Store Badges (Google Play & App Store) */}
            {config.showStoreBadge && (() => {
              const isBadgeSelected = !isExporting && config.selectedElementId === 'store-badge';
              const badgeScale = config.elementScales?.['store-badge'] || 1;
              return (
                <div
                  className={`banner-element-layer ${isBadgeSelected ? 'is-selected' : ''}`}
                  onPointerDown={(e) => handleElementPointerDown(e, 'store-badge')}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragMovedRef.current) return;
                    setEditingTextId(null);
                    setEditingElementId(null);
                    onChangeConfig({
                      selectedElementId: 'store-badge',
                      selectedDeviceId: null,
                      selectedShapeId: null,
                      selectedTextId: null,
                    });
                  }}
                  style={{
                    position: 'absolute',
                    left: `${getElementPos('store-badge').x}px`,
                    top: `${getElementPos('store-badge').y}px`,
                    transform: badgeScale !== 1 ? `scale(${badgeScale})` : undefined,
                    transformOrigin: 'top left',
                    zIndex: config.selectedElementId === 'store-badge' ? 50 : 35,
                    cursor: dragMode === 'element-move' && activeDragElementId === 'store-badge' ? 'grabbing' : 'grab',
                    outline: isBadgeSelected ? '1.5px dashed #D90429' : '1px dashed transparent',
                    outlineOffset: '4px',
                    borderRadius: '8px',
                    padding: '2px',
                    display: 'inline-flex',
                    gap: '8px',
                    alignItems: 'center',
                    transition: dragMode === 'element-move' ? 'none' : 'outline 0.15s ease',
                  }}
                  title="Mağaza Rozetleri - Taşımak için sürükleyin, köşelerinden boyutlandırın"
                >
                  {isBadgeSelected && (
                    <>
                      <div
                        className="text-corner-handle handle-nw"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / badgeScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'store-badge', 'nw')}
                      />
                      <div
                        className="text-corner-handle handle-ne"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / badgeScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'store-badge', 'ne')}
                      />
                      <div
                        className="text-corner-handle handle-sw"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / badgeScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'store-badge', 'sw')}
                      />
                      <div
                        className="text-corner-handle handle-se"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / badgeScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'store-badge', 'se')}
                      />
                    </>
                  )}
                  {(config.storeBadgeType === 'google-play' || config.storeBadgeType === 'both') && (
                    <div
                      style={{
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        userSelect: 'none',
                      }}
                    >
                      <svg width="18" height="20" viewBox="0 0 466 511.98" fillRule="evenodd" clipRule="evenodd" style={{ flexShrink: 0 }}>
                        <path fill="#EA4335" d="M199.9 237.8 1.4 470.17c7.22 24.57 30.16 41.81 55.8 41.81 11.16 0 20.93-2.79 29.3-8.37l244.16-139.46L199.9 237.8z"/>
                        <path fill="#FBBC04" d="m433.91 205.1-104.65-60-111.61 110.22 113.01 108.83 104.64-58.6c18.14-9.77 30.7-29.3 30.7-50.23-1.4-20.93-13.95-40.46-32.09-50.22z"/>
                        <path fill="#34A853" d="M199.42 273.45 329.27 145.1 87.9 8.37C79.53 2.79 68.36 0 57.2 0 30.7 0 6.98 18.14 1.4 41.86l198.02 231.59z"/>
                        <path fill="#4285F4" d="M1.39 41.86C0 46.04 0 51.63 0 57.2v397.64c0 5.57 0 9.76 1.4 15.34l216.27-214.86L1.39 41.86z"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontSize: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>İNDİRİN</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>Google Play</span>
                      </div>
                    </div>
                  )}

                  {(config.storeBadgeType === 'app-store' || config.storeBadgeType === 'both') && (
                    <div
                      style={{
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        userSelect: 'none',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.02-1.77.9-2.8-.88.04-1.94.59-2.57 1.33-.56.64-.99 1.68-.86 2.69.97.08 1.93-.49 2.53-1.22z"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontSize: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>İNDİRİN</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>App Store</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 6. Rating Badge */}
            {config.showRating && config.ratingText && (() => {
              const isRatingSelected = !isExporting && config.selectedElementId === 'rating';
              const ratingScale = config.elementScales?.['rating'] || 1;
              return (
                <div
                  className={`banner-element-layer ${isRatingSelected ? 'is-selected' : ''}`}
                  onPointerDown={(e) => {
                    if (editingElementId === 'rating') return;
                    handleElementPointerDown(e, 'rating');
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragMovedRef.current) return;
                    if (config.selectedElementId === 'rating' && editingElementId !== 'rating') {
                      setEditingElementId('rating');
                    } else if (config.selectedElementId !== 'rating') {
                      setEditingElementId(null);
                      onChangeConfig({ selectedElementId: 'rating', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingElementId('rating');
                    onChangeConfig({ selectedElementId: 'rating', selectedDeviceId: null, selectedShapeId: null, selectedTextId: null });
                  }}
                  style={{
                    position: 'absolute',
                    left: `${getElementPos('rating').x}px`,
                    top: `${getElementPos('rating').y}px`,
                    transform: ratingScale !== 1 ? `scale(${ratingScale})` : undefined,
                    transformOrigin: 'top left',
                    zIndex: config.selectedElementId === 'rating' ? 50 : 35,
                    cursor: editingElementId === 'rating' ? 'text' : dragMode === 'element-move' && activeDragElementId === 'rating' ? 'grabbing' : 'grab',
                    outline: isRatingSelected ? '1.5px dashed #D90429' : '1px dashed transparent',
                    outlineOffset: '4px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: config.ratingBgColor || 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    border: config.ratingBorderColor
                      ? `1px solid ${config.ratingBorderColor}`
                      : (config.ratingBgColor && config.ratingBgColor.startsWith('#'))
                      ? `1px solid ${config.ratingBgColor}33`
                      : '1px solid rgba(255, 255, 255, 0.18)',
                    paddingLeft: '10px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    gap: '6px',
                    color: config.ratingTextColor || '#F8FAFC',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: dragMode === 'element-move' ? 'none' : 'outline 0.15s ease',
                  }}
                  title="Kullanıcı Puanı Rozeti - Taşımak için sürükleyin, köşelerinden boyutlandırın, düzenlemek için metne tıklayın"
                >
                  {isRatingSelected && (
                    <>
                      <div
                        className="text-corner-handle handle-nw"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / ratingScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'rating', 'nw')}
                      />
                      <div
                        className="text-corner-handle handle-ne"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / ratingScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'rating', 'ne')}
                      />
                      <div
                        className="text-corner-handle handle-sw"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / ratingScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'rating', 'sw')}
                      />
                      <div
                        className="text-corner-handle handle-se"
                        title="Köşeden boyutlandır"
                        style={{ transform: `scale(${1 / ratingScale})`, transformOrigin: 'center center' }}
                        onPointerDown={(e) => handleElementCornerResizeStart(e, 'rating', 'se')}
                      />
                    </>
                  )}
                  <Star
                    size={14}
                    fill={config.ratingStarColor || '#F59E0B'}
                    color={config.ratingStarColor || '#F59E0B'}
                    style={{ flexShrink: 0 }}
                  />
                  <EditableCanvasText
                    as="span"
                    value={config.ratingText}
                    isEditing={editingElementId === 'rating'}
                    onStopEditing={() => setEditingElementId(null)}
                    onChange={(val) => onChangeConfig({ ratingText: val })}
                    placeholder="4.9 ★★★★★"
                    style={{
                      color: config.ratingTextColor || '#F8FAFC',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                </div>
              );
            })()}

            {/* DEVICE MOCKUPS LAYER */}
            {config.devices && config.devices.length > 0 && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {config.devices.map((device, idx) => renderDevice(device, idx))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
