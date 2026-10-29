import type { NextConfig } from "next";
import { ADSENSE_CONNECT_SRC, ADSENSE_FRAME_SRC, ADSENSE_SCRIPT_SRC } from "./src/lib/ads-csp";
import { MARKETING_CONNECT_SRC, MARKETING_SCRIPT_SRC } from "./src/lib/marketing-csp";

const isProduction = process.env.NODE_ENV === "production";
const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  isProduction ? "" : "'unsafe-eval'",
  adsEnabled ? ADSENSE_SCRIPT_SRC : "",
  MARKETING_SCRIPT_SRC,
]
  .filter(Boolean)
  .join(" ");

const connectSrc = [
  "'self'",
  "https://vitals.vercel-insights.com",
  "https://va.vercel-scripts.com",
  adsEnabled ? ADSENSE_CONNECT_SRC : "",
  MARKETING_CONNECT_SRC,
  isProduction ? "" : "http://localhost:*",
]
  .filter(Boolean)
  .join(" ");

const frameSrc = [
  "'self'",
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  adsEnabled ? ADSENSE_FRAME_SRC : "",
]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self' mailto:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSrc}`,
  `connect-src ${connectSrc}`,
  "worker-src 'self' blob:",
  `frame-src ${frameSrc}`,
  isProduction ? "upgrade-insecure-requests" : "",
].filter(Boolean).join("; ");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/proximos-lanzamientos', destination: '/alerts', permanent: true },
      { source: '/promociones-publicadas', destination: '/promotions', permanent: true },
      // El acompañamiento individual ya no se ofrece: las URLs antiguas llevan al catálogo de cursos.
      { source: '/acompanamiento', destination: '/cursos', permanent: true },
      { source: '/acompanamiento/:path*', destination: '/cursos', permanent: true },
      { source: '/services', destination: '/cursos', permanent: true },
      { source: '/admin/services', destination: '/admin', permanent: true },
      { source: '/admin/promotions/history', destination: '/admin/promotions', permanent: true },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ];

    if (isProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
