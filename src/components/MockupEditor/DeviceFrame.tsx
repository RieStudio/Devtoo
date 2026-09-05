import React from 'react';
import type { DeviceType } from '../../types/mockup';
import { DEVICE_MODELS, DEVICE_CUTOUTS, getDeviceBorderRadius } from '../../constants/devices';

interface DeviceFrameProps {
  deviceType: DeviceType;
  deviceColor: string;
  screenshotUrl: string | null;
  screenshotScale?: number;
  screenshotOffsetX?: number;
  screenshotOffsetY?: number;
  borderRadius: number;
  shadowDepth: string;
  onUploadClick?: () => void;
  presetWidth?: number;
  presetHeight?: number;
  isDeviceOnly?: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceType,
  deviceColor,
  screenshotUrl,
  screenshotScale = 1,
  screenshotOffsetX = 0,
  screenshotOffsetY = 0,
  borderRadius,
  shadowDepth,
  onUploadClick,
  presetWidth = 1290,
  presetHeight = 2796,
  isDeviceOnly = false,
}) => {
  const modelInfo = DEVICE_MODELS.find((m) => m.id === deviceType) || DEVICE_MODELS[0];
  const targetRatio = presetWidth / presetHeight;
  const isLandscape = presetWidth > presetHeight;

  // Compute shadow CSS (disabled in device-only mode to prevent browser SVG filter black box)
  const getShadowCss = () => {
    if (isDeviceOnly) return 'none';
    switch (shadowDepth) {
      case 'soft':
        return 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25))';
      case 'medium':
        return 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.38))';
      case 'dramatic':
        return 'drop-shadow(0 45px 90px rgba(0, 0, 0, 0.55))';
      case 'chili-glow':
        return 'drop-shadow(0 30px 60px rgba(217, 4, 41, 0.45))';
      default:
        return 'none';
    }
  };

  // Render screenshot or upload dropzone container
  const renderScreenContent = (computedCornerRadius: string) => {
    if (!screenshotUrl) {
      return (
        <div
          onClick={onUploadClick}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '20px 16px',
            textAlign: 'center',
            gap: '12px',
            borderRadius: computedCornerRadius,
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#FFF0F3',
            color: '#D90429',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(217, 4, 41, 0.2)'
          }}>
            +
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              Ekran Görüntüsü Yükleyin
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
              {modelInfo.name}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: computedCornerRadius,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
        }}
      >
        <img
          src={screenshotUrl}
          alt="App Screenshot"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: `scale(${screenshotScale}) translate(${screenshotOffsetX}px, ${screenshotOffsetY}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.05s ease-out',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  };

  // 1. MINIMAL FRAME (Bezelless clean option)
  if ((deviceType as string) === 'minimal') {
    let frameWidth = 260;
    let frameHeight = Math.round(frameWidth / targetRatio);

    if (isLandscape) {
      frameWidth = 460;
      frameHeight = Math.round(frameWidth / targetRatio);
    } else if (presetWidth === presetHeight) {
      frameWidth = 320;
      frameHeight = 320;
    }

    return (
      <div
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          borderRadius: `${borderRadius}px`,
          boxShadow: shadowDepth !== 'none' ? '0 20px 40px rgba(0,0,0,0.2)' : 'none',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          position: 'relative'
        }}
      >
        {renderScreenContent(`${borderRadius}px`)}
      </div>
    );
  }

  // Map device type and selected color to real image asset path
  const getDeviceAssetPath = () => {
    const matchedColor = modelInfo.colors.find((c) => c.id === deviceColor) || modelInfo.colors[0];
    if (matchedColor?.imagePath) {
      return matchedColor.imagePath;
    }
    return modelInfo.colors[0]?.imagePath || '/devices/phone/apple/iphone-17-pro-max.png';
  };

  // Screen cutout coordinates calibrated individually per device family
  const getCutoutSpecs = () => {
    if (DEVICE_CUTOUTS[deviceType]) {
      return DEVICE_CUTOUTS[deviceType];
    }
    return { top: '1.75%', left: '4.37%', width: '91.52%', height: '96.50%', radiusRatio: 0.14036 };
  };

  const specs = getCutoutSpecs();
  const assetPath = getDeviceAssetPath();

  // Outer frame default display dimensions based on device category
  const getDisplayWidth = () => {
    const category = modelInfo.category || 'phone';
    switch (category) {
      case 'pc':
        return 480;
      case 'tab':
        return 440;
      case 'tv':
        return 500;
      case 'watch':
        return 220;
      case 'phone':
      default:
        return isLandscape ? 440 : 260;
    }
  };

  const displayWidth = getDisplayWidth();
  const computedBorderRadius = getDeviceBorderRadius(specs, displayWidth);

  return (
    <div
      style={{
        position: 'relative',
        width: `${displayWidth}px`,
        filter: getShadowCss(),
        display: 'inline-block',
        backgroundColor: 'transparent',
      }}
    >
      {/* LAYER 1: SCREEN CONTENT (Screenshot or Upload Dropzone) */}
      <div
        style={{
          position: 'absolute',
          top: specs.top,
          left: specs.left,
          width: specs.width,
          height: specs.height,
          zIndex: 1,
          borderRadius: computedBorderRadius,
          overflow: 'hidden',
          backgroundColor: '#000000'
        }}
      >
        {renderScreenContent(computedBorderRadius)}
      </div>

      {/* LAYER 2: Device frame image - drives container height via natural aspect ratio */}
      <img
        src={assetPath}
        alt={modelInfo.name}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          pointerEvents: 'none',
          zIndex: 10,
          display: 'block'
        }}
      />
    </div>
  );
};
