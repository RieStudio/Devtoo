import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Smartphone, 
  Download, 
  Layers, 
  Globe, 
  Sun, 
  Moon
} from 'lucide-react';
import appleSvg from '../../assets/apple.svg';
import androidSvg from '../../assets/android.svg';

// iOS Companion App Icons (Light & Dark)
import iosPhotosLight from '../../assets/ios-photos-light.svg';
import iosPhotosDark from '../../assets/ios-photos-dark.svg';
import iosCameraLight from '../../assets/ios-camera-light.webp';
import iosCameraDark from '../../assets/ios-camera-dark.webp';
import iosMapsLight from '../../assets/ios-maps-light.webp';
import iosMapsDark from '../../assets/ios-maps-dark.webp';

// Device Wallpapers (Light & Dark)
import iphoneLightWallpaper from '../../assets/iPhone-17-White-wallpaper.jpg';
import iphoneDarkWallpaper from '../../assets/iPhone-17-Black.jpg';
import androidLightWallpaper from '../../assets/android-light.webp';
import androidDarkWallpaper from '../../assets/android-dark.webp';

// Android Companion App Icons
import googlePlaySvg from '../../assets/googleplay.svg';
import chromeSvg from '../../assets/chrome.svg';
import gmailSvg from '../../assets/google-gmail.svg';
import type { IconResizerConfig, IconSizeSpec, PreviewTab, CornerRadiusType } from '../../types/iconResizer';
import { ALL_ICON_SIZES, IOS_ICON_SIZES, ANDROID_ICON_SIZES, WEB_ICON_SIZES } from '../../constants/iconSizes';
import { exportSingleIcon, renderIconToCanvas } from '../../utils/iconGenerator';

interface IconCanvasPreviewProps {
  config: IconResizerConfig;
  onChangeConfig: (updated: Partial<IconResizerConfig>) => void;
  onFileSelect: (file: File) => void;
  onOpenCropModal?: () => void;
  onTriggerExport?: () => void;
  isExporting?: boolean;
}

export const IconCanvasPreview: React.FC<IconCanvasPreviewProps> = ({
  config,
  onChangeConfig,
  onFileSelect,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('device-preview');
  const [selectedGalleryPlatform, setSelectedGalleryPlatform] = useState<'all' | 'ios' | 'android' | 'web'>('all');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic iOS companion icons matching light / dark mode
  const photosIcon = config.previewDarkMode ? iosPhotosDark : iosPhotosLight;
  const cameraIcon = config.previewDarkMode ? iosCameraDark : iosCameraLight;
  const mapsIcon = config.previewDarkMode ? iosMapsDark : iosMapsLight;

  // Dynamic device wallpapers matching light / dark mode
  const iphoneWallpaper = config.previewDarkMode ? iphoneDarkWallpaper : iphoneLightWallpaper;
  const androidWallpaper = config.previewDarkMode ? androidDarkWallpaper : androidLightWallpaper;

  // Re-render preview canvas whenever image, background, padding or mask changes
  useEffect(() => {
    if (!config.sourceImageUrl) {
      setPreviewDataUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.sourceImageUrl;
    img.onload = () => {
      const canvas = renderIconToCanvas(img, 512, 512, {
        bgColor: config.bgColor,
        isTransparentBg: config.isTransparentBg,
        paddingPercent: config.paddingPercent,
      });
      setPreviewDataUrl(canvas.toDataURL('image/png'));
    };
  }, [config.sourceImageUrl, config.bgColor, config.isTransparentBg, config.paddingPercent]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleDownloadSingle = (spec: IconSizeSpec) => {
    if (!config.sourceImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.sourceImageUrl;
    img.onload = () => {
      exportSingleIcon(img, spec, {
        bgColor: config.bgColor,
        isTransparentBg: config.isTransparentBg,
        paddingPercent: config.paddingPercent,
      });
    };
  };

  // Helper for corner radius CSS
  const getMaskStyle = (type: CornerRadiusType): React.CSSProperties => {
    switch (type) {
      case 'squircle':
        // Continuous curve similar to Apple iOS Squircle
        return { borderRadius: '22.37%' };
      case 'circle':
        return { borderRadius: '50%' };
      case 'rounded':
        return { borderRadius: '16px' };
      case 'square':
      default:
        return { borderRadius: '0px' };
    }
  };

  const gallerySpecs = ALL_ICON_SIZES.filter((spec) => {
    if (selectedGalleryPlatform === 'all') return true;
    return spec.platform === selectedGalleryPlatform;
  });

  return (
    <div className="icon-canvas-viewport">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* When NO image is uploaded -> Big Upload & Drop Zone */}
      {!config.sourceImageUrl ? (
        <div
          className={`icon-empty-dropzone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="icon-empty-dropzone-content">
            <div className="icon-upload-hero-icon">
              <Upload size={38} color="#D90429" />
            </div>

            <h2 className="icon-empty-title">Uygulama İkonunu Yükleyin veya Sürükleyin</h2>
            <p className="icon-empty-subtitle">
              iOS, Android ve Web için tek tıkla eksiksiz simge paketleri oluşturun.
            </p>

            <div className="icon-empty-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="btn-chili"
                style={{ padding: '10px 24px', fontSize: '14px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Görsel Seç</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* When image IS uploaded -> Live Preview with Tabs */
        <div className="icon-preview-workspace">
          {/* Top Control & Tab Bar */}
          <div className="icon-preview-top-bar">
            {/* View Mode Tabs */}
            <div className="icon-tab-group">
              <button
                type="button"
                className={`icon-tab-btn ${activeTab === 'device-preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('device-preview')}
              >
                <Smartphone size={14} />
                <span>Cihaz Önizleme</span>
              </button>
              <button
                type="button"
                className={`icon-tab-btn ${activeTab === 'all-sizes' ? 'active' : ''}`}
                onClick={() => setActiveTab('all-sizes')}
              >
                <Layers size={14} />
                <span>Tüm Boyutlar Galerisi ({ALL_ICON_SIZES.length})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Realistic Device Preview */}
          {activeTab === 'device-preview' && (
            <div className="icon-device-preview-container">
              {/* Sub-toolbar for device selection & dark/light mode */}
              <div className="device-sub-toolbar">
                <div className="device-picker-pills">
                  <button
                    type="button"
                    className={`device-pill ${config.previewDevice === 'iphone' ? 'active' : ''}`}
                    onClick={() => onChangeConfig({ previewDevice: 'iphone', previewCornerRadius: 'squircle' })}
                  >
                    <img
                      src={appleSvg}
                      alt="Apple"
                      style={{
                        width: '13px',
                        height: '13px',
                        objectFit: 'contain',
                        filter: config.previewDevice === 'iphone' ? 'brightness(0) invert(1)' : 'none',
                      }}
                    />
                    <span>iPhone 17 Pro Max</span>
                  </button>
                  <button
                    type="button"
                    className={`device-pill ${config.previewDevice === 'android' ? 'active' : ''}`}
                    onClick={() => onChangeConfig({ previewDevice: 'android', previewCornerRadius: 'circle' })}
                  >
                    <img src={androidSvg} alt="Android" style={{ width: '14px', height: '13px', objectFit: 'contain' }} />
                    <span>Galaxy S26 Ultra</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="dark-mode-toggle-btn"
                    onClick={() => onChangeConfig({ previewDarkMode: !config.previewDarkMode })}
                    title={config.previewDarkMode ? 'Açık Duvar Kağıdına Geç' : 'Koyu Duvar Kağıdına Geç'}
                    aria-label={config.previewDarkMode ? 'Açık Duvar Kağıdı' : 'Koyu Duvar Kağıdı'}
                  >
                    {config.previewDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
              </div>

              {/* Realistic Device Screen Viewports */}
              <div className="device-stage-wrapper">
                {/* 1. iPhone 17 Pro Max Mockup */}
                {config.previewDevice === 'iphone' && (
                  <div
                    className="realistic-device-mockup"
                    style={{
                      position: 'relative',
                      width: '300px',
                      filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.28))',
                      display: 'inline-block',
                    }}
                  >
                    {/* Screen Content Layer */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '1.25%',
                        left: '3.34%',
                        width: '93.57%',
                        height: '97.50%',
                        zIndex: 1,
                        borderRadius: '42px',
                        overflow: 'hidden',
                        backgroundColor: '#000000',
                      }}
                    >
                      <div
                        className={`iphone-screen-content ${config.previewDarkMode ? 'dark-wallpaper' : 'light-wallpaper'}`}
                        style={{
                          backgroundImage: `url(${iphoneWallpaper})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Status Bar */}
                        <div className="iphone-status-bar">
                          <span className="iphone-status-time">9:41</span>
                          <div className="iphone-status-icons">
                            {/* Cellular 4 bars */}
                            <svg width="15" height="10" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
                              <rect x="0" y="8" width="2.5" height="3" rx="0.7" />
                              <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.7" />
                              <rect x="9" y="3" width="2.5" height="8" rx="0.7" />
                              <rect x="13.5" y="0" width="2.5" height="11" rx="0.7" />
                            </svg>
                            {/* Wi-Fi */}
                            <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-3.8-3a5.5 5.5 0 0 1 7.6 0 .8.8 0 1 1-1.1 1.1 4 4 0 0 0-5.4 0 .8.8 0 0 1-1.1-1.1Zm-3-3a9.8 9.8 0 0 1 13.6 0 .8.8 0 0 1-1.1 1.1 8.3 8.3 0 0 0-11.4 0 .8.8 0 0 1-1.1-1.1Z" />
                            </svg>
                            {/* Battery */}
                            <svg width="22" height="11" viewBox="0 0 25 12" fill="none" aria-hidden="true">
                              <rect x="0.75" y="0.75" width="20.5" height="10.5" rx="3.25" stroke="currentColor" strokeWidth="1.5" />
                              <rect x="2.5" y="2.5" width="14" height="7" rx="1.5" fill="currentColor" />
                              <path d="M23 4.2c.6 0 1 .4 1 1v1.6c0 .6-.4 1-1 1v-3.6Z" fill="currentColor" />
                            </svg>
                          </div>
                        </div>

                        {/* Dock Container */}
                        <div className="iphone-dock-glass">
                          {/* Custom User App Icon */}
                          <div className="iphone-app-item dock-item highlighted" title={config.appName || 'Uygulama'}>
                            <div
                              className="iphone-app-icon-wrapper"
                              style={{
                                ...getMaskStyle('squircle'),
                                backgroundColor: previewDataUrl ? 'transparent' : (config.isTransparentBg ? 'transparent' : config.bgColor || '#1E293B'),
                              }}
                            >
                              {previewDataUrl ? (
                                <img src={previewDataUrl} alt={config.appName} className="iphone-icon-img" />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Smartphone size={22} color="#FFFFFF" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Companion Apps */}
                          <div className="iphone-app-item dock-item mock" title="Fotoğraflar">
                            <div className="iphone-app-icon-wrapper">
                              <img src={photosIcon} alt="Fotoğraflar" className="iphone-icon-img" />
                            </div>
                          </div>

                          <div className="iphone-app-item dock-item mock" title="Kamera">
                            <div className="iphone-app-icon-wrapper">
                              <img src={cameraIcon} alt="Kamera" className="iphone-icon-img" />
                            </div>
                          </div>

                          <div className="iphone-app-item dock-item mock" title="Harita">
                            <div className="iphone-app-icon-wrapper">
                              <img src={mapsIcon} alt="Harita" className="iphone-icon-img" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* iPhone 17 Pro Max Hardware Frame Overlay */}
                    <img
                      src="/devices/phone/apple/iphone-17-pro-max.png"
                      alt="iPhone 17 Pro Max"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 'auto',
                        pointerEvents: 'none',
                        zIndex: 10,
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                {/* 2. Galaxy S26 Ultra Mockup */}
                {config.previewDevice === 'android' && (
                  <div
                    className="realistic-device-mockup"
                    style={{
                      position: 'relative',
                      width: '300px',
                      filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.28))',
                      display: 'inline-block',
                    }}
                  >
                    {/* Screen Content Layer */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.88%',
                        left: '2.08%',
                        width: '95.32%',
                        height: '98.12%',
                        zIndex: 1,
                        borderRadius: '19px',
                        overflow: 'hidden',
                        backgroundColor: '#000000',
                      }}
                    >
                      <div
                        className={`android-screen-content ${config.previewDarkMode ? 'dark-wallpaper' : 'light-wallpaper'}`}
                        style={{
                          backgroundImage: `url(${androidWallpaper})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Status Bar */}
                        <div className="android-status-bar">
                          <span className="android-status-time">10:00</span>
                          <div className="android-status-icons">
                            <span className="android-network-badge">5G</span>
                            {/* Signal */}
                            <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                              <rect x="0.5" y="8" width="2.2" height="4" rx="0.5" />
                              <rect x="4.5" y="5.5" width="2.2" height="6.5" rx="0.5" />
                              <rect x="8.5" y="3" width="2.2" height="9" rx="0.5" />
                              <rect x="12.5" y="0" width="2.2" height="12" rx="0.5" />
                            </svg>
                            {/* Wi-Fi */}
                            <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                              <path d="M8 9.8a1.4 1.4 0 1 1 0 2.4 1.4 1.4 0 0 1 0-2.4Zm-3.5-3a5 5 0 0 1 7 0 .7.7 0 1 1-1 1 3.6 3.6 0 0 0-5 0 .7.7 0 0 1-1-1Zm-2.8-2.8a8.8 8.8 0 0 1 12.6 0 .7.7 0 1 1-1 1 7.4 7.4 0 0 0-10.6 0 .7.7 0 1 1-1-1Z" />
                            </svg>
                            <span className="android-battery-percent">95%</span>
                            {/* Battery */}
                            <svg width="19" height="10" viewBox="0 0 24 11" fill="none" aria-hidden="true">
                              <rect x="0.6" y="0.6" width="20" height="9.8" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
                              <rect x="2" y="2" width="13" height="7" rx="1.2" fill="currentColor" />
                              <path d="M22 3.8c.4 0 .8.3.8.7v2c0 .4-.4.7-.8.7v-3.4Z" fill="currentColor" />
                            </svg>
                          </div>
                        </div>

                        {/* Google Search Pill */}
                        <div className="android-search-pill">
                          <span className="g-logo">G</span>
                          <span className="search-placeholder">Uygulama ve internette ara</span>
                        </div>

                        {/* App Grid */}
                        <div className="android-app-grid">
                          {/* Active User App Icon */}
                          <div className="android-app-item highlighted">
                            <div
                              className="android-app-icon-wrapper"
                              style={getMaskStyle(config.previewCornerRadius)}
                            >
                              {previewDataUrl && (
                                <img src={previewDataUrl} alt={config.appName} className="android-icon-img" />
                              )}
                            </div>
                            <span className="android-app-label active-app-label">{config.appName || 'Uygulama'}</span>
                          </div>

                          {/* Companion Apps */}
                          <div className="android-app-item mock">
                            <div className="android-app-icon-wrapper" style={getMaskStyle(config.previewCornerRadius)}>
                              <img src={googlePlaySvg} alt="Play Store" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                            </div>
                            <span className="android-app-label">Play Store</span>
                          </div>

                          <div className="android-app-item mock">
                            <div className="android-app-icon-wrapper" style={getMaskStyle(config.previewCornerRadius)}>
                              <img src={chromeSvg} alt="Chrome" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                            </div>
                            <span className="android-app-label">Chrome</span>
                          </div>

                          <div className="android-app-item mock">
                            <div className="android-app-icon-wrapper" style={getMaskStyle(config.previewCornerRadius)}>
                              <img src={gmailSvg} alt="Gmail" style={{ width: '62%', height: '62%', objectFit: 'contain' }} />
                            </div>
                            <span className="android-app-label">Gmail</span>
                          </div>
                        </div>

                        {/* Android Navigation Bar */}
                        <div className="android-nav-bar">
                          <div className="android-home-pill" />
                        </div>
                      </div>
                    </div>

                    {/* Galaxy S26 Ultra Hardware Frame Overlay */}
                    <img
                      src="/devices/phone/samsung/galaxy-s26-ultra.png"
                      alt="Galaxy S26 Ultra"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 'auto',
                        pointerEvents: 'none',
                        zIndex: 10,
                        display: 'block',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: All Sizes Gallery */}
          {activeTab === 'all-sizes' && (
            <div className="icon-gallery-container">
              {/* Platform Filter Bar */}
              <div className="gallery-filter-bar">
                <button
                  type="button"
                  className={`gallery-filter-btn ${selectedGalleryPlatform === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedGalleryPlatform('all')}
                >
                  <span>Tümü</span>
                  <span className="count-badge">{ALL_ICON_SIZES.length}</span>
                </button>
                <button
                  type="button"
                  className={`gallery-filter-btn ${selectedGalleryPlatform === 'ios' ? 'active' : ''}`}
                  onClick={() => setSelectedGalleryPlatform('ios')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <img
                    src={appleSvg}
                    alt="Apple"
                    style={{
                      width: '12px',
                      height: '12px',
                      objectFit: 'contain',
                      filter: selectedGalleryPlatform === 'ios' ? 'brightness(0) invert(1)' : 'none',
                    }}
                  />
                  <span>iOS & macOS</span>
                  <span className="count-badge">{IOS_ICON_SIZES.length}</span>
                </button>
                <button
                  type="button"
                  className={`gallery-filter-btn ${selectedGalleryPlatform === 'android' ? 'active' : ''}`}
                  onClick={() => setSelectedGalleryPlatform('android')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <img src={androidSvg} alt="Android" style={{ width: '13px', height: '12px', objectFit: 'contain' }} />
                  <span>Android</span>
                  <span className="count-badge">{ANDROID_ICON_SIZES.length}</span>
                </button>
                <button
                  type="button"
                  className={`gallery-filter-btn ${selectedGalleryPlatform === 'web' ? 'active' : ''}`}
                  onClick={() => setSelectedGalleryPlatform('web')}
                >
                  <span>Web & Favicon</span>
                  <span className="count-badge">{WEB_ICON_SIZES.length}</span>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="gallery-grid">
                {gallerySpecs.map((spec) => (
                  <div key={spec.id} className="icon-spec-card">
                    {/* Card Top: Platform & Dimensions */}
                    <div className="spec-card-header">
                      <span className={`platform-tag ${spec.platform}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {spec.platform === 'ios' ? (
                          <>
                            <img src={appleSvg} alt="Apple" style={{ width: '10px', height: '10px', objectFit: 'contain' }} />
                            <span>iOS</span>
                          </>
                        ) : spec.platform === 'android' ? (
                          <>
                            <img src={androidSvg} alt="Android" style={{ width: '11px', height: '10px', objectFit: 'contain' }} />
                            <span>Android</span>
                          </>
                        ) : (
                          <>
                            <Globe size={10} />
                            <span>Web</span>
                          </>
                        )}
                      </span>
                      <span className="spec-dimensions">{spec.width} × {spec.height}</span>
                    </div>

                    {/* Card Body: Icon Preview Thumbnail */}
                    <div className="spec-card-preview-area">
                      <div
                        className="spec-icon-thumb"
                        style={{
                          width: `${Math.min(96, Math.max(36, spec.width / 4))}px`,
                          height: `${Math.min(96, Math.max(36, spec.height / 4))}px`,
                          ...getMaskStyle(spec.isRound ? 'circle' : spec.platform === 'ios' ? 'squircle' : 'rounded'),
                        }}
                      >
                        {previewDataUrl && (
                          <img src={previewDataUrl} alt={spec.name} className="spec-thumb-img" />
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Details and Download */}
                    <div className="spec-card-footer">
                      <div className="spec-name-area">
                        <div className="spec-title" title={spec.name}>{spec.name}</div>
                        <div className="spec-filename" title={spec.fileName}>{spec.fileName}</div>
                      </div>

                      <button
                        type="button"
                        className="btn-download-icon"
                        onClick={() => handleDownloadSingle(spec)}
                        title={`${spec.fileName} dosyasını tekli PNG olarak indir`}
                      >
                        <Download size={13} />
                        <span>İndir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
