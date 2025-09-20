const esbuild = require('esbuild');
const { minify } = require('html-minifier-terser');
const fs = require('fs/promises');
const path = require('path');

async function build() {
  const distDir = 'dist';

  // Ensure the dist directory exists
  await fs.mkdir(distDir, { recursive: true });

  // 1. Bundle and minify JavaScript
  await esbuild.build({
    entryPoints: ['js/main.js'],
    bundle: true,
    outfile: path.join(distDir, 'bundle.js'),
    minify: true,
  });

  // 2. Read, minify, and write HTML
  const htmlContent = await fs.readFile('index.html', 'utf-8');
  const minifiedHtml = await minify(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true, // This will minify any inline JS if you have it
  });
  await fs.writeFile(path.join(distDir, 'index.html'), minifiedHtml);

  console.log('Build complete! Files are in the dist/ directory.');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
