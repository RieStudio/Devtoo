import React from 'react';

export interface DevtooLogoProps {
  size?: number;
  variant?: 'swift' | 'badge' | 'full';
  color?: string; // primary chili red
  facetColor?: string; // shadow facet color (flat)
  stemColor?: string; // dark slate / graphite stem
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Devtoo Official Brand Logo: The Swift Chili
 * 
 * Strict Design Standard:
 * - 100% Uniform across all instances (Favicon, Navbar, Sidebar, Store Banner Maker)
 * - Geometric Angled Stem: #0F172A (Dark Slate)
 * - Chili Main Hull: #D90429 (Chili Red)
 * - Flat Facet: #A00C24 (Deep Crimson)
 * - Zero Gradients, Zero Neon, Zero AI Slop
 */
export const DevtooLogo: React.FC<DevtooLogoProps> = ({
  size = 28,
  variant = 'swift',
  color = '#D90429',
  facetColor = '#A00C24',
  stemColor = '#0F172A',
  className = '',
  showText = false,
  textClassName = '',
}) => {
  const renderSvg = (iconSize: number) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
      aria-label="Devtoo Logo"
      className={className}
    >
      {/* 1. Geometric Angled Stem (Dark Slate) */}
      <path
        d="M36 8C39 8 42 10.5 43 13C40 13.5 37 15 35 17.5L32 15C33.5 12 34.5 9 36 8Z"
        fill={stemColor}
      />
      {/* 2. Solid Chili Main Hull (Chili Red) */}
      <path
        d="M35 17.5C39 18 43 22 43.5 27C44 34 38 43 33 49C29.5 53.5 25 57 23 58C23.5 55 25.5 50.5 25 46C24 39.5 19.5 31.5 22 24C24 18.5 30 17 35 17.5Z"
        fill={color}
      />
      {/* 3. Flat Modern Dark Facet / Inner Fold (Solid Crimson - No Gradient) */}
      <path
        d="M35 17.5C39 18 43 22 43.5 27C44 34 38 43 33 49L31 38C32 30 33 22 35 17.5Z"
        fill={facetColor}
      />
    </svg>
  );

  const renderIcon = () => {
    if (variant === 'badge') {
      const iconSize = Math.round(size * 0.7);
      return (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: '#FFF0F3',
            border: '1px solid #FFCCD5',
            borderRadius: Math.round(size * 0.26),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          className={className}
        >
          {renderSvg(iconSize)}
        </div>
      );
    }

    return renderSvg(size);
  };

  if (!showText) {
    return renderIcon();
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none',
      }}
      className={textClassName}
    >
      {renderIcon()}
      <span
        style={{
          fontSize: `${Math.round(size * 0.65)}px`,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#0F172A',
          lineHeight: 1,
        }}
      >
        Dev<span style={{ color: color }}>too</span>
      </span>
    </div>
  );
};
