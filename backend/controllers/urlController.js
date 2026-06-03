const geoip = require('geoip-lite');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

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
  
  // If expiration time is set, combine date and time
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
    console.log("Creating URL:", originalUrl);
    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required.' });
    }

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: 'Please provide a valid URL (include http:// or https://).' });
    }

    let shortCode = customAlias ? customAlias.trim() : nanoid(10);

    // Validate custom alias
    if (customAlias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        return res.status(400).json({ message: 'Custom alias can only contain letters, numbers, hyphens, and underscores.' });
      }
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(409).json({ message: 'This custom alias is already taken.' });
      }
    } else {
      // Ensure uniqueness
      let attempts = 0;
      while (await Url.findOne({ shortCode }) && attempts < 5) {
        shortCode = nanoid(7);
        attempts++;
      }
    }

    // Parse expiration date
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
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
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
      shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
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
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        isExpired: isUrlExpired(url),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update URL.' });
  }
};

// GET /api/url/analytics/:id
const getAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }

    // Check if URL is expired
    const expired = isUrlExpired(url);

    // Recent visits (last 20)
    const recentVisits = await Visit.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    // Daily clicks for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // Device breakdown
    const deviceBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Browser breakdown
    const browserBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Operating System breakdown
    const osBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$operatingSystem', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Geolocation breakdown (by country)
    const countryBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Referrer breakdown
    const referrerBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { source: '$_id', count: 1, _id: 0 } },
    ]);

    // Unique vs Repeated users
    const uniqueUsers = await Visit.countDocuments({ urlId: url._id, isUnique: true });
    const totalVisits = await Visit.countDocuments({ urlId: url._id });
    const repeatedUsers = totalVisits - uniqueUsers;

    // Hourly heatmap data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hourlyHeatmap = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$timestamp' },
            hour: { $hour: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
      {
        $project: {
          day: '$_id.dayOfWeek',
          hour: '$_id.hour',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Weekly growth (last 4 weeks)
    const weeklyGrowth = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      const count = await Visit.countDocuments({
        urlId: url._id,
        timestamp: { $gte: weekStart, $lt: weekEnd },
      });
      
      weeklyGrowth.unshift({
        week: `Week ${4 - i}`,
        count,
        percentage: i === 0 ? 0 : Math.round(((count - weeklyGrowth[0]?.count || 0) / (weeklyGrowth[0]?.count || 1)) * 100),
      });
    }

    res.json({
      url: { 
        ...url, 
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
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

// GET /api/url/public/:shortCode — public stats page
const getPublicStats = async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode }).lean();
    if (!url) {
      return res.status(404).json({ message: 'URL not found.' });
    }

    // Check if URL is expired
    const expired = isUrlExpired(url);
    if (expired) {
      return res.status(410).json({ message: 'This link has expired.', isExpired: true });
    }

    const dailyClicks = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // Country breakdown for public stats
    const countryBreakdown = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clickCount: url.clickCount,
      uniqueVisitors: url.uniqueVisitors || 0,
      createdAt: url.createdAt,
      lastVisited: url.lastVisited,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      dailyClicks,
      countryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public stats.' });
  }
};

// PATCH /api/url/expiry/:id - Update expiration
const updateExpiry = async (req, res) => {
  try {
    const { expiresAt, expiresAtTime } = req.body;
    
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }

    // Parse expiration date
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
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        isExpired: isUrlExpired(url),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update expiration.' });
  }
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
};

// Helper: get visitor location from IP
const getVisitorLocation = (ip) => {
  try {
    // Handle localhost/dev environments
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