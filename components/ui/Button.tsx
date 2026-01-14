import React, { ElementType, ReactNode } from 'react';
import { SpinnerIcon } from '../icons/Icons';

type ButtonOwnProps<C extends ElementType> = {
  as?: C;
  children: ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
};

type ButtonProps<C extends ElementType> = ButtonOwnProps<C> &
  Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonOwnProps<C>>;

export function Button<C extends ElementType = 'button'>({
  as,
  children,
  isLoading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...rest
}: ButtonProps<C>) {
  const Component = as || 'button';

  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-green-600 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30',
    secondary: 'bg-secondary dark:bg-slate-700 text-dark dark:text-secondary hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600',
    ghost: 'bg-transparent text-dark dark:text-secondary hover:bg-slate-100 dark:hover:bg-slate-700',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <Component className={combinedClassName} disabled={isLoading || disabled} {...rest}>
      {isLoading ? <SpinnerIcon className="h-5 w-5" /> : children}
    </Component>
  );
};