import React from 'react';
import GlassSurface, { GlassSurfaceProps } from './GlassSurface';

export interface GlassHeaderProps extends Omit<GlassSurfaceProps, 'width' | 'height' | 'borderRadius'> {
  /**
   * Height of the header (default: 96px)
   */
  height?: number;
  /**
   * Border radius (default: 48px for pill shape)
   */
  borderRadius?: number;
}

/**
 * GlassHeader - Pre-configured glass surface optimized for navigation headers
 * 
 * Features:
 * - Full width with max-width constraint
 * - Pill-shaped design (48px border radius)
 * - Optimized backdrop filter settings
 * - Proper padding for header content
 */
const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  borderRadius = 48,
  brightness = 50,
  opacity = 0.93,
  blur = 8,
  displace = 2,
  className = '',
  ...rest
}) => {
  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={borderRadius}
      brightness={brightness}
      opacity={opacity}
      blur={blur}
      displace={displace}
      className={`w-full px-2 py-2 ${className}`}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
};

export default GlassHeader;
