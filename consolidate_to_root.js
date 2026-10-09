const fs = require('fs-extra');
const path = require('path');

const rootDir = process.cwd();
const artifactDir = path.join(rootDir, 'artifacts/smart-kisan-bharat');

console.log('🔄 Merging Artifacts directly into Root Project...');

// 1. Copy everything from nested artifacts folder directly to Root
if (fs.existsSync(artifactDir)) {
  fs.copySync(artifactDir, rootDir, { overwrite: true });
  console.log('✅ Merged artifacts directly into Root!');
}

// 2. Format Logo properly
if (fs.existsSync(path.join(rootDir, '.jpglogo'))) {
  fs.mkdirpSync(path.join(rootDir, 'public'));
  fs.copySync(path.join(rootDir, '.jpglogo'), path.join(rootDir, 'public/logo.jpg'), { overwrite: true });
  console.log('✅ Logo formatted to public/logo.jpg');
}

// 3. Write Root-Level Direct Supabase Client
const envConfigCode = `export const ENV_CONFIG = {
  SUPABASE_URL: "https://auogqqrioziypwuixfwa.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b2dxcXJpb3ppeXB3dWl4ZndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTE5ODY5OCwiZXhwIjoyMTA2Nzc0Njk4fQ.G7dGfsga-d7FPjIfBukuwMcuIEsW_-_h3hzJFlKtenw",
  ADMIN_MOBILE_HASH: "3db092aa828a2c262d6d8dbcd0bf85bb4ffcce7e882a17e07e86e1e6bc79ff4b",
  ADMIN_PIN_HASH: "718ef03de36c469b61d4b68c2f218204b6b66d4002636f4eb14b53298cb2fb87"
};
`;

const supabaseClientCode = `import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './envConfig';

export const supabase = createClient(ENV_CONFIG.SUPABASE_URL, ENV_CONFIG.SUPABASE_ANON_KEY);
`;

fs.mkdirpSync(path.join(rootDir, 'src/lib'));
fs.writeFileSync(path.join(rootDir, 'src/lib/envConfig.ts'), envConfigCode);
fs.writeFileSync(path.join(rootDir, 'src/lib/supabaseClient.ts'), supabaseClientCode);

// 4. Set PWA Manifest with Official Logo & Branding
const manifestData = {
  "short_name": "स्मार्ट किसान भारत",
  "name": "स्मार्ट किसान भारत - Smart Kisan Bharat",
  "description": "Smart Kisan Bharat Digital Agricultural Marketplace",
  "icons": [
    {
      "src": "/logo.jpg",
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
fs.writeFileSync(path.join(rootDir, 'public/manifest.json'), JSON.stringify(manifestData, null, 2));

// 5. Clean Single-Project Vercel Configuration
const vercelConfig = {
  "version": 2,
  "framework": "vite",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/assets/(.*)", "destination": "/assets/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
};
fs.writeFileSync(path.join(rootDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));

console.log('✅ Clean Single-Project Structure Complete!');
