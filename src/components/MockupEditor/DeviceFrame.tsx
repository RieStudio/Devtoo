import React from 'react';
import type { DeviceType } from '../../types/mockup';

interface DeviceFrameProps {
  deviceType: DeviceType;
  deviceColor: 'natural' | 'dark' | 'silver' | 'gold';
  screenshotUrl: string | null;
  borderRadius: number;
  shadowDepth: string;
  onUploadClick?: () => void;
  scale?: number;
  presetWidth?: number;
  presetHeight?: number;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceType,
  deviceColor,
  screenshotUrl,
  borderRadius,
  shadowDepth,
  onUploadClick,
  presetWidth = 1290,
  presetHeight = 2796,
}) => {
  // Color presets for device body
  const bodyColors = {
    natural: '#8D8D92',
    dark: '#2A2B2E',
    silver: '#E2E2E7',
    gold: '#D6C5B3',
  };

  const currentBodyColor = bodyColors[deviceColor] || bodyColors.dark;

  // Aspect ratio calculation
  const targetRatio = presetWidth / presetHeight;
  const isLandscape = presetWidth > presetHeight;

  // Compute shadow CSS
  const getShadowCss = () => {
    switch (shadowDepth) {
      case 'soft':
        return '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
      case 'medium':
        return '0 20px 35px -10px rgba(0, 0, 0, 0.25), 0 10px 15px -8px rgba(0, 0, 0, 0.15)';
      case 'dramatic':
        return '0 30px 60px -15px rgba(0, 0, 0, 0.4), 0 15px 25px -10px rgba(0, 0, 0, 0.25)';
      case 'chili-glow':
        return '0 20px 40px -10px rgba(217, 4, 41, 0.35), 0 10px 20px -8px rgba(0, 0, 0, 0.2)';
      default:
        return 'none';
    }
  };

  // Render placeholder dropzone if no image
  const renderContent = () => {
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
            gap: '10px',
            border: '2px dashed #CBD5E1',
            borderRadius: `${borderRadius}px`,
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
            fontSize: '20px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            +
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
              Ekran Görüntüsü Yükleyin
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>
              {presetWidth} x {presetHeight} px ({presetWidth > presetHeight ? 'Yatay' : 'Dikey'})
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
          borderRadius: `${borderRadius}px`
        }}
      />
    );
  };

  // 1. MINIMAL BEZEL
  if (deviceType === 'minimal') {
    let frameWidth = 250;
    let frameHeight = Math.round(frameWidth / targetRatio);

    if (isLandscape) {
      frameWidth = 440;
      frameHeight = Math.round(frameWidth / targetRatio);
    } else if (presetWidth === presetHeight) {
      frameWidth = 300;
      frameHeight = 300;
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
          border: '1px solid rgba(0,0,0,0.08)',
          position: 'relative'
        }}
      >
        {renderContent()}
      </div>
    );
  }

  // 2. IPHONE 16 PRO
  if (deviceType === 'iphone16pro') {
    if (isLandscape) {
      const screenHeight = 200;
      const screenWidth = Math.round(screenHeight * targetRatio);
      return (
        <div
          style={{
            position: 'relative',
            width: `${screenWidth + 20}px`,
            height: `${screenHeight + 20}px`,
            backgroundColor: currentBodyColor,
            borderRadius: '28px',
            padding: '10px',
            boxShadow: getShadowCss(),
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000000',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid #000'
            }}
          >
            {/* Dynamic Island Left */}
            <div
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '75px',
                backgroundColor: '#000000',
                borderRadius: '16px',
                zIndex: 10
              }}
            />
            <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      );
    }

    // Portrait iPhone 16 Pro
    const screenWidth = 240;
    const screenHeight = Math.round(screenWidth / targetRatio);

    return (
      <div
        style={{
          position: 'relative',
          width: `${screenWidth + 20}px`,
          height: `${screenHeight + 20}px`,
          backgroundColor: currentBodyColor,
          borderRadius: '40px',
          padding: '10px',
          boxShadow: getShadowCss(),
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Side Buttons */}
        <div style={{ position: 'absolute', left: '-3px', top: '80px', width: '3px', height: '24px', backgroundColor: currentBodyColor, borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '115px', width: '3px', height: '38px', backgroundColor: currentBodyColor, borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: '-3px', top: '120px', width: '3px', height: '50px', backgroundColor: currentBodyColor, borderRadius: '0 2px 2px 0' }} />

        {/* Screen Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #000'
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '75px',
              height: '20px',
              backgroundColor: '#000000',
              borderRadius: '16px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '6px'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0B1021', border: '1px solid #1E293B' }} />
          </div>

          <div style={{ width: '100%', height: '100%', borderRadius: '30px', overflow: 'hidden' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // 3. PIXEL 9 PRO
  if (deviceType === 'pixel9pro') {
    if (isLandscape) {
      const screenHeight = 200;
      const screenWidth = Math.round(screenHeight * targetRatio);
      return (
        <div
          style={{
            position: 'relative',
            width: `${screenWidth + 16}px`,
            height: `${screenHeight + 16}px`,
            backgroundColor: currentBodyColor,
            borderRadius: '26px',
            padding: '8px',
            boxShadow: getShadowCss(),
            border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000000',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      );
    }

    // Portrait Pixel 9 Pro
    const screenWidth = 240;
    const screenHeight = Math.round(screenWidth / targetRatio);

    return (
      <div
        style={{
          position: 'relative',
          width: `${screenWidth + 16}px`,
          height: `${screenHeight + 16}px`,
          backgroundColor: currentBodyColor,
          borderRadius: '34px',
          padding: '8px',
          boxShadow: getShadowCss(),
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Camera Punch Hole */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: '#000000',
              border: '2px solid #111',
              borderRadius: '50%',
              zIndex: 10
            }}
          />

          <div style={{ width: '100%', height: '100%', borderRadius: '26px', overflow: 'hidden' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // 4. IPAD PRO / TABLET
  let screenWidth = 340;
  let screenHeight = Math.round(screenWidth / targetRatio);

  if (isLandscape) {
    screenWidth = 420;
    screenHeight = Math.round(screenWidth / targetRatio);
  }

  return (
    <div
      style={{
        position: 'relative',
        width: `${screenWidth + 24}px`,
        height: `${screenHeight + 24}px`,
        backgroundColor: currentBodyColor,
        borderRadius: '22px',
        padding: '12px',
        boxShadow: getShadowCss(),
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
