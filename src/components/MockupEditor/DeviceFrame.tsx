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
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceType,
  deviceColor,
  screenshotUrl,
  borderRadius,
  shadowDepth,
  onUploadClick,
}) => {
  // Color presets for device titanium body
  const bodyColors = {
    natural: '#8D8D92',
    dark: '#2A2B2E',
    silver: '#E2E2E7',
    gold: '#D6C5B3',
  };

  const currentBodyColor = bodyColors[deviceColor] || bodyColors.dark;

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
            padding: '20px',
            textAlign: 'center',
            gap: '12px',
            border: '2px dashed #CBD5E1',
            borderRadius: `${borderRadius}px`
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#FFF0F3',
            color: '#D90429',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            +
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Ekran Görüntüsü Yükleyin
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              PNG, JPG veya WebP sürükleyip bırakın
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

  if (deviceType === 'minimal') {
    return (
      <div
        style={{
          width: '280px',
          height: '580px',
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

  if (deviceType === 'iphone16pro') {
    return (
      <div
        style={{
          position: 'relative',
          width: '290px',
          height: '600px',
          backgroundColor: currentBodyColor,
          borderRadius: '46px',
          padding: '10px',
          boxShadow: getShadowCss(),
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Side Buttons Visual accents */}
        <div style={{ position: 'absolute', left: '-3px', top: '100px', width: '3px', height: '26px', backgroundColor: currentBodyColor, borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '140px', width: '3px', height: '44px', backgroundColor: currentBodyColor, borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '195px', width: '3px', height: '44px', backgroundColor: currentBodyColor, borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: '-3px', top: '150px', width: '3px', height: '60px', backgroundColor: currentBodyColor, borderRadius: '0 2px 2px 0' }} />

        {/* Screen Bezel & Dynamic Island Area */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '36px',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #000'
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '85px',
              height: '24px',
              backgroundColor: '#000000',
              borderRadius: '20px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '8px'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0B1021', border: '1px solid #1E293B' }} />
          </div>

          {/* Screenshot Content */}
          <div style={{ width: '100%', height: '100%', borderRadius: '34px', overflow: 'hidden' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  if (deviceType === 'pixel9pro') {
    return (
      <div
        style={{
          position: 'relative',
          width: '290px',
          height: '590px',
          backgroundColor: currentBodyColor,
          borderRadius: '38px',
          padding: '8px',
          boxShadow: getShadowCss(),
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        {/* Screen Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '30px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Android Punch Hole Camera */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '14px',
              height: '14px',
              backgroundColor: '#000000',
              border: '2px solid #111',
              borderRadius: '50%',
              zIndex: 10
            }}
          />

          <div style={{ width: '100%', height: '100%', borderRadius: '28px', overflow: 'hidden' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Tablet / iPad Pro
  return (
    <div
      style={{
        position: 'relative',
        width: '420px',
        height: '560px',
        backgroundColor: currentBodyColor,
        borderRadius: '24px',
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
          borderRadius: '14px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Front Camera */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            backgroundColor: '#222',
            borderRadius: '50%',
            zIndex: 10
          }}
        />

        <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
