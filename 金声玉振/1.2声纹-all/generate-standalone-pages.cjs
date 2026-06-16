const fs = require('fs');
const path = require('path');

const root = __dirname;
const playerPath = path.join(root, 'shared', 'page-template.html');
const player = fs.readFileSync(playerPath, 'utf8');

const entries = {
  sheng: { folder: '笙', title: '笙 · 音画欣赏' },
  drum: { folder: '鼓', title: '鼓 · 音画欣赏' },
  xun: { folder: '埙', title: '埙 · 音画欣赏' },
  qin: { folder: '琴', title: '琴 · 音画欣赏' },
};

function dataUrl(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === '.jpg' || extension === '.jpeg'
    ? 'image/jpeg'
    : extension === '.mp3'
      ? 'audio/mpeg'
      : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

for (const [key, entry] of Object.entries(entries)) {
  const folder = path.join(root, entry.folder);
  const assets = path.join(folder, 'assets');
  const backgroundJpg = path.join(assets, 'background.jpg');
  const backgroundPng = path.join(assets, 'background.png');
  const inlineSource = `window.__AUDIO_VISUAL_ASSETS__=${JSON.stringify({
    painting: dataUrl(path.join(assets, 'painting.jpg')),
    instrument: dataUrl(path.join(assets, 'instrument.png')),
    audio: dataUrl(path.join(assets, 'audio.mp3')),
    background: fs.existsSync(backgroundJpg)
      ? dataUrl(backgroundJpg)
      : fs.existsSync(backgroundPng)
        ? dataUrl(backgroundPng)
        : null,
  })};\n`;
  fs.writeFileSync(path.join(assets, 'inline-images.js'), inlineSource, 'utf8');

  const html = player
    .replace('<html lang="zh-CN">', `<html lang="zh-CN" data-instrument="${key}">`)
    .replace(/<title>.*?<\/title>/, `<title>${entry.title}</title>`)
    .replace('href="./styles.css"', 'href="../shared/styles.css"')
    .replace('<script src="./app.bundle.js"></script>', '<script src="./assets/inline-images.js"></script>\n  <script src="../shared/app.bundle.js"></script>');
  fs.writeFileSync(path.join(folder, 'index.html'), html, 'utf8');
}
