# 📚 tsDice Documentation

This folder contains auto-generated HTML documentation pages converted from the markdown files in the repository root.

## 📄 Available Documentation

- [User Guide](user-guide.html) - Complete guide from beginner to power user
- [Architecture Guide](architecture.html) - Technical architecture and design decisions
- [Complete Analysis](analysis.html) - Comprehensive technical analysis
- [Quick Reference](quick-reference.html) - Quick reference and cheat sheet

## 🔄 Auto-Generation

The HTML files are automatically generated from markdown files using the `scripts/build-docs.js` script:

```bash
npm run build:docs
```

### Source Files

| HTML Output | Markdown Source |
|-------------|----------------|
| `user-guide.html` | `USER_GUIDE.md` |
| `architecture.html` | `ARCHITECTURE.md` |
| `analysis.html` | `ANALYSIS.md` |
| `quick-reference.html` | `QUICK_REFERENCE.md` |

### GitHub Actions

The documentation is automatically rebuilt whenever:
- Any `.md` file in the repository root is updated
- The `scripts/build-docs.js` script is modified
- The workflow is manually triggered

See `.github/workflows/build-docs.yml` for the automation configuration.

## 🎨 Styling

The generated HTML pages match the tsDice application's design:
- Dark mode by default with light mode toggle
- Glass-morphism design language
- Responsive layout for mobile and desktop
- Syntax highlighting for code blocks

## 🔗 Integration

These docs are linked from the main application's Help & Information modal (Alt+?), making them accessible both:
- Online via GitHub Pages
- Offline when the repository is downloaded locally

## ✏️ Making Changes

**Do not edit the HTML files directly!** They will be overwritten on the next build.

To update documentation:
1. Edit the source markdown files (`*.md` in repository root)
2. Run `npm run build:docs` to regenerate HTML
3. Commit both the markdown and generated HTML files

Or simply commit the markdown changes and let GitHub Actions rebuild the HTML automatically.
