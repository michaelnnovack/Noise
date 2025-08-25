import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Noise Detector - Real-Time Sound Level Monitor',
    short_name: 'Noise Detector',
    description: 'Measure environmental noise levels using your device microphone',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['utilities', 'productivity', 'tools'],
    orientation: 'portrait-primary',
  };
}