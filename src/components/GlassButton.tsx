import React from 'react';
import GlassSurface, { GlassSurfaceProps } from './GlassSurface';

export interface GlassButtonProps extends Omit<GlassSurfaceProps, 'width' | 'height'> {
  /**
   * Button size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Button style variant
   */
  variant?: 'default' | 'primary' | 'secondary';
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * GlassButton - Pre-configured glass surface optimized for interactive buttons
 * 
 * Features:
 * - Multiple size variants (sm, md, lg)
 * - Style variants (default, primary, secondary)
 * - Hover and active states
 * - Disabled state support
 * - Accessible button semantics
 */
const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  size = 'md',
  variant = 'default',
  onClick,
  disabled = false,
  type = 'button',
  borderRadius = 12,
  blur = 8,
  className = '',
  style = {},
  ...rest
}) => {
  const sizeStyles = {
    sm: { height: 36, padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { height: 44, padding: '0.625rem 1.5rem', fontSize: '1rem' },
    lg: { height: 52, padding: '0.75rem 2rem', fontSize: '1.125rem' },
  };

  const variantStyles = {
    default: { brightness: 50, opacity: 0.9 },
    primary: { brightness: 60, opacity: 0.95 },
    secondary: { brightness: 40, opacity: 0.85 },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  // Suppress unused variable warning - type is part of the API
  void type;

  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium
    transition-all duration-200
    cursor-pointer
    select-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}
    ${className}
  `.trim();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <GlassSurface
      width="auto"
      height={currentSize.height}
      borderRadius={borderRadius}
      brightness={currentVariant.brightness}
      opacity={currentVariant.opacity}
      blur={blur}
      className={buttonClasses}
      style={{
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        ...style,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
};

export default GlassButton;
