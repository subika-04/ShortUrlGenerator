const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const geoip = require('geoip-lite');
const { getDeviceType, getBrowser, getOperatingSystem, isUrlExpired } = require('../controllers/urlController');

const getLocationFromIP = (ip) => {
  try {
    if (!ip || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168') || ip.startsWith('172.')) {
      return { country: 'Unknown', countryCode: null, city: 'N/A' };
    }
    const geo = geoip.lookup(ip);
    if (!geo) {
      return { country: 'Unknown', countryCode: null, city: 'N/A' };
    }
    return {
      country: geo.country || 'Unknown',
      countryCode: geo.country || null,
      city: geo.city || 'N/A'
    };
  } catch (err) {
    console.error('GeoIP error:', err);
    return { country: 'Unknown', countryCode: null, city: 'N/A' };
  }
};

router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    if (shortCode.startsWith('api') || shortCode === 'favicon.ico') {
      return res.status(404).json({ message: 'Not found' });
    }

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found.' });
    }

    if (isUrlExpired(url)) {
      return res.status(410).json({ 
        message: 'This link has expired.',
        isExpired: true,
        expiredAt: url.expiresAt,
      });
    }

    // Get IP
    const forwardedIP = req.headers['x-forwarded-for'];
    const ip = forwardedIP ? forwardedIP.split(',')[0].trim() : 
              req.ip || 
              req.connection?.remoteAddress || 
              '127.0.0.1';
    
    console.log("🔗 Visit from IP:", ip);
    
    const location = getLocationFromIP(ip);
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
    const deviceType = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);
    const operatingSystem = getOperatingSystem(userAgent);

    // Create fingerprint
    const fingerprint = `${ip}-${userAgent.substring(0, 50)}`;
    console.log("🔐 Fingerprint:", fingerprint);

    // Check if unique visitor
    const existingVisit = await Visit.findOne({
      urlId: url._id,
      fingerprint: fingerprint
    });
    const isUnique = !existingVisit;
    console.log("👤 Is unique:", isUnique || "Returning");

    // ✅ FIXED: Use async/await with proper error handling
    const visitData = {
      urlId: url._id,
      shortCode: shortCode,
      timestamp: new Date(),
      referrer: referrer || 'Direct',
      userAgent: userAgent,
      deviceType: deviceType,
      browser: browser,
      operatingSystem: operatingSystem,
      ip: ip,
      country: location.country,
      countryCode: location.countryCode,
      city: location.city,
      region: location.region || 'Unknown',
      fingerprint: fingerprint,
      isUnique: isUnique,
    };
    
    console.log("💾 Visit data:", visitData);
    
    await Visit.create(visitData);
    console.log("✅ Visit saved to database");

    // Update click count
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clickCount: 1 },
      lastVisited: new Date(),
    });
    console.log("✅ Click count updated");

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error('❌ Redirect error:', err);
    res.status(500).json({ message: 'Server error during redirect.' });
  }
});

module.exports = router;