import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.TIGRESS_SUPABASE || {};
const ready = cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_PROJECT_REF') && !cfg.anonKey.includes('YOUR_SUPABASE');
if (!ready) {
  console.info('[TIGRESS CMS] Supabase is not configured yet; using the static site content.');
} else {
  const siteId = cfg.siteId || 'main';
  const cacheKey = window.TIGRESS_CMS_CACHE_KEY || `tigress:cms:${siteId}:v1`;
  const supabase = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  const saveCache = (row) => {
    try { localStorage.setItem(cacheKey, JSON.stringify(row)); } catch (_) {}
  };
  const applyRow = (row, source) => {
    if (!row?.content || !Object.keys(row.content).length) return;
    saveCache(row);
    window.TIGRESS_APPLY_CMS?.(row.content, { source, updatedAt: row.updated_at, version: row.version });
  };

  async function fetchLatest() {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content,version,updated_at')
        .eq('site_id', siteId)
        .maybeSingle();
      if (error) throw error;
      if (data) applyRow(data, 'network');
    } catch (error) {
      console.warn('[TIGRESS CMS] Using cached/static content:', error.message);
    }
  }

  const start = () => fetchLatest();
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 650 });
  else setTimeout(start, 30);

  try {
    supabase
      .channel(`tigress-site-content-${siteId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'site_content', filter: `site_id=eq.${siteId}`
      }, payload => {
        const row = payload.new;
        if (row?.content) applyRow(row, 'realtime');
      })
      .subscribe();
  } catch (error) {
    console.warn('[TIGRESS CMS] Realtime unavailable:', error.message);
  }
}
