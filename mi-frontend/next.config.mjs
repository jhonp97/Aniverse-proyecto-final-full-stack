/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // CDN de AniList (fuente actual de los animes)
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        //regla para el back localhost
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**', // Permite cualquier imagen dentro de la carpeta /uploads
      },
      // Regla para PRODUCCIÓN (añadir la url de vercel)
      {
        protocol: 'https',
        hostname: 'aniverse-api-g15y.onrender.com', // mi enlace de vercel
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
