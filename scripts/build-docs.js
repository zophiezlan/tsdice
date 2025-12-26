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

// Configure marked for GitHub-flavored markdown with custom renderer for heading IDs
marked.use({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
});

// Custom renderer to ensure heading IDs are generated
const renderer = new marked.Renderer();
const originalHeading = renderer.heading.bind(renderer);

renderer.heading = function ({ text, depth }) {
  // Generate slug from heading text
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
};

marked.use({ renderer });

/**
 * Generate table of contents from HTML content
 */
function generateTableOfContents(htmlContent) {
  const headings = [];
  const headingRegex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  let match;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ''), // Strip HTML tags
    });
  }

  if (headings.length === 0) return '';

  let toc =
    '<nav class="toc" aria-label="Table of contents"><div class="toc-header">📑 Contents</div><ul class="toc-list">';

  headings.forEach((heading) => {
    const indent = heading.level === 3 ? ' class="toc-indent"' : '';
    toc += `<li${indent}><a href="#${heading.id}">${heading.text}</a></li>`;
  });

  toc += '</ul></nav>';
  return toc;
}

/**
 * HTML template that matches tsDice's styling with professional UX enhancements
 */
function createHTMLTemplate(title, description, content, currentPage) {
  const toc = generateTableOfContents(content);

  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎲</text></svg>">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:site_name" content="tsDice Documentation">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">

  <style>
    /* --- CSS Theming matching tsDice --- */
    :root {
      /* Backgrounds */
      --bg-primary: #111;
      --bg-content: rgba(255, 255, 255, 0.05);
      --bg-code: rgba(0, 0, 0, 0.3);
      --bg-code-block: rgba(0, 0, 0, 0.5);
      --bg-sidebar: rgba(255, 255, 255, 0.03);

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
      --active-nav: rgba(135, 206, 235, 0.2);
    }

    body.light-mode {
      /* Backgrounds */
      --bg-primary: #f0f0f0;
      --bg-content: rgba(0, 0, 0, 0.03);
      --bg-code: rgba(0, 0, 0, 0.05);
      --bg-code-block: rgba(0, 0, 0, 0.08);
      --bg-sidebar: rgba(0, 0, 0, 0.02);

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
      --active-nav: rgba(67, 97, 238, 0.15);
    }

    /* --- Reduced Motion --- */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* --- Base Styles --- */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
      scroll-padding-top: 80px;
    }

    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* --- Skip to Content (Accessibility) --- */
    .skip-to-content {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--link-color);
      color: #000;
      padding: 0.5rem 1rem;
      text-decoration: none;
      z-index: 1000;
      font-weight: 600;
    }

    .skip-to-content:focus {
      top: 0;
    }

    /* --- Progress Bar --- */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--link-color), var(--link-color-hover));
      z-index: 1001;
      transition: width 0.1s ease;
    }

    /* --- Header --- */
    header {
      background: rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 100;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .home-link {
      color: var(--text-primary);
      text-decoration: none;
      font-size: 1.5rem;
      transition: transform 0.2s ease;
      display: inline-block;
      line-height: 1;
    }

    .home-link:hover {
      transform: scale(1.1);
    }

    .home-link:focus {
      outline: 2px solid var(--focus-outline);
      outline-offset: 4px;
      border-radius: 4px;
    }

    .header-nav {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .nav-link {
      color: var(--link-color);
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      transition: background 0.2s ease, color 0.2s ease;
      white-space: nowrap;
      font-size: 0.95rem;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--link-color-hover);
    }

    .nav-link:focus {
      outline: 2px solid var(--focus-outline);
      outline-offset: 2px;
    }

    .nav-link.active {
      background: var(--active-nav);
      font-weight: 600;
      position: relative;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--link-color);
    }

    .theme-toggle {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background 0.2s ease;
      white-space: nowrap;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .theme-toggle:focus {
      outline: 2px solid var(--focus-outline);
      outline-offset: 2px;
    }

    /* Mobile Menu */
    .mobile-menu-toggle {
      display: none;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
    }

    .mobile-menu-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* --- Layout Container --- */
    .layout-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 2rem;
      padding: 2rem;
    }

    /* --- Table of Contents Sidebar --- */
    .toc {
      position: sticky;
      top: 100px;
      flex: 0 0 250px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--bg-sidebar);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      align-self: flex-start;
    }

    .toc-header {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: var(--text-strong);
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-list li {
      margin: 0;
    }

    .toc-list a {
      display: block;
      padding: 0.4rem 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .toc-list a:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--link-color);
      padding-left: 0.75rem;
    }

    .toc-indent {
      padding-left: 1rem;
    }

    /* --- Main Content --- */
    main {
      flex: 1;
      min-width: 0;
    }

    .content {
      background: var(--bg-content);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 2.5rem;
    }

    /* --- Typography --- */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-strong);
      margin-top: 2rem;
      margin-bottom: 1rem;
      line-height: 1.3;
      position: relative;
    }

    h1 {
      font-size: 2.5rem;
      margin-top: 0;
    }

    h2 {
      font-size: 2rem;
      padding-bottom: 0.3rem;
      border-bottom: 1px solid var(--border-color);
      scroll-margin-top: 80px;
    }

    h3 {
      font-size: 1.5rem;
      scroll-margin-top: 80px;
    }

    h4 { font-size: 1.25rem; }
    h5 { font-size: 1.1rem; }
    h6 { font-size: 1rem; }

    /* Heading anchor links */
    h2:hover .header-anchor,
    h3:hover .header-anchor {
      opacity: 1;
    }

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

    a:focus {
      outline: 2px solid var(--focus-outline);
      outline-offset: 2px;
      border-radius: 2px;
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
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
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
      position: relative;
    }

    pre code {
      background: none;
      padding: 0;
      color: var(--text-secondary);
    }

    /* Copy button for code blocks */
    .code-block-wrapper {
      position: relative;
    }

    .copy-code-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      opacity: 0;
      transition: opacity 0.2s ease, background 0.2s ease;
    }

    .code-block-wrapper:hover .copy-code-btn {
      opacity: 1;
    }

    .copy-code-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .copy-code-btn.copied {
      background: var(--link-color);
      color: #000;
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
      display: block;
      overflow-x: auto;
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
      position: sticky;
      top: 0;
    }

    tbody tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03);
    }

    tbody tr:hover {
      background: rgba(255, 255, 255, 0.05);
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

    /* --- Scroll to Top Button --- */
    .scroll-to-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.2s ease, background 0.2s ease;
      z-index: 99;
    }

    .scroll-to-top.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .scroll-to-top:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-4px);
    }

    .scroll-to-top:focus {
      outline: 2px solid var(--focus-outline);
      outline-offset: 2px;
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

    footer a {
      color: var(--link-color);
      margin: 0 0.5rem;
    }

    /* --- Responsive --- */
    @media (max-width: 1024px) {
      .toc {
        display: none;
      }

      .layout-container {
        padding: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .header-container {
        flex-wrap: wrap;
      }

      .header-nav {
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: rgba(17, 17, 17, 0.98);
        backdrop-filter: blur(10px);
        flex-direction: column;
        padding: 1rem;
        gap: 0.5rem;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        border-bottom: 1px solid var(--border-color);
        z-index: 99;
      }

      body.light-mode .header-nav {
        background: rgba(240, 240, 240, 0.98);
      }

      .header-nav.mobile-open {
        max-height: 400px;
      }

      .mobile-menu-toggle {
        display: block;
      }

      .nav-link,
      .theme-toggle {
        width: 100%;
        text-align: center;
      }

      .layout-container {
        padding: 1rem;
        gap: 0;
      }

      .content {
        padding: 1.5rem;
      }

      h1 { font-size: 2rem; }
      h2 { font-size: 1.75rem; }
      h3 { font-size: 1.5rem; }

      .scroll-to-top {
        bottom: 1rem;
        right: 1rem;
        width: 44px;
        height: 44px;
      }

      table {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .header-title {
        font-size: 1.2rem;
      }

      .content {
        padding: 1rem;
      }

      h1 { font-size: 1.75rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-to-content">Skip to content</a>
  <div class="progress-bar" id="progress-bar" role="progressbar" aria-label="Reading progress"></div>

  <header>
    <div class="header-container">
      <div class="header-left">
        <a href="../index.html" class="home-link" aria-label="Return to tsDice app" title="Return to tsDice">🎲</a>
        <div class="header-title">${title.replace(/ - tsDice$/, '')}</div>
      </div>
      <button class="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="Toggle navigation menu" aria-expanded="false">☰</button>
      <nav class="header-nav" id="main-nav" aria-label="Documentation navigation">
        <a href="user-guide.html" class="nav-link${currentPage === 'user-guide' ? ' active' : ''}" ${currentPage === 'user-guide' ? 'aria-current="page"' : ''}>📖 User Guide</a>
        <a href="architecture.html" class="nav-link${currentPage === 'architecture' ? ' active' : ''}" ${currentPage === 'architecture' ? 'aria-current="page"' : ''}>🏗️ Architecture</a>
        <a href="analysis.html" class="nav-link${currentPage === 'analysis' ? ' active' : ''}" ${currentPage === 'analysis' ? 'aria-current="page"' : ''}>📊 Analysis</a>
        <a href="quick-reference.html" class="nav-link${currentPage === 'quick-reference' ? ' active' : ''}" ${currentPage === 'quick-reference' ? 'aria-current="page"' : ''}>⚡ Quick Ref</a>
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark/light theme">🌓 Theme</button>
      </nav>
    </div>
  </header>

  <div class="layout-container">
    ${toc}
    <main id="main-content">
      <article class="content">
        ${content}
      </article>
    </main>
  </div>

  <button class="scroll-to-top" id="scroll-to-top" onclick="scrollToTop()" aria-label="Scroll to top">↑</button>

  <footer>
    <p>
      Generated from markdown •
      <a href="https://github.com/zophiezlan/tsdice" target="_blank" rel="noopener">GitHub</a> •
      <a href="../index.html">Back to App</a>
    </p>
  </footer>

  <script>
    // Theme toggle functionality
    function toggleTheme() {
      document.body.classList.toggle('light-mode');
      const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('tsDiceDocsTheme', theme);
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

    // Mobile menu toggle
    function toggleMobileMenu() {
      const nav = document.getElementById('main-nav');
      const btn = document.querySelector('.mobile-menu-toggle');
      const isOpen = nav.classList.toggle('mobile-open');
      btn.setAttribute('aria-expanded', isOpen);
    }

    // Close mobile menu when clicking outside or on a link
    document.addEventListener('click', (e) => {
      const nav = document.getElementById('main-nav');
      const btn = document.querySelector('.mobile-menu-toggle');
      if (nav.classList.contains('mobile-open') &&
          !nav.contains(e.target) &&
          e.target !== btn) {
        nav.classList.remove('mobile-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const nav = document.getElementById('main-nav');
        const btn = document.querySelector('.mobile-menu-toggle');
        nav.classList.remove('mobile-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Reading progress bar
    function updateProgressBar() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      document.getElementById('progress-bar').style.width = scrolled + '%';
    }

    window.addEventListener('scroll', updateProgressBar);

    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Keyboard shortcut for scroll to top (Home key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Home' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        scrollToTop();
      }
    });

    // Add copy buttons to code blocks
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('pre').forEach((pre) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');

        button.addEventListener('click', async () => {
          const code = pre.querySelector('code')?.textContent || pre.textContent;
          try {
            await navigator.clipboard.writeText(code);
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
              button.textContent = 'Copy';
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            button.textContent = 'Failed';
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          }
        });

        wrapper.appendChild(button);
      });

      // Highlight active TOC item on scroll
      const observerOptions = {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      };

      const headings = document.querySelectorAll('h2[id], h3[id]');
      const tocLinks = document.querySelectorAll('.toc-list a');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tocLinks.forEach(link => {
              link.style.fontWeight = 'normal';
              link.style.color = 'var(--text-secondary)';
            });
            const activeLink = document.querySelector(\`.toc-list a[href="#\${entry.target.id}"]\`);
            if (activeLink) {
              activeLink.style.fontWeight = '600';
              activeLink.style.color = 'var(--link-color)';
            }
          }
        });
      }, observerOptions);

      headings.forEach(heading => observer.observe(heading));
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

    // Extract current page identifier from output filename (e.g., 'user-guide' from 'user-guide.html')
    const currentPage = config.output.replace('.html', '');

    // Wrap in template
    const fullHTML = createHTMLTemplate(
      config.title,
      config.description,
      htmlContent,
      currentPage
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
