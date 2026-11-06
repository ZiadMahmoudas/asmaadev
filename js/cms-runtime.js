import { createClient, SupabaseAuthAdapter } from 'https://cdn.jsdelivr.net/npm/@neondatabase/neon-js@0.9.0-beta/+esm';

const cfg = window.TIGRESS_NEON || {};
const ready = cfg.authUrl && cfg.dataApiUrl && !cfg.authUrl.includes('PASTE_') && !cfg.dataApiUrl.includes('PASTE_');
if (!ready) {
  console.info('[TIGRESS CMS] Neon is not configured yet; using the static site content.');
} else {
  const siteId = cfg.siteId || 'main';
  const cacheKey = window.TIGRESS_CMS_CACHE_KEY || `tigress:cms:${siteId}:v1`;
  const neon = createClient({
    auth: { adapter: SupabaseAuthAdapter(), url: cfg.authUrl, allowAnonymous: true },
    dataApi: { url: cfg.dataApiUrl }
  });

  let lastVersion = Number(window.TIGRESS_CMS_CACHE?.version || 0);
  const saveCache = (row) => {
    try { localStorage.setItem(cacheKey, JSON.stringify(row)); } catch (_) {}
  };
  const applyRow = (row, source) => {
    if (!row?.content || !Object.keys(row.content).length) return;
    saveCache(row);
    lastVersion = Number(row.version || 0);
    window.TIGRESS_APPLY_CMS?.(row.content, { source, updatedAt: row.updated_at, version: row.version });
  };

  async function fetchLatest(source='network') {
    try {
      const { data, error } = await neon
        .from('site_content')
        .select('content,version,updated_at')
        .eq('site_id', siteId)
        .maybeSingle();
      if (error) throw error;
      if (data && Number(data.version || 0) >= lastVersion) applyRow(data, source);
    } catch (error) {
      console.warn('[TIGRESS CMS] Using cached/static content:', error.message);
    }
  }

  const start = () => fetchLatest();
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 650 });
  else setTimeout(start, 30);

  // Static-site friendly near-realtime refresh. No persistent backend connection required.
  // Only polls while the tab is visible, and also refreshes when the visitor returns to it.
  const poll = setInterval(() => { if (!document.hidden) fetchLatest('poll'); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) fetchLatest('visibility'); });
  window.addEventListener('beforeunload', () => clearInterval(poll), { once:true });
}
