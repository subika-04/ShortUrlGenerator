import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedLogo from '../components/AnimatedLogo';

export default function ExpiryPage() {
  const { shortCode } = useParams();

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 max-w-md text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
          Link Expired
        </h1>

        <p className="text-surface-600 dark:text-dark-400 mb-6">
          This short link <span className="font-mono text-primary-500">/{shortCode}</span> has expired and is no longer active.
        </p>

        <div className="flex flex-col gap-3">
          <Link to="/" className="btn-primary w-full justify-center">
            Create New Link
          </Link>
        </div>
      </motion.div>
    </div>
  );
}