// Copies the admin CMS bundle from node_modules into public/admin/cms at build time.
import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('node_modules/@sveltia/cms/dist');
const dest = path.resolve('public/admin/cms');
if (!fs.existsSync(src)) {
  console.error('Admin CMS package not found. Run npm install first.');
  process.exit(1);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Admin CMS copied to public/admin/cms');
