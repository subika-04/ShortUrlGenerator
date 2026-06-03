import { motion } from 'framer-motion';

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'default',
  dot = false,
  className = '' 
}) {
  const variants = {
    default: 'bg-surface-200 dark:bg-dark-700 text-surface-700 dark:text-dark-300',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    secondary: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300',
    accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300',
    warning: 'bg-highlight-100 dark:bg-highlight-900/30 text-highlight-700 dark:text-highlight-300',
    success: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    default: 'bg-surface-500',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    warning: 'bg-highlight-500',
    success: 'bg-accent-500',
    danger: 'bg-red-500',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </motion.span>
  );
}