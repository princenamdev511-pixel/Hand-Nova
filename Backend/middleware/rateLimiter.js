
const loginAttempts = new Map();

export function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 15;

  let record = loginAttempts.get(ip);

  if (!record || now - record.startTime > windowMs) {
    record = { count: 1, startTime: now };
    loginAttempts.set(ip, record);
    return next();
  }

  record.count += 1;

  if (record.count > maxAttempts) {
    const remainingTimeMin = Math.ceil((record.startTime + windowMs - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please wait ${remainingTimeMin} minute(s) before trying again.`,
    });
  }

  next();
}
