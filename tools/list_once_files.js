const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'ONCE');
const entries = fs.readdirSync(dir)
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .sort((a, b) => {
    const aStats = fs.statSync(path.join(dir, a));
    const bStats = fs.statSync(path.join(dir, b));
    const aTime = aStats.birthtimeMs || aStats.mtimeMs;
    const bTime = bStats.birthtimeMs || bStats.mtimeMs;
    return bTime - aTime;
  });

const outputPath = path.join(__dirname, '..', 'js', 'once-gallery-data.js');
const content = `window.onceSlides = [\n${entries.map((file) => `  'ONCE/${file}'`).join(',\n')}\n];\n`;
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${entries.length} ONCE photos in ${outputPath}`);
