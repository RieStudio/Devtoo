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
            padding: '16px',
            textAlign: 'center',
            gap: '12px',
            border: '2px dashed #CBD5E1',
            borderRadius: `${cornerRad}px`,
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#FFF0F3',
            color: '#D90429',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            flexShrink: 0,
            boxShadow: '0 3px 10px rgba(217, 4, 41, 0.25)'
          }}>
            +
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              Ekran Görüntüsü Yükleyin
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
              {modelInfo.name} ({presetWidth}x{presetHeight}px)
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
      case 'iphone17promax':
        return '/devices/iphone16pro.png';
      case 'samsung-s26ultra':
        return '/devices/samsung-s25ultra.png';
      case 'pixel11pro':
        return '/devices/pixel9pro.png';
      case 'ipadpro':
        return '/devices/ipadpro.png';
      default:
        return '/devices/iphone16pro.png';
    }
  };

  // Screen cutout coordinates for each real device photo frame
  const getCutoutSpecs = () => {
    switch (deviceType) {
      case 'iphone17promax':
        return { top: '2.4%', left: '3.6%', width: '92.8%', height: '95.2%', cornerRadius: 42 };
      case 'samsung-s26ultra':
        return { top: '1.6%', left: '2.4%', width: '95.2%', height: '96.8%', cornerRadius: 12 };
      case 'pixel11pro':
        return { top: '2.0%', left: '3.0%', width: '94.0%', height: '96.0%', cornerRadius: 32 };
      case 'ipadpro':
        return { top: '3.2%', left: '4.0%', width: '91.8%', height: '93.6%', cornerRadius: 20 };
      default:
        return { top: '2.4%', left: '3.6%', width: '92.8%', height: '95.2%', cornerRadius: 42 };
    }
  };

  const specs = getCutoutSpecs();
  const assetPath = getDeviceAssetPath();

  // Outer frame display dimensions
  let displayWidth = 260;
  if (deviceType === 'ipadpro') displayWidth = 360;
  if (isLandscape) displayWidth = 440;

  const displayHeight = Math.round(displayWidth / targetRatio);

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
          objectFit: 'fill',
          pointerEvents: 'none',
          zIndex: 10,
          display: 'block'
        }}
      />
    </div>
  );
};
