import type { MetadataRoute } from 'next';
import { isProductionSite } from '@/lib/app-env';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/login', '/register', '/checkout', '/mi-espacio'],
    },
    sitemap: `${siteConfig.url.replace(/\/$/, '')}/sitemap.xml`,
    host: siteConfig.url,
  };
}
