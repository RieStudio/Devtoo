import React from 'react';
import type { DeviceType } from '../../types/mockup';
import { DEVICE_MODELS } from '../../constants/devices';

interface DeviceFrameProps {
  deviceType: DeviceType;
  deviceColor: string;
  screenshotUrl: string | null;
  borderRadius: number;
  shadowDepth: string;
  onUploadClick?: () => void;
  presetWidth?: number;
  presetHeight?: number;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceType,
  screenshotUrl,
  borderRadius,
  shadowDepth,
  onUploadClick,
  presetWidth = 1290,
  presetHeight = 2796,
}) => {
  const modelInfo = DEVICE_MODELS.find((m) => m.id === deviceType) || DEVICE_MODELS[0];
  const targetRatio = presetWidth / presetHeight;
  const isLandscape = presetWidth > presetHeight;

  // Compute shadow CSS
  const getShadowCss = () => {
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
  const renderScreenContent = (cornerRad: number) => {
    if (!screenshotUrl) {
      return (
        <div 
          onClick={onUploadClick}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#F8F9FA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '20px 16px',
            textAlign: 'center',
            gap: '12px',
            borderRadius: `${cornerRad}px`,
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
      <img
        src={screenshotUrl}
        alt="App Screenshot"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: `${cornerRad}px`
        }}
      />
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
        {renderScreenContent(borderRadius)}
      </div>
    );
  }

  // Map device type to real photorealistic transparent frame image
  const getDeviceAssetPath = () => {
    switch (deviceType) {
      case 'iphone-17-pro-max':
        return '/devices/iphone-17-pro-max.png';
      case 'iphone-17-pro':
        return '/devices/iphone-17-pro.png';
      case 'iphone-17':
        return '/devices/iphone-17.png';
      case 'galaxy-s26-ultra':
        return '/devices/galaxy-s26-ultra.png';
      case 'pixel-10-pro':
        return '/devices/pixel-10-pro.png';
      case 'pixel-10':
        return '/devices/pixel-10.png';
      default:
        return '/devices/iphone-17-pro-max.png';
    }
  };

  // Screen cutout coordinates: Intentionally tucks 2-3px underneath the opaque device bezels
  // so the user sees 100% edge-to-edge content right up to the glass edge without any hairline gaps or clipping.
  const getCutoutSpecs = () => {
    switch (deviceType) {
      case 'iphone-17-pro-max':
      case 'iphone-17-pro':
        return { top: '1.2%', left: '3.0%', width: '94.0%', height: '97.6%', cornerRadius: 46 };
      case 'iphone-17':
        return { top: '1.2%', left: '3.0%', width: '94.0%', height: '97.6%', cornerRadius: 46 };
      case 'galaxy-s26-ultra':
        return { top: '1.0%', left: '2.0%', width: '96.0%', height: '98.0%', cornerRadius: 18 };
      case 'pixel-10-pro':
        return { top: '1.3%', left: '3.0%', width: '94.0%', height: '97.4%', cornerRadius: 38 };
      case 'pixel-10':
        return { top: '1.6%', left: '3.6%', width: '92.8%', height: '96.8%', cornerRadius: 38 };
      default:
        return { top: '1.2%', left: '3.0%', width: '94.0%', height: '97.6%', cornerRadius: 46 };
    }
  };

  const specs = getCutoutSpecs();
  const assetPath = getDeviceAssetPath();

  // Outer frame display dimensions - use device's natural aspect ratio so it doesn't stretch or cause gaps
  let displayWidth = 260;
  if (isLandscape) displayWidth = 440;

  const deviceRatio = modelInfo.defaultRatio || (1290 / 2796);
  const displayHeight = Math.round(displayWidth / deviceRatio);

  return (
    <div
      style={{
        position: 'relative',
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        filter: getShadowCss(),
        display: 'inline-block'
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
          borderRadius: `${specs.cornerRadius}px`,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF'
        }}
      >
        {renderScreenContent(specs.cornerRadius)}
      </div>

      {/* LAYER 2: 100% REAL PHOTOREALISTIC TRANSPARENT FLAT FRONT-FACING DEVICE OVERLAY */}
      <img
        src={assetPath}
        alt={modelInfo.name}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          zIndex: 10,
          display: 'block'
        }}
      />
    </div>
  );
};
