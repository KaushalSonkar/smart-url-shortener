import { Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { Link } from '../models/Link';
import { redisClient } from '../config/redis';
import { AuthRequest } from '../middlewares/authMiddleware';

// Utility to generate a collision-safe short code
const generateShortCode = (length = 6): string => {
  // Generates random bytes, converts to base64, cleans non-alphanumeric chars
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, length);
};

export const createLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originalUrl, customAlias } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User ID not found.' });
      return;
    }

    let shortCode = '';

    if (customAlias) {
      const aliasLower = customAlias.trim();
      // Check if alias is already taken as shortCode or customAlias
      const existingLink = await Link.findOne({
        $or: [{ shortCode: aliasLower }, { customAlias: aliasLower }],
      });

      if (existingLink) {
        res.status(400).json({ message: 'Custom alias is already in use.' });
        return;
      }
      shortCode = aliasLower;
    } else {
      let unique = false;
      while (!unique) {
        const potentialCode = generateShortCode();
        const existingLink = await Link.findOne({
          $or: [{ shortCode: potentialCode }, { customAlias: potentialCode }],
        });
        if (!existingLink) {
          shortCode = potentialCode;
          unique = true;
        }
      }
    }

    // Construct the actual redirect URL pointing to the backend redirect path
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol;
    const shortUrl = `${protocol}://${host}/${shortCode}`;

    // Generate QR code data URI
    const qrCodeDataUri = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });

    const newLink = new Link({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias ? shortCode : undefined,
      qrCode: qrCodeDataUri,
      clicks: 0,
    });

    await newLink.save();

    // Cache the redirection mapping in Redis for 24 hours
    // Cache payload holds both the target URL and DB document ID for async tracking
    const cachePayload = JSON.stringify({
      id: newLink._id,
      originalUrl: newLink.originalUrl,
    });
    
    if (redisClient.isOpen) {
      await redisClient.setEx(`link:${shortCode}`, 86400, cachePayload);
    }

    res.status(201).json({
      success: true,
      link: newLink,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating short URL.' });
  }
};

export const getLinks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const search = req.query.search as string;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    let query: any = { userId };

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort by newest links first
    const links = await Link.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      links,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching links.' });
  }
};

export const getLinkById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      res.status(404).json({ message: 'Link not found or unauthorized.' });
      return;
    }

    res.status(200).json({
      success: true,
      link,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching link details.' });
  }
};

export const updateLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;
    const userId = req.user?.userId;

    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      res.status(404).json({ message: 'Link not found or unauthorized.' });
      return;
    }

    // Invalidate old cache key
    if (redisClient.isOpen) {
      await redisClient.del(`link:${link.shortCode}`);
    }

    link.originalUrl = originalUrl;
    await link.save();

    // Cache updated link mapping in Redis
    const cachePayload = JSON.stringify({
      id: link._id,
      originalUrl: link.originalUrl,
    });

    if (redisClient.isOpen) {
      await redisClient.setEx(`link:${link.shortCode}`, 86400, cachePayload);
    }

    res.status(200).json({
      success: true,
      link,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating link.' });
  }
};

export const deleteLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const link = await Link.findOne({ _id: id, userId });
    if (!link) {
      res.status(404).json({ message: 'Link not found or unauthorized.' });
      return;
    }

    // Remove from Redis
    if (redisClient.isOpen) {
      await redisClient.del(`link:${link.shortCode}`);
    }

    // Delete link from MongoDB (triggers cascade or is standard delete)
    await Link.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Link successfully deleted.',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting link.' });
  }
};
