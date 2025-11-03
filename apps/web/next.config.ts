import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Otimizações de performance
  reactStrictMode: true,

  // Compressão
  compress: true,

  // Otimizar fontes
  optimizeFonts: true,

  // SWC minifier (mais rápido que Terser)
  swcMinify: true,

  // Experimental - turbopack para dev mais rápido (Next 15)
  experimental: {
    turbo: {
      // Ativa Turbopack no modo dev
    },
  },
};

export default nextConfig;
