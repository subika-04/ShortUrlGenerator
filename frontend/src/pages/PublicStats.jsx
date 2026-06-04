import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { urlApi } from '../api/urlApi';
import AnimatedLogo from '../components/AnimatedLogo';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-900 dark:bg-dark-800 border border-surface-700 dark:border-dark-600 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-surface-400 dark:text-dark-400 text-xs mb-1">{label}</p>
        <p className="text-primary-400 font-semibold text-sm">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

const formatChartDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function PublicStats() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await urlApi.getPublicStats(shortCode);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Link not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-dark-900">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-dark-900">
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">Link Not Found</h1>
          <p className="text-surface-500 dark:text-dark-400 mb-4">{error}</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const chartData = data.dailyClicks?.map(d => ({ date: formatChartDate(d.date), clicks: d.count })) || [];

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <AnimatedLogo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              /{data.shortCode}
            </h1>
            <p className="text-surface-600 dark:text-dark-400 text-sm break-all">{data.originalUrl}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-surface-100 dark:bg-dark-700 rounded-xl">
              <p className="text-2xl font-display font-bold text-primary-500">{data.clickCount || 0}</p>
              <p className="text-xs text-surface-500 dark:text-dark-400">Total Clicks</p>
            </div>
            <div className="text-center p-4 bg-surface-100 dark:bg-dark-700 rounded-xl">
              <p className="text-2xl font-display font-bold text-secondary-500">{data.uniqueVisitors || 0}</p>
              <p className="text-xs text-surface-500 dark:text-dark-400">Unique</p>
            </div>
            <div className="text-center p-4 bg-surface-100 dark:bg-dark-700 rounded-xl">
              <p className="text-2xl font-display font-bold text-accent-500">
                {data.createdAt ? Math.ceil((Date.now() - new Date(data.createdAt)) / 86400000) : 0}
              </p>
              <p className="text-xs text-surface-500 dark:text-dark-400">Days Old</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">
            Click Trend (Last 30 Days)
          </h2>
          {chartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-surface-500 dark:text-dark-400">No clicks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-dark-700" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <p className="text-center text-xs text-surface-500 dark:text-dark-500 mt-8">
          Powered by Short URL Generator
        </p>
      </div>
    </div>
  );
}