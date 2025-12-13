const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken');

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES;  // e.g. '15m'
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS); // e.g. 7 days

// create JWT access token
function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: ACCESS_TOKEN_TTL });
}

// create opaque refresh token, save to DB
async function generateRefreshToken(userId) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    const refreshToken = new RefreshToken({
        token,
        user: userId,
        expiresAt
    });
    await refreshToken.save();
    return token;
}

async function rotateRefreshToken(oldToken, userId) {
  // Marks old token revoked and issue new one.
    const existing = await RefreshToken.findOne({ token: oldToken, user: userId });
    if (!existing || existing.revoked || existing.expiresAt < Date.now()) {
        return null;
    }
    existing.revoked = true;
    existing.revokedAt = Date.now();

    const newToken = crypto.randomBytes(40).toString('hex');
    existing.replacedByToken = newToken;
    await existing.save();

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    const newRefresh = new RefreshToken({ token: newToken, user: userId, expiresAt });
    await newRefresh.save();
    return newToken;
}

async function revokeRefreshToken(token) {
    const doc = await RefreshToken.findOne({ token });
    if (!doc) 
        return false;
    doc.revoked = true;
    doc.revokedAt = Date.now();
    await doc.save();
    return true;
}

module.exports = { generateAccessToken, generateRefreshToken, rotateRefreshToken,
  revokeRefreshToken };
