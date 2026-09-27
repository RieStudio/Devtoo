export type BannerPresetId = 
  | 'google-play-feature' 
  | 'google-play-promo'
  | 'appstore-promo' 
  | 'appstore-today' 
  | 'social-card' 
  | 'custom';

export interface BannerPreset {
  id: BannerPresetId;
  name: string;
  store: 'google-play' | 'app-store' | 'social' | 'custom';
  width: number;
  height: number;
  description: string;
  badge?: string;
}

export type BannerBgType = 'gradient' | 'solid' | 'image';

export type BannerPattern = 'none' | 'dots' | 'mesh-glow' | 'diagonal-stripes' | 'grid' | 'circles';

export interface BannerDeviceConfig {
  id: string;
  enabled: boolean;
  deviceType: string;
  deviceColor: string;
  screenshotUrl: string | null;
  originalScreenshotUrl?: string | null;
  cropData?: any;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  perspectiveY: number; // 3D tilt
  shadowDepth: 'none' | 'soft' | 'medium' | 'deep' | '3d-floating';
}

export interface StoreBannerConfig {
  // Canvas Size
  preset: BannerPresetId;
  width: number;
  height: number;
  exportScale: number;

  // Background
  bgType: BannerBgType;
  bgColor: string;
  bgGradient: {
    from: string;
    to: string;
    angle: number;
    type: 'linear' | 'radial';
  };
  bgPattern: BannerPattern;
  bgPatternOpacity: number;
  bgImageUrl: string | null;
  bgImageBlur: number;
  bgImageDim: number;

  // Branding App Icon
  showAppIcon: boolean;
  appIconUrl: string | null;
  appIconSize: number;
  appIconRadius: 'squircle' | 'round' | 'circle';

  // Typography
  showEyebrow: boolean;
  eyebrowText: string;
  eyebrowColor: string;
  eyebrowBgColor: string;

  showTitle: boolean;
  titleText: string;
  titleFontSize: number;
  titleFontFamily: string;
  titleColor: string;
  titleFontWeight: '600' | '700' | '800' | '900';

  showSubtitle: boolean;
  subtitleText: string;
  subtitleFontSize: number;
  subtitleFontFamily: string;
  subtitleColor: string;
  subtitleFontWeight: '400' | '500' | '600';

  textAlignment: 'left' | 'center' | 'right';
  textOffsetX: number;
  textOffsetY: number;
  textMaxWidth: number;

  // Trust Badges & Ratings
  showStoreBadge: boolean;
  storeBadgeType: 'google-play' | 'app-store' | 'both';
  showRating: boolean;
  ratingText: string;
  ratingScore: number;

  // Devices (up to 2)
  deviceCount: 0 | 1 | 2;
  devices: [BannerDeviceConfig, BannerDeviceConfig];
  selectedDeviceId: string;

  // Layout template tag
  templateId?: string;
}
