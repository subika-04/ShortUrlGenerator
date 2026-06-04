import { useState } from 'react';
import { motion } from 'framer-motion';
import { urlApi } from '../api/urlApi';

function ShortenForm({ onSuccess }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suspendFrom, setSuspendFrom] = useState('');
const [suspendFromTime, setSuspendFromTime] = useState('');
const [suspendUntil, setSuspendUntil] = useState('');
const [suspendUntilTime, setSuspendUntilTime] = useState('');

// In the handleSubmit payload:
if (suspendFrom) payload.suspendFrom = suspendFrom;
if (suspendFromTime) payload.suspendFromTime = suspendFromTime;
if (suspendUntil) payload.suspendUntil = suspendUntil;
if (suspendUntilTime) payload.suspendUntilTime = suspendUntilTime;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = { originalUrl: url };
      
      if (alias) payload.customAlias = alias;
      if (expiryDate) {
        payload.expiresAt = expiryDate;
        if (expiryTime) payload.expiresAtTime = expiryTime;
      }
      
      const { data } = await urlApi.create(payload);
      onSuccess?.(data.url);
      
      setUrl('');
      setAlias('');
      setExpiryDate('');
      setExpiryTime('');
      setLoading(false);
    } catch (err) {
      console.error('Create URL error:', err);
      setError(err.response?.data?.message || 'Failed to create short URL');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-500">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Short Link
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Original URL *</label>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://example.com/very-long-url"
            className="input"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Custom Alias (optional)</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              placeholder="my-link"
              className="input"
            />
          </div>
          <div>
            <label className="label">Expiration Date (optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>
        </div>

        {expiryDate && (
          <div>
            <label className="label">Expiration Time (optional)</label>
            <input
              type="time"
              value={expiryTime}
              onChange={(e) => setExpiryTime(e.target.value)}
              className="input"
            />
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

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
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Shortening...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Shorten URL
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default ShortenForm;