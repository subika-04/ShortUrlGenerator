import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedLogo from '../components/AnimatedLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-dark-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-8xl mb-4"
        >
          🚫
        </motion.div>
        
        <h1 className="text-4xl font-display font-bold text-surface-900 dark:text-white mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-surface-700 dark:text-dark-300 mb-2">
          Page Not Found
        </h2>
        
        <p className="text-surface-500 dark:text-dark-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/dashboard" className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}