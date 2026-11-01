import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const configuredUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL
  let siteUrl = ''
  try {
    const url = new URL(configuredUrl)
    if (url.protocol === 'https:') siteUrl = url.origin
  } catch { /* A production domain has not been configured. */ }

  return {
    plugins: [react(), {
      name: 'public-seo-files',
      generateBundle() {
        const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /donatur', 'Disallow: /penerima', 'Disallow: /login', 'Disallow: /register', 'Disallow: /forgot-password', 'Disallow: /reset-password/']
        if (siteUrl) robots.push(`Sitemap: ${siteUrl}/sitemap.xml`)
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
        if (siteUrl) {
          this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>\n` })
        }
      },
    }],
  }
})
