/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13.4+
  transpilePackages: ["@supabase/supabase-js"],
};

module.exports = nextConfig;
