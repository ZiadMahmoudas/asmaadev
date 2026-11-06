import { Hono } from 'hono';
import { Pool } from 'pg';
import { AwsClient } from 'aws4fetch';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = new Hono();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const bucket = 'tigress-media';
const MAX_BYTES = 25 * 1024 * 1024;
const allowedTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'
]);

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const jwks = createRemoteJWKSet(new URL(required('NEON_AUTH_JWKS_URL')));
const s3 = new AwsClient({
  accessKeyId: required('AWS_ACCESS_KEY_ID'),
  secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
  service: 's3',
  region: process.env.AWS_REGION || 'us-east-2',
});
const endpoint = required('AWS_ENDPOINT_URL_S3').replace(/\/$/, '');

function cors(c: any) {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

app.options('*', (c) => { cors(c); return c.body(null, 204); });

app.post('/', async (c) => {
  cors(c);
  try {
    const authHeader = c.req.header('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    const { payload } = await jwtVerify(token, jwks);
    const userId = String(payload.sub || '');
    if (!userId) return c.json({ error: 'Invalid user token' }, 401);

    const admin = await pool.query('select 1 from public.site_admins where user_id=$1 limit 1', [userId]);
    if (!admin.rowCount) return c.json({ error: 'Admin access required' }, 403);

    const body = await c.req.json<{ path?: string; contentType?: string; size?: number }>();
    const path = String(body.path || '');
    const contentType = String(body.contentType || '');
    const size = Number(body.size || 0);

    if (!path.startsWith('site/') || path.includes('..')) return c.json({ error: 'Invalid path' }, 400);
    if (!allowedTypes.has(contentType)) return c.json({ error: 'Unsupported file type' }, 400);
    if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) return c.json({ error: 'File is too large' }, 400);

    const objectUrl = `${endpoint}/${bucket}/${path}`;
    const url = new URL(objectUrl);
    url.searchParams.set('X-Amz-Expires', '300');
    const signed = await s3.sign(url.toString(), { method: 'PUT', aws: { signQuery: true } });

    return c.json({ uploadUrl: signed.url, publicUrl: objectUrl, expiresIn: 300 });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error?.message || 'Upload signing failed' }, 500);
  }
});

export default app;
