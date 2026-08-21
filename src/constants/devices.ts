import type { DeviceModelInfo } from '../types/mockup';

export const DEVICE_MODELS: DeviceModelInfo[] = [
  // APPLE
  {
    id: 'iphone-17-pro-max',
    brand: 'apple',
    name: 'iPhone 17 Pro Max',
    tag: 'Flagship 6.9"',
    defaultRatio: 389 / 800,
    colors: [
      { id: 'default', name: 'Default', hex: '#2C2B2F', borderHex: '#3E3D42' },
    ],
  },
  {
    id: 'iphone-17-pro',
    brand: 'apple',
    name: 'iPhone 17 Pro',
    tag: 'Pro 6.3"',
    defaultRatio: 389 / 800,
    colors: [
      { id: 'default', name: 'Default', hex: '#2C2B2F', borderHex: '#3E3D42' },
    ],
  },
  {
    id: 'iphone-17',
    brand: 'apple',
    name: 'iPhone 17',
    tag: 'Standard 6.1"',
    defaultRatio: 388 / 800,
    colors: [
      { id: 'default', name: 'Default', hex: '#2C2B2F', borderHex: '#3E3D42' },
    ],
  },

  // SAMSUNG
  {
    id: 'galaxy-s26-ultra',
    brand: 'samsung',
    name: 'Galaxy S26 Ultra',
    tag: 'Armor Frame 6.8"',
    defaultRatio: 385 / 800,
    colors: [
      { id: 'default', name: 'Default', hex: '#1E1E20', borderHex: '#333336' },
    ],
  },

  // GOOGLE
  {
    id: 'pixel-10-pro',
    brand: 'google',
    name: 'Pixel 10 Pro',
    tag: 'Tensor Flagship',
    defaultRatio: 380 / 800,
    colors: [
      { id: 'default', name: 'Default', hex: '#1C1D1F', borderHex: '#303236' },
    ],
  },
  {
    id: 'pixel-10',
    brand: 'google',
    name: 'Pixel 10',
    tag: 'Tensor AI',
    defaultRatio: 379 / 800,
    colors: [
      { id: 'default', name: 'Default', hex: '#1C1D1F', borderHex: '#303236' },
    ],
  },
];
