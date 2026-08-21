import React from 'react';
import type { MockupConfig } from '../../types/mockup';
import { DeviceFrame } from './DeviceFrame';

interface MockupCanvasProps {
  config: MockupConfig;
  onUploadImageClick: () => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  config,
  onUploadImageClick,
  exportRef,
}) => {
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

  return (
    <div className="canvas-viewport">
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

        {/* Device Frame */}
        <DeviceFrame
          deviceType={config.deviceType}
          deviceColor={config.deviceColor}
          screenshotUrl={config.screenshotUrl}
          borderRadius={config.borderRadius}
          shadowDepth={config.shadowDepth}
          onUploadClick={onUploadImageClick}
          presetWidth={config.width}
          presetHeight={config.height}
        />
      </div>
    </div>
  );
};
