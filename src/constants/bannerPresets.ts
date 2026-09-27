import type { BannerPreset, StoreBannerConfig } from '../types/storeBanner';

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: 'google-play-feature',
    name: 'Google Play Öne Çıkan',
    store: 'google-play',
    width: 1024,
    height: 500,
    description: 'Play Store zorunlu öne çıkan grafik (1024×500 px)',
    badge: '1024×500 • Önerilen'
  },
  {
    id: 'google-play-promo',
    name: 'Google Play Küçük Tanıtım',
    store: 'google-play',
    width: 180,
    height: 120,
    description: 'Eski sürüm Android & mini banner (180×120 px)',
    badge: '180×120'
  },
  {
    id: 'appstore-promo',
    name: 'App Store Tanıtım / Event',
    store: 'app-store',
    width: 1920,
    height: 1080,
    description: 'Apple App Store In-App Event & Yatay Banner (1920×1080 px)',
    badge: '1920×1080'
  },
  {
    id: 'appstore-today',
    name: 'App Store Today Sekmesi',
    store: 'app-store',
    width: 1080,
    height: 1350,
    description: 'Apple App Store Today hikaye kartı (1080×1350 px)',
    badge: '1080×1350'
  },
  {
    id: 'social-card',
    name: 'Sosyal Medya / Lansman',
    store: 'social',
    width: 1200,
    height: 630,
    description: 'X (Twitter), LinkedIn, Product Hunt tanıtım kartı (1200×630 px)',
    badge: '1200×630'
  },
  {
    id: 'custom',
    name: 'Özel Boyut',
    store: 'custom',
    width: 1200,
    height: 600,
    description: 'İstediğiniz piksel genişlik ve yüksekliği belirleyin',
    badge: 'Özel'
  },
];

export const BANNER_GRADIENTS = [
  { id: 'chili-blaze', name: 'Chili Blaze', from: '#9B0017', to: '#160205', angle: 135 },
  { id: 'midnight-slate', name: 'Midnight Slate', from: '#1E293B', to: '#090D16', angle: 145 },
  { id: 'cyber-indigo', name: 'Cyber Indigo', from: '#4F46E5', to: '#0F172A', angle: 135 },
  { id: 'electric-violet', name: 'Electric Violet', from: '#7C3AED', to: '#1E1B4B', angle: 140 },
  { id: 'emerald-mint', name: 'Emerald Mint', from: '#059669', to: '#064E3B', angle: 135 },
  { id: 'sunset-amber', name: 'Sunset Amber', from: '#EA580C', to: '#7C2D12', angle: 135 },
  { id: 'obsidian-black', name: 'Obsidian Minimal', from: '#18181B', to: '#09090B', angle: 180 },
  { id: 'ocean-blue', name: 'Deep Ocean', from: '#0284C7', to: '#0C4A6E', angle: 135 },
  { id: 'clean-light', name: 'Clean Light', from: '#F8FAFC', to: '#E2E8F0', angle: 180 },
];

export const INITIAL_BANNER_CONFIG: StoreBannerConfig = {
  preset: 'google-play-feature',
  width: 1024,
  height: 500,
  exportScale: 1,

  bgType: 'gradient',
  bgColor: '#0F172A',
  bgGradient: {
    from: '#1E293B',
    to: '#090D16',
    angle: 135,
    type: 'linear',
  },
  bgPattern: 'mesh-glow',
  bgPatternOpacity: 0.18,
  bgImageUrl: null,
  bgImageBlur: 0,
  bgImageDim: 0.3,

  showAppIcon: true,
  appIconUrl: null,
  appIconSize: 72,
  appIconRadius: 'squircle',

  showEyebrow: true,
  eyebrowText: 'YENİ SÜRÜM YAYINDA',
  eyebrowColor: '#D90429',
  eyebrowBgColor: 'rgba(217, 4, 41, 0.15)',

  showTitle: true,
  titleText: 'Harika Uygulamanız',
  titleFontSize: 46,
  titleFontFamily: 'outfit',
  titleColor: '#FFFFFF',
  titleFontWeight: '800',

  showSubtitle: true,
  subtitleText: 'Tüm işlerinizi kolaylaştıran modern mobil deneyim. Şimdi Google Play ve App Store\'da.',
  subtitleFontSize: 16,
  subtitleFontFamily: 'outfit',
  subtitleColor: '#94A3B8',
  subtitleFontWeight: '400',

  textAlignment: 'left',
  textOffsetX: 52,
  textOffsetY: 0,
  textMaxWidth: 480,

  showStoreBadge: true,
  storeBadgeType: 'google-play',
  showRating: true,
  ratingText: '4.9 ★★★★★ (10K+ Değerlendirme)',
  ratingScore: 4.9,

  deviceCount: 1,
  devices: [
    {
      id: 'banner-dev-1',
      enabled: true,
      deviceType: 'iphone-17-pro-max',
      deviceColor: 'default',
      screenshotUrl: null,
      originalScreenshotUrl: null,
      cropData: null,
      scale: 0.88,
      offsetX: 680,
      offsetY: 280,
      rotation: -12,
      perspectiveY: 0,
      shadowDepth: '3d-floating',
    },
    {
      id: 'banner-dev-2',
      enabled: false,
      deviceType: 'galaxy-s26-ultra',
      deviceColor: 'default',
      screenshotUrl: null,
      originalScreenshotUrl: null,
      cropData: null,
      scale: 0.80,
      offsetX: 820,
      offsetY: 310,
      rotation: 8,
      perspectiveY: 0,
      shadowDepth: 'deep',
    },
  ],
  selectedDeviceId: 'banner-dev-1',
  templateId: 'showcase-modern',
};
