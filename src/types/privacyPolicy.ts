export type AppType = 'game' | 'app';

export type MonetizationType = 'free-ads' | 'free-iap' | 'free-ads-iap' | 'paid' | 'free-clean';

export type ThirdPartyServiceId = 
  | 'admob'
  | 'unity-ads'
  | 'applovin'
  | 'firebase-analytics'
  | 'firebase-crashlytics'
  | 'revenuecat'
  | 'google-play-games'
  | 'apple-game-center'
  | 'onesignal'
  | 'meta-audience-network';

export interface ThirdPartyService {
  id: ThirdPartyServiceId;
  name: string;
  category: 'ads' | 'analytics' | 'iap' | 'gaming' | 'notifications';
  privacyUrl: string;
  description: string;
  dataSafetyNotes: string;
}

export interface PrivacyPolicyConfig {
  // Temel Bilgiler
  appName: string;
  companyName: string;
  contactEmail: string;
  effectiveDate: string;
  appType: AppType;
  monetization: MonetizationType;

  // Platformlar
  platforms: {
    android: boolean;
    ios: boolean;
  };

  // Üçüncü Taraf SDK'lar
  services: Record<ThirdPartyServiceId, boolean>;

  // Kullanıcı Verileri & İzinler
  features: {
    hasUserAccounts: boolean;
    hasAccountDeletionUrl: boolean;
    accountDeletionUrl?: string;
    hasCameraPermission: boolean;
    hasLocationPermission: boolean;
    hasPhotoLibraryPermission: boolean;
    isTargetingChildren: boolean; // COPPA / Aileler Politikası (13 yaş altı)
    collectsAnalytics: boolean;
    collectsCrashLogs: boolean;
  };

  // Dil & Çıktı Ayarı
  language: 'tr' | 'en';
}

export interface DataSafetyCheckItem {
  id: string;
  question: string;
  answer: 'EVET' | 'HAYIR' | 'SEÇİLEN SERVİSLERE BAĞLI';
  badgeType: 'yes' | 'no' | 'conditional';
  explanation: string;
  details?: string[];
}
