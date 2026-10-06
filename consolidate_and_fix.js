const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const artifactDir = path.join(rootDir, 'artifacts/smart-kisan-bharat');

console.log('🔄 Consolidation started...');

// 1. Copy nested artifact files directly to Root if exists
if (fs.existsSync(artifactDir)) {
  fs.copySync(artifactDir, rootDir, { overwrite: true });
  console.log('✅ Moved artifacts/smart-kisan-bharat directly to Root project!');
}

// 2. Write Clean Supabase Client & Credentials at Root src/lib
const libDir = path.join(rootDir, 'src/lib');
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });

const envConfig = `export const ENV_CONFIG = {
  SUPABASE_URL: "https://auogqqrioziypwuixfwa.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b2dxcXJpb3ppeXB3dWl4ZndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTE5ODY5OCwiZXhwIjoyMTA2Nzc0Njk4fQ.G7dGfsga-d7FPjIfBukuwMcuIEsW_-_h3hzJFlKtenw",
  ADMIN_MOBILE_HASH: "3db092aa828a2c262d6d8dbcd0bf85bb4ffcce7e882a17e07e86e1e6bc79ff4b",
  ADMIN_PIN_HASH: "718ef03de36c469b61d4b68c2f218204b6b66d4002636f4eb14b53298cb2fb87"
};
`;
fs.writeFileSync(path.join(libDir, 'envConfig.ts'), envConfig);

const supabaseClient = `import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './envConfig';

export const supabase = createClient(ENV_CONFIG.SUPABASE_URL, ENV_CONFIG.SUPABASE_ANON_KEY);
`;
fs.writeFileSync(path.join(libDir, 'supabaseClient.ts'), supabaseClient);

// 3. Write Root-level vercel.json
const vercelConfig = {
  "version": 2,
  "framework": "vite",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
};
fs.writeFileSync(path.join(rootDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));

// 4. Update PWA Manifest with Smart Kisan branding
const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const manifestData = {
  "short_name": "स्मार्ट किसान",
  "name": "स्मार्ट किसान भारत - Smart Kisan Bharat",
  "description": "Smart Kisan Bharat Digital Agricultural Marketplace",
  "icons": [
    {
      "src": "/assets/logo.jpg",
      "type": "image/jpeg",
      "sizes": "192x192 512x512",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "background_color": "#0B3D2E",
  "theme_color": "#0B3D2E",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/"
};
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifestData, null, 2));

console.log('✅ Configuration, Single-Project Structure, and PWA Branding synchronized!');
