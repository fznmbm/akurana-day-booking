/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  },
};

module.exports = nextConfig;
