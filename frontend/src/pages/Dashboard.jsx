import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import ShortenForm from '../components/ShortenForm';
import BulkCSVForm from '../components/BulkCSVForm';
import UrlCard from '../components/UrlCard';
import SearchInput from '../components/SearchInput';
import { urlApi } from '../api/urlApi';

export default function Dashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBulk, setShowBulk] = useState(false);

  const fetchUrls = async () => {
    try {
      const { data } = await urlApi.getAll();
      setUrls(data.urls);
    } catch (err) {
      setError('Failed to load URLs. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUrls(); 
  }, []);

  const handleSuccess = (newUrl) => {
    setUrls(prev => [newUrl, ...prev]);
    setShowBulk(false);
  };
  const handleDelete = (id) => setUrls(prev => prev.filter(u => u._id !== id));
  const handleUpdate = (updated) => setUrls(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u));

  // Calculate stats
  const totalClicks = urls.reduce((s, u) => s + u.clickCount, 0);
  const activeUrls = urls.filter(u => u.isActive).length;
  const totalUrls = urls.length;
  const topUrl = urls.reduce((best, u) => (!best || u.clickCount > best.clickCount) ? u : best, null);

  // Filter and sort
  const filtered = urls
    .filter(u => 
      u.originalUrl.toLowerCase().includes(search.toLowerCase()) || 
      u.shortCode.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'most-clicks') return b.clickCount - a.clickCount;
      if (sortBy === 'least-clicks') return a.clickCount - b.clickCount;
      return 0;
    });

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72 transition-all duration-300">
        <Navbar />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-1">
                  {getGreeting()},{' '}
                  <span className="text-gradient-primary">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-surface-600 dark:text-dark-400">
                  Welcome to your Analytics Command Center
                </p>
              </div>
              
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden btn-icon"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Links"
              value={totalUrls}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              }
              color="primary"
              delay={0}
            />
            <StatCard
              label="Total Clicks"
              value={totalClicks}
              subtext="All time"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              color="secondary"
              delay={1}
            />
            <StatCard
              label="Active URLs"
              value={activeUrls}
              subtext={`${totalUrls - activeUrls} expired`}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
              color="accent"
              delay={2}
            />
            <StatCard
              label="Top Link"
              value={topUrl ? topUrl.clickCount : 0}
              subtext={topUrl ? `/${topUrl.shortCode}` : 'No links yet'}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              color="warning"
              delay={3}
            />
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setShowBulk(false)} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showBulk ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-dark-700 text-surface-600 dark:text-dark-400'}`}
            >
              Single URL
            </button>
            <button 
              onClick={() => setShowBulk(true)} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showBulk ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-dark-700 text-surface-600 dark:text-dark-400'}`}
            >
              Bulk Upload
            </button>
          </div>

          {/* Shorten Form or Bulk Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {!showBulk ? (
              <ShortenForm onSuccess={handleSuccess} />
            ) : (
              <BulkCSVForm onSuccess={handleSuccess} />
            )}
          </motion.div>

          {/* URL List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-display font-semibold text-surface-900 dark:text-white">
                Your Links <span className="text-surface-500 dark:text-dark-400 text-sm font-normal">({urls.length})</span>
              </h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search links..."
                  className="sm:w-56"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input py-2 text-sm cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-clicks">Most Clicks</option>
                  <option value="least-clicks">Least Clicks</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-5">
                    <div className="shimmer h-5 w-40 mb-3" />
                    <div className="shimmer h-4 w-full mb-3" />
                    <div className="shimmer h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-12 text-center">
                {search ? (
                  <>
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No results found</h3>
                    <p className="text-surface-500 dark:text-dark-400">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-500">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No links yet</h3>
                    <p className="text-surface-500 dark:text-dark-400">Paste a URL above to create your first short link</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((url, index) => (
                  <motion.div
                    key={url._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UrlCard url={url} onDelete={handleDelete} onUpdate={handleUpdate} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}