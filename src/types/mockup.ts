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

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: number;
  rotation?: number;
  width?: number;
}

export interface CanvasDeviceItem {
  id: string;
  deviceType: DeviceType;
  deviceColor: string;
  screenshotUrl: string | null;
  originalScreenshotUrl?: string | null;
  cropData?: { unit: string; x: number; y: number; width: number; height: number } | null;
  screenshotScale: number;
  screenshotOffsetX: number;
  screenshotOffsetY: number;
  deviceScale: number;
  deviceOffsetX: number;
  deviceOffsetY: number;
  deviceRotation?: number;
  borderRadius?: number;
  shadowDepth?: 'none' | 'soft' | 'medium' | 'dramatic' | 'chili-glow';
}

export interface MockupConfig {
  // Screen Unique Identifier
  id?: string;
  screenTitle?: string;

  // Output Mode: Full visual or only standalone device (transparent PNG)
  exportMode: 'full-canvas' | 'device-only';

  // Canvas settings
  preset: AspectRatioPreset;
  width: number;
  height: number;
  
  // Background settings
  bgType: BackgroundType;
  bgColor: string;
  patternOpacity: number;
  
  // Frame & Image settings (Primary / default device for single-device fallback)
  deviceType: DeviceType;
  deviceColor: string;
  screenshotUrl: string | null;
  originalScreenshotUrl?: string | null;
  cropData?: { unit: string; x: number; y: number; width: number; height: number } | null;
  screenshotScale: number;
  screenshotOffsetX: number;
  screenshotOffsetY: number;
  
  // Device positioning & scaling on canvas
  deviceScale: number;
  deviceOffsetX: number;
  deviceOffsetY: number;
  deviceRotation?: number;

  // Multi-Device support
  devices?: CanvasDeviceItem[];
  selectedDeviceId?: string | null;

  // Layout & Padding
  padding: number;
  borderRadius: number;
  shadowDepth: 'none' | 'soft' | 'medium' | 'dramatic' | 'chili-glow';
  frameRotation: number;
  
  // Multi-Text Layers
  showHeadline: boolean;
  textLayers: TextLayer[];
  selectedTextId: string | null;
  selectedTextIds?: string[];
  
  // Export scale
  exportScale: 1 | 2 | 3;
}

/**
 * Normalizes a MockupConfig to always return an array of CanvasDeviceItem.
 * If config.devices is explicitly provided (including empty array []), it returns it.
 * Ensures seamless backward compatibility with legacy single-device configs when config.devices is undefined.
 */
export function getMockupDevices(config: MockupConfig): CanvasDeviceItem[] {
  if (config.devices !== undefined) {
    return config.devices;
  }
  return [
    {
      id: 'device-primary',
      deviceType: config.deviceType,
      deviceColor: config.deviceColor || 'default',
      screenshotUrl: config.screenshotUrl,
      originalScreenshotUrl: config.originalScreenshotUrl,
      cropData: config.cropData,
      screenshotScale: config.screenshotScale ?? 1,
      screenshotOffsetX: config.screenshotOffsetX ?? 0,
      screenshotOffsetY: config.screenshotOffsetY ?? 0,
      deviceScale: config.deviceScale ?? 1,
      deviceOffsetX: config.deviceOffsetX ?? 0,
      deviceOffsetY: config.deviceOffsetY ?? 0,
      deviceRotation: config.deviceRotation ?? 0,
      borderRadius: config.borderRadius ?? 24,
      shadowDepth: config.shadowDepth ?? 'medium',
    },
  ];
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
