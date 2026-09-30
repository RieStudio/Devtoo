import type { BannerPreset, StoreBannerConfig, BannerPresetId, BannerDeviceConfig, TextLayer } from '../types/storeBanner';

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

  shapeLayers: [],
  selectedShapeId: null,
  elementPositions: {
    'app-icon': { x: 388, y: 85 },
    'eyebrow': { x: 476, y: 103 },
    'store-badge': { x: 335, y: 340 },
    'rating': { x: 484, y: 343 },
  },
  selectedElementId: null,

  textLayers: [
    {
      id: 'banner-text-1',
      text: 'Uygulamanız',
      x: 272,
      y: 185,
      fontSize: 42,
      color: '#FFFFFF',
      fontFamily: 'outfit',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      width: 480,
    },
    {
      id: 'banner-text-2',
      text: "Tüm işlerinizi kolaylaştıran modern mobil deneyim. Şimdi Google Play ve App Store'da.",
      x: 232,
      y: 256,
      fontSize: 16,
      color: '#94A3B8',
      fontFamily: 'outfit',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center',
      width: 560,
    },
  ],
  selectedTextId: null,

  showAppIcon: true,
  appIconUrl: null,
  appIconSize: 72,
  appIconRadius: 'squircle',

  showEyebrow: true,
  eyebrowText: 'YENİ SÜRÜM YAYINDA',
  eyebrowColor: '#FFFFFF',
  eyebrowBgColor: '#D90429',

  showTitle: true,
  titleText: 'Uygulamanız',
  titleFontSize: 42,
  titleFontFamily: 'outfit',
  titleColor: '#FFFFFF',
  titleFontWeight: '800',

  showSubtitle: true,
  subtitleText: 'Tüm işlerinizi kolaylaştıran modern mobil deneyim. Şimdi Google Play ve App Store\'da.',
  subtitleFontSize: 16,
  subtitleFontFamily: 'outfit',
  subtitleColor: '#94A3B8',
  subtitleFontWeight: '400',

  textAlignment: 'center',
  textOffsetX: 0,
  textOffsetY: 0,
  textMaxWidth: 480,

  showStoreBadge: true,
  storeBadgeType: 'google-play',
  showRating: true,
  ratingText: '4.9 ★★★★★ (10K+ Değerlendirme)',
  ratingScore: 4.9,
  ratingStarColor: '#F59E0B',
  ratingBgColor: 'rgba(255, 255, 255, 0.12)',
  ratingTextColor: '#F8FAFC',

  deviceCount: 0,
  devices: [],
  selectedDeviceId: null,
};

export const getPresetLayoutPatch = (
  presetId: BannerPresetId,
  _currentDevices?: BannerDeviceConfig[],
  currentTextLayers?: TextLayer[]
): Partial<StoreBannerConfig> => {
  const getCleanTitle = () => {
    const raw = currentTextLayers?.[0]?.text;
    if (!raw || raw === 'Harika Uygulamanız') return 'Uygulamanız';
    return raw;
  };
  const getCleanSubtitle = () => {
    return currentTextLayers?.[1]?.text || "Tüm işlerinizi kolaylaştıran modern mobil deneyim. Şimdi Google Play ve App Store'da.";
  };

  switch (presetId) {
    case 'google-play-feature':
      return {
        preset: 'google-play-feature',
        width: 1024,
        height: 500,
        textAlignment: 'center',
        textOffsetX: 0,
        textOffsetY: 0,
        textMaxWidth: 480,
        titleFontSize: 42,
        subtitleFontSize: 16,
        appIconSize: 72,
        showStoreBadge: true,
        storeBadgeType: 'google-play',
        showRating: true,
        deviceCount: 0,
        devices: [],
        selectedDeviceId: null,
        elementPositions: {
          'app-icon': { x: 388, y: 85 },
          'eyebrow': { x: 476, y: 103 },
          'store-badge': { x: 335, y: 340 },
          'rating': { x: 484, y: 343 },
        },
        textLayers: [
          {
            id: currentTextLayers?.[0]?.id || 'banner-text-1',
            text: getCleanTitle(),
            x: 272,
            y: 185,
            fontSize: 42,
            color: currentTextLayers?.[0]?.color || '#FFFFFF',
            fontFamily: currentTextLayers?.[0]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[0]?.isBold ?? true,
            isItalic: currentTextLayers?.[0]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[0]?.isUnderline ?? false,
            textAlign: 'center',
            width: 480,
          },
          {
            id: currentTextLayers?.[1]?.id || 'banner-text-2',
            text: getCleanSubtitle(),
            x: 232,
            y: 256,
            fontSize: 16,
            color: currentTextLayers?.[1]?.color || '#94A3B8',
            fontFamily: currentTextLayers?.[1]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[1]?.isBold ?? false,
            isItalic: currentTextLayers?.[1]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[1]?.isUnderline ?? false,
            textAlign: 'center',
            width: 560,
          },
        ],
      };

    case 'appstore-promo':
      return {
        preset: 'appstore-promo',
        width: 1920,
        height: 1080,
        textAlignment: 'center',
        textOffsetX: 0,
        textOffsetY: 0,
        textMaxWidth: 860,
        titleFontSize: 64,
        subtitleFontSize: 22,
        appIconSize: 96,
        showStoreBadge: true,
        storeBadgeType: 'app-store',
        showRating: true,
        deviceCount: 0,
        devices: [],
        selectedDeviceId: null,
        elementPositions: {
          'app-icon': { x: 812, y: 220 },
          'eyebrow': { x: 928, y: 247 },
          'store-badge': { x: 768, y: 610 },
          'rating': { x: 931, y: 613 },
        },
        textLayers: [
          {
            id: currentTextLayers?.[0]?.id || 'banner-text-1',
            text: getCleanTitle(),
            x: 630,
            y: 370,
            fontSize: 64,
            color: currentTextLayers?.[0]?.color || '#FFFFFF',
            fontFamily: currentTextLayers?.[0]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[0]?.isBold ?? true,
            isItalic: currentTextLayers?.[0]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[0]?.isUnderline ?? false,
            textAlign: 'center',
            width: 660,
          },
          {
            id: currentTextLayers?.[1]?.id || 'banner-text-2',
            text: getCleanSubtitle(),
            x: 540,
            y: 480,
            fontSize: 22,
            color: currentTextLayers?.[1]?.color || '#94A3B8',
            fontFamily: currentTextLayers?.[1]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[1]?.isBold ?? false,
            isItalic: currentTextLayers?.[1]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[1]?.isUnderline ?? false,
            textAlign: 'center',
            width: 840,
          },
        ],
      };

    case 'appstore-today':
      return {
        preset: 'appstore-today',
        width: 1080,
        height: 1350,
        textAlignment: 'center',
        textOffsetX: 0,
        textOffsetY: 0,
        textMaxWidth: 780,
        titleFontSize: 56,
        subtitleFontSize: 20,
        appIconSize: 100,
        showStoreBadge: true,
        storeBadgeType: 'app-store',
        showRating: true,
        deviceCount: 0,
        devices: [],
        selectedDeviceId: null,
        elementPositions: {
          'app-icon': { x: 396, y: 340 },
          'eyebrow': { x: 514, y: 372 },
          'store-badge': { x: 349, y: 740 },
          'rating': { x: 510, y: 743 },
        },
        textLayers: [
          {
            id: currentTextLayers?.[0]?.id || 'banner-text-1',
            text: getCleanTitle(),
            x: 260,
            y: 490,
            fontSize: 56,
            color: currentTextLayers?.[0]?.color || '#FFFFFF',
            fontFamily: currentTextLayers?.[0]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[0]?.isBold ?? true,
            isItalic: currentTextLayers?.[0]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[0]?.isUnderline ?? false,
            textAlign: 'center',
            width: 560,
          },
          {
            id: currentTextLayers?.[1]?.id || 'banner-text-2',
            text: getCleanSubtitle(),
            x: 190,
            y: 590,
            fontSize: 20,
            color: currentTextLayers?.[1]?.color || '#94A3B8',
            fontFamily: currentTextLayers?.[1]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[1]?.isBold ?? false,
            isItalic: currentTextLayers?.[1]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[1]?.isUnderline ?? false,
            textAlign: 'center',
            width: 700,
          },
        ],
      };

    case 'custom':
    default:
      return {
        preset: 'custom',
        width: 1200,
        height: 600,
        textAlignment: 'center',
        textOffsetX: 0,
        textOffsetY: 0,
        textMaxWidth: 680,
        titleFontSize: 46,
        subtitleFontSize: 17,
        appIconSize: 80,
        showStoreBadge: true,
        showRating: true,
        deviceCount: 0,
        devices: [],
        selectedDeviceId: null,
        elementPositions: {
          'app-icon': { x: 472, y: 110 },
          'eyebrow': { x: 568, y: 132 },
          'store-badge': { x: 423, y: 400 },
          'rating': { x: 572, y: 403 },
        },
        textLayers: [
          {
            id: currentTextLayers?.[0]?.id || 'banner-text-1',
            text: getCleanTitle(),
            x: 340,
            y: 220,
            fontSize: 46,
            color: currentTextLayers?.[0]?.color || '#FFFFFF',
            fontFamily: currentTextLayers?.[0]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[0]?.isBold ?? true,
            isItalic: currentTextLayers?.[0]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[0]?.isUnderline ?? false,
            textAlign: 'center',
            width: 520,
          },
          {
            id: currentTextLayers?.[1]?.id || 'banner-text-2',
            text: getCleanSubtitle(),
            x: 270,
            y: 300,
            fontSize: 17,
            color: currentTextLayers?.[1]?.color || '#94A3B8',
            fontFamily: currentTextLayers?.[1]?.fontFamily || 'outfit',
            isBold: currentTextLayers?.[1]?.isBold ?? false,
            isItalic: currentTextLayers?.[1]?.isItalic ?? false,
            isUnderline: currentTextLayers?.[1]?.isUnderline ?? false,
            textAlign: 'center',
            width: 660,
          },
        ],
      };
  }
};
