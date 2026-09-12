import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Smartphone, 
  Download, 
  Layers, 
  Globe, 
  Laptop, 
  Sun, 
  Moon, 
  Crop, 
  RefreshCw,
  Lock
} from 'lucide-react';
import appleSvg from '../../assets/apple.svg';
import androidSvg from '../../assets/android.svg';
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
  onOpenCropModal,
  onTriggerExport,
  isExporting = false,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('device-preview');
  const [selectedGalleryPlatform, setSelectedGalleryPlatform] = useState<'all' | 'ios' | 'android' | 'web'>('all');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

            {/* Quick Actions on Loaded Image */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenCropModal && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={onOpenCropModal}
                  title="Görseli kare olarak kırp"
                >
                  <Crop size={13} />
                  <span>Kırp</span>
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => fileInputRef.current?.click()}
                title="Yeni bir görsel yükleyin"
              >
                <RefreshCw size={13} />
                <span>Görsel Değiştir</span>
              </button>
              {onTriggerExport && (
                <button
                  type="button"
                  className="btn-chili"
                  style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}
                  onClick={onTriggerExport}
                  disabled={isExporting}
                  title="Tüm simge paketlerini (.ZIP) indir"
                >
                  <Download size={13} />
                  <span>{isExporting ? 'Paketleniyor...' : 'İndir'}</span>
                </button>
              )}
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
                  <button
                    type="button"
                    className={`device-pill ${config.previewDevice === 'web' ? 'active' : ''}`}
                    onClick={() => onChangeConfig({ previewDevice: 'web' })}
                  >
                    <Laptop size={13} />
                    <span>Studio Display (Web & Dock)</span>
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
                      <div className={`iphone-screen-content ${config.previewDarkMode ? 'dark-wallpaper' : 'light-wallpaper'}`}>
                        {/* Status Bar */}
                        <div className="iphone-status-bar">
                          <span className="status-time">9:41</span>
                          <div className="iphone-dynamic-island" />
                          <div className="status-icons">
                            <span style={{ fontSize: '10px', fontWeight: 600 }}>5G</span>
                            <div className="battery-pill" />
                          </div>
                        </div>

                        {/* App Grid */}
                        <div className="iphone-app-grid">
                          {/* Custom User App Icon */}
                          <div className="iphone-app-item highlighted">
                            <div
                              className="iphone-app-icon-wrapper"
                              style={getMaskStyle('squircle')}
                            >
                              {previewDataUrl && (
                                <img src={previewDataUrl} alt={config.appName} className="iphone-icon-img" />
                              )}
                            </div>
                            <span className="iphone-app-label active-app-label">{config.appName || 'Uygulama'}</span>
                          </div>

                          {/* Companion Apps */}
                          <div className="iphone-app-item mock">
                            <div className="iphone-app-icon-wrapper photos-mock" style={getMaskStyle('squircle')}>
                              <div className="photo-emblem" />
                            </div>
                            <span className="iphone-app-label">Fotoğraflar</span>
                          </div>

                          <div className="iphone-app-item mock">
                            <div className="iphone-app-icon-wrapper camera-mock" style={getMaskStyle('squircle')}>
                              <div className="camera-lens" />
                            </div>
                            <span className="iphone-app-label">Kamera</span>
                          </div>

                          <div className="iphone-app-item mock">
                            <div className="iphone-app-icon-wrapper maps-mock" style={getMaskStyle('squircle')}>
                              <div className="maps-pin" />
                            </div>
                            <span className="iphone-app-label">Harita</span>
                          </div>
                        </div>

                        {/* Dock Container */}
                        <div className="iphone-dock-glass">
                          <div className="iphone-app-item dock-item">
                            <div className="iphone-app-icon-wrapper phone-mock" style={getMaskStyle('squircle')} />
                          </div>
                          <div className="iphone-app-item dock-item">
                            <div className="iphone-app-icon-wrapper safari-mock" style={getMaskStyle('squircle')} />
                          </div>
                          <div className="iphone-app-item dock-item">
                            <div className="iphone-app-icon-wrapper messages-mock" style={getMaskStyle('squircle')} />
                          </div>
                          <div className="iphone-app-item dock-item">
                            <div className="iphone-app-icon-wrapper music-mock" style={getMaskStyle('squircle')} />
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
                  <div className="samsung-preview-stage">
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
                        <div className={`android-screen-content ${config.previewDarkMode ? 'dark-wallpaper' : 'light-wallpaper'}`}>
                          {/* Status Bar */}
                          <div className="android-status-bar">
                            <span>09:41</span>
                            <div className="android-punch-hole" />
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <span>5G</span>
                              <div className="android-battery" />
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
                              <div className="android-app-icon-wrapper play-mock" style={getMaskStyle(config.previewCornerRadius)} />
                              <span className="android-app-label">Play Store</span>
                            </div>

                            <div className="android-app-item mock">
                              <div className="android-app-icon-wrapper chrome-mock" style={getMaskStyle(config.previewCornerRadius)} />
                              <span className="android-app-label">Chrome</span>
                            </div>

                            <div className="android-app-item mock">
                              <div className="android-app-icon-wrapper gmail-mock" style={getMaskStyle(config.previewCornerRadius)} />
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

                    {/* Samsung Mask Selector Vertically Stacked on Phone's Right Side */}
                    <div className="samsung-vertical-mask-picker">
                      <div className="samsung-mask-title">Maske Tipi</div>
                      {(['circle', 'squircle', 'rounded', 'square'] as CornerRadiusType[]).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          className={`samsung-mask-pill-btn ${config.previewCornerRadius === shape ? 'active' : ''}`}
                          onClick={() => onChangeConfig({ previewCornerRadius: shape })}
                          title={`${shape} maskesi`}
                        >
                          <div className={`mask-mini-shape shape-${shape}`} />
                          <span>{shape === 'circle' ? 'Dairesel' : shape === 'squircle' ? 'Squircle' : shape === 'rounded' ? 'Yuvarlak' : 'Kare'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Studio Display Mockup (Web & Mac Dock) */}
                {config.previewDevice === 'web' && (
                  <div
                    className="realistic-device-mockup"
                    style={{
                      position: 'relative',
                      width: '680px',
                      maxWidth: '100%',
                      filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.28))',
                      display: 'inline-block',
                    }}
                  >
                    {/* Screen Content Layer */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '2.69%',
                        left: '2.07%',
                        width: '95.85%',
                        height: '70.58%',
                        zIndex: 1,
                        borderRadius: '0px',
                        overflow: 'hidden',
                        backgroundColor: '#000000',
                      }}
                    >
                      <div className={`studio-display-screen ${config.previewDarkMode ? 'dark-macos' : 'light-macos'}`}>
                        {/* macOS Top Menu Bar */}
                        <div className="macos-menu-bar">
                          <div className="menu-bar-left">
                            <img src={appleSvg} alt="Apple" className="macos-apple-logo" />
                            <span className="menu-item app-title">{config.appName || 'Uygulama'}</span>
                            <span className="menu-item">Dosya</span>
                            <span className="menu-item">Düzen</span>
                            <span className="menu-item">Görünüm</span>
                            <span className="menu-item">Pencere</span>
                            <span className="menu-item">Yardım</span>
                          </div>
                          <div className="menu-bar-right">
                            <span className="menu-time">9:41</span>
                          </div>
                        </div>

                        {/* Desktop Window: Browser with Web App & Favicon */}
                        <div className="studio-desktop-center">
                          <div className="browser-window-frame">
                            <div className="browser-window-header">
                              <div className="window-dots">
                                <span className="dot red" />
                                <span className="dot yellow" />
                                <span className="dot green" />
                              </div>
                              <div className="browser-active-tab">
                                {previewDataUrl ? (
                                  <img src={previewDataUrl} alt="Favicon" className="tab-favicon-img" />
                                ) : (
                                  <Globe size={13} />
                                )}
                                <span className="tab-title">{config.appName || 'Uygulama'} - Web App</span>
                                <span className="tab-close">×</span>
                              </div>
                            </div>
                            <div className="browser-url-bar">
                              <span className="url-lock" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Lock size={11} color="#10B981" />
                              </span>
                              <span className="url-text">https://{config.appName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}.com</span>
                            </div>
                            <div className="browser-content-mock">
                              <div className="browser-content-hero">
                                <div
                                  className="hero-logo-box"
                                  style={getMaskStyle(config.previewCornerRadius)}
                                >
                                  {previewDataUrl && <img src={previewDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                                </div>
                                <h3>{config.appName || 'Uygulama'} Web & PWA</h3>
                                <p>Favicon, Apple Touch Icon ve Web Manifest simgeleri Studio Display'de optimize edildi.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* macOS Dock with Custom App Icon */}
                        <div className="studio-dock-container">
                          <div className="macos-dock-glass">
                            <div className="dock-icon-item finder-mock" title="Finder" />
                            <div className="dock-icon-item safari-mock" title="Safari" />
                            {/* Active User App Icon in Dock */}
                            <div className="dock-icon-item active-user-dock" title={config.appName || 'Uygulama'}>
                              <div
                                className="dock-user-icon"
                                style={getMaskStyle('squircle')}
                              >
                                {previewDataUrl && <img src={previewDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                              </div>
                              <div className="dock-dot" />
                            </div>
                            <div className="dock-icon-item terminal-mock" title="Terminal" />
                            <div className="dock-icon-item trash-mock" title="Çöp Sepeti" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Apple Studio Display Hardware Stand & Bezel Overlay */}
                    <img
                      src="/devices/pc/apple/studio display/Studio Display 2026 On Light Background.png"
                      alt="Studio Display"
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
