import path from 'node:path';
import { applyManualData } from './manual';

const root = process.cwd();
applyManualData(root, path.join(root, 'public/data'));
console.log('Manual datasets rebuilt from content/data/*.yml');
