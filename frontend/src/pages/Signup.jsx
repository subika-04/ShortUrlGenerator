import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedLogo from '../components/AnimatedLogo';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError('');

  try {
    await signup(
      form.name,
      form.email,
      form.password
    );

    navigate('/login');
  } catch (err) {
    setError(
      err.response?.data?.message || 'Signup failed.'
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <AnimatedLogo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-1">
              Create your account
            </h1>
            <p className="text-surface-600 dark:text-dark-400 text-sm">
              Start shortening URLs with analytics
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input"
                autoComplete="name"
              />
            </div>
            
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
              />
            </div>
            
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="input"
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-surface-500">
                Must be at least 6 characters
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-surface-600 dark:text-dark-400">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </span>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600 dark:text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-surface-500 dark:text-dark-500">
          © 2024 Short URL Generator. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}