import { ButtonHTMLAttributes, forwardRef, Children, isValidElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconDefinition;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-300',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400',
  accent:
    'bg-accent-500 text-gray-900 hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent-300',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      iconOnly = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:cursor-not-allowed';

    // Determine if this is an icon-only button (no visible text content)
    const isIconOnly = iconOnly || !Children.toArray(children).some(
      (child) => typeof child === 'string' || (isValidElement(child) && child.props.className !== 'sr-only')
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className={isIconOnly ? '' : 'mr-2'}>
            <Spinner size="sm" />
          </span>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${isIconOnly ? '' : 'mr-2'}`} />
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${isIconOnly ? '' : 'ml-2'}`} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
