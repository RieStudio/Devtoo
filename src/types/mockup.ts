export type DeviceType = 'iphone16pro' | 'pixel9pro' | 'ipadpro' | 'minimal';

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
  deviceColor: 'natural' | 'dark' | 'silver' | 'gold';
  screenshotUrl: string | null;
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
