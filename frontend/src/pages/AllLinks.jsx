import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import UrlCard from '../components/UrlCard';
import SearchInput from '../components/SearchInput';
import { urlApi } from '../api/urlApi';

export default function AllLinks() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const { data } = await urlApi.getAll();
        setUrls(data.urls);
      } catch (err) {
        console.error('Failed to load URLs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);

  const handleDelete = (id) => {
    setUrls(prev => prev.filter(u => u._id !== id));
  };

  const handleUpdate = (updated) => {
    setUrls(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u));
  };

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
              All Links
            </h1>
            <p className="text-surface-600 dark:text-dark-400">
              Manage and view all your shortened URLs
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search links..."
              className="sm:w-64"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-2.5 text-sm cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-clicks">Most Clicks</option>
              <option value="least-clicks">Least Clicks</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="shimmer h-5 w-40 mb-3" />
                  <div className="shimmer h-4 w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                {search ? 'No results found' : 'No links yet'}
              </h3>
              <p className="text-surface-500 dark:text-dark-400">
                {search ? 'Try a different search term' : 'Create your first short link'}
              </p>
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
        </main>
      </div>
    </div>
  );
}