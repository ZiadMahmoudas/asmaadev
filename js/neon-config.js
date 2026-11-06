/* TIGRESS CMS / Neon public browser configuration.
   Public endpoints only. NEVER place DATABASE_URL, Postgres passwords,
   Neon API keys, S3 secrets, or any private credential in this file. */
window.TIGRESS_NEON = {
  // Neon Console -> Data API -> copy the URL for database: neondb
  // Expected shape: https://.../neondb/rest/v1
  dataApiUrl: 'https://ep-silent-pine-a44gi4kb.apirest.us-east-1.aws.neon.tech/neondb/rest/v1',

  // From Neon Console -> Settings -> Better Auth (production branch)
  authUrl: 'https://ep-silent-pine-a44gi4kb.neonauth.us-east-1.aws.neon.tech/neondb/auth',

  // Keep blank until media upload is enabled. Existing/local asset URLs still work.
  uploadFunctionUrl: '',

  siteId: 'main',
  bucket: 'tigress-media'
};
