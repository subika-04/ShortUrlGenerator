import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CopyButton from './CopyButton';
import Badge from './Badge';
import EditModal from './EditModal';
import QRModal from './QRModal';
import { urlApi } from '../api/urlApi';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function UrlCard({ url, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const shortUrl = `${BASE_URL}/${url.shortCode}`;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    setDeleting(true);
    try {
      await urlApi.delete(url._id);
      onDelete?.(url._id);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link
                to={`/analytics/${url._id}`}
                className="font-mono font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                /{url.shortCode}
              </Link>
              {url.isActive === false && <Badge variant="danger" size="sm">Inactive</Badge>}
              {url.isExpired && <Badge variant="warning" size="sm">Expired</Badge>}
            </div>
            
            <p className="text-sm text-surface-600 dark:text-dark-400 truncate mb-2">{url.originalUrl}</p>
            
            <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-dark-500">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {url.clickCount} clicks
              </span>
              <span>Created {formatDate(url.createdAt)}</span>
              {url.expiresAt && <span>Expires {formatDate(url.expiresAt)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1.5 bg-surface-200 dark:bg-dark-700 rounded-lg">
              <span className="font-mono text-xs text-surface-700 dark:text-dark-300">{shortUrl}</span>
              <CopyButton text={shortUrl} />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn-icon"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-36 card-glass py-1 z-10"
                  >
                    <button
                      onClick={() => { setShowEdit(true); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-surface-700 dark:text-dark-300 hover:bg-surface-200 dark:hover:bg-dark-700 flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => { setShowQR(true); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-surface-700 dark:text-dark-300 hover:bg-surface-200 dark:hover:bg-dark-700 flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                      QR Code
                    </button>
                    <button
                      onClick={() => { navigate(`/stats/${url.shortCode}`); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-surface-700 dark:text-dark-300 hover:bg-surface-200 dark:hover:bg-dark-700 flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                      Stats
                    </button>
                    <hr className="my-1 border-surface-200 dark:border-dark-700" />
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                    >
                      {deleting ? (
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <EditModal isOpen={showEdit} onClose={() => setShowEdit(false)} url={url} onSave={onUpdate} />
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} url={shortUrl} />
    </>
  );
}