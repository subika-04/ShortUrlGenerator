import { useState } from 'react';
import { urlApi } from '../api/urlApi';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkCSVForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const text = await file.text();
      const urls = text
        .split('\n')
        .map((u) => u.trim())
        .filter((u) => u && (u.startsWith('http://') || u.startsWith('https://')));

      if (urls.length === 0) {
        setError('No valid URLs found');
        setLoading(false);
        return;
      }

      const { data } = await urlApi.bulkShorten(urls);
      setResults(data);
      if (data.successCount > 0) {
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const copyAll = async () => {
    if (!results?.urls) 
      {
        alert("Links has been added to Your Links");
        return;
      }
    const text = results.urls.map(u => `${window.location.origin}/${u.shortCode}`).join('\n');
    await navigator.clipboard.writeText(text);
  };

  const handleFileReset = () => {
    setFile(null);
    setResults(null);
    setError('');
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Bulk Upload</h3>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="label">Upload CSV/TXT</label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="input w-full"
          />
          <p className="text-xs text-surface-500 mt-1">
            One URL per line: https://google.com
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || !file} className="btn-primary w-full">
          {loading ? 'Processing...' : 'Upload & Shorten'}
        </button>
      </form>

      {/* ✅ Show Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-surface-900 dark:text-white">
                ✅ {results.successCount} URLs Created
              </p>
              {results.errorCount > 0 && (
                <p className="text-red-500 text-sm">{results.errorCount} failed</p>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {results.urls?.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-surface-50 dark:bg-dark-700 rounded-lg">
                  <span className="text-primary-500 font-mono text-sm flex-1 truncate">
                    /{url.shortCode}
                  </span>
                  <span className="text-surface-500 text-xs truncate max-w-[150px]">
                    {url.originalUrl}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={copyAll} className="btn-primary flex-1">
                Copy All Short URLs
              </button>
              <button onClick={handleFileReset} className="btn-ghost">
                Upload More
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}