/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Ensure Vercel/Next detects the correct root of the project
    root: ".",
  },
};

module.exports = nextConfig;
