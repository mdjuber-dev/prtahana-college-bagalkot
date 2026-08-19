export default {
  async fetch(request: any, env: any, ctx: any) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return fetch(request);
    }

    try {
      const assetResponse = await env.ASSETS.get(request);
      if (assetResponse && assetResponse.status === 200) {
        return assetResponse;
      }
    } catch (e) {
      console.error('Asset fetch error:', e);
    }

    const indexRequest = new Request(`${url.origin}/index.html`, request);
    const response = env.ASSETS.get(indexRequest);
    ctx.waitUntil(Promise.resolve());
    return response;
  },
};
