import type { DeviceModelInfo } from '../types/mockup';

export interface DeviceCutoutSpec {
  top: string;
  left: string;
  width: string;
  height: string;
  radiusRatio: number;
  topOnlyRadius?: boolean;
}

export const DEVICE_CUTOUTS: Record<string, DeviceCutoutSpec> = {
  // PHONES
  'iphone-17-pro-max': { top: '1.25%', left: '3.34%', width: '93.57%', height: '97.50%', radiusRatio: 0.14036 },
  'iphone-17-pro': { top: '1.25%', left: '3.34%', width: '93.57%', height: '97.50%', radiusRatio: 0.14036 },
  'iphone-17': { top: '1.25%', left: '3.09%', width: '93.81%', height: '97.50%', radiusRatio: 0.14072 },
  'galaxy-s26-ultra': { top: '0.88%', left: '2.08%', width: '95.32%', height: '98.12%', radiusRatio: 0.06208 },
  'pixel-10-pro': { top: '1.38%', left: '2.89%', width: '93.16%', height: '97.12%', radiusRatio: 0.11684 },
  'pixel-10': { top: '1.88%', left: '3.96%', width: '91.56%', height: '96.25%', radiusRatio: 0.12612 },

  // PC (COMPUTERS & DISPLAYS)
  'macbook-pro': { top: '9.89%', left: '8.92%', width: '82.16%', height: '80.21%', radiusRatio: 0.00962, topOnlyRadius: true },
  'macbook-air': { top: '8.70%', left: '8.79%', width: '82.37%', height: '82.61%', radiusRatio: 0.00963, topOnlyRadius: true },
  'macbook-neo': { top: '13.33%', left: '12.08%', width: '75.84%', height: '73.33%', radiusRatio: 0.01059, topOnlyRadius: true },
  'imac': { top: '3.09%', left: '2.42%', width: '95.17%', height: '63.46%', radiusRatio: 0 },
  'studio-display': { top: '2.69%', left: '2.07%', width: '95.85%', height: '70.58%', radiusRatio: 0 },

  // TABLETS
  'ipad-pro': { top: '4.39%', left: '3.57%', width: '92.87%', height: '91.22%', radiusRatio: 0.01933 },
  'ipad-air': { top: '4.74%', left: '3.59%', width: '92.82%', height: '90.52%', radiusRatio: 0.01262 },
  'ipad-mini': { top: '7.42%', left: '5.02%', width: '89.96%', height: '85.17%', radiusRatio: 0.01741 },
  'ipad': { top: '9.02%', left: '6.67%', width: '86.67%', height: '81.96%', radiusRatio: 0.01732 },

  // TV
  'apple-tv': { top: '3.49%', left: '1.88%', width: '90.33%', height: '79.28%', radiusRatio: 0 },

  // WATCH
  'apple-watch-11': { top: '21.14%', left: '11.79%', width: '76.43%', height: '57.73%', radiusRatio: 0.18286 },
  'apple-watch-ultra-3': { top: '22.50%', left: '13.67%', width: '72.67%', height: '55.00%', radiusRatio: 0.19350 },
};

export const getDeviceBorderRadius = (specs: DeviceCutoutSpec, displayWidth: number): string => {
  if (!specs || specs.radiusRatio <= 0) return '0px';
  const r = Math.round(displayWidth * specs.radiusRatio);
  if (specs.topOnlyRadius) {
    return `${r}px ${r}px 0px 0px`;
  }
  return `${r}px`;
};

export const DEVICE_MODELS: DeviceModelInfo[] = [
  // ==================== PHONE ====================
  {
    id: 'iphone-17-pro-max',
    category: 'phone',
    brand: 'apple',
    name: 'iPhone 17 Pro Max',
    tag: 'Flagship 6.9"',
    defaultRatio: 389 / 800,
    colors: [
      { id: 'default', name: 'Standart', hex: '#2C2B2F', borderHex: '#3E3D42', imagePath: '/devices/phone/apple/iphone-17-pro-max.png' },
    ],
  },
  {
    id: 'iphone-17-pro',
    category: 'phone',
    brand: 'apple',
    name: 'iPhone 17 Pro',
    tag: 'Pro 6.3"',
    defaultRatio: 389 / 800,
    colors: [
      { id: 'default', name: 'Standart', hex: '#2C2B2F', borderHex: '#3E3D42', imagePath: '/devices/phone/apple/iphone-17-pro.png' },
    ],
  },
  {
    id: 'iphone-17',
    category: 'phone',
    brand: 'apple',
    name: 'iPhone 17',
    tag: 'Standard 6.1"',
    defaultRatio: 388 / 800,
    colors: [
      { id: 'default', name: 'Standart', hex: '#2C2B2F', borderHex: '#3E3D42', imagePath: '/devices/phone/apple/iphone-17.png' },
    ],
  },
  {
    id: 'galaxy-s26-ultra',
    category: 'phone',
    brand: 'samsung',
    name: 'Galaxy S26 Ultra',
    tag: 'Armor Frame 6.8"',
    defaultRatio: 385 / 800,
    colors: [
      { id: 'default', name: 'Standart', hex: '#1E1E20', borderHex: '#333336', imagePath: '/devices/phone/samsung/galaxy-s26-ultra.png' },
    ],
  },
  {
    id: 'pixel-10-pro',
    category: 'phone',
    brand: 'google',
    name: 'Pixel 10 Pro',
    tag: 'Tensor Flagship',
    defaultRatio: 380 / 800,
    colors: [
      { id: 'default', name: 'Standart', hex: '#1C1D1F', borderHex: '#303236', imagePath: '/devices/phone/google/pixel-10-pro.png' },
    ],
  },
  {
    id: 'pixel-10',
    category: 'phone',
    brand: 'google',
    name: 'Pixel 10',
    tag: 'Tensor AI',
    defaultRatio: 379 / 800,
    colors: [
      { id: 'default', name: 'Standart', hex: '#1C1D1F', borderHex: '#303236', imagePath: '/devices/phone/google/pixel-10.png' },
    ],
  },

  // ==================== PC (COMPUTERS & DISPLAYS) ====================
  {
    id: 'macbook-pro',
    category: 'pc',
    brand: 'apple',
    name: 'MacBook Pro',
    tag: 'M5 16" Liquid Retina XDR',
    defaultRatio: 1.593,
    colors: [
      { id: 'space-black', name: 'Uzay Siyahı', hex: '#2E2C2F', borderHex: '#1E1E20', imagePath: '/devices/pc/apple/macbook pro/MacBook Pro M5 16-inch Space Black.png' },
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/pc/apple/macbook pro/MacBook Pro M5 16-inch Silver.png' },
    ],
  },
  {
    id: 'macbook-air',
    category: 'pc',
    brand: 'apple',
    name: 'MacBook Air',
    tag: 'M5 15" Liquid Retina',
    defaultRatio: 1.592,
    colors: [
      { id: 'midnight', name: 'Gece Yarısı', hex: '#1B2430', borderHex: '#111827', imagePath: '/devices/pc/apple/macbook air/MacBook Air M5 15-inch Midnight.png' },
      { id: 'starlight', name: 'Yıldız Işığı', hex: '#F0EAD6', borderHex: '#E5DFCB', imagePath: '/devices/pc/apple/macbook air/MacBook Air M5 15-inch Starlight.png' },
      { id: 'sky-blue', name: 'Gök Mavisi', hex: '#C3D4E6', borderHex: '#A3B4C6', imagePath: '/devices/pc/apple/macbook air/MacBook Air M5 15-inch Sky Blue.png' },
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/pc/apple/macbook air/MacBook Air M5 15-inch Silver.png' },
    ],
  },
  {
    id: 'macbook-neo',
    category: 'pc',
    brand: 'apple',
    name: 'MacBook Neo',
    tag: 'Neo Ultraportable',
    defaultRatio: 1.599,
    colors: [
      { id: 'blush', name: 'Allık Pembesi', hex: '#E8B4B8', borderHex: '#D89FA4', imagePath: '/devices/pc/apple/macbook neo/MacBook Neo - Blush.png' },
      { id: 'citrus', name: 'Narenciye', hex: '#E5B842', borderHex: '#CCA033', imagePath: '/devices/pc/apple/macbook neo/MacBook Neo - Citrus.png' },
      { id: 'indigo', name: 'Çivit Mavisi', hex: '#3E4A61', borderHex: '#2E384D', imagePath: '/devices/pc/apple/macbook neo/MacBook Neo - Indigo.png' },
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/pc/apple/macbook neo/MacBook Neo - Silver.png' },
    ],
  },
  {
    id: 'imac',
    category: 'pc',
    brand: 'apple',
    name: 'iMac',
    tag: 'M4 24" 4.5K Retina',
    defaultRatio: 1.778,
    colors: [
      { id: 'blue', name: 'Mavi', hex: '#4E7CA8', borderHex: '#3D6B97', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Blue.png' },
      { id: 'green', name: 'Yeşil', hex: '#708E77', borderHex: '#5F7D66', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Green.png' },
      { id: 'orange', name: 'Turuncu', hex: '#E27649', borderHex: '#CC6538', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Orange.png' },
      { id: 'pink', name: 'Pembe', hex: '#D65D7A', borderHex: '#BF4C69', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Pink.png' },
      { id: 'purple', name: 'Mor', hex: '#8E82A8', borderHex: '#7C7096', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Purple.png' },
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Silver.png' },
      { id: 'yellow', name: 'Sarı', hex: '#F0D153', borderHex: '#DEC042', imagePath: '/devices/pc/apple/imac/iMac M4 24-inch Yellow.png' },
    ],
  },
  {
    id: 'studio-display',
    category: 'pc',
    brand: 'apple',
    name: 'Studio Display',
    tag: '27" 5K Retina Display',
    defaultRatio: 1.778,
    colors: [
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/pc/apple/studio display/Studio Display 2026 On Light Background.png' },
    ],
  },

  // ==================== TABLET ====================
  {
    id: 'ipad-pro',
    category: 'tab',
    brand: 'apple',
    name: 'iPad Pro',
    tag: 'M5 Ultra Retina XDR',
    defaultRatio: 1.333,
    colors: [
      { id: 'space-black', name: 'Uzay Siyahı', hex: '#2E2C2F', borderHex: '#1E1E20', imagePath: '/devices/tab/apple/ipad pro/iPad Pro (M5) 13_ - Space Black - Landscape.png' },
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/tab/apple/ipad pro/iPad Pro (M5) 13_ - Silver - Landscape.png' },
    ],
  },
  {
    id: 'ipad-air',
    category: 'tab',
    brand: 'apple',
    name: 'iPad Air',
    tag: 'M4 13" Liquid Retina',
    defaultRatio: 1.334,
    colors: [
      { id: 'space-gray', name: 'Uzay Grisi', hex: '#4E4F51', borderHex: '#3D3E40', imagePath: '/devices/tab/apple/ipad air/iPad Air 13_ (M4) - Space Gray - Landscape.png' },
      { id: 'starlight', name: 'Yıldız Işığı', hex: '#F0EAD6', borderHex: '#E5DFCB', imagePath: '/devices/tab/apple/ipad air/iPad Air 13_ (M4) - Starlight - Landscape.png' },
      { id: 'blue', name: 'Mavi', hex: '#4E7CA8', borderHex: '#3D6B97', imagePath: '/devices/tab/apple/ipad air/iPad Air 13_ (M4) - Blue - Landscape.png' },
      { id: 'purple', name: 'Mor', hex: '#8E82A8', borderHex: '#7C7096', imagePath: '/devices/tab/apple/ipad air/iPad Air 13_ (M4) - Purple - Landscape.png' },
    ],
  },
  {
    id: 'ipad-mini',
    category: 'tab',
    brand: 'apple',
    name: 'iPad mini',
    tag: 'A17 Pro 8.3" Liquid Retina',
    defaultRatio: 1.523,
    colors: [
      { id: 'space-gray', name: 'Uzay Grisi', hex: '#4E4F51', borderHex: '#3D3E40', imagePath: '/devices/tab/apple/ipad mini/iPad mini (A17 Pro) - Space Gray - Landscape.png' },
      { id: 'starlight', name: 'Yıldız Işığı', hex: '#F0EAD6', borderHex: '#E5DFCB', imagePath: '/devices/tab/apple/ipad mini/iPad mini (A17 Pro) - Starlight - Landscape.png' },
      { id: 'blue', name: 'Mavi', hex: '#4E7CA8', borderHex: '#3D6B97', imagePath: '/devices/tab/apple/ipad mini/iPad mini (A17 Pro) - Blue - Landscape.png' },
      { id: 'purple', name: 'Mor', hex: '#8E82A8', borderHex: '#7C7096', imagePath: '/devices/tab/apple/ipad mini/iPad mini (A17 Pro) - Purple - Landscape.png' },
    ],
  },
  {
    id: 'ipad',
    category: 'tab',
    brand: 'apple',
    name: 'iPad',
    tag: 'A16 10.9" All-Screen',
    defaultRatio: 1.439,
    colors: [
      { id: 'silver', name: 'Gümüş', hex: '#E3E4E6', borderHex: '#CCCCCC', imagePath: '/devices/tab/apple/ipad/iPad (A16) - Silver - Landscape.png' },
      { id: 'blue', name: 'Mavi', hex: '#4E7CA8', borderHex: '#3D6B97', imagePath: '/devices/tab/apple/ipad/iPad (A16) - Blue - Landscape.png' },
      { id: 'pink', name: 'Pembe', hex: '#D65D7A', borderHex: '#BF4C69', imagePath: '/devices/tab/apple/ipad/iPad (A16) - Pink - Landscape.png' },
      { id: 'yellow', name: 'Sarı', hex: '#F0D153', borderHex: '#DEC042', imagePath: '/devices/tab/apple/ipad/iPad (A16) - Yellow - Landscape.png' },
    ],
  },

  // ==================== TV ====================
  {
    id: 'apple-tv',
    category: 'tv',
    brand: 'apple',
    name: 'Apple TV',
    tag: 'Apple TV 4K HDR',
    defaultRatio: 1.778,
    colors: [
      { id: 'default', name: '4K', hex: '#1C1D1F', borderHex: '#303236', imagePath: '/devices/tv/apple/Apple TV - 4K.png' },
    ],
  },

  // ==================== WATCH ====================
  {
    id: 'apple-watch-ultra-3',
    category: 'watch',
    brand: 'apple',
    name: 'Apple Watch Ultra 3',
    tag: '49mm Titanyum Kasa',
    defaultRatio: 0.817,
    colors: [
      { id: 'black-alpine-black', name: 'Siyah Titanyum + Alpine Loop Siyah', hex: '#1E1E20', borderHex: '#111', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Black + Alpine Loop Black.png' },
      { id: 'black-alpine-light-blue', name: 'Siyah Titanyum + Alpine Loop Açık Mavi', hex: '#6C97C2', borderHex: '#111', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Black + Alpine Loop Light Blue.png' },
      { id: 'black-milanese', name: 'Siyah Titanyum + Milanese Loop', hex: '#2E2C2F', borderHex: '#111', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Black + Milanese Loop.png' },
      { id: 'black-ocean-anchor-blue', name: 'Siyah Titanyum + Ocean Band Anchor Blue', hex: '#3E5C76', borderHex: '#111', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Black + Ocean Band Anchor Blue.png' },
      { id: 'black-ocean-black', name: 'Siyah Titanyum + Ocean Band Siyah', hex: '#1B1B1C', borderHex: '#111', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Black + Ocean Band Black.png' },
      { id: 'black-trail-charcoal', name: 'Siyah Titanyum + Trail Loop Charcoal', hex: '#383838', borderHex: '#111', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Black + Trail Loop Black Charcoal.png' },
      { id: 'natural-alpine-light-blue', name: 'Natürel Titanyum + Alpine Loop Açık Mavi', hex: '#6C97C2', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Alpine Loop Light Blue.png' },
      { id: 'natural-alpine-terra-cotta', name: 'Natürel Titanyum + Alpine Loop Terra Cotta', hex: '#DE7143', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Alpine Loop Terra Cotta.png' },
      { id: 'natural-milanese', name: 'Natürel Titanyum + Milanese Loop', hex: '#D5CEC5', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Milanese Loop.png' },
      { id: 'natural-ocean-anchor-blue', name: 'Natürel Titanyum + Ocean Band Anchor Blue', hex: '#3E5C76', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Ocean Band Anchor Blue.png' },
      { id: 'natural-ocean-neon-green', name: 'Natürel Titanyum + Ocean Band Neon Yeşil', hex: '#65A30D', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Ocean Band Neon Green.png' },
      { id: 'natural-trail-blue', name: 'Natürel Titanyum + Trail Loop Mavi', hex: '#2563EB', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Trail Loop Blue Bright Blue.png' },
      { id: 'natural-trail-green', name: 'Natürel Titanyum + Trail Loop Yeşil', hex: '#16A34A', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch ultra/AW Ultra 3 - Natural + Trail Loop Green Neon.png' },
    ],
  },
  {
    id: 'apple-watch-11',
    category: 'watch',
    brand: 'apple',
    name: 'Apple Watch 11',
    tag: '46mm Series 11 Kasa',
    defaultRatio: 0.834,
    colors: [
      { id: 'jet-black-sport-black', name: 'Alüminyum Jet Black + Sport Band Siyah', hex: '#121315', borderHex: '#000', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Jet Black + Sport Band Black.png' },
      { id: 'jet-black-sport-dark-gray', name: 'Alüminyum Jet Black + Sport Loop Koyu Gri', hex: '#374151', borderHex: '#000', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Jet Black + Sport Loop Dark Gray.png' },
      { id: 'rose-gold-sport-light-blush', name: 'Alüminyum Rose Gold + Sport Band Light Blush', hex: '#E8A5A5', borderHex: '#E6A8A4', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Rose Gold + Sport Band Light Blush.png' },
      { id: 'rose-gold-sport-purple-fog', name: 'Alüminyum Rose Gold + Sport Loop Purple Fog', hex: '#9384A6', borderHex: '#E6A8A4', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Rose Gold + Sport Loop Purple Fog.png' },
      { id: 'silver-sport-neon-yellow', name: 'Alüminyum Gümüş + Sport Band Neon Sarı', hex: '#EAB308', borderHex: '#E3E4E6', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Silver + Sport Band Neon Yellow.png' },
      { id: 'silver-sport-purple-fog', name: 'Alüminyum Gümüş + Sport Band Purple Fog', hex: '#9384A6', borderHex: '#E3E4E6', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Silver + Sport Band Purple Fog.png' },
      { id: 'silver-sport-forest', name: 'Alüminyum Gümüş + Sport Loop Forest', hex: '#166534', borderHex: '#E3E4E6', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Silver + Sport Loop Forest.png' },
      { id: 'silver-sport-loop-neon-yellow', name: 'Alüminyum Gümüş + Sport Loop Neon Sarı', hex: '#EAB308', borderHex: '#E3E4E6', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Silver + Sport Loop Neon Yellow.png' },
      { id: 'space-gray-sport-anchor-blue', name: 'Alüminyum Space Gray + Sport Band Anchor Blue', hex: '#3E5C76', borderHex: '#5A5B5F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Space Gray + Sport Band Anchor Blue.png' },
      { id: 'space-gray-sport-black', name: 'Alüminyum Space Gray + Sport Band Siyah', hex: '#1F2937', borderHex: '#5A5B5F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Space Gray + Sport Band Black.png' },
      { id: 'space-gray-sport-loop-anchor-blue', name: 'Alüminyum Space Gray + Sport Loop Anchor Blue', hex: '#3E5C76', borderHex: '#5A5B5F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Space Gray + Sport Loop Anchor Blue.png' },
      { id: 'space-gray-sport-loop-forest', name: 'Alüminyum Space Gray + Sport Loop Forest', hex: '#166534', borderHex: '#5A5B5F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Aluminum Space Gray + Sport Loop Forest.png' },
      { id: 'titanium-gold-magnetic-sage', name: 'Titanyum Altın + Magnetic Link Adaçayı', hex: '#84A98C', borderHex: '#E5CE9F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Gold + Magnetic Link Sage Gray.png' },
      { id: 'titanium-gold-milanese', name: 'Titanyum Altın + Milanese Loop', hex: '#E5CE9F', borderHex: '#D4B87C', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Gold + Milanese Loop.png' },
      { id: 'titanium-gold-sport-light-blush', name: 'Titanyum Altın + Sport Band Light Blush', hex: '#E8A5A5', borderHex: '#E5CE9F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Gold + Sport Band Light Blush.png' },
      { id: 'titanium-gold-sport-purple-fog', name: 'Titanyum Altın + Sport Band Purple Fog', hex: '#9384A6', borderHex: '#E5CE9F', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Gold + Sport Band Purple Fog.png' },
      { id: 'titanium-natural-magnetic-caramel', name: 'Titanyum Natürel + Magnetic Link Karamel', hex: '#B45309', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Natural + Magnetic Link Caramel.png' },
      { id: 'titanium-natural-milanese', name: 'Titanyum Natürel + Milanese Loop', hex: '#D5CEC5', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Natural + Milanese Loop.png' },
      { id: 'titanium-natural-sport-stone-gray', name: 'Titanyum Natürel + Sport Band Taş Grisi', hex: '#78716C', borderHex: '#EADDCB', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Natural + Sport Band Stone Gray.png' },
      { id: 'titanium-slate-magnetic-navy', name: 'Titanyum Arduvaz + Magnetic Link Lacivert', hex: '#1E3A8A', borderHex: '#434B54', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Slate + Magnetic Link Navy.png' },
      { id: 'titanium-slate-milanese', name: 'Titanyum Arduvaz + Milanese Loop', hex: '#475569', borderHex: '#334155', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Slate + Milanese Loop.png' },
      { id: 'titanium-slate-sport-black', name: 'Titanyum Arduvaz + Sport Band Siyah', hex: '#1E293B', borderHex: '#0F172A', imagePath: '/devices/watch/apple/watch series/Apple Watch S11 - 46mm - Titanium Slate + Sport Band Black.png' },
    ],
  },
];
