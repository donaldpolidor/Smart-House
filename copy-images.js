// copy-images.js
import fs from 'fs';
import path from 'path';

const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

// Copy images to the build folder
copyDir('src/images', 'dist/images');