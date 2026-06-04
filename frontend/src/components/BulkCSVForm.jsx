import { useState } from 'react';
import { urlApi } from '../api/urlApi';

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

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Bulk Upload CSV</h3>
      
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {results && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-600 font-medium">
              ✅ {results.successCount} URLs created!
            </p>
            {results.errorCount > 0 && (
              <p className="text-red-500 text-sm">{results.errorCount} failed</p>
            )}
          </div>
        )}

        <button type="submit" disabled={loading || !file} className="btn-primary w-full">
          {loading ? 'Processing...' : 'Upload & Shorten'}
        </button>
      </form>
    </div>
  );
}