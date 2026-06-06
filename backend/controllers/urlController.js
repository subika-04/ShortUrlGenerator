const geoip = require('geoip-lite');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

// ✅ Helper to clean BASE_URL (removes trailing slashes)
const getBaseUrl = () => {
  return (process.env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
};

// Helper: parse device type from userAgent
const getDeviceType = (ua = '') => {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'Mobile';
  if (ua) return 'Desktop';
  return 'Unknown';
};

// Helper: parse browser name
const getBrowser = (ua = '') => {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  if (/opera/i.test(ua)) return 'Opera';
  if (/msie|trident/i.test(ua)) return 'IE';
  return 'Unknown';
};

// Helper: parse OS from userAgent
const getOperatingSystem = (ua = '') => {
  if (/windows nt 10/i.test(ua)) return 'Windows 10';
  if (/windows nt 6\.3/i.test(ua)) return 'Windows 8.1';
  if (/windows nt 6\.1/i.test(ua)) return 'Windows 7';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/ios|iphone|ipad/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  if (/windows phone/i.test(ua)) return 'Windows Phone';
  return 'Unknown';
};

// Helper: check if URL is expired
const isUrlExpired = (url) => {
  if (!url.expiresAt) return false;
  const now = new Date();
  let expiryDate = new Date(url.expiresAt);
  if (url.expiresAtTime) {
    const [hours, minutes] = url.expiresAtTime.split(':');
    expiryDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  return now > expiryDate;
};

// POST /api/url/shorten
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt, expiresAtTime } = req.body;
    // In shortenUrl function, improve validation:
if (!originalUrl) {
  return res.status(400).json({ message: 'Original URL is required.' });
}

// Check for valid URL format
if (!validUrl.isUri(originalUrl)) {
  return res.status(400).json({ message: 'Please provide a valid URL (include http:// or https://).' });
}

// Try to fetch the URL to validate it actually exists
try {
  const response = await fetch(originalUrl, { method: 'HEAD', timeout: 5000 });
  if (!response.ok) {
    console.log('URL responded but may not be valid:', response.status);
  }
} catch (err) {
  console.log('URL validation warning:', err.message);
}

    let shortCode = customAlias ? customAlias.trim() : nanoid(10);

    if (customAlias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        return res.status(400).json({ message: 'Custom alias can only contain letters, numbers, hyphens, and underscores.' });
      }
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(409).json({ message: 'This custom alias is already taken.' });
      }
    } else {
      let attempts = 0;
      while (await Url.findOne({ shortCode }) && attempts < 5) {
        shortCode = nanoid(7);
        attempts++;
      }
    }

    let expiration = null;
    if (expiresAt) {
      expiration = new Date(expiresAt);
      if (isNaN(expiration.getTime())) {
        return res.status(400).json({ message: 'Invalid expiration date.' });
      }
      if (expiration < new Date()) {
        return res.status(400).json({ message: 'Expiration date must be in the future.' });
      }
    }

    const url = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiresAt: expiration,
      expiresAtTime: expiresAtTime || null,
    });

    res.status(201).json({
      message: 'Short URL created successfully.',
      url: {
        ...url.toObject(),
        shortUrl: `${getBaseUrl()}/${shortCode}`,  // ✅ FIXED
      },
    });
  } catch (err) {
    console.error("SHORTEN ERROR:", err);
    res.status(500).json({ message: 'Failed to create short URL.' });
  }
};

// GET /api/url/user/all
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const urlsWithShort = urls.map((u) => ({
      ...u,
      isExpired: isUrlExpired(u),
      shortUrl: `${getBaseUrl()}/${u.shortCode}`,  // ✅ FIXED
    }));

    res.json({ urls: urlsWithShort });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch URLs.' });
  }
};

// DELETE /api/url/:id
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }
    await Url.deleteOne({ _id: url._id });
    await Visit.deleteMany({ urlId: url._id });
    res.json({ message: 'URL deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete URL.' });
  }
};

// PUT /api/url/:id
const updateUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required.' });
    }
    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: 'Please provide a valid URL.' });
    }
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }
    url.originalUrl = originalUrl;
    await url.save();
    res.json({
      message: 'URL updated successfully.',
      url: {
        ...url.toObject(),
        shortUrl: `${getBaseUrl()}/${url.shortCode}`,  // ✅ FIXED
        isExpired: isUrlExpired(url),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update URL.' });
  }
};

// ✅ getAnalytics - fix the broken line
const getAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }
    const expired = isUrlExpired(url);
    const recentVisits = await Visit.find({ urlId: url._id }).sort({ timestamp: -1 }).limit(20).lean();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyClicks = await Visit.aggregate([
      { $match: { urlId: url._id, timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);
    const deviceBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);
    const browserBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);
    const osBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$operatingSystem', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);
    const countryBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);
    const referrerBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { source: '$_id', count: 1, _id: 0 } },
    ]);
    const uniqueUsers = await Visit.countDocuments({ urlId: url._id, isUnique: true });
    const totalVisits = await Visit.countDocuments({ urlId: url._id });
    const repeatedUsers = totalVisits - uniqueUsers;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const hourlyHeatmap = await Visit.aggregate([
      { $match: { urlId: url._id, timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: { dayOfWeek: { $dayOfWeek: '$timestamp' }, hour: { $hour: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
      { $project: { day: '$_id.dayOfWeek', hour: '$_id.hour', count: 1, _id: 0 } },
    ]);
    const weeklyGrowth = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const count = await Visit.countDocuments({ urlId: url._id, timestamp: { $gte: weekStart, $lt: weekEnd } });
      weeklyGrowth.unshift({
        week: `Week ${4 - i}`,
        count,
        percentage: i === 0 ? 0 : Math.round(((count - weeklyGrowth[0]?.count || 0) / (weeklyGrowth[0]?.count || 1)) * 100),
      });
    }
    res.json({
      url: {
        ...url,
        shortUrl: `${getBaseUrl()}/${url.shortCode}`,  // ✅ FIXED (was missing /)
        isExpired: expired,
      },
      analytics: {
        totalClicks: url.clickCount,
        uniqueVisitors: url.uniqueVisitors || uniqueUsers,
        lastVisited: url.lastVisited,
        recentVisits,
        dailyClicks,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        referrerBreakdown,
        uniqueUsers,
        repeatedUsers,
        hourlyHeatmap,
        weeklyGrowth,
        isExpired: expired,
      },
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
};

// GET /api/url/public/:shortCode
const getPublicStats = async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode }).lean();
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found.' });
    }
    
    // ✅ Get visits to count unique visitors
    const visits = await Visit.find({ urlId: url._id }).lean();
    
    // ✅ Count unique visitors by fingerprint
    const uniqueFingerprints = new Set(visits.map(v => v.fingerprint).filter(Boolean));
    const uniqueVisitors = uniqueFingerprints.size;
    
    // Daily clicks aggregation
    const dailyClicks = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);
    
    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clickCount: url.clickCount || 0,
      uniqueVisitors: uniqueVisitors || 0,  // ✅ Add this!
      createdAt: url.createdAt,
      dailyClicks,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public stats.' });
  }
};

// PATCH /api/url/expiry/:id
const updateExpiry = async (req, res) => {
  try {
    const { expiresAt, expiresAtTime } = req.body;
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }
    if (expiresAt === null) {
      url.expiresAt = null;
      url.expiresAtTime = null;
    } else if (expiresAt) {
      const expiration = new Date(expiresAt);
      if (isNaN(expiration.getTime())) {
        return res.status(400).json({ message: 'Invalid expiration date.' });
      }
      if (expiration < new Date()) {
        return res.status(400).json({ message: 'Expiration date must be in the future.' });
      }
      url.expiresAt = expiration;
      url.expiresAtTime = expiresAtTime || null;
    }
    await url.save();
    res.json({
      message: 'Expiration updated successfully.',
      url: {
        ...url.toObject(),
        shortUrl: `${getBaseUrl()}/${url.shortCode}`,  // ✅ FIXED
        isExpired: isUrlExpired(url),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update expiration.' });
  }
};
// POST /api/url/bulk
const bulkShorten = async (req, res) => {
  try {
    const { urls, expiresAt, expiresAtTime } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'Please provide an array of URLs.' });
    }
    
    if (urls.length > 100) {
      return res.status(400).json({ message: 'Maximum 100 URLs at a time.' });
    }
    
    const results = [];
    const errors = [];
    
    for (const originalUrl of urls) {
      if (!validUrl.isUri(originalUrl)) {
        errors.push({ url: originalUrl, error: 'Invalid URL' });
        continue;
      }
      
      let shortCode = nanoid(10);
      let attempts = 0;
      while (await Url.findOne({ shortCode }) && attempts < 5) {
        shortCode = nanoid(10);
        attempts++;
      }
      
      let expiration = null;
      if (expiresAt) {
        expiration = new Date(expiresAt);
        if (!isNaN(expiration.getTime()) && expiration > new Date()) {
          if (expiresAtTime) {
            const [hours, minutes] = expiresAtTime.split(':');
            expiration.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }
        }
      }
      
      const url = await Url.create({
        userId: req.user._id,
        originalUrl,
        shortCode,
        expiresAt: expiration,
        expiresAtTime: expiresAtTime || null,
      });
      
      results.push({
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${getBaseUrl()}/${url.shortCode}`,
      });
    }
    
    res.json({ results, errors });
  } catch (err) {
    res.status(500).json({ message: 'Bulk shortening failed.' });
  }
};

// Check if URL is suspended
const isUrlSuspended = (url) => {
  if (!url.suspendFrom || !url.suspendUntil) return false;
  
  const now = new Date();
  let suspendFrom = new Date(url.suspendFrom);
  let suspendUntil = new Date(url.suspendUntil);
  
  if (url.suspendFromTime) {
    const [hours, minutes] = url.suspendFromTime.split(':');
    suspendFrom.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  if (url.suspendUntilTime) {
    const [hours, minutes] = url.suspendUntilTime.split(':');
    suspendUntil.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  return now >= suspendFrom && now <= suspendUntil;
};
module.exports = {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  getAnalytics,
  getPublicStats,
  updateExpiry,
  getDeviceType,
  getBrowser,
  getOperatingSystem,
  isUrlExpired,
  bulkShorten,
  isUrlSuspended
};


// Helper: get visitor location from IP
const getVisitorLocation = (ip) => {
  try {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      return { country: 'Unknown', city: 'N/A' };
    }
    const geo = geoip.lookup(ip);
    return {
      country: geo?.country || 'Unknown',
      city: geo?.city || 'N/A'
    };
  } catch (err) {
    return { country: 'Unknown', city: 'N/A' };
  }
};

