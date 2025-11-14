# CI/CD Guide for tsDice

This document explains the comprehensive CI/CD framework implemented for the tsDice project.

## Overview

The tsDice project uses GitHub Actions for continuous integration and continuous deployment. The framework includes automated testing, linting, security scanning, deployment, and dependency management.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push to `main` or `develop`, Pull Requests to `main` or `develop`

**Jobs:**

- **Lint:** Runs ESLint and Prettier format checks
- **Test:** Runs test suite on Node.js 18.x, 20.x, and 22.x
  - Generates code coverage reports
  - Uploads coverage to Codecov (if configured)
  - Stores coverage artifacts
- **Security:** Runs npm audit to check for vulnerabilities

**Purpose:** Ensures code quality, test coverage, and basic security before merging.

### 2. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

**Triggers:**

- Push to `main` or `develop`
- Pull Requests to `main` or `develop`
- Weekly schedule (Mondays at 00:00 UTC)

**Jobs:**

- Analyzes JavaScript code for security vulnerabilities
- Uses security-extended and security-and-quality queries
- Reports findings to GitHub Security tab

**Purpose:** Provides advanced security scanning to identify potential vulnerabilities.

### 3. Deploy to GitHub Pages (`.github/workflows/deploy.yml`)

**Triggers:**

- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

- **Build:** Runs tests and prepares artifact
- **Deploy:** Deploys to GitHub Pages

**Purpose:** Automatically deploys the application to GitHub Pages on every main branch update.

**Note:** To enable GitHub Pages deployment:

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"

### 4. PR Validation (`.github/workflows/pr-validation.yml`)

**Triggers:** Pull request opened, synchronized, or reopened

**Jobs:**

- Runs full CI suite (linting, formatting, tests, coverage)
- Validates PR title follows conventional commits
- Checks for large files
- Posts validation results as PR comment

**Purpose:** Provides comprehensive validation and feedback on pull requests.

### 5. Release (`.github/workflows/release.yml`)

**Triggers:**

- Push of version tags (e.g., `v1.0.0`)
- Manual workflow dispatch

**Jobs:**

- Runs tests and linting
- Generates changelog from commits
- Creates release archives (zip and tar.gz)
- Creates GitHub Release with artifacts
- Updates release branch

**Purpose:** Automates the release process with proper versioning and artifacts.

**Usage:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 6. Performance Monitoring (`.github/workflows/performance.yml`)

**Triggers:** Push to `main`, Pull Requests to `main`

**Jobs:**

- **Lighthouse CI:** Runs Lighthouse performance audits
- **Bundle Size:** Calculates and reports file sizes
  - Comments size report on PRs

**Purpose:** Tracks application performance and bundle size over time.

### 7. Stale Issues and PRs (`.github/workflows/stale.yml`)

**Triggers:** Daily schedule (00:00 UTC), Manual dispatch

**Jobs:**

- Marks inactive issues stale after 60 days
- Closes stale issues after 7 additional days
- Marks inactive PRs stale after 30 days
- Closes stale PRs after 14 additional days

**Purpose:** Keeps issue tracker clean and manageable.

### 8. Auto Label PRs (`.github/workflows/labeler.yml`)

**Triggers:** Pull request opened or synchronized

**Jobs:**

- Automatically labels PRs based on changed files
- Adds size labels (XS, S, M, L, XL) based on changes

**Purpose:** Improves PR organization and review workflow.

## Dependabot Configuration

**File:** `.github/dependabot.yml`

**Features:**

- Weekly npm dependency updates (Mondays at 09:00)
- Weekly GitHub Actions updates (Mondays at 09:00)
- Auto-labels dependencies PRs
- Limits open PRs (10 for npm, 5 for actions)

**Purpose:** Keeps dependencies up-to-date and secure.

## Local Development Tools

### ESLint Configuration

**File:** `eslint.config.js`

- Uses ESLint flat config format (v9+)
- Configured for ES2021+ and browser environment
- Integrated with Prettier to avoid conflicts

**Commands:**

```bash
npm run lint          # Run linting
npm run lint:fix      # Auto-fix linting issues
```

### Prettier Configuration

**File:** `.prettierrc.json`

- Enforces consistent code formatting
- Single quotes, 2-space indentation, semicolons

**Commands:**

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Testing

**Framework:** Vitest with happy-dom

**Commands:**

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Coverage:** Configured in `vitest.config.js`

- Excludes: `node_modules`, `js/main.js`, `js/constants.js`
- Reporters: text, html

## Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/zophiezlan/tsdice/workflows/CI/badge.svg)
![CodeQL](https://github.com/zophiezlan/tsdice/workflows/CodeQL%20Security%20Analysis/badge.svg)
![License](https://img.shields.io/github/license/zophiezlan/tsdice)
[![codecov](https://codecov.io/gh/zophiezlan/tsdice/branch/main/graph/badge.svg)](https://codecov.io/gh/zophiezlan/tsdice)
```

## Secrets Configuration

To fully enable all features, configure these secrets in GitHub repository settings:

1. **CODECOV_TOKEN** (Optional)
   - For uploading coverage reports to Codecov
   - Get from: <https://codecov.io>

2. **GITHUB_TOKEN** (Automatic)
   - Automatically provided by GitHub Actions
   - No configuration needed

## Best Practices

### For Contributors

1. **Before Creating PR:**
   - Run `npm run lint` to check code style
   - Run `npm run format` to format code
   - Run `npm test` to ensure tests pass
   - Keep changes focused and small (aim for size/S or size/M)

2. **PR Title Format:**
   - Follow conventional commits: `type: description`
   - Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore

3. **Review CI Results:**
   - Wait for all checks to pass before requesting review
   - Address any linting or test failures promptly
   - Review coverage report to ensure adequate test coverage

### For Maintainers

1. **Release Process:**

   ```bash
   # Update version in package.json
   npm version patch|minor|major
   
   # Push with tags
   git push origin main --tags
   ```

2. **Managing Stale Items:**
   - Review stale issues/PRs before auto-close
   - Use 'pinned' label for items that should never be closed

3. **Dependency Updates:**
   - Review and merge Dependabot PRs regularly
   - Test thoroughly before merging major version updates

## Monitoring

### Where to Find Information

1. **GitHub Actions Tab:** View all workflow runs and logs
2. **Security Tab:** View CodeQL findings and Dependabot alerts
3. **Pull Requests:** See automated checks and comments
4. **Releases:** View published releases and artifacts

### Troubleshooting

**Tests failing in CI but passing locally:**

- Check Node.js version matches CI matrix
- Ensure dependencies are up-to-date: `npm ci`
- Check for environment-specific issues

**Linting failures:**

- Run `npm run lint:fix` locally
- Commit the changes

**Deployment failures:**

- Verify GitHub Pages is enabled in repository settings
- Check workflow permissions

**CodeQL alerts:**

- Review in Security tab
- Address vulnerabilities in code
- Update dependencies if needed

## Continuous Improvement

The CI/CD framework is designed to be:

- **Comprehensive:** Covers testing, security, quality, and deployment
- **Efficient:** Parallel jobs and caching reduce execution time
- **Maintainable:** Clear configuration and documentation
- **Extensible:** Easy to add new workflows or checks

Suggestions for improvements are welcome! Please open an issue to discuss.

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Vitest Documentation](https://vitest.dev/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
