import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedLogo from '../components/AnimatedLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-100 via-primary-50 to-secondary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute top-1/2 right-0 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 4 }}
            className="absolute -bottom-40 -right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <AnimatedLogo size="md" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary">Sign In</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
              🚀 The fastest URL shortener
            </span>
            <h1 className="text-5xl sm:text-6xl font-display font-bold text-surface-900 dark:text-white mb-6 leading-tight">
              Short links.{' '}
              <span className="text-gradient-primary">Big insights.</span>
            </h1>
            <p className="text-xl text-surface-600 dark:text-dark-400 mb-10 max-w-2xl mx-auto">
              Create shortened URLs with built-in analytics. Track clicks, devices, 
              locations, and more. All in one beautiful platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary text-lg px-8 py-3.5">
                Start Free →
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3.5">
                View Demo
              </Link>
            </div>
          </motion.div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl blur opacity-30" />
              <div className="relative card p-2 rounded-xl">
                <div className="bg-surface-200 dark:bg-dark-700 rounded-lg p-4 space-y-3">
                  <div className="h-2 bg-surface-300 dark:bg-dark-600 rounded w-1/4" />
                  <div className="h-2 bg-surface-300 dark:bg-dark-600 rounded w-3/4" />
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-surface-300 dark:bg-dark-600 rounded flex items-end pb-2 px-2">
                        <div 
                          className="w-full bg-primary-500 rounded" 
                          style={{ height: `${30 + i * 15}%` }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-surface-600 dark:text-dark-400">
              Powerful features for your links
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'Analytics', desc: 'Track clicks, devices, locations' },
              { icon: '🔗', title: 'Custom Links', desc: 'Create memorable short URLs' },
              { icon: '📱', title: 'QR Codes', desc: 'Generate instantly' },
              { icon: '⏰', title: 'Link Expiry', desc: 'Set expiration dates' },
              { icon: '🌍', title: 'Geo Tracking', desc: 'See where clicks come from' },
              { icon: '📈', title: 'Trends', desc: 'Daily click charts' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-surface-500 dark:text-dark-400">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto card p-10 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-surface-600 dark:text-dark-400 mb-8">
            Create your free account and start shortening URLs in seconds.
          </p>
          <Link to="/signup" className="btn-primary text-lg px-10 py-4">
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-surface-200 dark:border-dark-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500 dark:text-dark-500">
            © 2026 URL Shortener. Built with 🔥
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="text-surface-500 hover:text-surface-700 dark:hover:text-dark-300">
              Login
            </Link>
            <Link to="/signup" className="text-surface-500 hover:text-surface-700 dark:hover:text-dark-300">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}