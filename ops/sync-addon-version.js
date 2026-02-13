const { readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');
const { resolve } = require('path');

const root = resolve(__dirname, '..');
const version = require(resolve(root, 'package.json')).version;

const addonPath = resolve(root, 'addon.xml');
const addonXml = readFileSync(addonPath, 'utf8');
const updated = addonXml.replace(
  /(<addon[\s\S]*?)version="[^"]*"/,
  `$1version="${version}"`
);

writeFileSync(addonPath, updated, 'utf8');
execSync('git add addon.xml', { cwd: root });

console.log(`addon.xml synced to version ${version}`);
