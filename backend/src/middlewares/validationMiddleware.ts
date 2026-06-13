import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ message: 'Name is required and must be a valid string.' });
    return;
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    res.status(400).json({ message: 'A valid email address is required.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ message: 'Password is required and must be at least 6 characters.' });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    res.status(400).json({ message: 'A valid email address is required.' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ message: 'Password is required.' });
    return;
  }

  next();
};

export const validateLink = (req: Request, res: Response, next: NextFunction): void => {
  const { originalUrl, customAlias } = req.body;

  if (!originalUrl || typeof originalUrl !== 'string' || originalUrl.trim() === '') {
    res.status(400).json({ message: 'Original URL is required.' });
    return;
  }

  // Attempt to parse originalUrl
  let formattedUrl = originalUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    // Automatically prepend https:// if missing, so standard links work
    formattedUrl = 'https://' + formattedUrl;
    req.body.originalUrl = formattedUrl;
  }

  try {
    new URL(formattedUrl);
  } catch (error) {
    res.status(400).json({ message: 'Original URL must be a valid absolute URL.' });
    return;
  }

  if (customAlias) {
    if (typeof customAlias !== 'string') {
      res.status(400).json({ message: 'Custom alias must be a string.' });
      return;
    }
    
    const aliasTrimmed = customAlias.trim();
    req.body.customAlias = aliasTrimmed;
    
    const aliasRegex = /^[a-zA-Z0-9-_]+$/;
    if (!aliasRegex.test(aliasTrimmed)) {
      res.status(400).json({ message: 'Custom alias can only contain alphanumeric characters, hyphens, and underscores.' });
      return;
    }

    if (aliasTrimmed.length < 3) {
      res.status(400).json({ message: 'Custom alias must be at least 3 characters long.' });
      return;
    }
    
    // Prevent system route overlap
    const blacklistedAliases = ['api', 'dashboard', 'login', 'register', 'profile', 'analytics'];
    if (blacklistedAliases.includes(aliasTrimmed.toLowerCase())) {
      res.status(400).json({ message: 'This custom alias is reserved and cannot be used.' });
      return;
    }
  }

  next();
};
