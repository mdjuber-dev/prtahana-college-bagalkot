import https from 'https';
import http from 'http';

const routes = ['/', '/about', '/courses', '/achievements', '/announcements', '/gallery', '/fee-structure', '/transport', '/contact', '/careers', '/admission'];
const baseUrl = 'https://prarthanapucollegebagalkot.in';

console.log('=== Cloudflare Frontend Routes ===');
for (const route of routes) {
  try {
    const html = await fetchUrl(baseUrl + route);
    const hasReact = html.includes('react-vendor') || html.includes('index-') || html.includes('script');
    const hasTitle = html.includes('<title>');
    const hasHtml = html.includes('<html');
    console.log(`  ${route}: OK (${html.length} chars, react=${hasReact}, title=${hasTitle}, html=${hasHtml})`);
  } catch (e) {
    console.log(`  ${route}: ERROR - ${e.message}`);
  }
}

// Also test API endpoint through the domain
try {
  const apiResp = await fetchUrl(baseUrl + '/api/health');
  console.log(`\n  /api/health: ${apiResp}`);
} catch (e) {
  console.log(`\n  /api/health: ${e.message}`);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}
