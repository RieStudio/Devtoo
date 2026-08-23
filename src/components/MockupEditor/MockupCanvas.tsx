import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MockupConfig } from '../../types/mockup';
import { DeviceFrame } from './DeviceFrame';
import { Move, Maximize2, Crosshair, RotateCw } from 'lucide-react';

interface MockupCanvasProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>, recordHistory?: boolean) => void;
  onCommitHistory?: () => void;
  onUploadImageClick: () => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
  deviceFrameRef?: React.RefObject<HTMLDivElement | null>;
  isExporting?: boolean;
}

type DragMode =
  | 'move'
  | 'group-move'
  | 'group-rotate'
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
  config,
  onChangeConfig,
  onUploadImageClick,
  exportRef,
  deviceFrameRef,
  isExporting = false,
}) => {
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

  // Determine outer container dimensions for responsive fit
  const getCanvasDimensions = () => {
    const isLandscape = config.width > config.height;
    const isSquare = config.width === config.height;

    if (isLandscape) {
      return { width: '660px', minHeight: '380px' };
    }
    if (isSquare) {
      return { width: '440px', minHeight: '440px' };
    }
    return { width: '400px', minHeight: '640px' };
  };

  const dims = getCanvasDimensions();
  const currentScale = config.deviceScale ?? 1;
  const currentOffsetX = config.deviceOffsetX ?? 0;
  const currentOffsetY = config.deviceOffsetY ?? 0;

  // Handle pointer down on device frame or resize handle
  const handlePointerDown = (e: React.PointerEvent, mode: DragMode) => {
    e.stopPropagation();
    e.preventDefault();

    const currentSelectedIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
    const isMultiSelectedWithDevice = isDeviceSelected && currentSelectedIds.length > 0 && mode === 'move';

    if (isMultiSelectedWithDevice) {
      handleGroupMovePointerDown(e);
      return;
    }

    setDragMode(mode);
    setDragMoved(false);
    setIsDeviceSelected(true);
    // When device is individually selected/dragged, clear text selection
    if (config.selectedTextId || (config.selectedTextIds && config.selectedTextIds.length > 0)) {
      onChangeConfig({
        selectedTextId: null,
        selectedTextIds: [],
      });
    }

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: currentOffsetX,
      initialOffsetY: currentOffsetY,
      initialScale: currentScale,
    };
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
      // Initiate group move for all selected layers and device
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

  // Handle pointer down on text layer ROTATE handle (drag to rotate)
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

  // Group Move Handler: Move all selected text layers and/or device together
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

  // Group Rotate Handler: Rotate all selected text layers together around group center
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

  // Canvas marquee pointer down to start rubberband selection box
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Only trigger if clicking directly on canvas-viewport or mockup-render-box background
    const target = e.target as HTMLElement;
    if (
      target.closest('.free-text-layer') ||
      target.closest('.layer-drag-bar') ||
      target.closest('.device-interactive-container') ||
      target.closest('.canvas-quick-toolbar') ||
      target.closest('.preset-selector-bar')
    ) {
      return;
    }

    const rect = exportRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Check if within render box or viewport
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
    setDragMoved(false);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Update selection box if dragging marquee on canvas
      if (selectionBox && exportRef.current) {
        const rect = exportRef.current.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        setSelectionBox((prev) => (prev ? { ...prev, currentX: curX, currentY: curY } : null));

        const boxLeft = Math.min(selectionBox.startX, curX);
        const boxRight = Math.max(selectionBox.startX, curX);
        const boxTop = Math.min(selectionBox.startY, curY);
        const boxBottom = Math.max(selectionBox.startY, curY);

        if (Math.hypot(curX - selectionBox.startX, curY - selectionBox.startY) > 6) {
          setDragMoved(true);

          // Test collision with Text Layers
          const textEls = exportRef.current.querySelectorAll('.free-text-layer');
          const hitTextIds: string[] = [];
          textEls.forEach((el) => {
            const elRect = el.getBoundingClientRect();
            const elL = elRect.left - rect.left;
            const elR = elRect.right - rect.left;
            const elT = elRect.top - rect.top;
            const elB = elRect.bottom - rect.top;

            const intersects = !(boxLeft > elR || boxRight < elL || boxTop > elB || boxBottom < elT);
            if (intersects) {
              const layerKey = el.getAttribute('data-layer-id');
              if (layerKey) {
                hitTextIds.push(layerKey);
              }
            }
          });

          // Test collision with Device Container
          let hitDevice = false;
          const deviceEl = exportRef.current.querySelector('.device-interactive-container');
          if (deviceEl) {
            const devRect = deviceEl.getBoundingClientRect();
            const devL = devRect.left - rect.left;
            const devR = devRect.right - rect.left;
            const devT = devRect.top - rect.top;
            const devB = devRect.bottom - rect.top;

            hitDevice = !(boxLeft > devR || boxRight < devL || boxTop > devB || boxBottom < devT);
            setIsDeviceSelected(hitDevice);
          }

          if (hitTextIds.length > 0) {
            onChangeConfig({
              selectedTextIds: hitTextIds,
              selectedTextId: hitTextIds[0],
            });
          } else if (!hitDevice) {
            onChangeConfig({
              selectedTextIds: [],
            });
          }
        }
        return;
      }

      if (!dragMode) return;

      const deltaX = e.clientX - startPosRef.current.clientX;
      const deltaY = e.clientY - startPosRef.current.clientY;

      if (Math.hypot(deltaX, deltaY) > 3) {
        setDragMoved(true);
      }

      if (dragMode === 'group-move') {
        const { startX, startY, initialLayers, initialDeviceOffsetX, initialDeviceOffsetY } = groupDragRef.current;
        let dX = e.clientX - startX;
        let dY = e.clientY - startY;

        // Calculate true geometric bounding box center of all selected components
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

        if (snapX) {
          dX = dX - groupCenterX;
        }
        if (snapY) {
          dY = dY - groupCenterY;
        }

        setAlignmentGuides({
          showVertical: snapX,
          showHorizontal: snapY,
        });

        const updated: Partial<MockupConfig> = {};
        if (initialLayers.length > 0) {
          const initMap = new Map(initialLayers.map((l) => [l.id, l]));
          updated.textLayers = (config.textLayers || []).map((l) => {
            const init = initMap.get(l.id);
            if (init) {
              return { ...l, x: Math.round(init.x + dX), y: Math.round(init.y + dY) };
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

        onChangeConfig({
          deviceOffsetX: newOffsetX,
          deviceOffsetY: newOffsetY,
        }, false);
      } else if (dragMode === 'text-move' && draggingTextId) {
        let newX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        let newY = Math.round(startPosRef.current.initialOffsetY + deltaY);

        // Smart snap to horizontal center (X: 0) and vertical center (Y: 0) with a 4px magnetic threshold
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
      } else if (dragMode === 'text-rotate' && draggingTextId) {
        const { centerX, centerY, startRotation, startPointerAngle } = rotateCenterRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - startPointerAngle;
        let newRot = Math.round((startRotation + deltaAngle) % 360);
        if (newRot < -180) newRot += 360;
        if (newRot > 180) newRot -= 360;

        // Smart snap to 0°, 90°, -90°, 180° within 3 degrees
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
        // Project screen movement onto the rotated text's local X axis
        const projectedDelta = dX * Math.cos(rad) + dY * Math.sin(rad);

        const currentLayer = (config.textLayers || []).find((l) => l.id === draggingTextId);
        const currentLayerX = currentLayer?.x || 0;
        const canvasBoundWidth = exportRef.current?.offsetWidth || 600;
        // Maximum allowed width without overflowing canvas borders from current X position
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

        // Project mouse displacement into local element coordinate axes
        const rad = (rotation || 0) * (Math.PI / 180);
        const localDX = dX * Math.cos(rad) + dY * Math.sin(rad);
        const localDY = -dX * Math.sin(rad) + dY * Math.cos(rad);

        // Direction multiplier for the specific corner
        const signX = corner === 'se' || corner === 'ne' ? 1 : -1;
        const signY = corner === 'se' || corner === 'sw' ? 1 : -1;

        const currentLayer = (config.textLayers || []).find((l) => l.id === draggingTextId);
        const currentLayerX = currentLayer?.x || 0;
        const canvasBoundWidth = exportRef.current?.offsetWidth || 600;
        const maxWidthAllowed = Math.max(60, (canvasBoundWidth / 2 - Math.abs(currentLayerX)) * 2);

        // Scale factor derived smoothly from displacement
        const diagonalDelta = (localDX * signX + localDY * signY) / 2;
        const initialHypot = Math.max(40, Math.hypot(initialWidth, initialHeight));
        const unboundedScaleFactor = Math.max(0.15, (initialHypot + diagonalDelta * 2) / initialHypot);

        // Limit scaleFactor so that newWidth doesn't exceed canvas boundaries
        const maxScaleFactorFromWidth = maxWidthAllowed / Math.max(40, initialWidth);
        const scaleFactor = Math.min(unboundedScaleFactor, Math.max(0.15, maxScaleFactorFromWidth));

        const updatedConfig: Partial<MockupConfig> = {};

        // Scale all selected text layers proportionally
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

        // If device is also selected in multi-selection, scale device proportionally as well
        if (isDeviceSelected) {
          const newDevScale = Math.min(Math.max(Number((currentScale * scaleFactor).toFixed(2)), 0.35), 2.2);
          updatedConfig.deviceScale = newDevScale;
        }

        onChangeConfig(updatedConfig, false);
      } else if (dragMode.startsWith('resize-')) {
        // Calculate scaling delta based on handle direction
        let scaleDelta = 0;
        const sensitivity = 0.005; // smooth scaling factor

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

        onChangeConfig({
          deviceScale: newScale,
        }, false);
      }
    },
    [dragMode, draggingTextId, config.textLayers, config.selectedTextId, selectionBox, onChangeConfig]
  );

  const handlePointerUp = useCallback(() => {
    setAlignmentGuides({ showVertical: false, showHorizontal: false });
    if (selectionBox) {
      setSelectionBox(null);
    }
    if (dragMode) {
      setDragMode(null);
      setDraggingTextId(null);
      // Record final position / transform to history when drag finishes
      if (dragMoved) {
        onChangeConfig({}, true);
      }
    }
  }, [dragMode, dragMoved, selectionBox, onChangeConfig]);

  useEffect(() => {
    if (dragMode || selectionBox) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragMode, selectionBox, handlePointerMove, handlePointerUp]);

  const handleCanvasClick = () => {
    // Only deselect if clicked outside interactive elements and not a drag
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
    // If not dragged and there's no screenshot, allow upload click
    if (!dragMoved && !config.screenshotUrl) {
      onUploadImageClick();
    }
  };

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeConfig({
      deviceOffsetX: 0,
      deviceOffsetY: 0,
    });
  };

  return (
    <div className="canvas-viewport" onPointerDown={handleCanvasPointerDown} onClick={handleCanvasClick}>
      {/* Top Floating Quick Controls for Canvas (Only in Full Canvas Mode) */}
      {!isDeviceOnly && (
        <div className="canvas-quick-toolbar" onClick={(e) => e.stopPropagation()}>
          <button
            className="canvas-quick-btn"
            title="Cihazı Merkeze Hizala (X:0, Y:0)"
            onClick={handleResetPosition}
          >
            <Crosshair size={13} />
            <span>Ortala</span>
          </button>
          {(currentOffsetX !== 0 || currentOffsetY !== 0 || currentScale !== 1) && (
            <span className="canvas-coords-badge">
              X: {currentOffsetX > 0 ? `+${currentOffsetX}` : currentOffsetX}px, Y:{' '}
              {currentOffsetY > 0 ? `+${currentOffsetY}` : currentOffsetY}px (%{Math.round(currentScale * 100)})
            </span>
          )}
        </div>
      )}

      {/* Render Box for HTML-to-Image Export */}
      <div
        ref={exportRef}
        onClick={handleCanvasClick}
        className={`mockup-render-box ${
          isDeviceOnly 
            ? 'mode-device-only-clean' 
            : config.bgType !== 'solid' ? `bg-${config.bgType}` : ''
        }`}
        style={{
          width: isDeviceOnly ? 'auto' : dims.width,
          minHeight: isDeviceOnly ? 'auto' : dims.minHeight,
          backgroundColor: isDeviceOnly ? 'transparent' : config.bgColor,
          boxShadow: isDeviceOnly ? 'none' : undefined,
          border: isDeviceOnly ? 'none' : undefined,
          padding: isDeviceOnly ? '0px' : `${config.padding}px`,
          transform: isDeviceOnly ? 'none' : `rotate(${config.frameRotation}deg)`,
          overflow: isDeviceOnly ? 'visible' : 'hidden',
        }}
      >
        {/* Visual Marquee Selection Box */}
        {selectionBox && (
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
        {!isExporting && alignmentGuides.showVertical && (
          <div className="alignment-guide-line alignment-guide-line-v" title="Dikey Merkez Doğrultusu" />
        )}
        {!isExporting && alignmentGuides.showHorizontal && (
          <div className="alignment-guide-line alignment-guide-line-h" title="Yatay Merkez Doğrultusu" />
        )}

        {/* Unified Move & Rotate toolbar when multiple items are selected */}
        {!isExporting && !isDeviceOnly && (
          ((config.selectedTextIds && config.selectedTextIds.length > 1) || (config.selectedTextId && isDeviceSelected))
        ) && (() => {
          const selIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
          const activeLayers = (config.textLayers || []).filter((l) => selIds.includes(l.id));

          let minRelY = 0;
          let avgRelX = 0;
          if (activeLayers.length > 0) {
            minRelY = Math.min(...activeLayers.map((l) => l.y));
            avgRelX = activeLayers.reduce((sum, l) => sum + l.x, 0) / activeLayers.length;
          } else if (isDeviceSelected) {
            minRelY = (config.deviceOffsetY ?? 0) - 180;
            avgRelX = config.deviceOffsetX ?? 0;
          }

          const canvasHalfH = (exportRef.current?.offsetHeight || 600) / 2;
          // Calculate desired top offset from center. If it would overflow top edge (< 14px), pin near top border (14px)
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
                    const selIds = config.selectedTextIds || (config.selectedTextId ? [config.selectedTextId] : []);
                    onChangeConfig({
                      textLayers: (config.textLayers || []).map((l) =>
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
        {!isDeviceOnly && config.showHeadline && (config.textLayers || []).map((layer) => {
          const isSelected = config.selectedTextId === layer.id || (config.selectedTextIds || []).includes(layer.id);
          const isMultiSelected = (config.selectedTextIds && config.selectedTextIds.length > 1) || ((config.selectedTextIds || []).length >= 1 && isDeviceSelected);
          const isDraggingThis = dragMode === 'text-move' && draggingTextId === layer.id;

          const canvasH = config.width > config.height ? 380 : config.width === config.height ? 440 : 640;
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
                transition: isDraggingThis || dragMode === 'group-move' ? 'none' : 'transform 0.1s ease-out',
                zIndex: isSelected ? 20 : 15,
                fontFamily: getFontFamilyCss(layer.fontFamily),
              }}
              onPointerDown={(e) => {
                // If currently editing text, let native text selection/cursor work
                if (editingTextId === layer.id) {
                  return;
                }
                // If user clicks on resize handles or rotate button, don't trigger layer move
                const target = e.target as HTMLElement;
                if (target.closest('.text-corner-handle') || target.closest('.text-border-handle') || target.closest('.layer-rotate-btn')) {
                  return;
                }
                handleTextPointerDown(e, layer.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeviceSelected(false);

                // If user was dragging/moving the layer, don't trigger edit mode on release
                if (dragMoved) {
                  return;
                }

                // If this text box is ALREADY SELECTED, clicking it again enters text editing mode!
                if (config.selectedTextId === layer.id && (!config.selectedTextIds || config.selectedTextIds.length <= 1) && editingTextId !== layer.id) {
                  setEditingTextId(layer.id);
                } else if (config.selectedTextId !== layer.id) {
                  // 1st click on unselected text box: ONLY select the box (no cursor, no text editing)
                  setEditingTextId(null);
                  window.getSelection()?.removeAllRanges();
                  onChangeConfig({ selectedTextId: layer.id, selectedTextIds: [layer.id] });
                }
              }}
              onDoubleClick={(e) => {
                // Double Click also immediately enters text editing mode
                e.stopPropagation();
                setIsDeviceSelected(false);
                setEditingTextId(layer.id);
                onChangeConfig({ selectedTextId: layer.id, selectedTextIds: [layer.id] });
              }}
            >
              {/* Individual Drag & Rotate Handle Bar - ONLY show when single item is selected */}
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

                  {/* Rotate Handle: Hold & Drag around to rotate in real time */}
                  <div
                    className={`layer-rotate-btn ${(layer.rotation || 0) !== 0 ? 'active' : ''}`}
                    title="Döndürmek için basılı tutup sürükleyin (veya tıklayın)"
                    onPointerDown={(e) => handleTextRotatePointerDown(e, layer.id, e.currentTarget.closest('.free-text-layer'))}
                    onClick={(e) => {
                      if (!dragMoved) {
                        e.stopPropagation();
                        const nextRot = ((layer.rotation || 0) + 15) % 360;
                        onChangeConfig({
                          textLayers: (config.textLayers || []).map((l) =>
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

              {/* Rotated text wrapper: Only the text rotates */}
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
                {/* Boundary & Corner Resize Handles (Subtle & visible on hover/drag) */}
                {isSelected && !isExporting && (
                  <>
                    {/* 4 Corner Resize Handles */}
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

                    {/* Left & Right Side Width Resize Handles */}
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
                  isEditing={editingTextId === layer.id}
                  onStartEditing={() => setEditingTextId(layer.id)}
                  onStopEditing={() => setEditingTextId(null)}
                  onChange={(val) => {
                    onChangeConfig({
                      textLayers: (config.textLayers || []).map((l) =>
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

        {/* Interactive Device Wrapper */}
        <div
          className={`device-interactive-container ${
            !isDeviceOnly && isDeviceSelected ? 'is-device-selected' : ''
          } ${!isDeviceOnly && (dragMode === 'move' || dragMode?.startsWith('resize-')) ? 'is-dragging' : ''}`}
          style={{
            transform: isDeviceOnly ? 'none' : `translate(${currentOffsetX}px, ${currentOffsetY}px) scale(${currentScale})`,
            transformOrigin: 'center center',
            cursor: isDeviceOnly ? 'default' : (dragMode === 'move' ? 'grabbing' : 'grab'),
            transition: dragMode ? 'none' : 'transform 0.15s ease-out',
            touchAction: isDeviceOnly ? 'auto' : 'none',
          }}
          onPointerDown={isDeviceOnly ? undefined : (e) => handlePointerDown(e, 'move')}
          onClick={handleDeviceClick}
        >
          {/* Target for standalone device export */}
          <div ref={deviceFrameRef} className="device-frame-capture-target">
            <DeviceFrame
              deviceType={config.deviceType}
              deviceColor={config.deviceColor}
              screenshotUrl={config.screenshotUrl}
              screenshotScale={config.screenshotScale}
              screenshotOffsetX={config.screenshotOffsetX}
              screenshotOffsetY={config.screenshotOffsetY}
              borderRadius={config.borderRadius}
              shadowDepth={config.shadowDepth}
              onUploadClick={onUploadImageClick}
              presetWidth={config.width}
              presetHeight={config.height}
              isDeviceOnly={isDeviceOnly}
            />
          </div>

          {/* Transform & Resize Bounding Box Gizmo (Only in full visual mode when device is selected) */}
          {!isExporting && !isDeviceOnly && isDeviceSelected && (
            <div
              className="device-transform-gizmo"
              style={{
                opacity: 1,
                pointerEvents: 'auto',
              }}
            >
              {/* Corner Resize Handles */}
              <div
                className="resize-handle handle-nw"
                title="Boyutlandır"
                onPointerDown={(e) => handlePointerDown(e, 'resize-nw')}
              />
              <div
                className="resize-handle handle-ne"
                title="Boyutlandır"
                onPointerDown={(e) => handlePointerDown(e, 'resize-ne')}
              />
              <div
                className="resize-handle handle-sw"
                title="Boyutlandır"
                onPointerDown={(e) => handlePointerDown(e, 'resize-sw')}
              />
              <div
                className="resize-handle handle-se"
                title="Boyutlandır"
                onPointerDown={(e) => handlePointerDown(e, 'resize-se')}
              />

              {/* Active Transform Floating Info Pill */}
              {dragMode && (
                <div className="transform-floating-pill">
                  {dragMode === 'move' ? (
                    <>
                      <Move size={12} />
                      <span>
                        X: {currentOffsetX}px | Y: {currentOffsetY}px
                      </span>
                    </>
                  ) : dragMode === 'text-move' ? (
                    <>
                      <Move size={12} />
                      <span>
                        Metin Taşınıyor
                      </span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={12} />
                      <span>%{Math.round(currentScale * 100)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

