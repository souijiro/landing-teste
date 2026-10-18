import fs from 'fs';
import path from 'path';

const EXCLUDED = new Set(['api', 'pages', 'node_modules']);

export default function handler(req, res) {
  const root = process.cwd();

  let redirects = {};
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
    for (const route of cfg.routes || []) {
      if (route.status === 301 && route.src && route.headers?.Location) {
        const m = route.src.match(/^\/([^/(]+)/);
        if (m) redirects[m[1]] = route.headers.Location.replace(/\$\d+$/, '');
      }
    }
  } catch (e) {
    // no vercel.json or unreadable, ignore
  }

  const sites = [];
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not read project root' });
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    if (slug.startsWith('.') || EXCLUDED.has(slug)) continue;

    const indexPath = path.join(root, slug, 'index.html');
    if (!fs.existsSync(indexPath)) continue;

    let title = slug;
    try {
      const html = fs.readFileSync(indexPath, 'utf8');
      const m = html.match(/<title>([^<]*)<\/title>/i);
      if (m) title = m[1].trim();
    } catch (e) {
      // skip title if unreadable
    }

    sites.push({
      slug,
      path: `/${slug}`,
      title,
      redirectsTo: redirects[slug] || null,
    });
  }

  sites.sort((a, b) => a.slug.localeCompare(b.slug));

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ generatedAt: new Date().toISOString(), sites });
}
