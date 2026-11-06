const crypto = require("crypto");
const { User, RefreshToken } = require("../../db/db");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodeToken,
  hashToken,
} = require("../utils/jwt.util");

/**
 * Generate a new access and refresh token pair and save the hashed refresh token to MongoDB.
 *
 * @param {Object} user - Mongoose User document or user-like object
 * @param {Object} options - Metadata including ipAddress, userAgent, and optional family
 * @returns {Promise<{ accessToken: string, refreshToken: string, token: string, family: string, expiresAt: Date }>}
 */
const generateAuthTokens = async (
  user,
  { ipAddress = null, userAgent = null, family = null } = {},
) => {
  const tokenFamily = family || crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, { family: tokenFamily });

  const tokenHash = hashToken(refreshToken);
  const decoded = decodeToken(refreshToken);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const userId = user._id || user.id;

  await RefreshToken.create({
    userId,
    tokenHash,
    family: tokenFamily,
    expiresAt,
    createdByIp: ipAddress,
    userAgent,
    isRevoked: false,
  });

  return {
    accessToken,
    refreshToken,
    token: accessToken, // Backward compatibility alias
    family: tokenFamily,
    expiresAt,
  };
};

/**
 * Rotate a refresh token:
 * - Verifies cryptographic validity.
 * - Detects token reuse (if an already-revoked token is replayed, invalidates the whole family).
 * - Issues a brand new access and refresh token while marking the old token as revoked and replaced.
 *
 * @param {Object} params
 * @param {string} params.refreshToken
 * @param {string} [params.ipAddress]
 * @param {string} [params.userAgent]
 * @returns {Promise<{ status: number, error?: string, accessToken?: string, refreshToken?: string, token?: string, user?: Object }>}
 */
const rotateRefreshToken = async ({
  refreshToken,
  ipAddress = null,
  userAgent = null,
}) => {
  if (!refreshToken || typeof refreshToken !== "string") {
    return { status: 400, error: "Refresh token is required" };
  }

  // 1. Verify token signature and expiration with the dedicated refresh secret
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return {
      status: 401,
      error:
        error.name === "TokenExpiredError"
          ? "Refresh token has expired"
          : "Invalid refresh token",
    };
  }

  // 2. Hash the incoming token to look it up in the database
  const tokenHash = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken) {
    return {
      status: 401,
      error: "Refresh token not recognized or session terminated",
    };
  }

  // 3. Reuse Detection: If token is already revoked, an attacker or replay occurred.
  // Revoke all tokens in this family immediately.
  if (storedToken.isRevoked) {
    await RefreshToken.updateMany(
      { family: storedToken.family },
      { isRevoked: true, revokedAt: new Date() },
    );
    return {
      status: 401,
      error:
        "Security alert: Refresh token reuse detected. All sessions in this chain have been revoked.",
    };
  }

  // 4. Verify DB-level expiration
  if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();
    return {
      status: 401,
      error: "Refresh token has expired",
    };
  }

  // 5. Verify user status
  const user = await User.findById(storedToken.userId);
  if (!user) {
    return { status: 404, error: "User account no longer exists" };
  }

  if (
    user.status === "blocked" ||
    user.status === "blockend" ||
    user.status === "BLOCKED"
  ) {
    return { status: 403, error: "Account is blocked" };
  }

  // 6. Generate rotated pair with the same family
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user, {
    family: storedToken.family,
  });
  const newTokenHash = hashToken(newRefreshToken);
  const newDecoded = decodeToken(newRefreshToken);
  const newExpiresAt = newDecoded?.exp
    ? new Date(newDecoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 7. Revoke old token and link to replacement
  storedToken.isRevoked = true;
  storedToken.revokedAt = new Date();
  storedToken.replacedByTokenHash = newTokenHash;
  await storedToken.save();

  // 8. Save new refresh token record
  await RefreshToken.create({
    userId: user._id,
    tokenHash: newTokenHash,
    family: storedToken.family,
    expiresAt: newExpiresAt,
    createdByIp: ipAddress,
    userAgent,
    isRevoked: false,
  });

  return {
    status: 200,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken,
    user,
  };
};

/**
 * Revoke a specific refresh token (used on logout).
 *
 * @param {Object} params
 * @param {string} params.refreshToken
 * @returns {Promise<boolean>}
 */
const revokeRefreshToken = async ({ refreshToken }) => {
  if (!refreshToken || typeof refreshToken !== "string") {
    return false;
  }

  try {
    const tokenHash = hashToken(refreshToken);
    const result = await RefreshToken.updateOne(
      { tokenHash, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
    return result.modifiedCount > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Revoke all active refresh tokens for a user (e.g., logout from all devices or password change).
 *
 * @param {Object} params
 * @param {string} params.userId
 * @returns {Promise<number>}
 */
const revokeAllUserTokens = async ({ userId }) => {
  if (!userId) return 0;
  const result = await RefreshToken.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true, revokedAt: new Date() },
  );
  return result.modifiedCount;
};

module.exports = {
  generateAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
