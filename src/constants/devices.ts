import type { DeviceModelInfo } from '../types/mockup';

export const DEVICE_MODELS: DeviceModelInfo[] = [
  // APPLE
  {
    id: 'iphone17promax',
    brand: 'apple',
    name: 'iPhone 17 Pro Max',
    tag: 'Son Amiral Gemisi',
    defaultRatio: 1290 / 2796,
    colors: [
      { id: 'dark', name: 'Black Titanium', hex: '#2C2B2F', borderHex: '#3E3D42' },
      { id: 'natural', name: 'Natural Titanium', hex: '#8B8983', borderHex: '#A2A09A' },
      { id: 'desert', name: 'Desert Titanium', hex: '#C2A58F', borderHex: '#D7BC9F' },
      { id: 'white', name: 'White Titanium', hex: '#E3E3E5', borderHex: '#F0F0F2' },
    ],
  },

  // SAMSUNG
  {
    id: 'samsung-s26ultra',
    brand: 'samsung',
    name: 'Galaxy S26 Ultra',
    tag: 'Titanium Armor',
    defaultRatio: 1440 / 3120,
    colors: [
      { id: 'dark', name: 'Titanium Black', hex: '#1E1E20', borderHex: '#333336' },
      { id: 'gray', name: 'Titanium Gray', hex: '#6F7075', borderHex: '#88898E' },
      { id: 'silver', name: 'Titanium Silver', hex: '#D1D2D6', borderHex: '#E2E3E7' },
      { id: 'blue', name: 'Titanium Blue', hex: '#3B4B61', borderHex: '#4F617C' },
    ],
  },

  // GOOGLE
  {
    id: 'pixel11pro',
    brand: 'google',
    name: 'Pixel 11 Pro',
    tag: 'Tensor G5',
    defaultRatio: 1280 / 2856,
    colors: [
      { id: 'obsidian', name: 'Obsidian', hex: '#1C1D1F', borderHex: '#303236' },
      { id: 'porcelain', name: 'Porcelain', hex: '#F0EFEA', borderHex: '#FAFAFA' },
      { id: 'hazel', name: 'Hazel', hex: '#585D58', borderHex: '#6F756F' },
      { id: 'rose', name: 'Rose Quartz', hex: '#E8CAD2', borderHex: '#F5DAE1' },
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
];
