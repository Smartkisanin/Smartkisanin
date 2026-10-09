const fs = require('fs-extra');
const path = require('path');

const rootDir = process.cwd();

console.log('🔄 Syncing PWA Logo and Name for Local & Vercel...');

// 1. Ensure logo exists in public
const publicDir = path.join(rootDir, 'public');
fs.mkdirpSync(publicDir);

if (fs.existsSync(path.join(rootDir, '.jpglogo'))) {
  fs.copySync(path.join(rootDir, '.jpglogo'), path.join(publicDir, 'logo.jpg'), { overwrite: true });
  console.log('✅ Copied logo to root public/logo.jpg');
}

// 2. Set Manifest for App Name and Icon
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

fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifestData, null, 2));

// 3. Copy to Artifacts folder for Vercel Build
const artifactPublic = path.join(rootDir, 'artifacts/smart-kisan-bharat/public');
if (fs.existsSync(path.dirname(artifactPublic))) {
  fs.mkdirpSync(artifactPublic);
  fs.writeFileSync(path.join(artifactPublic, 'manifest.json'), JSON.stringify(manifestData, null, 2));
  if (fs.existsSync(path.join(publicDir, 'logo.jpg'))) {
    fs.copySync(path.join(publicDir, 'logo.jpg'), path.join(artifactPublic, 'logo.jpg'), { overwrite: true });
  }
}

console.log('✅ PWA Branding synced across Local & Vercel!');
