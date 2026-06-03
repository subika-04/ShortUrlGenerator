import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ 
  label, 
  value, 
  subtext, 
  icon, 
  trend, 
  color = 'primary',
  delay = 0
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up animation
  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [value]);

  const colors = {
    primary: {
      bg: 'bg-primary-500/10',
      text: 'text-primary-500',
      border: 'border-primary-500/20',
      glow: 'hover:shadow-glow-primary',
    },
    secondary: {
      bg: 'bg-secondary-500/10',
      text: 'text-secondary-500',
      border: 'border-secondary-500/20',
      glow: 'hover:shadow-glow-purple',
    },
    accent: {
      bg: 'bg-accent-500/10',
      text: 'text-accent-500',
      border: 'border-accent-500/20',
      glow: 'hover:shadow-glow-green',
    },
    warning: {
      bg: 'bg-highlight-500/10',
      text: 'text-highlight-500',
      border: 'border-highlight-500/20',
      glow: 'hover:shadow-glow-orange',
    },
  };

  const colorClasses = colors[color] || colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4, ease: 'easeOut' }}
      className={`card p-5 ${colorClasses.glow} transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-surface-500 dark:text-dark-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          
          {/* Animated Value */}
          <motion.p
            className="text-2xl font-display font-bold text-surface-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay * 0.1 + 0.2 }}
          >
            {typeof value === 'number' 
              ? displayValue.toLocaleString() 
              : value}
          </motion.p>
          
          {/* Subtext */}
          {subtext && (
            <p className="text-xs text-surface-500 dark:text-dark-400 mt-0.5">
              {subtext}
            </p>
          )}
          
          {/* Trend Indicator */}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend >= 0 ? 'text-accent-500' : 'text-red-500'
            }`}
            >
              {trend >= 0 ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
              <span>{Math.abs(trend)}%</span>
              <span className="text-surface-500 dark:text-dark-500">vs last period</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        {icon && (
          <motion.div
            className={`w-10 h-10 rounded-xl ${colorClasses.bg} ${colorClasses.text} flex items-center justify-center`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay * 0.1 + 0.3, type: 'spring' }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}