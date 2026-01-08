import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/utils';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tackleapp.ai';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/preview/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [],
      },
    ],
    sitemap: [
      absoluteUrl('/sitemap.xml'),
      absoluteUrl('/sitemap-static.xml'),
      absoluteUrl('/sitemap-blog.xml'),
      absoluteUrl('/sitemap-species.xml'),
      absoluteUrl('/sitemap-how-to.xml'),
      absoluteUrl('/sitemap-locations.xml'),
    ],
  };
}



