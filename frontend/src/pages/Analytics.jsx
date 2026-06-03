import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import CopyButton from '../components/CopyButton';
import { urlApi } from '../api/urlApi';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-900 dark:bg-dark-800 border border-surface-700 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-surface-400 text-xs">{label}</p>
        <p className="text-primary-400 font-semibold text-sm">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};
const visitCount = await Visit.countDocuments({});
console.log("Debug - Total visits in collection:", visitCount);
const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await urlApi.getAnalytics(id);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <Navbar />
          <div className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(7)].map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}
            </div>
            <div className="shimmer h-80 rounded-2xl mb-6" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="shimmer h-64 rounded-2xl" />
              <div className="shimmer h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <Navbar />
          <div className="p-8">
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-500 mb-4">{error || 'URL not found'}</p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { url, analytics } = data;
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const shortUrl = `${BASE_URL}/${url.shortCode}`;
  const daysActive = Math.max(1, Math.ceil((Date.now() - new Date(url.createdAt)) / 86400000));

  // 1. Daily Click Trends
  const dailyData = analytics.dailyClicks?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: d.count
  })) || [];

  // 2. Traffic Source Analytics
  const trafficData = analytics.referrerBreakdown?.map((r, i) => ({
    name: r.source || 'Direct',
    value: r.count,
    color: COLORS[i % COLORS.length]
  })) || [];

  // 3. Geolocation Analytics
  const geoData = analytics.countryBreakdown?.slice(0, 8).map((c, i) => ({
    name: c.name,
    value: c.value,
    color: COLORS[i % COLORS.length]
  })) || [];

  // 4. Unique vs Repeated Users (Donut)
  const uniqueData = [
    { name: 'Unique', value: analytics.uniqueUsers || 0, color: COLORS[0] },
    { name: 'Repeated', value: analytics.repeatedUsers || 0, color: COLORS[1] }
  ];

  // 5. Hourly HeatMap

  // Convert UTC to local time for display
const hourlyData = Array.from({ length: 24 }, (_, i) => {
  const hourData = analytics.hourlyHeatmap?.filter(h => h.hour === i) || [];
  return { 
    hour: `${i}:00`, 
    clicks: hourData.reduce((s, h) => s + h.count, 0) 
  };
});

// BUT - adjust for local timezone
// For example, if server is UTC and you're IST (+5:30):
// hour 18 UTC = 23:30 IST

  // 6. Browser Analytics
  const browserData = analytics.browserBreakdown?.map((b, i) => ({
    name: b.name,
    value: b.value,
    color: COLORS[i % COLORS.length]
  })) || [];

  // 7. Device Analytics
  const deviceData = analytics.deviceBreakdown?.map((d, i) => ({
    name: d.name,
    value: d.value,
    color: COLORS[i % COLORS.length]
  })) || [];

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-dark-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72 transition-all duration-300">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-dark-400 mb-3">
              <Link to="/dashboard" className="hover:text-primary-500">Dashboard</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              <span>Analytics</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">/{url.shortCode}</h1>
                  {analytics.isExpired && <Badge variant="warning" dot>Expired</Badge>}
                </div>
                <p className="text-surface-600 dark:text-dark-400 text-sm truncate">{url.originalUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-2 bg-surface-200 dark:bg-dark-700 rounded-xl text-sm">
                  <span className="font-mono text-surface-700 dark:text-dark-300">{shortUrl}</span>
                  <CopyButton text={shortUrl} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Clicks" value={analytics.totalClicks || 0} color="primary" delay={0} />
            <StatCard label="Unique Visitors" value={analytics.uniqueUsers || 0} color="secondary" delay={1} />
            <StatCard label="Avg. Daily" value={((analytics.totalClicks || 0) / daysActive).toFixed(1)} subtext="clicks/day" color="accent" delay={2} />
            <StatCard label="Days Active" value={daysActive} color="warning" delay={3} />
          </div>

          {/* 1. Daily Click Trends */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 mb-6">
            <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-6">Daily Click Trends</h2>
            {dailyData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-surface-500">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-dark-700" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* 2. Traffic Source & 3. Geolocation */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Traffic Sources</h2>
              {trafficData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-surface-500">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trafficData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-dark-700" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={80} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {trafficData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Geolocation</h2>
              {geoData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-surface-500">No data yet</div>
              ) : (
                <div className="space-y-3">
                  {geoData.map((c, i) => {
                    const max = geoData[0]?.value || 1;
                    const pct = Math.round((c.value / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-surface-700 dark:text-dark-300">{c.name}</span>
                          <span className="text-primary-500">{c.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-surface-200 dark:bg-dark-700 rounded-full">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: c.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* 4. Unique vs Repeated */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 mb-6">
            <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Unique vs Repeated Users</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={uniqueData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {uniqueData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie data={uniqueData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-4">
                {uniqueData.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-surface-500">{item.value} visitors</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 5. Hourly HeatMap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-6 mb-6">
            <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Hourly HeatMap (24h)</h2>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {hourlyData.map((h, i) => {
                const max = Math.max(...hourlyData.map(d => d.clicks), 1);
                const intensity = h.clicks / max;
                return (
                  <div key={i} className="relative group">
                    <div className="h-10 rounded-lg flex items-center justify-center text-xs font-mono" style={{ backgroundColor: intensity > 0.5 ? COLORS[0] : intensity > 0 ? `${COLORS[0]}66` : '#e5e7eb' }}>
                      <span className={intensity > 0.5 ? 'text-white' : 'text-surface-600'}>{h.clicks}</span>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-900 dark:bg-dark-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.hour}: {h.clicks} clicks
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-surface-500 mt-2">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </motion.div>

          {/* 6. Browser & 7. Device */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Browser Analytics</h2>
              {browserData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-surface-500">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={browserData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-dark-700" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {browserData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card p-6">
              <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Device Analytics</h2>
              {deviceData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-surface-500">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {deviceData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Recent Visits Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
            <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4">Recent Visits</h2>
            {!analytics.recentVisits || analytics.recentVisits.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-surface-500">No visits yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-dark-700">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">Time</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">Browser</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">Device</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">Source</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">Country</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">City</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-surface-500 uppercase">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentVisits.slice(0, 15).map((v, i) => (
                      <tr key={i} className="border-b border-surface-100 dark:border-dark-800 hover:bg-surface-50 dark:hover:bg-dark-800">
                        <td className="py-3 px-2 text-surface-700 dark:text-dark-300">{formatDate(v.timestamp)}</td>
                        <td className="py-3 px-2 text-surface-700 dark:text-dark-300">{v.browser || 'Unknown'}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-surface-100 dark:bg-dark-700 rounded text-xs">{v.deviceType || 'Desktop'}</span>
                        </td>
                        <td className="py-3 px-2 text-surface-700 dark:text-dark-300">{v.referrer || 'Direct'}</td>
                        <td className="py-3 px-2 text-surface-700 dark:text-dark-300">{v.country || 'Unknown'}</td>
                        <td className="py-3 px-2 text-surface-700 dark:text-dark-300">{v.city || 'N/A'}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs ${v.isUnique ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600'}`}>
                            {v.isUnique ? 'Unique' : 'Returning'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}