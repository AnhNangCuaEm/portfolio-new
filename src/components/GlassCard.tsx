import React from 'react';
import GlassSurface, { GlassSurfaceProps } from './GlassSurface';

export interface GlassCardProps extends Omit<GlassSurfaceProps, 'width' | 'height'> {
  /**
   * Card width (default: auto - fits content)
   */
  width?: number | string;
  /**
   * Card height (default: auto - fits content)
   */
  height?: number | string;
  /**
   * Padding inside the card
   */
  padding?: number | string;
  /**
   * Whether the card is hoverable/interactive
   */
  hoverable?: boolean;
  /**
   * Click handler for interactive cards
   */
  onClick?: () => void;
}

/**
 * GlassCard - Pre-configured glass surface optimized for content cards
 * 
 * Features:
 * - Flexible sizing
 * - Customizable padding
 * - Optional hover effects
 * - Perfect for content containers, info boxes, etc.
 */
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  width = 'auto',
  height = 'auto',
  padding = '1.5rem',
  hoverable = false,
  onClick,
  borderRadius = 20,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  className = '',
  style = {},
  ...rest
}) => {
  const cardClasses = `
    ${hoverable ? 'transition-all duration-300 hover:scale-[1.02] hover:brightness-105 cursor-pointer' : ''}
    ${className}
  `.trim();

  const handleClick = () => {
    if (hoverable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hoverable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <GlassSurface
      width={width}
      height={height}
      borderRadius={borderRadius}
      brightness={brightness}
      opacity={opacity}
      blur={blur}
      className={cardClasses}
      style={{
        padding,
        ...style,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={hoverable ? 'button' : undefined}
      tabIndex={hoverable ? 0 : undefined}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
};

export default GlassCard;
