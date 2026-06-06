import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { urlApi } from '../api/urlApi';
import EditModal from './EditModal';
import SuspendModal from './SuspendModal';

export default function UrlCard({ url, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shortUrl = `${window.location.origin}/${url.shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await urlApi.delete(url._id);
        onDelete?.(url._id);
      } catch (err) {
        alert('Failed to delete link');
      }
    }
    setShowMenu(false);
  };

  const handleSaveEdit = (updated) => {
    onUpdate?.(updated);
    setShowEdit(false);
  };

  const handleSaveSuspend = (updated) => {
    onUpdate?.(updated);
    setShowSuspend(false);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Link 
                to={`/stats/${url.shortCode}`}
                className="text-lg font-display font-semibold text-primary-500 hover:text-primary-600"
              >
                /{url.shortCode}
              </Link>
              {url.isActive === false && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Inactive
                </span>
              )}
              {url.expiresAt && new Date(url.expiresAt) < new Date() && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Expired
                </span>
              )}
            </div>
            
            <p className="text-surface-600 dark:text-dark-400 text-sm truncate mb-2">
              {url.originalUrl}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500 dark:text-dark-400">
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {url.clickCount} clicks
              </span>
              <span>•</span>
              <span>{new Date(url.createdAt).toLocaleDateString()}</span>
              {url.expiresAt && (
                <>
                  <span>•</span>
                  <span className={new Date(url.expiresAt) < new Date() ? 'text-red-500' : ''}>
                    Expires: {new Date(url.expiresAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 w-40 bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 rounded-xl shadow-lg overflow-hidden z-10"
              >
                <button 
                  onClick={() => { setShowMenu(false); setShowEdit(true); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-surface-700 dark:text-dark-300 hover:bg-surface-100 dark:hover:bg-dark-700 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9-9z" />
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={() => { setShowMenu(false); setShowSuspend(true); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-surface-700 dark:text-dark-300 hover:bg-surface-100 dark:hover:bg-dark-700 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Suspend
                </button>
                <button 
                  onClick={() => window.open(`/stats/${url.shortCode}`, '_blank')}
                  className="w-full px-4 py-2.5 text-left text-sm text-surface-700 dark:text-dark-300 hover:bg-surface-100 dark:hover:bg-dark-700 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Stats
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <EditModal 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        url={url} 
        onSave={handleSaveEdit} 
      />

      {/* Suspend Modal */}
      <SuspendModal 
        isOpen={showSuspend} 
        onClose={() => setShowSuspend(false)} 
        url={url} 
        onSave={handleSaveSuspend} 
      />
    </>
  );
}