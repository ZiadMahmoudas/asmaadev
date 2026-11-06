import { defineConfig } from '@neondatabase/config/v1';

export default defineConfig({
  auth: true,
  dataApi: true,
  buckets: {
    'tigress-media': { access: 'public_read' },
  },
  functions: {
    'media-upload': {
      name: 'TIGRESS media upload signer',
      source: './functions/media-upload.ts',
    },
  },
});
