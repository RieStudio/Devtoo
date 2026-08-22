import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MockupConfig } from '../../types/mockup';
import { DeviceFrame } from './DeviceFrame';
import { Move, Maximize2, Crosshair } from 'lucide-react';

interface MockupCanvasProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>) => void;
  onUploadImageClick: () => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
  isExporting?: boolean;
}

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null;

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  config,
  onChangeConfig,
  onUploadImageClick,
  exportRef,
  isExporting = false,
}) => {
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);

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

    setDragMode(mode);
    setDragMoved(false);

    startPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffsetX: currentOffsetX,
      initialOffsetY: currentOffsetY,
      initialScale: currentScale,
    };
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragMode) return;

      const deltaX = e.clientX - startPosRef.current.clientX;
      const deltaY = e.clientY - startPosRef.current.clientY;

      if (Math.hypot(deltaX, deltaY) > 3) {
        setDragMoved(true);
      }

      if (dragMode === 'move') {
        const newOffsetX = Math.round(startPosRef.current.initialOffsetX + deltaX);
        const newOffsetY = Math.round(startPosRef.current.initialOffsetY + deltaY);
        onChangeConfig({
          deviceOffsetX: newOffsetX,
          deviceOffsetY: newOffsetY,
        });
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
        });
      }
    },
    [dragMode, onChangeConfig]
  );

  const handlePointerUp = useCallback(() => {
    if (dragMode) {
      setDragMode(null);
    }
  }, [dragMode]);

  useEffect(() => {
    if (dragMode) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragMode, handlePointerMove, handlePointerUp]);

  const handleDeviceClick = () => {
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
    <div className="canvas-viewport">
      {/* Top Floating Quick Controls for Canvas */}
      <div className="canvas-quick-toolbar">
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

      {/* Render Box for HTML-to-Image Export */}
      <div
        ref={exportRef}
        className={`mockup-render-box ${config.bgType !== 'solid' ? `bg-${config.bgType}` : ''}`}
        style={{
          width: dims.width,
          minHeight: dims.minHeight,
          backgroundColor: config.bgColor,
          padding: `${config.padding}px`,
          transform: `rotate(${config.frameRotation}deg)`,
        }}
      >
        {/* Optional Headline Text */}
        {config.showHeadline && (
          <div
            className="mockup-headline-wrap"
            style={{ color: config.textColor }}
          >
            <div className="mockup-headline-title">{config.headlineText}</div>
            <div className="mockup-headline-sub">{config.subtitleText}</div>
          </div>
        )}

        {/* Interactive Device Wrapper */}
        <div
          className={`device-interactive-container ${isHovered || dragMode ? 'interactive-active' : ''} ${
            dragMode ? 'is-dragging' : ''
          }`}
          style={{
            transform: `translate(${currentOffsetX}px, ${currentOffsetY}px) scale(${currentScale})`,
            transformOrigin: 'center center',
            cursor: dragMode === 'move' ? 'grabbing' : 'grab',
            transition: dragMode ? 'none' : 'transform 0.15s ease-out',
            touchAction: 'none',
          }}
          onPointerDown={(e) => handlePointerDown(e, 'move')}
          onClick={handleDeviceClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Device Frame Display */}
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
          />

          {/* Transform & Resize Bounding Box Gizmo (Only visible in editor, hidden in export) */}
          {!isExporting && (
            <div
              className="device-transform-gizmo"
              style={{
                opacity: isHovered || dragMode ? 1 : 0,
                pointerEvents: isHovered || dragMode ? 'auto' : 'none',
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

