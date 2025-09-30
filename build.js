import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  try {
    console.log('Starting build process...');
    
    // Clean dist folder
    await fs.remove('dist');
    
    // Create directories
    await fs.ensureDir('dist/images/kitchen');
    await fs.ensureDir('dist/images/bathroom');
    await fs.ensureDir('dist/images/logos');
    await fs.ensureDir('dist/images/icon');
    await fs.ensureDir('dist/json');
    await fs.ensureDir('dist/js');
    await fs.ensureDir('dist/css');
    await fs.ensureDir('dist/cart');
    await fs.ensureDir('dist/checkout');
    await fs.ensureDir('dist/public/partials');
    
    // Copy images
    console.log('Copying images...');
    if (await fs.pathExists('src/images')) {
      await fs.copy('src/images', 'dist/images');
    }
    
    // Copy JSON files
    console.log('Copying JSON files...');
    if (await fs.pathExists('src/public/json')) {
      await fs.copy('src/public/json', 'dist/json');
    }
    
    // Copy partials
    console.log('Copying partials...');
    if (await fs.pathExists('src/public/partials')) {
      await fs.copy('src/public/partials', 'dist/public/partials');
    }
    
    // Copy HTML files
    console.log('Copying HTML files...');
    const htmlFiles = [
      'src/index.html',
      'src/cart/index.html', 
      'src/checkout/index.html',
      'src/checkout/success.html'
    ];
    
    for (const htmlFile of htmlFiles) {
      if (await fs.pathExists(htmlFile)) {
        const destFile = htmlFile.replace('src/', 'dist/');
        await fs.ensureDir(path.dirname(destFile));
        await fs.copy(htmlFile, destFile);
      }
    }
    
    // Copy JS files
    console.log('Copying JS files...');
    if (await fs.pathExists('src/js')) {
      await fs.copy('src/js', 'dist/js');
    }
    
    // Copy CSS files
    console.log('Copying CSS files...');
    if (await fs.pathExists('src/css')) {
      await fs.copy('src/css', 'dist/css');
    }
    
    console.log('✓ Build completed successfully!');
    
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
}

build();