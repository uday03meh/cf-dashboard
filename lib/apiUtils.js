// lib/apiUtils.js
const crypto = require('crypto');

const generateApiSig = (key, secret, methodName, params = {}) => {
  const rand = Math.random().toString(36).substring(7); // Generate a random string for 'rand'
  const time = Math.floor(Date.now() / 1000); // Current Unix time in seconds

  // Sort params alphabetically by key
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});

  // Constructing the hash string
  const paramString = Object.entries({ ...sortedParams, apiKey: key, time })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const hashString = `${rand}/${methodName}?${paramString}#${secret}`;

  // Generating SHA-512 hash
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  const apiSig = rand + hash.slice(0, 128);

  return { apiKey: key, time, apiSig };
};

module.exports = { generateApiSig };
