import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showBulk, setShowBulk] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  // Sync sidebar with viewport width on resize
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSuccess = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
    setShowBulk(false);
  };
  const handleDelete = (id) => setUrls((prev) => prev.filter((u) => u._id !== id));
  const handleUpdate = (updated) =>
    setUrls((prev) => prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)));

  // Stats
  const totalClicks = urls.reduce((s, u) => s + u.clickCount, 0);
  const totalUrls = urls.length;
  const activeUrls = urls.filter((u) => {
    if (!u.expiresAt) return true;
    return new Date(u.expiresAt) > new Date();
  }).length;
  const expiredUrls = totalUrls - activeUrls;
  const topUrl = urls.reduce(
    (best, u) => (!best || u.clickCount > best.clickCount ? u : best),
    null
  );

  // Filter & sort
  const filtered = urls
    .filter(
      (u) =>
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
      {/* ── Sidebar ── */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main content ── */}
      <div className="lg:pl-72 transition-all duration-300 min-w-0">
        <Navbar />

        <main className="p-3 xs:p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl xs:text-3xl font-display font-bold text-surface-900 dark:text-white mb-1 leading-tight">
                  {getGreeting()},{' '}
                  <span className="text-gradient-primary break-all">
                    {user?.name?.split(' ')[0]}
                  </span>{' '}
                  👋
                </h1>
                <p className="text-sm text-surface-600 dark:text-dark-400 hidden xs:block">
                  Welcome to your Analytics Command Center
                </p>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden btn-icon flex-shrink-0 mt-0.5"
                aria-label="Toggle sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* ── Stats Grid ──
              xs: 1 col → sm: 2 col → lg: 4 col
          */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
              subtext={`${expiredUrls} expired`}
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

          {/* ── Toggle Buttons ── */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowBulk(false)}
              className={`flex-1 xs:flex-none px-3 xs:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showBulk
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-200 dark:bg-dark-700 text-surface-600 dark:text-dark-400'
              }`}
            >
              Single URL
            </button>
            <button
              onClick={() => setShowBulk(true)}
              className={`flex-1 xs:flex-none px-3 xs:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showBulk
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-200 dark:bg-dark-700 text-surface-600 dark:text-dark-400'
              }`}
            >
              Bulk Upload
            </button>
          </div>

          {/* ── Shorten / Bulk Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <AnimatePresence mode="wait">
              {!showBulk ? (
                <motion.div
                  key="single"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <ShortenForm onSuccess={handleSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="bulk"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <BulkCSVForm onSuccess={handleSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── URL List ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* List header row */}
            <div className="flex flex-col gap-3 mb-4">
              {/* Title + filter toggle (mobile) */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg xs:text-xl font-display font-semibold text-surface-900 dark:text-white">
                  Your Links{' '}
                  <span className="text-surface-500 dark:text-dark-400 text-sm font-normal">
                    ({urls.length})
                  </span>
                </h2>

                {/* Mobile: toggle filter row */}
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="sm:hidden btn-icon"
                  aria-label="Toggle filters"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Filter controls — always visible on sm+, collapsible on mobile */}
              <AnimatePresence initial={false}>
                {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 640) && (
                  <motion.div
                    key="filters"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden sm:overflow-visible"
                  >
                    <div className="flex flex-col xs:flex-row gap-2 sm:flex-row">
                      <div className="flex-1 xs:flex-none xs:w-full sm:w-56">
                        <SearchInput
                          value={search}
                          onChange={setSearch}
                          placeholder="Search links..."
                        />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input py-2 text-sm cursor-pointer xs:w-auto"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="most-clicks">Most Clicks</option>
                        <option value="least-clicks">Least Clicks</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Always-visible search on sm+ (duplicated to avoid layout jump on mobile) */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Hidden — rendered above via AnimatePresence on desktop */}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-4 sm:p-5">
                    <div className="shimmer h-4 xs:h-5 w-32 xs:w-40 mb-3" />
                    <div className="shimmer h-3 xs:h-4 w-full mb-3" />
                    <div className="shimmer h-3 w-24 xs:w-32" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-8 sm:p-12 text-center">
                {search ? (
                  <>
                    <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                    <h3 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-dark-400">
                      Try a different search term
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-primary-500 sm:w-10 sm:h-10"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white mb-2">
                      No links yet
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-dark-400">
                      Paste a URL above to create your first short link
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((url, index) => (
                  <motion.div
                    key={url._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
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
