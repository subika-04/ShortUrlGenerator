import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { urlApi } from '../api/urlApi';

export default function EditModal({ isOpen, onClose, url, onSave }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Suspend fields
  const [suspendFrom, setSuspendFrom] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');

  useEffect(() => {
    if (url) {
      setOriginalUrl(url.originalUrl || '');
      setSuspendFrom(url.suspendFrom ? new Date(url.suspendFrom).toISOString().split('T')[0] : '');
      setSuspendUntil(url.suspendUntil ? new Date(url.suspendUntil).toISOString().split('T')[0] : '');
    }
  }, [url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setError('URL is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { originalUrl };
      
      // Add suspend fields
      if (suspendFrom) payload.suspendFrom = suspendFrom;
      if (suspendUntil) payload.suspendUntil = suspendUntil;
      if (!suspendFrom && !suspendUntil) {
        payload.suspendFrom = null;
        payload.suspendUntil = null;
      }
      
      const { data } = await urlApi.update(url._id, payload);
      onSave?.(data.url);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update URL');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-surface-900 dark:text-white">
            Edit Link
          </h2>
          <button onClick={onClose} className="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Short Code</label>
            <div className="input bg-surface-200 dark:bg-dark-700 text-surface-500 dark:text-dark-400">
              /{url?.shortCode}
            </div>
          </div>

          <div>
            <label className="label">Original URL</label>
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => { setOriginalUrl(e.target.value); setError(''); }}
              placeholder="https://example.com"
              className="input"
            />
          </div>

          {/* ✅ Suspend Section */}
          <div className="border-t border-surface-200 dark:border-dark-700 pt-4 mt-4">
            <p className="text-sm font-medium text-surface-700 dark:text-dark-300 mb-3">Suspend Link (optional)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Suspend From</label>
                <input
                  type="date"
                  value={suspendFrom}
                  onChange={(e) => setSuspendFrom(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Suspend Until</label>
                <input
                  type="date"
                  value={suspendUntil}
                  onChange={(e) => setSuspendUntil(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2">Leave empty to unsuspend</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}