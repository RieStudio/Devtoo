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
  deviceColor,
  screenshotUrl,
  borderRadius,
  shadowDepth,
  onUploadClick,
  presetWidth = 1290,
  presetHeight = 2796,
}) => {
  const modelInfo = DEVICE_MODELS.find((m) => m.id === deviceType) || DEVICE_MODELS[0];
  const colorInfo = modelInfo.colors.find((c) => c.id === deviceColor) || modelInfo.colors[0];

  const targetRatio = presetWidth / presetHeight;
  const isLandscape = presetWidth > presetHeight;

  // Compute shadow CSS
  const getShadowCss = () => {
    switch (shadowDepth) {
      case 'soft':
        return '0 12px 25px -6px rgba(0,0,0,0.25), 0 4px 10px -4px rgba(0,0,0,0.15)';
      case 'medium':
        return '0 25px 50px -12px rgba(0,0,0,0.35), 0 8px 20px -6px rgba(0,0,0,0.2)';
      case 'dramatic':
        return '0 40px 80px -16px rgba(0,0,0,0.5), 0 16px 32px -8px rgba(0,0,0,0.3)';
      case 'chili-glow':
        return '0 25px 50px -10px rgba(217, 4, 41, 0.45), 0 10px 24px -8px rgba(0,0,0,0.25)';
      default:
        return 'none';
    }
  };

  // Render placeholder dropzone or uploaded image inside phone screen
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

  // Glass Gloss Light Reflection Overlay
  const renderGlassReflection = (cornerRad: number) => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 40%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 20,
        borderRadius: `${cornerRad}px`
      }}
    />
  );

  // 1. MINIMAL FRAME
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
        {renderScreenContent(borderRadius)}
      </div>
    );
  }

  // Calculate screen width & height based on aspect ratio
  const baseWidth = isLandscape ? 420 : 250;
  const screenHeight = Math.round(baseWidth / targetRatio);
  const screenWidth = baseWidth;

  // 2. APPLE IPHONE 16 PRO & IPHONE 15 PRO
  if (deviceType === 'iphone16pro' || deviceType === 'iphone15pro') {
    const is16 = deviceType === 'iphone16pro';
    const cornerRadius = is16 ? 42 : 38;
    const innerScreenCorner = is16 ? 32 : 28;

    return (
      <div
        style={{
          position: 'relative',
          width: `${screenWidth + 20}px`,
          height: `${screenHeight + 20}px`,
          borderRadius: `${cornerRadius}px`,
          padding: '10px',
          boxShadow: getShadowCss(),
          background: `linear-gradient(145deg, ${colorInfo.borderHex} 0%, ${colorInfo.hex} 50%, #151517 100%)`,
          border: `1px solid ${colorInfo.borderHex}`,
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Metallic Side Buttons */}
        {!isLandscape && (
          <>
            {/* Action / Mute Button */}
            <div style={{ position: 'absolute', left: '-3px', top: '75px', width: '3px', height: '22px', backgroundColor: colorInfo.borderHex, borderRadius: '2px 0 0 2px' }} />
            {/* Volume Up */}
            <div style={{ position: 'absolute', left: '-3px', top: '108px', width: '3px', height: '36px', backgroundColor: colorInfo.borderHex, borderRadius: '2px 0 0 2px' }} />
            {/* Volume Down */}
            <div style={{ position: 'absolute', left: '-3px', top: '152px', width: '3px', height: '36px', backgroundColor: colorInfo.borderHex, borderRadius: '2px 0 0 2px' }} />
            {/* Power Button */}
            <div style={{ position: 'absolute', right: '-3px', top: '120px', width: '3px', height: '52px', backgroundColor: colorInfo.borderHex, borderRadius: '0 2px 2px 0' }} />
            {/* Camera Control Button (iPhone 16 Pro) */}
            {is16 && (
              <div style={{ position: 'absolute', right: '-3px', top: '200px', width: '3px', height: '28px', backgroundColor: colorInfo.borderHex, borderRadius: '0 2px 2px 0', opacity: 0.8 }} />
            )}
          </>
        )}

        {/* Screen Container (Black Bezel + Dynamic Island) */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: `${innerScreenCorner}px`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 2px #000000'
          }}
        >
          {/* Dynamic Island Pill */}
          {!isLandscape && (
            <div
              style={{
                position: 'absolute',
                top: '9px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '78px',
                height: '21px',
                backgroundColor: '#000000',
                borderRadius: '18px',
                zIndex: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 7px',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.06)'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0A0E1A', border: '1px solid #1E293B' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#080B14' }} />
            </div>
          )}

          {renderGlassReflection(innerScreenCorner)}

          <div style={{ width: '100%', height: '100%', borderRadius: `${innerScreenCorner - 2}px`, overflow: 'hidden' }}>
            {renderScreenContent(innerScreenCorner - 2)}
          </div>
        </div>
      </div>
    );
  }

  // 3. SAMSUNG GALAXY S25 ULTRA & S24
  if (deviceType === 'samsung-s25ultra' || deviceType === 'samsung-s24') {
    const isUltra = deviceType === 'samsung-s25ultra';
    const cornerRadius = isUltra ? 14 : 34;
    const innerScreenCorner = isUltra ? 8 : 26;

    return (
      <div
        style={{
          position: 'relative',
          width: `${screenWidth + 16}px`,
          height: `${screenHeight + 16}px`,
          borderRadius: `${cornerRadius}px`,
          padding: '8px',
          boxShadow: getShadowCss(),
          background: `linear-gradient(145deg, ${colorInfo.borderHex} 0%, ${colorInfo.hex} 60%, #111113 100%)`,
          border: `1px solid ${colorInfo.borderHex}`,
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: `${innerScreenCorner}px`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 2px #000000'
          }}
        >
          {/* Infinity Punch Hole Camera */}
          {!isLandscape && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                backgroundColor: '#000000',
                border: '1.5px solid #1A1A1E',
                borderRadius: '50%',
                zIndex: 25
              }}
            />
          )}

          {renderGlassReflection(innerScreenCorner)}

          <div style={{ width: '100%', height: '100%', borderRadius: `${innerScreenCorner - 2}px`, overflow: 'hidden' }}>
            {renderScreenContent(innerScreenCorner - 2)}
          </div>
        </div>
      </div>
    );
  }

  // 4. GOOGLE PIXEL 9 PRO & PIXEL 8 PRO
  if (deviceType === 'pixel9pro' || deviceType === 'pixel8pro') {
    const cornerRadius = 36;
    const innerScreenCorner = 28;

    return (
      <div
        style={{
          position: 'relative',
          width: `${screenWidth + 16}px`,
          height: `${screenHeight + 16}px`,
          borderRadius: `${cornerRadius}px`,
          padding: '8px',
          boxShadow: getShadowCss(),
          background: `linear-gradient(145deg, ${colorInfo.borderHex} 0%, ${colorInfo.hex} 50%, #151619 100%)`,
          border: `1px solid ${colorInfo.borderHex}`,
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Pixel Visor Top Metallic Line */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            backgroundColor: colorInfo.borderHex,
            borderRadius: '2px',
            opacity: 0.7
          }}
        />

        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: `${innerScreenCorner}px`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 2px #000000'
          }}
        >
          {/* Pixel Punch Hole */}
          {!isLandscape && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                backgroundColor: '#000000',
                border: '1.5px solid #1A1A1E',
                borderRadius: '50%',
                zIndex: 25
              }}
            />
          )}

          {renderGlassReflection(innerScreenCorner)}

          <div style={{ width: '100%', height: '100%', borderRadius: `${innerScreenCorner - 2}px`, overflow: 'hidden' }}>
            {renderScreenContent(innerScreenCorner - 2)}
          </div>
        </div>
      </div>
    );
  }

  // 5. IPAD PRO 13" TABLET
  const ipadWidth = isLandscape ? 440 : 350;
  const ipadHeight = Math.round(ipadWidth / targetRatio);

  return (
    <div
      style={{
        position: 'relative',
        width: `${ipadWidth + 24}px`,
        height: `${ipadHeight + 24}px`,
        borderRadius: '24px',
        padding: '12px',
        boxShadow: getShadowCss(),
        background: `linear-gradient(145deg, ${colorInfo.borderHex} 0%, ${colorInfo.hex} 60%, #151518 100%)`,
        border: `1px solid ${colorInfo.borderHex}`,
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
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
            top: '7px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '7px',
            height: '7px',
            backgroundColor: '#151515',
            borderRadius: '50%',
            zIndex: 25
          }}
        />

        {renderGlassReflection(14)}

        <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
          {renderScreenContent(12)}
        </div>
      </div>
    </div>
  );
};
