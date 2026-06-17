const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const folders = [
  String.fromCodePoint(0x7b19),
  String.fromCodePoint(0x9f13),
  String.fromCodePoint(0x7b1b),
  String.fromCodePoint(0x7434),
  String.fromCodePoint(0x57d9),
];

for (const folder of folders) {
  const source = path.join(root, folder);
  const target = path.join(root, 'dist', folder);
  if (fs.existsSync(source)) {
    copyDirectory(source, target);
    console.log(`Copied ${folder} static assets to dist.`);
  }
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}
