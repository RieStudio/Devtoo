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
        return '0 15px 35px -8px rgba(0, 0, 0, 0.25), 0 5px 15px -4px rgba(0, 0, 0, 0.15)';
      case 'medium':
        return '0 30px 60px -12px rgba(0, 0, 0, 0.38), 0 10px 25px -6px rgba(0, 0, 0, 0.22)';
      case 'dramatic':
        return '0 45px 90px -18px rgba(0, 0, 0, 0.55), 0 20px 40px -10px rgba(0, 0, 0, 0.35)';
      case 'chili-glow':
        return '0 30px 60px -10px rgba(217, 4, 41, 0.45), 0 12px 28px -8px rgba(0, 0, 0, 0.25)';
      default:
        return 'none';
    }
  };

  // Render screenshot image or upload dropzone container
  const renderContent = (contentBorderRadius: number) => {
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
            padding: '14px',
            textAlign: 'center',
            gap: '10px',
            border: '2px dashed #CBD5E1',
            borderRadius: `${contentBorderRadius}px`,
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#FFF0F3',
            color: '#D90429',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(217, 4, 41, 0.2)'
          }}>
            +
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              Ekran Görüntüsü Yükleyin
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', fontWeight: 500 }}>
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
          borderRadius: `${contentBorderRadius}px`
        }}
      />
    );
  };

  // 1. MINIMAL FRAME (Pure crisp frame without photo shell)
  if (deviceType === 'minimal') {
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
          boxShadow: getShadowCss(),
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          position: 'relative'
        }}
      >
        {renderContent(borderRadius)}
      </div>
    );
  }

  // Map device type to real photorealistic frame image asset
  const getDeviceAssetPath = () => {
    switch (deviceType) {
      case 'iphone16pro':
      case 'iphone15pro':
        return '/devices/iphone16pro.png';
      case 'samsung-s25ultra':
      case 'samsung-s24':
        return '/devices/samsung-s25ultra.png';
      case 'pixel9pro':
      case 'pixel8pro':
        return '/devices/pixel9pro.png';
      case 'ipadpro':
        return '/devices/ipadpro.png';
      default:
        return '/devices/iphone16pro.png';
    }
  };

  // Target screen cutout coordinates for real photo frames
  const getCutoutSpecs = () => {
    switch (deviceType) {
      case 'iphone16pro':
      case 'iphone15pro':
        return { top: '3.6%', left: '4.8%', width: '90.4%', height: '92.8%', cornerRadius: 36 };
      case 'samsung-s25ultra':
        return { top: '2.8%', left: '3.5%', width: '93.0%', height: '94.4%', cornerRadius: 10 };
      case 'samsung-s24':
        return { top: '2.8%', left: '3.8%', width: '92.4%', height: '94.4%', cornerRadius: 28 };
      case 'pixel9pro':
      case 'pixel8pro':
        return { top: '3.2%', left: '4.5%', width: '91.0%', height: '93.6%', cornerRadius: 30 };
      case 'ipadpro':
        return { top: '3.5%', left: '4.0%', width: '92.0%', height: '93.0%', cornerRadius: 16 };
      default:
        return { top: '3.6%', left: '4.8%', width: '90.4%', height: '92.8%', cornerRadius: 36 };
    }
  };

  const specs = getCutoutSpecs();
  const assetPath = getDeviceAssetPath();

  // Frame outer dimensions for fit inside canvas
  let outerWidth = 270;
  if (deviceType === 'ipadpro') outerWidth = 360;
  if (isLandscape) outerWidth = 460;

  const outerHeight = Math.round(outerWidth / targetRatio) + 30;

  return (
    <div
      style={{
        position: 'relative',
        width: `${outerWidth}px`,
        height: `${outerHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: shadowDepth !== 'none' ? `drop-shadow(0 20px 30px rgba(0,0,0,0.25))` : 'none'
      }}
    >
      {/* 100% REAL PHOTOREALISTIC DEVICE PRODUCT MOCKUP IMAGE */}
      <img
        src={assetPath}
        alt={modelInfo.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* INNER SCREEN CUTOUT CONTAINER FOR USER SCREENSHOT */}
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
          backgroundColor: '#000000'
        }}
      >
        {renderContent(specs.cornerRadius)}
      </div>
    </div>
  );
};
