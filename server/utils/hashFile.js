const crypto = require('crypto');
const fs = require('fs');

/**
 * Returns the SHA-256 hex digest of a file.
 * @param {string} filePath - Absolute or relative path to the file.
 * @returns {Promise<string>} hex string
 */
function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Returns a shortened fingerprint: first6...last6
 */
function shortFingerprint(hash) {
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
}

module.exports = { hashFile, shortFingerprint };
