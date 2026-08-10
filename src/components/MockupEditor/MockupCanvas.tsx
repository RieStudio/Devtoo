import React from 'react';
import type { MockupConfig, AspectRatioPreset, CanvasPreset } from '../../types/mockup';
import { DeviceFrame } from './DeviceFrame';
import { PresetsBar } from './PresetsBar';

interface MockupCanvasProps {
  config: MockupConfig;
  onChangeConfig: (updated: Partial<MockupConfig>) => void;
  onUploadImageClick: () => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  config,
  onChangeConfig,
  onUploadImageClick,
  exportRef,
}) => {

  const handleSelectPreset = (preset: CanvasPreset) => {
    onChangeConfig({
      preset: preset.id as AspectRatioPreset,
      width: preset.width,
      height: preset.height,
    });
  };

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
      <PresetsBar
        currentPreset={config.preset}
        onSelectPreset={handleSelectPreset}
      />

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
