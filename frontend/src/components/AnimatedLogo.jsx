import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AnimatedLogo({ size = 'default', showText = true }) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    default: { icon: 40, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 56, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size] || sizes.default;

  // SVG path for link chain icon
  const linkPath = "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71";
  const linkPath2 = "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71";

  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 group">
      {/* Animated Icon Container */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: icon, height: icon }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 opacity-30"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* SVG Icon with draw animation */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          
          {/* Animated link paths */}
          <motion.path
            d={linkPath}
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <motion.path
            d={linkPath2}
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
          />
          
          {/* Center dot */}
          <motion.circle
            cx="12"
            cy="12"
            r="2"
            fill="url(#logoGradient)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />
        </svg>
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <motion.span
          className={`font-display font-bold ${text} text-surface-900 dark:text-white tracking-tight`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Short{' '}
          <span className="text-gradient-primary">URL</span>
        </motion.span>
      )}
    </Link>
  );
}