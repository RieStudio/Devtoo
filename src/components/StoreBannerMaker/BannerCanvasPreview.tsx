import React, { useRef, useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ShieldCheck, 
  Upload, 
  Crop, 
  Trash2,
  Star
} from 'lucide-react';
import type { StoreBannerConfig, BannerDeviceConfig } from '../../types/storeBanner';
import { DeviceFrame } from '../MockupEditor/DeviceFrame';
import { BANNER_PRESETS } from '../../constants/bannerPresets';

interface BannerCanvasPreviewProps {
  config: StoreBannerConfig;
  onChangeConfig: (updated: Partial<StoreBannerConfig>) => void;
  onUploadDeviceScreenshot: (deviceId: string) => void;
  onCropDeviceScreenshot: (deviceId: string) => void;
  onUploadAppIcon: () => void;
  canvasExportRef: React.RefObject<HTMLDivElement | null>;
}

export const BannerCanvasPreview: React.FC<BannerCanvasPreviewProps> = ({
  config,
  onChangeConfig,
  onUploadDeviceScreenshot,
  onCropDeviceScreenshot,
  onUploadAppIcon,
  canvasExportRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

  // Auto calculate fit zoom scale based on viewport size
  const calculateFitZoom = () => {
    if (!containerRef.current) return;
    const padding = 64;
    const availableWidth = containerRef.current.clientWidth - padding;
    const availableHeight = containerRef.current.clientHeight - padding;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / config.width;
    const scaleY = availableHeight / config.height;
    const fit = Math.min(scaleX, scaleY, 1.25);
    setZoomScale(Number(fit.toFixed(2)));
  };

  useEffect(() => {
    if (isAutoFit) {
      calculateFitZoom();
    }
  }, [config.width, config.height, isAutoFit]);

  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit) calculateFitZoom();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoFit, config.width, config.height]);

  const handleZoom = (delta: number) => {
    setIsAutoFit(false);
    setZoomScale((prev) => Math.min(2.5, Math.max(0.2, Number((prev + delta).toFixed(2)))));
  };

  const handleResetFit = () => {
    setIsAutoFit(true);
    calculateFitZoom();
  };

  const currentPreset = BANNER_PRESETS.find((p) => p.id === config.preset);

  // Compute background style
  const getCanvasBackground = (): React.CSSProperties => {
    if (config.bgType === 'solid') {
      return { backgroundColor: config.bgColor };
    }
    if (config.bgType === 'gradient') {
      const { from, to, angle, type } = config.bgGradient;
      if (type === 'radial') {
        return { background: `radial-gradient(circle at 60% 40%, ${from} 0%, ${to} 100%)` };
      }
      return { background: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` };
    }
    return { backgroundColor: config.bgColor };
  };

  // Render Pattern Overlay
  const renderPatternOverlay = () => {
    if (config.bgPattern === 'none') return null;

    if (config.bgPattern === 'dots') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
            opacity: config.bgPatternOpacity,
            pointerEvents: 'none',
          }}
        />
      );
    }

    if (config.bgPattern === 'grid') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            opacity: config.bgPatternOpacity,
            pointerEvents: 'none',
          }}
        />
      );
    }

    if (config.bgPattern === 'diagonal-stripes') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 2px, transparent 0, transparent 16px)`,
            opacity: config.bgPatternOpacity,
            pointerEvents: 'none',
          }}
        />
      );
    }

    if (config.bgPattern === 'mesh-glow') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            opacity: config.bgPatternOpacity,
          }}
        >
          {/* Ambient luminous orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '15%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(217, 4, 41, 0.7) 0%, rgba(217, 4, 41, 0) 70%)',
              filter: 'blur(75px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-5%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79, 70, 229, 0.6) 0%, rgba(79, 70, 229, 0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '5%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0) 70%)',
              filter: 'blur(70px)',
            }}
          />
        </div>
      );
    }

    return null;
  };

  const getShadowStyle = (shadowDepth: BannerDeviceConfig['shadowDepth']) => {
    switch (shadowDepth) {
      case 'soft':
        return 'drop-shadow(0 15px 30px rgba(0,0,0,0.35))';
      case 'medium':
        return 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))';
      case 'deep':
        return 'drop-shadow(0 40px 80px rgba(0,0,0,0.65))';
      case '3d-floating':
        return 'drop-shadow(-20px 40px 60px rgba(0,0,0,0.55)) drop-shadow(0 10px 20px rgba(0,0,0,0.3))';
      default:
        return 'none';
    }
  };

  // Render each device
  const renderDevice = (device: BannerDeviceConfig, index: number) => {
    if (!device.enabled) return null;
    const isSelected = config.selectedDeviceId === device.id;

    return (
      <div
        key={device.id}
        onClick={(e) => {
          e.stopPropagation();
          onChangeConfig({ selectedDeviceId: device.id });
        }}
        style={{
          position: 'absolute',
          left: `${device.offsetX}px`,
          top: `${device.offsetY}px`,
          transform: `
            translate(-50%, -50%) 
            rotate(${device.rotation}deg) 
            scale(${device.scale})
          `,
          transformOrigin: 'center center',
          filter: getShadowStyle(device.shadowDepth),
          cursor: 'pointer',
          zIndex: isSelected ? 30 : index === 0 ? 25 : 20,
          transition: 'outline 0.15s ease, filter 0.2s ease',
          outline: isSelected ? '2px dashed rgba(217, 4, 41, 0.8)' : 'none',
          outlineOffset: '8px',
          borderRadius: '32px',
        }}
        title={`Cihaz ${index + 1} (${device.deviceType}) - Tıklayarak seçin`}
      >
        <DeviceFrame
          deviceType={device.deviceType as any}
          deviceColor={device.deviceColor}
          screenshotUrl={device.screenshotUrl}
          borderRadius={24}
          shadowDepth="none" // Filter is applied to outer container
          onUploadClick={() => onUploadDeviceScreenshot(device.id)}
          presetWidth={config.width}
          presetHeight={config.height}
        />

        {/* Floating Quick Action Pill for Selected Device */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: '-48px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              borderRadius: '999px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn-pill-action"
              onClick={() => onUploadDeviceScreenshot(device.id)}
              title="Ekran Görüntüsü Yükle / Değiştir"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              <Upload size={12} color="#D90429" />
              <span>{device.screenshotUrl ? 'Görseli Değiştir' : 'Görsel Yükle'}</span>
            </button>

            {device.screenshotUrl && (
              <button
                type="button"
                className="btn-pill-action"
                onClick={() => onCropDeviceScreenshot(device.id)}
                title="Kırp"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Crop size={12} />
                <span>Kırp</span>
              </button>
            )}

            {device.screenshotUrl && (
              <button
                type="button"
                className="btn-pill-action"
                onClick={() => {
                  const updatedDevs = [...config.devices] as [BannerDeviceConfig, BannerDeviceConfig];
                  const idx = updatedDevs.findIndex((d) => d.id === device.id);
                  if (idx !== -1) {
                    updatedDevs[idx] = {
                      ...updatedDevs[idx],
                      screenshotUrl: null,
                      originalScreenshotUrl: null,
                      cropData: null,
                    };
                    onChangeConfig({ devices: updatedDevs });
                  }
                }}
                title="Ekran görüntüsünü kaldır"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="canvas-container banner-canvas-container" ref={containerRef}>
      {/* Top Banner Toolbar: Preset info, zoom, and safe zone toggle */}
      <div className="canvas-header-bar">
        <div className="canvas-preset-info">
          <span className="preset-name-tag">{currentPreset?.name || 'Banner'}</span>
          <span className="preset-dim-tag">{config.width} × {config.height} px</span>
          {config.preset === 'google-play-feature' && (
            <span className="badge-highlight" style={{ backgroundColor: '#059669', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600 }}>
              Google Play Standardı
            </span>
          )}
        </div>

        <div className="canvas-controls-group">
          {/* Safe Zone Guideline Toggle */}
          <button
            type="button"
            className={`btn-toolbar-toggle ${showSafeZone ? 'is-active' : ''}`}
            onClick={() => setShowSafeZone(!showSafeZone)}
            title="Google Play / App Store Güvenli Alan Kılavuzunu Göster/Gizle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 500,
              backgroundColor: showSafeZone ? '#FFF0F3' : '#F8FAFC',
              color: showSafeZone ? '#D90429' : '#475569',
              border: `1px solid ${showSafeZone ? '#D90429' : '#E2E8F0'}`,
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={14} />
            <span>Güvenli Alan</span>
          </button>

          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button
              type="button"
              className="btn-zoom"
              onClick={() => handleZoom(-0.1)}
              title="Uzaklaştır"
            >
              <ZoomOut size={14} />
            </button>
            <span className="zoom-value" onClick={handleResetFit} title="Otomatik Sığdır">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              className="btn-zoom"
              onClick={() => handleZoom(0.1)}
              title="Yakınlaştır"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              className={`btn-zoom ${isAutoFit ? 'is-active' : ''}`}
              onClick={handleResetFit}
              title="Ekrana Sığdır"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll & Scaling Stage */}
      <div className="canvas-scroll-stage">
        <div
          className="canvas-zoom-wrapper"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* THE BANNER RENDER SURFACE (Target of html-to-image export) */}
          <div
            ref={canvasExportRef}
            id="store-banner-export-surface"
            className="store-banner-surface"
            style={{
              width: `${config.width}px`,
              height: `${config.height}px`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              ...getCanvasBackground(),
            }}
          >
            {/* Background Image Layer if present */}
            {config.bgType === 'image' && config.bgImageUrl && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${config.bgImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `blur(${config.bgImageBlur}px)`,
                  transform: config.bgImageBlur > 0 ? 'scale(1.05)' : 'none',
                  zIndex: 1,
                }}
              />
            )}

            {/* Background Dim Overlay */}
            {config.bgType === 'image' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: `rgba(0, 0, 0, ${config.bgImageDim})`,
                  zIndex: 2,
                }}
              />
            )}

            {/* Background Texture / Pattern */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
              {renderPatternOverlay()}
            </div>

            {/* Google Play / App Store Safe Zone Overlay Guide */}
            {showSafeZone && (
              <div
                style={{
                  position: 'absolute',
                  top: '15%',
                  bottom: '15%',
                  left: '12%',
                  right: '12%',
                  border: '2px dashed rgba(217, 4, 41, 0.75)',
                  backgroundColor: 'rgba(217, 4, 41, 0.04)',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                  zIndex: 90,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: '12px 16px',
                }}
              >
                <div style={{
                  backgroundColor: 'rgba(217, 4, 41, 0.85)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <ShieldCheck size={12} />
                  <span>Google Play Güvenli Alanı (Metin & İkonlar bu sınırın içinde kalmalıdır)</span>
                </div>
              </div>
            )}

            {/* TEXT & BRANDING GROUP LAYER */}
            <div
              style={{
                position: 'absolute',
                left: `${config.textOffsetX}px`,
                top: `calc(50% + ${config.textOffsetY}px)`,
                transform: 'translateY(-50%)',
                maxWidth: `${config.textMaxWidth}px`,
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 
                  config.textAlignment === 'center'
                    ? 'center'
                    : config.textAlignment === 'right'
                    ? 'flex-end'
                    : 'flex-start',
                textAlign: config.textAlignment,
                gap: '16px',
                pointerEvents: 'none',
              }}
            >
              {/* App Icon + Eyebrow Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                  justifyContent: config.textAlignment === 'center' ? 'center' : 'flex-start',
                }}
              >
                {/* App Icon */}
                {config.showAppIcon && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onUploadAppIcon();
                    }}
                    style={{
                      width: `${config.appIconSize}px`,
                      height: `${config.appIconSize}px`,
                      borderRadius:
                        config.appIconRadius === 'circle'
                          ? '50%'
                          : config.appIconRadius === 'round'
                          ? '16px'
                          : '22.37%', // iOS Squircle ratio
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35), 0 0 0 1.5px rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                    title="Uygulama İkonunu Değiştirmek İçin Tıklayın"
                  >
                    {config.appIconUrl ? (
                      <img
                        src={config.appIconUrl}
                        alt="App Icon"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #D90429 0%, #EF233C 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: `${Math.round(config.appIconSize * 0.42)}px`,
                          fontWeight: 800,
                        }}
                      >
                        🌶️
                      </div>
                    )}
                  </div>
                )}

                {/* Eyebrow / Tag Pill */}
                {config.showEyebrow && config.eyebrowText && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: config.eyebrowColor,
                      backgroundColor: config.eyebrowBgColor,
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${config.eyebrowColor}33`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {config.eyebrowText}
                  </span>
                )}
              </div>

              {/* Title Headline */}
              {config.showTitle && config.titleText && (
                <h1
                  style={{
                    margin: 0,
                    fontSize: `${config.titleFontSize}px`,
                    fontWeight: config.titleFontWeight,
                    fontFamily: `var(--font-${config.titleFontFamily}, 'Outfit', sans-serif)`,
                    color: config.titleColor,
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    textShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    wordBreak: 'break-word',
                  }}
                >
                  {config.titleText}
                </h1>
              )}

              {/* Subtitle Description */}
              {config.showSubtitle && config.subtitleText && (
                <p
                  style={{
                    margin: 0,
                    fontSize: `${config.subtitleFontSize}px`,
                    fontWeight: config.subtitleFontWeight,
                    fontFamily: `var(--font-${config.subtitleFontFamily}, 'Outfit', sans-serif)`,
                    color: config.subtitleColor,
                    lineHeight: 1.5,
                    letterSpacing: '-0.01em',
                    opacity: 0.92,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    wordBreak: 'break-word',
                  }}
                >
                  {config.subtitleText}
                </p>
              )}

              {/* Badges & Trust Rating Group */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '4px',
                  justifyContent: config.textAlignment === 'center' ? 'center' : 'flex-start',
                }}
              >
                {/* Store Badges */}
                {config.showStoreBadge && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(config.storeBadgeType === 'google-play' || config.storeBadgeType === 'both') && (
                      <div
                        style={{
                          backgroundColor: '#000000',
                          color: '#FFFFFF',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M3.6 1.8L14.2 12.4L3.6 23C3.2 22.7 3 22.1 3 21.4V3.4C3 2.7 3.2 2.1 3.6 1.8Z" fill="#00E5FF"/>
                          <path d="M17.7 8.9L14.2 12.4L3.6 1.8C4 1.5 4.6 1.5 5.2 1.8L17.7 8.9Z" fill="#00E676"/>
                          <path d="M17.7 15.9L5.2 23C4.6 23.3 4 23.3 3.6 23L14.2 12.4L17.7 15.9Z" fill="#FF1744"/>
                          <path d="M21.5 11.1L17.7 8.9L14.2 12.4L17.7 15.9L21.5 13.7C22.2 13.3 22.2 11.5 21.5 11.1Z" fill="#FFD600"/>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                          <span style={{ fontSize: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>İNDİRİN</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>Google Play</span>
                        </div>
                      </div>
                    )}

                    {(config.storeBadgeType === 'app-store' || config.storeBadgeType === 'both') && (
                      <div
                        style={{
                          backgroundColor: '#000000',
                          color: '#FFFFFF',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.02-1.77.9-2.8-.88.04-1.94.59-2.57 1.33-.56.64-.99 1.68-.86 2.69.97.08 1.93-.49 2.53-1.22z"/>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                          <span style={{ fontSize: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>İNDİRİN</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>App Store</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Rating Badge */}
                {config.showRating && config.ratingText && (
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <span>{config.ratingText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* DEVICE MOCKUPS LAYER */}
            {config.deviceCount >= 1 && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {config.deviceCount >= 2 && renderDevice(config.devices[1], 1)}
                {renderDevice(config.devices[0], 0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
