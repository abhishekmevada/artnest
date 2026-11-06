const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");

/**
 * Access token secret retrieval with backward compatibility fallback.
 */
const getJwtSecret = () => {
  return (
    process.env.JWT_SECRET || process.env.jwt || "artnest_default_jwt_secret"
  );
};

const getJwtAccessSecret = () => {
  return getJwtSecret();
};

/**
 * Dedicated refresh token secret retrieval.
 * Falls back to a deterministic derivative of the main secret if unset.
 */
const getJwtRefreshSecret = () => {
  return (
    process.env.JWT_REFRESH_SECRET || `${getJwtSecret()}_refresh_secret_key`
  );
};

/**
 * Access token expiration: defaults to 15m (or existing JWT_EXPIRES_IN if specified).
 */
const getJwtExpiresIn = () => {
  return (
    process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "15m"
  );
};

const getJwtAccessExpiresIn = () => {
  return getJwtExpiresIn();
};

/**
 * Refresh token expiration: defaults to 7d.
 */
const getJwtRefreshExpiresIn = () => {
  return process.env.JWT_REFRESH_EXPIRES_IN || "7d";
};

/**
 * Cryptographic SHA-256 hash helper for storing tokens securely in MongoDB.
 */
const hashToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Token must be a non-empty string to hash");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate a short-lived access token.
 */
const generateAccessToken = (user, customExpiresIn = null) => {
  const secret = getJwtAccessSecret();
  const expiresIn = customExpiresIn || getJwtAccessExpiresIn();

  return jsonwebtoken.sign(
    {
      userId: user._id ? user._id.toString() : user.id,
      role: user.role,
      email: user.email,
      tokenType: "access",
    },
    secret,
    { expiresIn },
  );
};

/**
 * Generate a long-lived refresh token.
 */
const generateRefreshToken = (user, { family, customExpiresIn } = {}) => {
  const secret = getJwtRefreshSecret();
  const expiresIn = customExpiresIn || getJwtRefreshExpiresIn();
  const tokenFamily = family || crypto.randomUUID();

  return jsonwebtoken.sign(
    {
      userId: user._id ? user._id.toString() : user.id,
      role: user.role,
      family: tokenFamily,
      tokenType: "refresh",
    },
    secret,
    { expiresIn },
  );
};

/**
 * Existing generateToken function preserved for backward compatibility.
 */
const generateToken = (user, customExpiresIn = null) => {
  return generateAccessToken(user, customExpiresIn);
};

/**
 * Verify an access token.
 */
const verifyAccessToken = (token) => {
  const secret = getJwtAccessSecret();
  return jsonwebtoken.verify(token, secret);
};

/**
 * Existing verifyToken function preserved for backward compatibility.
 */
const verifyToken = (token) => {
  return verifyAccessToken(token);
};

/**
 * Verify a refresh token.
 */
const verifyRefreshToken = (token) => {
  const secret = getJwtRefreshSecret();
  return jsonwebtoken.verify(token, secret);
};

/**
 * Decode token payload without signature verification (useful for reading exp claims).
 */
const decodeToken = (token) => {
  return jsonwebtoken.decode(token);
};

module.exports = {
  getJwtSecret,
  getJwtAccessSecret,
  getJwtRefreshSecret,
  getJwtExpiresIn,
  getJwtAccessExpiresIn,
  getJwtRefreshExpiresIn,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyToken,
  decodeToken,
};
