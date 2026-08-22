export type DeviceType = 
  | 'iphone-17'
  | 'iphone-17-pro'
  | 'iphone-17-pro-max' 
  | 'galaxy-s26-ultra' 
  | 'pixel-10'
  | 'pixel-10-pro';

export type DeviceBrand = 'apple' | 'samsung' | 'google';

export type AspectRatioPreset = 'appstore-6.7' | 'appstore-6.5' | 'playstore-portrait' | 'game-landscape' | 'square' | 'custom';

export type BackgroundType = 'solid' | 'dots' | 'grid';

export interface CanvasPreset {
  id: AspectRatioPreset;
  name: string;
  width: number;
  height: number;
  subtitle: string;
  category: 'iOS App Store' | 'Google Play' | 'Mobile Game' | 'Social';
}

export interface DeviceModelInfo {
  id: DeviceType;
  brand: DeviceBrand;
  name: string;
  tag: string;
  defaultRatio: number;
  colors: { id: string; name: string; hex: string; borderHex: string }[];
}

export interface MockupConfig {
  // Canvas settings
  preset: AspectRatioPreset;
  width: number;
  height: number;
  
  // Background settings
  bgType: BackgroundType;
  bgColor: string;
  patternOpacity: number;
  
  // Frame & Image settings
  deviceType: DeviceType;
  deviceColor: string;
  screenshotUrl: string | null;
  originalScreenshotUrl?: string | null;
  cropData?: { unit: string; x: number; y: number; width: number; height: number } | null;
  screenshotScale: number;
  screenshotOffsetX: number;
  screenshotOffsetY: number;
  
  // Layout & Padding
  padding: number;
  borderRadius: number;
  shadowDepth: 'none' | 'soft' | 'medium' | 'dramatic' | 'chili-glow';
  frameRotation: number;
  
  // Store Headline / Typography
  showHeadline: boolean;
  headlineText: string;
  subtitleText: string;
  textColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  textPosition: 'top' | 'bottom';
  
  // Export scale
  exportScale: 1 | 2 | 3;
}

export interface ToolItem {
  id: string;
  name: string;
  category: 'Geliştirici Araçları' | 'Mağaza & Tasarım' | 'Kod & Yardımcılar';
  icon: string;
  isAvailable: boolean;
  badge?: string;
  description: string;
}
