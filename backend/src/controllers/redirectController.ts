import { Request, Response } from 'express';
import { Link } from '../models/Link';
import { Analytics } from '../models/Analytics';
import { redisClient } from '../config/redis';

// Simple user-agent parser to classify devices, operating systems, and browsers
const parseUserAgent = (userAgentHeader: string | undefined) => {
  const ua = userAgentHeader || '';
  let browser = 'Other';
  let device = 'Desktop';
  let operatingSystem = 'Other';

  // Detect browser
  if (ua.includes('Firefox') && !ua.includes('Seamonkey')) {
    browser = 'Firefox';
  } else if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Safari';
  } else if (ua.includes('Edg') || ua.includes('Edge')) {
    browser = 'Edge';
  } else if (ua.includes('MSIE') || ua.includes('Trident')) {
    browser = 'Internet Explorer';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
  }

  // Detect device type
  if (/ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    device = 'Mobile';
  }

  // Detect OS
  if (ua.includes('Windows NT')) {
    operatingSystem = 'Windows';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    operatingSystem = 'macOS';
  } else if (ua.includes('Android')) {
    operatingSystem = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    operatingSystem = 'iOS';
  } else if (ua.includes('Linux')) {
    operatingSystem = 'Linux';
  }

  return { browser, device, operatingSystem };
};

// Asynchronous background click logging to ensure rapid redirection
const logAnalytics = async (linkId: string, req: Request): Promise<void> => {
  try {
    // 1. Increment click counter on the link
    await Link.updateOne({ _id: linkId }, { $inc: { clicks: 1 } });

    // 2. Parse request headers
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    // Clean IP in case of proxy arrays
    const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'Unknown';

    // Parse referrer. Keep only host for cleaner analytics, or fallback to 'Direct'
    let referrer = 'Direct';
    const refererHeader = req.headers['referer'] || req.headers['referrer'];
    if (refererHeader && typeof refererHeader === 'string') {
      try {
        const refUrl = new URL(refererHeader);
        referrer = refUrl.hostname || refererHeader;
      } catch (err) {
        referrer = refererHeader;
      }
    }

    const { browser, device, operatingSystem } = parseUserAgent(req.headers['user-agent']);

    // 3. Save click analytics log in database
    const analyticEntry = new Analytics({
      linkId,
      ip,
      browser,
      device,
      referrer,
      operatingSystem,
    });
    
    await analyticEntry.save();
  } catch (error) {
    console.error('Error logging analytics in background:', error);
  }
};

export const redirectUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // 1. Check Redis cache first
    let cachedLink: string | null = null;
    if (redisClient.isOpen) {
      cachedLink = await redisClient.get(`link:${shortCode}`);
    }

    if (cachedLink) {
      const { id, originalUrl } = JSON.parse(cachedLink);
      // Run analytics asynchronously in the background. Do not await it.
      logAnalytics(id, req);
      // Redirect immediately
      res.redirect(originalUrl);
      return;
    }

    // 2. Fallback to MongoDB lookup
    const link = await Link.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!link) {
      // If short link is invalid, redirect to front-end 404 page
      res.redirect(`${clientUrl}/404`);
      return;
    }

    // 3. Cache the found mapping in Redis for future hits (TTL: 24h)
    const cachePayload = JSON.stringify({
      id: link._id,
      originalUrl: link.originalUrl,
    });

    if (redisClient.isOpen) {
      await redisClient.setEx(`link:${shortCode}`, 86400, cachePayload);
    }

    // 4. Log analytics asynchronously
    logAnalytics(link._id.toString(), req);

    // 5. Perform redirection
    res.redirect(link.originalUrl);
  } catch (error: any) {
    console.error('Redirection router failure:', error);
    res.status(500).send('Internal server error during redirection.');
  }
};
