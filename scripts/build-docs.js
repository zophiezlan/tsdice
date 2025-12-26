#!/usr/bin/env node

/**
 * Documentation Builder
 * Converts markdown files to styled HTML pages that match the tsDice theme
 */

import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

// Configuration: markdown files to convert
const DOCS_CONFIG = [
  {
    source: 'USER_GUIDE.md',
    output: 'user-guide.html',
    title: '🎨 User Guide - tsDice',
    description: 'Complete guide to using tsDice from beginner to power user',
  },
  {
    source: 'ARCHITECTURE.md',
    output: 'architecture.html',
    title: '🏗️ Architecture - tsDice',
    description: 'Technical architecture and design decisions',
  },
  {
    source: 'ANALYSIS.md',
    output: 'analysis.html',
    title: '📊 Complete Analysis - tsDice',
    description: 'Comprehensive technical analysis of the codebase',
  },
  {
    source: 'QUICK_REFERENCE.md',
    output: 'quick-reference.html',
    title: '⚡ Quick Reference - tsDice',
    description: 'Quick reference guide for tsDice features',
  },
];

// Configure marked for GitHub-flavored markdown
marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
});

/**
 * HTML template that matches tsDice's styling
 */
function createHTMLTemplate(title, description, content) {
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <style>
    /* --- CSS Theming matching tsDice --- */
    :root {
      /* Backgrounds */
      --bg-primary: #111;
      --bg-content: rgba(255, 255, 255, 0.05);
      --bg-code: rgba(0, 0, 0, 0.3);
      --bg-code-block: rgba(0, 0, 0, 0.5);

      /* Text */
      --text-primary: white;
      --text-secondary: #eee;
      --text-strong: #fff;
      --text-muted: #aaa;

      /* Borders */
      --border-color: rgba(255, 255, 255, 0.2);
      --border-accent: rgba(255, 255, 255, 0.3);

      /* Interactive */
      --link-color: #87ceeb;
      --link-color-hover: #9370db;
      --focus-outline: #87ceeb;
    }

    body.light-mode {
      /* Backgrounds */
      --bg-primary: #f0f0f0;
      --bg-content: rgba(0, 0, 0, 0.03);
      --bg-code: rgba(0, 0, 0, 0.05);
      --bg-code-block: rgba(0, 0, 0, 0.08);

      /* Text */
      --text-primary: #333;
      --text-secondary: #444;
      --text-strong: #000;
      --text-muted: #666;

      /* Borders */
      --border-color: rgba(0, 0, 0, 0.2);
      --border-accent: rgba(0, 0, 0, 0.3);

      /* Interactive */
      --link-color: #4361ee;
      --link-color-hover: #7209b7;
      --focus-outline: #4361ee;
    }

    /* --- Base Styles --- */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* --- Header --- */
    header {
      background: rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      backdrop-filter: blur(10px);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-link {
      color: var(--link-color);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--link-color-hover);
    }

    .theme-toggle {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s ease;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* --- Main Content --- */
    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .content {
      background: var(--bg-content);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 2rem;
    }

    /* --- Typography --- */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-strong);
      margin-top: 2rem;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    h1 { font-size: 2.5rem; margin-top: 0; }
    h2 { font-size: 2rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--border-color); }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    h5 { font-size: 1.1rem; }
    h6 { font-size: 1rem; }

    p {
      margin: 1rem 0;
      color: var(--text-secondary);
    }

    a {
      color: var(--link-color);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--link-color-hover);
      text-decoration: underline;
    }

    /* --- Lists --- */
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
      color: var(--text-secondary);
    }

    li {
      margin: 0.5rem 0;
    }

    /* --- Code --- */
    code {
      background: var(--bg-code);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9em;
      color: var(--text-primary);
    }

    pre {
      background: var(--bg-code-block);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1rem 0;
    }

    pre code {
      background: none;
      padding: 0;
      color: var(--text-secondary);
    }

    /* --- Blockquotes --- */
    blockquote {
      border-left: 4px solid var(--link-color);
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background: var(--bg-code);
      color: var(--text-secondary);
      font-style: italic;
    }

    blockquote p {
      margin: 0.5rem 0;
    }

    /* --- Tables --- */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      overflow: hidden;
      border-radius: 4px;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      text-align: left;
    }

    th {
      background: rgba(255, 255, 255, 0.1);
      font-weight: 600;
      color: var(--text-strong);
    }

    tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03);
    }

    /* --- Horizontal Rule --- */
    hr {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 2rem 0;
    }

    /* --- Images --- */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1rem 0;
    }

    /* --- Footer --- */
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-size: 0.9rem;
      border-top: 1px solid var(--border-color);
      margin-top: 4rem;
    }

    /* --- Responsive --- */
    @media (max-width: 768px) {
      header {
        flex-direction: column;
        gap: 1rem;
      }

      main {
        padding: 1rem;
      }

      .content {
        padding: 1rem;
      }

      h1 { font-size: 2rem; }
      h2 { font-size: 1.75rem; }
      h3 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-title">${title.replace(/ - tsDice$/, '')}</div>
    <nav class="header-nav">
      <a href="../index.html" class="nav-link">← Back to tsDice</a>
      <a href="user-guide.html" class="nav-link">User Guide</a>
      <a href="architecture.html" class="nav-link">Architecture</a>
      <a href="analysis.html" class="nav-link">Analysis</a>
      <a href="quick-reference.html" class="nav-link">Quick Ref</a>
      <button class="theme-toggle" onclick="toggleTheme()">🌓 Theme</button>
    </nav>
  </header>

  <main>
    <article class="content">
      ${content}
    </article>
  </main>

  <footer>
    <p>Generated from markdown • <a href="https://github.com/zophiezlan/tsdice" target="_blank" rel="noopener">View on GitHub</a></p>
  </footer>

  <script>
    // Theme toggle functionality
    function toggleTheme() {
      document.body.classList.toggle('light-mode');
      localStorage.setItem('tsDiceDocsTheme',
        document.body.classList.contains('light-mode') ? 'light' : 'dark'
      );
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('tsDiceDocsTheme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }

    // Sync with main app's theme if available
    window.addEventListener('storage', (e) => {
      if (e.key === 'tsDiceTheme') {
        if (e.newValue === 'light') {
          document.body.classList.add('light-mode');
        } else {
          document.body.classList.remove('light-mode');
        }
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Convert a single markdown file to HTML
 */
async function convertMarkdownToHTML(config) {
  const sourcePath = path.join(rootDir, config.source);
  const outputPath = path.join(docsDir, config.output);

  console.log(`Converting ${config.source} → ${config.output}...`);

  try {
    // Read markdown file
    const markdown = fs.readFileSync(sourcePath, 'utf8');

    // Convert to HTML
    const htmlContent = marked.parse(markdown);

    // Wrap in template
    const fullHTML = createHTMLTemplate(
      config.title,
      config.description,
      htmlContent
    );

    // Write output
    fs.writeFileSync(outputPath, fullHTML, 'utf8');

    console.log(`✓ Created ${config.output}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${config.source}:`, error.message);
    throw error;
  }
}

/**
 * Main build function
 */
async function buildDocs() {
  console.log('🔨 Building documentation...\n');

  // Ensure docs directory exists
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    console.log('Created docs/ directory');
  }

  // Convert all configured docs
  for (const config of DOCS_CONFIG) {
    await convertMarkdownToHTML(config);
  }

  console.log('\n✨ Documentation build complete!');
  console.log(`📁 Output: ${docsDir}`);
}

// Run the build
buildDocs().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
