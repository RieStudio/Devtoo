import type { IconSizeSpec } from '../types/iconResizer';

export const IOS_ICON_SIZES: IconSizeSpec[] = [
  // App Store & Universal
  {
    id: 'ios-1024',
    name: 'App Store Marketing',
    platform: 'ios',
    width: 1024,
    height: 1024,
    scale: '1x',
    idiom: 'ios-marketing',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-1024.png',
    description: 'App Store mağaza simgesi (1024x1024 px)',
  },
  // iPhone App
  {
    id: 'ios-180',
    name: 'iPhone App (3x)',
    platform: 'ios',
    width: 180,
    height: 180,
    scale: '3x',
    idiom: 'iphone',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-60@3x.png',
    description: 'iPhone ana ekran simgesi (60pt @3x)',
  },
  {
    id: 'ios-120',
    name: 'iPhone App (2x)',
    platform: 'ios',
    width: 120,
    height: 120,
    scale: '2x',
    idiom: 'iphone',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-60@2x.png',
    description: 'iPhone ana ekran simgesi (60pt @2x)',
  },
  // iPad App
  {
    id: 'ios-167',
    name: 'iPad Pro App',
    platform: 'ios',
    width: 167,
    height: 167,
    scale: '2x',
    idiom: 'ipad',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-83.5@2x.png',
    description: 'iPad Pro ana ekran (83.5pt @2x)',
  },
  {
    id: 'ios-152',
    name: 'iPad App (2x)',
    platform: 'ios',
    width: 152,
    height: 152,
    scale: '2x',
    idiom: 'ipad',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-76@2x.png',
    description: 'iPad ana ekran simgesi (76pt @2x)',
  },
  {
    id: 'ios-76',
    name: 'iPad App (1x)',
    platform: 'ios',
    width: 76,
    height: 76,
    scale: '1x',
    idiom: 'ipad',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-76.png',
    description: 'iPad ana ekran simgesi (76pt @1x)',
  },
  // Spotlight
  {
    id: 'ios-spotlight-120',
    name: 'Spotlight Arama (3x)',
    platform: 'ios',
    width: 120,
    height: 120,
    scale: '3x',
    idiom: 'iphone',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-40@3x.png',
    description: 'Spotlight arama simgesi (40pt @3x)',
  },
  {
    id: 'ios-spotlight-80',
    name: 'Spotlight Arama (2x)',
    platform: 'ios',
    width: 80,
    height: 80,
    scale: '2x',
    idiom: 'universal',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-40@2x.png',
    description: 'Spotlight arama simgesi (40pt @2x)',
  },
  {
    id: 'ios-spotlight-40',
    name: 'Spotlight Arama (1x)',
    platform: 'ios',
    width: 40,
    height: 40,
    scale: '1x',
    idiom: 'ipad',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-40.png',
    description: 'Spotlight arama simgesi (40pt @1x)',
  },
  // Settings
  {
    id: 'ios-settings-87',
    name: 'Ayarlar (3x)',
    platform: 'ios',
    width: 87,
    height: 87,
    scale: '3x',
    idiom: 'iphone',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-29@3x.png',
    description: 'Ayarlar menü simgesi (29pt @3x)',
  },
  {
    id: 'ios-settings-58',
    name: 'Ayarlar (2x)',
    platform: 'ios',
    width: 58,
    height: 58,
    scale: '2x',
    idiom: 'universal',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-29@2x.png',
    description: 'Ayarlar menü simgesi (29pt @2x)',
  },
  {
    id: 'ios-settings-29',
    name: 'Ayarlar (1x)',
    platform: 'ios',
    width: 29,
    height: 29,
    scale: '1x',
    idiom: 'ipad',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-29.png',
    description: 'Ayarlar menü simgesi (29pt @1x)',
  },
  // Notification
  {
    id: 'ios-notif-60',
    name: 'Bildirimler (3x)',
    platform: 'ios',
    width: 60,
    height: 60,
    scale: '3x',
    idiom: 'iphone',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-20@3x.png',
    description: 'Bildirim simgesi (20pt @3x)',
  },
  {
    id: 'ios-notif-40',
    name: 'Bildirimler (2x)',
    platform: 'ios',
    width: 40,
    height: 40,
    scale: '2x',
    idiom: 'universal',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-20@2x.png',
    description: 'Bildirim simgesi (20pt @2x)',
  },
  {
    id: 'ios-notif-20',
    name: 'Bildirimler (1x)',
    platform: 'ios',
    width: 20,
    height: 20,
    scale: '1x',
    idiom: 'ipad',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-20.png',
    description: 'Bildirim simgesi (20pt @1x)',
  },
  // macOS & watchOS essentials
  {
    id: 'macos-512',
    name: 'macOS App Icon',
    platform: 'ios',
    width: 512,
    height: 512,
    scale: '1x',
    idiom: 'mac',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-512.png',
    description: 'macOS Dock ve Finder simgesi (512x512)',
  },
  {
    id: 'macos-256',
    name: 'macOS App Icon (Small)',
    platform: 'ios',
    width: 256,
    height: 256,
    scale: '1x',
    idiom: 'mac',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'AppIcon-256.png',
    description: 'macOS simgesi (256x256)',
  },
  {
    id: 'watchos-1024',
    name: 'Apple Watch App Store',
    platform: 'ios',
    width: 1024,
    height: 1024,
    scale: '1x',
    idiom: 'watch-marketing',
    folder: 'ios/AppIcon.appiconset',
    fileName: 'WatchAppIcon-1024.png',
    description: 'Apple Watch App Store simgesi',
  },
];

export const ANDROID_ICON_SIZES: IconSizeSpec[] = [
  // Google Play Store
  {
    id: 'android-playstore',
    name: 'Google Play Store',
    platform: 'android',
    width: 512,
    height: 512,
    folder: 'android',
    fileName: 'playstore-icon.png',
    description: 'Google Play Console mağaza simgesi (512x512 px)',
  },
  // mipmap xxxhdpi
  {
    id: 'android-xxxhdpi',
    name: 'Launcher xxxhdpi (192px)',
    platform: 'android',
    width: 192,
    height: 192,
    folder: 'android/res/mipmap-xxxhdpi',
    fileName: 'ic_launcher.png',
    description: 'Ekstra yüksek yoğunluklu ekranlar (xxxhdpi)',
  },
  {
    id: 'android-xxxhdpi-round',
    name: 'Launcher xxxhdpi Round',
    platform: 'android',
    width: 192,
    height: 192,
    folder: 'android/res/mipmap-xxxhdpi',
    fileName: 'ic_launcher_round.png',
    isRound: true,
    description: 'Dairesel simge destekli başlatıcılar (xxxhdpi)',
  },
  // mipmap xxhdpi
  {
    id: 'android-xxhdpi',
    name: 'Launcher xxhdpi (144px)',
    platform: 'android',
    width: 144,
    height: 144,
    folder: 'android/res/mipmap-xxhdpi',
    fileName: 'ic_launcher.png',
    description: 'Yüksek yoğunluklu ekranlar (xxhdpi)',
  },
  {
    id: 'android-xxhdpi-round',
    name: 'Launcher xxhdpi Round',
    platform: 'android',
    width: 144,
    height: 144,
    folder: 'android/res/mipmap-xxhdpi',
    fileName: 'ic_launcher_round.png',
    isRound: true,
    description: 'Dairesel simge destekli başlatıcılar (xxhdpi)',
  },
  // mipmap xhdpi
  {
    id: 'android-xhdpi',
    name: 'Launcher xhdpi (96px)',
    platform: 'android',
    width: 96,
    height: 96,
    folder: 'android/res/mipmap-xhdpi',
    fileName: 'ic_launcher.png',
    description: 'Orta-yüksek yoğunluklu ekranlar (xhdpi)',
  },
  {
    id: 'android-xhdpi-round',
    name: 'Launcher xhdpi Round',
    platform: 'android',
    width: 96,
    height: 96,
    folder: 'android/res/mipmap-xhdpi',
    fileName: 'ic_launcher_round.png',
    isRound: true,
    description: 'Dairesel simge destekli başlatıcılar (xhdpi)',
  },
  // mipmap hdpi
  {
    id: 'android-hdpi',
    name: 'Launcher hdpi (72px)',
    platform: 'android',
    width: 72,
    height: 72,
    folder: 'android/res/mipmap-hdpi',
    fileName: 'ic_launcher.png',
    description: 'Yüksek çözünürlüklü ekranlar (hdpi)',
  },
  {
    id: 'android-hdpi-round',
    name: 'Launcher hdpi Round',
    platform: 'android',
    width: 72,
    height: 72,
    folder: 'android/res/mipmap-hdpi',
    fileName: 'ic_launcher_round.png',
    isRound: true,
    description: 'Dairesel simge destekli başlatıcılar (hdpi)',
  },
  // mipmap mdpi
  {
    id: 'android-mdpi',
    name: 'Launcher mdpi (48px)',
    platform: 'android',
    width: 48,
    height: 48,
    folder: 'android/res/mipmap-mdpi',
    fileName: 'ic_launcher.png',
    description: 'Standart temel ekranlar (mdpi)',
  },
  {
    id: 'android-mdpi-round',
    name: 'Launcher mdpi Round',
    platform: 'android',
    width: 48,
    height: 48,
    folder: 'android/res/mipmap-mdpi',
    fileName: 'ic_launcher_round.png',
    isRound: true,
    description: 'Dairesel simge destekli başlatıcılar (mdpi)',
  },
];

export const WEB_ICON_SIZES: IconSizeSpec[] = [
  {
    id: 'web-512',
    name: 'PWA Android Chrome (512px)',
    platform: 'web',
    width: 512,
    height: 512,
    folder: 'web',
    fileName: 'android-chrome-512x512.png',
    description: 'Web Manifest & PWA büyük açılış simgesi',
  },
  {
    id: 'web-192',
    name: 'PWA Android Chrome (192px)',
    platform: 'web',
    width: 192,
    height: 192,
    folder: 'web',
    fileName: 'android-chrome-192x192.png',
    description: 'Web Manifest ana ekran simgesi',
  },
  {
    id: 'web-apple-touch',
    name: 'Apple Touch Icon (180px)',
    platform: 'web',
    width: 180,
    height: 180,
    folder: 'web',
    fileName: 'apple-touch-icon.png',
    description: 'Safari ana ekrana ekle simgesi',
  },
  {
    id: 'web-favicon-48',
    name: 'Favicon (48px)',
    platform: 'web',
    width: 48,
    height: 48,
    folder: 'web',
    fileName: 'favicon-48x48.png',
    description: 'Yüksek çözünürlüklü tarayıcı sekme simgesi',
  },
  {
    id: 'web-favicon-32',
    name: 'Favicon (32px)',
    platform: 'web',
    width: 32,
    height: 32,
    folder: 'web',
    fileName: 'favicon-32x32.png',
    description: 'Standart masaüstü tarayıcı sekme simgesi',
  },
  {
    id: 'web-favicon-16',
    name: 'Favicon (16px)',
    platform: 'web',
    width: 16,
    height: 16,
    folder: 'web',
    fileName: 'favicon-16x16.png',
    description: 'Küçük tarayıcı sekme ve yer imi simgesi',
  },
];

export const ALL_ICON_SIZES: IconSizeSpec[] = [
  ...IOS_ICON_SIZES,
  ...ANDROID_ICON_SIZES,
  ...WEB_ICON_SIZES,
];

/**
 * Generates Xcode compatible Contents.json for AppIcon.appiconset
 */
export function generateXcodeContentsJson(specs: IconSizeSpec[]): string {
  const images = specs
    .filter((s) => s.platform === 'ios')
    .map((s) => {
      // Parse pt size e.g. "60x60" or "83.5x83.5"
      const ptSize = s.scale === '3x' 
        ? `${s.width / 3}x${s.height / 3}` 
        : s.scale === '2x' 
        ? `${s.width / 2}x${s.height / 2}` 
        : `${s.width}x${s.height}`;
      
      return {
        size: ptSize,
        idiom: s.idiom || 'universal',
        filename: s.fileName,
        scale: s.scale || '1x',
      };
    });

  const contents = {
    images,
    info: {
      version: 1,
      author: 'Devtoo App Icon Resizer',
    },
  };

  return JSON.stringify(contents, null, 2);
}

/**
 * HTML head snippet generator for Web icons
 */
export function generateWebHtmlSnippet(): string {
  return `<!-- Devtoo App Icon Resizer - Web & Favicon Tags -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#FFFFFF">`;
}
