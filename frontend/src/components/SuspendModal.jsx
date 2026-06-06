import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { urlApi } from '../api/urlApi';

export default function SuspendModal({ isOpen, onClose, url, onSave }) {
  const [suspendFrom, setSuspendFrom] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (url) {
      setSuspendFrom(url.suspendFrom ? new Date(url.suspendFrom).toISOString().split('T')[0] : '');
      setSuspendUntil(url.suspendUntil ? new Date(url.suspendUntil).toISOString().split('T')[0] : '');
    }
  }, [url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {};
      
      // If dates are set, suspend the link
      if (suspendFrom) payload.suspendFrom = suspendFrom;
      if (suspendUntil) payload.suspendUntil = suspendUntil;
      
      // If both are empty, unsuspend the link
      if (!suspendFrom && !suspendUntil) {
        payload.suspendFrom = null;
        payload.suspendUntil = null;
      }
      
      const { data } = await urlApi.update(url._id, payload);
      onSave?.(data.url);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update suspension');
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
            Suspend Link
          </h2>
          <button onClick={onClose} className="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> When a link is suspended, visitors will see "Link Suspended" 
            message instead of being redirected.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Short Code</label>
            <div className="input bg-surface-200 dark:bg-dark-700 text-surface-500">
              /{url?.shortCode}
            </div>
          </div>

          <div>
            <label className="label">Suspend From (optional)</label>
            <input
              type="date"
              value={suspendFrom}
              onChange={(e) => setSuspendFrom(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Suspend Until (optional)</label>
            <input
              type="date"
              value={suspendUntil}
              onChange={(e) => setSuspendUntil(e.target.value)}
              className="input"
            />
          </div>

          <p className="text-xs text-surface-500">
            Leave both empty to unsuspend the link
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}