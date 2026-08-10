import React from 'react';
import type { AspectRatioPreset, CanvasPreset } from '../../types/mockup';
import { Smartphone, Tablet, Gamepad2, Square, Layout } from 'lucide-react';

interface PresetsBarProps {
  currentPreset: AspectRatioPreset;
  onSelectPreset: (preset: CanvasPreset) => void;
}

export const PRESETS: CanvasPreset[] = [
  {
    id: 'appstore-6.7',
    name: 'App Store 6.7"',
    width: 1290,
    height: 2796,
    subtitle: 'iPhone 16 Pro Max',
    category: 'iOS App Store',
  },
  {
    id: 'appstore-6.5',
    name: 'App Store 6.5"',
    width: 1242,
    height: 2688,
    subtitle: 'Standard iOS',
    category: 'iOS App Store',
  },
  {
    id: 'playstore-portrait',
    name: 'Play Store Dikey',
    width: 1080,
    height: 1920,
    subtitle: 'Android Phone',
    category: 'Google Play',
  },
  {
    id: 'game-landscape',
    name: 'Game 16:9 Yatay',
    width: 1920,
    height: 1080,
    subtitle: 'Mobil Oyun Görseli',
    category: 'Mobile Game',
  },
  {
    id: 'square',
    name: 'Kare 1:1',
    width: 1080,
    height: 1080,
    subtitle: 'Sosyal / Post',
    category: 'Social',
  },
];

export const PresetsBar: React.FC<PresetsBarProps> = ({ currentPreset, onSelectPreset }) => {
  const getIcon = (id: AspectRatioPreset) => {
    switch (id) {
      case 'appstore-6.7':
      case 'appstore-6.5':
        return <Smartphone size={14} />;
      case 'playstore-portrait':
        return <Tablet size={14} />;
      case 'game-landscape':
        return <Gamepad2 size={14} />;
      case 'square':
        return <Square size={14} />;
      default:
        return <Layout size={14} />;
    }
  };

  return (
    <div className="preset-selector-bar">
      {PRESETS.map((preset) => {
        const isActive = currentPreset === preset.id;
        return (
          <button
            key={preset.id}
            className={`preset-chip ${isActive ? 'active' : ''}`}
            onClick={() => onSelectPreset(preset)}
          >
            {getIcon(preset.id)}
            <span>{preset.name}</span>
          </button>
        );
      })}
    </div>
  );
};
