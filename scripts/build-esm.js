// scripts/build-esm.js
import { mkdir, copyFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildEsm() {
    try {
        // Create dist/esm directory
        await mkdir(join(__dirname, '../dist/esm'), { recursive: true });

        // Copy source files to dist/esm
        await copyFile(
            join(__dirname, '../src/index.js'),
            join(__dirname, '../dist/esm/index.js')
        );

        console.log('ESM build completed successfully');
    } catch (error) {
        console.error('Error building ESM:', error);
        process.exit(1);
    }
}

buildEsm();