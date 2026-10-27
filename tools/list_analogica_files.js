const fs = require('fs');
const path = require('path');

const dirName = 'ANALOGICA';
const dir = path.join(__dirname, '..', dirName);
const entries = fs.readdirSync(dir)
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

const outputPath = path.join(__dirname, '..', 'js', 'analogica-gallery-data.js');
const content = `window.analogicaSlides = [\n${entries.map((file) => `  ${JSON.stringify(`${dirName}/${file}`)}`).join(',\n')}\n];\n`;
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${entries.length} ANALOGICA photos in ${outputPath}`);
