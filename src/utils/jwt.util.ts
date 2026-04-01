import jwt from 'jsonwebtoken';

const accessSecret: jwt.Secret | undefined = process.env.JWT_ACCESS_SECRET;
const refreshSecret: jwt.Secret | undefined = process.env.JWT_REFRESH_SECRET;

export const generateAccessToken = (payload: Record<string, unknown>) => {
  if (!accessSecret) {
    throw new Error('JWT_ACCESS_SECRET is not configured');
  }

  return jwt.sign(payload, accessSecret, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '15m',
  });
};

export const generateRefreshToken = (payload: Record<string, unknown>) => {
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  return jwt.sign(payload, refreshSecret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '7d',
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
  } catch {
    return null;
  }
};