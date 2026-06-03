import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72 transition-all duration-300">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-surface-600 dark:text-dark-400">
              Manage your account and preferences
            </p>
          </motion.div>

          <div className="max-w-2xl space-y-6">
            {/* Profile Section */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">
                Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <div className="input bg-surface-100 dark:bg-dark-800">{user?.name}</div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="input bg-surface-100 dark:bg-dark-800">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">
                Appearance
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-surface-500 dark:text-dark-400">
                    Toggle between light and dark theme
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    isDark ? 'bg-primary-500' : 'bg-surface-300 dark:bg-dark-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
                    animate={{ left: isDark ? 28 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card p-6 border-red-500/20">
              <h2 className="text-lg font-display font-semibold text-red-500 mb-4">
                Danger Zone
              </h2>
              <p className="text-sm text-surface-500 dark:text-dark-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}