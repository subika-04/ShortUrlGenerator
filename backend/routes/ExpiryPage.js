const getExpiryPage = (shortCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired - Short URL Generator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center">
    <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Link Expired
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      This short link <span class="text-blue-500 font-mono">/${shortCode}</span> has expired and is no longer active.
    </p>
    <a href="/" class="inline-block w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
      Create New Link
    </a>
  </div>
</body>
</html>
  `;
};

module.exports = { getExpiryPage };