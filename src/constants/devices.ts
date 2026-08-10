import type { DeviceModelInfo } from '../types/mockup';

export const DEVICE_MODELS: DeviceModelInfo[] = [
  // APPLE
  {
    id: 'iphone16pro',
    brand: 'apple',
    name: 'iPhone 16 Pro',
    tag: 'Yeni Flagship',
    defaultRatio: 1290 / 2796,
    colors: [
      { id: 'dark', name: 'Titanium Black', hex: '#2C2B2F', borderHex: '#3E3D42' },
      { id: 'natural', name: 'Natural Titanium', hex: '#8B8983', borderHex: '#A2A09A' },
      { id: 'desert', name: 'Desert Titanium', hex: '#C2A58F', borderHex: '#D7BC9F' },
      { id: 'white', name: 'White Titanium', hex: '#E3E3E5', borderHex: '#F0F0F2' },
    ],
  },
  {
    id: 'iphone15pro',
    brand: 'apple',
    name: 'iPhone 15 Pro',
    tag: 'Pro Seri',
    defaultRatio: 1179 / 2556,
    colors: [
      { id: 'dark', name: 'Black Titanium', hex: '#262628', borderHex: '#38383B' },
      { id: 'natural', name: 'Natural Titanium', hex: '#888580', borderHex: '#9E9B96' },
      { id: 'blue', name: 'Blue Titanium', hex: '#2E3847', borderHex: '#404C5F' },
      { id: 'white', name: 'White Titanium', hex: '#E1E2E4', borderHex: '#EEF0F2' },
    ],
  },

  // SAMSUNG
  {
    id: 'samsung-s25ultra',
    brand: 'samsung',
    name: 'Galaxy S25 Ultra',
    tag: 'Titanium Armor',
    defaultRatio: 1440 / 3120,
    colors: [
      { id: 'dark', name: 'Titanium Black', hex: '#1E1E20', borderHex: '#333336' },
      { id: 'gray', name: 'Titanium Gray', hex: '#6F7075', borderHex: '#88898E' },
      { id: 'silver', name: 'Titanium Silver', hex: '#D1D2D6', borderHex: '#E2E3E7' },
      { id: 'blue', name: 'Titanium Blue', hex: '#3B4B61', borderHex: '#4F617C' },
    ],
  },
  {
    id: 'samsung-s24',
    brand: 'samsung',
    name: 'Galaxy S24',
    tag: 'Compact Flagship',
    defaultRatio: 1080 / 2340,
    colors: [
      { id: 'dark', name: 'Onyx Black', hex: '#222327', borderHex: '#37383D' },
      { id: 'gray', name: 'Marble Gray', hex: '#B2B4B9', borderHex: '#C9CBD0' },
      { id: 'violet', name: 'Cobalt Violet', hex: '#48435C', borderHex: '#5C5675' },
      { id: 'yellow', name: 'Amber Yellow', hex: '#E6D7B8', borderHex: '#F2E5C9' },
    ],
  },

  // GOOGLE
  {
    id: 'pixel9pro',
    brand: 'google',
    name: 'Pixel 9 Pro',
    tag: 'Tensor G4',
    defaultRatio: 1280 / 2856,
    colors: [
      { id: 'obsidian', name: 'Obsidian', hex: '#1C1D1F', borderHex: '#303236' },
      { id: 'porcelain', name: 'Porcelain', hex: '#F0EFEA', borderHex: '#FAFAFA' },
      { id: 'hazel', name: 'Hazel', hex: '#585D58', borderHex: '#6F756F' },
      { id: 'rose', name: 'Rose Quartz', hex: '#E8CAD2', borderHex: '#F5DAE1' },
    ],
  },
  {
    id: 'pixel8pro',
    brand: 'google',
    name: 'Pixel 8 Pro',
    tag: 'Visor Camera',
    defaultRatio: 1344 / 2992,
    colors: [
      { id: 'obsidian', name: 'Obsidian', hex: '#212226', borderHex: '#36373D' },
      { id: 'porcelain', name: 'Porcelain', hex: '#EEEDE8', borderHex: '#F7F6F2' },
      { id: 'bay', name: 'Bay Blue', hex: '#87B5E5', borderHex: '#A2C9F2' },
      { id: 'mint', name: 'Mint', hex: '#C5E0D8', borderHex: '#D6ECE5' },
    ],
  },

  // OTHER / TABLET
  {
    id: 'ipadpro',
    brand: 'other',
    name: 'iPad Pro 13"',
    tag: 'M4 Ultra Thin',
    defaultRatio: 2064 / 2752,
    colors: [
      { id: 'dark', name: 'Space Black', hex: '#1D1D1F', borderHex: '#313135' },
      { id: 'silver', name: 'Silver', hex: '#E3E4E6', borderHex: '#F0F1F3' },
    ],
  },
  {
    id: 'minimal',
    brand: 'other',
    name: 'Minimal Bezel',
    tag: 'Temiz Çerçeve',
    defaultRatio: 1,
    colors: [
      { id: 'dark', name: 'Mat Siyah', hex: '#0F172A', borderHex: '#1E293B' },
      { id: 'light', name: 'Açık Gri', hex: '#F8F9FA', borderHex: '#E2E8F0' },
    ],
  },
];
