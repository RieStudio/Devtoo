export type IconPlatform = 'ios' | 'android';

export type CornerRadiusType = 'squircle' | 'circle' | 'rounded' | 'square';

export type PreviewTab = 'device-preview' | 'all-sizes';

export interface IconSizeSpec {
  id: string;
  name: string;
  platform: IconPlatform;
  width: number;
  height: number;
  scale?: string; // e.g. '1x', '2x', '3x'
  idiom?: string; // e.g. 'iphone', 'ipad', 'ios-marketing', 'universal', 'watch'
  folder: string; // e.g. 'ios/AppIcon.appiconset', 'android/res/mipmap-xxxhdpi'
  fileName: string; // e.g. 'AppIcon-60@3x.png', 'ic_launcher.png'
  description: string;
  isRound?: boolean;
}

export interface IconResizerConfig {
  sourceImageUrl: string | null;
  sourceImageName: string;
  sourceImageWidth: number;
  sourceImageHeight: number;
  appName: string;
  bgColor: string; // Hex color
  isTransparentBg: boolean;
  paddingPercent: number; // 0 to 40%
  previewCornerRadius: CornerRadiusType;
  selectedPlatforms: {
    ios: boolean;
    android: boolean;
  };
  previewDevice: 'iphone' | 'android';
  previewDarkMode: boolean;
}
