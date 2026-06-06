const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const geoip = require('geoip-lite');
const { getDeviceType, getBrowser, getOperatingSystem, isUrlExpired } = require('../controllers/urlController');

const getExpiryPage = (shortCode, type = 'expired') => {
  const title = type === 'expired' ? 'Link Expired' : 'Link Suspended';
  const message = type === 'expired' 
    ? `This short link /${shortCode} has expired and is no longer active.`
    : `This short link /${shortCode} is currently suspended.`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Short URL Generator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center">
    <div class="w-20 h-20 mx-auto mb-6 rounded-full ${type === 'expired' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'} flex items-center justify-center">
      ${type === 'expired' 
        ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
        : `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`
      }
    </div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${title}</h1>
    <p class="text-gray-600 dark:text-gray-400 mb-6">${message}</p>
    <a href="/" class="inline-block w-full bg-blue-500 dark:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">Create New Link</a>
  </div>
</body>
</html>`;
};

const isUrlSuspended = (url) => {
  if (!url.suspendFrom || !url.suspendUntil) return false;
  const now = new Date();
  const suspendFrom = new Date(url.suspendFrom);
  const suspendUntil = new Date(url.suspendUntil);
  return now >= suspendFrom && now <= suspendUntil;
};

const getLocationFromIP = (ip) => {
  try {
    if (!ip || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168') || ip.startsWith('172.')) {
      return { country: 'Unknown', countryCode: null, city: 'N/A' };
    }
    const geo = geoip.lookup(ip);
    return geo ? { country: geo.country || 'Unknown', countryCode: geo.country || null, city: geo.city || 'N/A' } : { country: 'Unknown', countryCode: null, city: 'N/A' };
  } catch (err) {
    return { country: 'Unknown', countryCode: null, city: 'N/A' };
  }
};

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  console.log("REDIRECT HIT:", shortCode);

  // Skip API routes
  if (shortCode.startsWith('api') || shortCode === 'favicon.ico') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const url = await Url.findOne({ shortCode, isActive: true });
    if (!url) {
      return res.status(404).send(getExpiryPage(shortCode, 'expired'));
    }

    // Check if expired - return HTML page
    if (isUrlExpired(url)) {
      return res.status(410).send(getExpiryPage(shortCode, 'expired'));
    }

    // Check if suspended - return HTML page
    if (isUrlSuspended(url)) {
      return res.status(403).send(getExpiryPage(shortCode, 'suspended'));
    }

    const ip = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '127.0.0.1').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    const location = getLocationFromIP(ip);
    const fingerprint = ip;

    const existingVisit = await Visit.findOne({ urlId: url._id, fingerprint });
    const isUnique = !existingVisit;

    try {
      await Visit.create({
        urlId: url._id,
        shortCode,
        timestamp: new Date(),
        referrer: req.headers['referer'] || req.headers['referrer'] || 'Direct',
        userAgent,
        deviceType: getDeviceType(userAgent),
        browser: getBrowser(userAgent),
        operatingSystem: getOperatingSystem(userAgent),
        ip,
        country: location.country,
        countryCode: location.countryCode,
        city: location.city,
        fingerprint,
        isUnique,
      });
    } catch (visitErr) {
      console.log("Visit save error:", visitErr.message);
    }

    await Url.findByIdAndUpdate(url._id, { $inc: { clickCount: 1 }, lastVisited: new Date() });
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).send(getExpiryPage(shortCode, 'expired'));
  }
});

module.exports = router;