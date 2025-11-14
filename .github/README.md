# tsDice CI/CD Framework

Welcome to the tsDice CI/CD framework! This directory contains all automation, workflows, templates, and documentation for the project's continuous integration and deployment pipeline.

## 📁 Directory Structure

```text
.github/
├── workflows/              # GitHub Actions workflows (8 files)
│   ├── ci.yml             # Main CI pipeline
│   ├── codeql.yml         # Security scanning
│   ├── deploy.yml         # GitHub Pages deployment
│   ├── pr-validation.yml  # PR validation
│   ├── release.yml        # Release automation
│   ├── performance.yml    # Performance monitoring
│   ├── stale.yml          # Issue/PR cleanup
│   └── labeler.yml        # Auto-labeling
│
├── ISSUE_TEMPLATE/        # Issue templates
│   ├── bug_report.yml     # Bug report form
│   ├── feature_request.yml# Feature request form
│   └── config.yml         # Template configuration
│
├── dependabot.yml         # Dependency updates
├── labeler.yml            # Labeling rules
├── pull_request_template.md # PR template
│
└── Documentation/
    ├── CI_CD_GUIDE.md          # Complete guide (300+ lines)
    ├── CI_CD_SUMMARY.md        # High-level overview (250+ lines)
    ├── CI_CD_ARCHITECTURE.md   # Visual diagrams (600+ lines)
    └── README.md               # This file
```

## 🚀 Quick Start

### For Contributors

**Before creating a PR:**

```bash
npm run lint          # Check code style
npm run format        # Format code
npm test              # Run tests
```

**Create your PR:**

1. Use the [PR template](pull_request_template.md)
2. Follow conventional commits format
3. Wait for automated checks
4. Address any feedback

### For Maintainers

**Managing releases:**

```bash
git tag v1.x.x
git push origin v1.x.x
# Release workflow triggers automatically
```

**Reviewing Dependabot PRs:**

1. Check CI results
2. Review changelog
3. Merge if tests pass

## 📖 Documentation

### Comprehensive Guides

1. **[CI/CD Guide](CI_CD_GUIDE.md)** ⭐ START HERE
   - Complete documentation
   - Workflow details
   - Troubleshooting
   - Best practices

2. **[Architecture Diagrams](CI_CD_ARCHITECTURE.md)**
   - Visual pipeline flows
   - Security layers
   - Integration points
   - Data flows

3. **[Implementation Summary](CI_CD_SUMMARY.md)**
   - High-level overview
   - Metrics and statistics
   - Quick reference
   - Learning resources

## 🔧 Workflows Overview

### Active Workflows (8)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push/PR | Lint, test, security audit |
| **CodeQL** | Push/PR/Weekly | Security analysis |
| **Deploy** | Push to main | GitHub Pages deployment |
| **PR Validation** | PR events | Comprehensive PR checks |
| **Release** | Version tags | Automated releases |
| **Performance** | Push/PR to main | Bundle size tracking |
| **Stale** | Daily | Issue/PR cleanup |
| **Auto Labeler** | PR events | Smart categorization |

### Workflow Details

#### CI Workflow (ci.yml)

- **Duration**: ~2-3 minutes
- **Node versions**: 18.x, 20.x, 22.x
- **Jobs**: Lint, Test, Security
- **Artifacts**: Coverage reports

#### CodeQL (codeql.yml)

- **Schedule**: Weekly (Monday 00:00)
- **Language**: JavaScript
- **Queries**: security-extended, security-and-quality
- **Reports**: GitHub Security tab

#### Deploy (deploy.yml)

- **Target**: GitHub Pages
- **Trigger**: Push to main
- **Process**: Build → Test → Deploy
- **URL**: Auto-configured

## 🛡️ Security

### Security Layers

1. **CodeQL Analysis**
   - Static code analysis
   - Weekly scheduled scans
   - PR checks

2. **npm audit**
   - Dependency scanning
   - High severity only
   - Runs on every CI

3. **Dependabot**
   - Weekly updates
   - npm + GitHub Actions
   - Auto-labels PRs

4. **Security Policy**
   - See [SECURITY.md](../SECURITY.md)
   - Responsible disclosure
   - Response timeline

### Current Status

- ✅ CodeQL: 0 alerts
- ✅ npm audit: Clean
- ✅ Dependencies: Up to date

## 🏷️ Labels

### Automatic Labels

**By File Type:**

- `documentation` - *.md files
- `javascript` - *.js files
- `tests` - tests/* files
- `ci/cd` - .github/workflows/*
- `dependencies` - package.json
- `ui` - index.html, *.css

**By PR Size:**

- `size/XS` - <10 changes
- `size/S` - <50 changes
- `size/M` - <200 changes
- `size/L` - <500 changes
- `size/XL` - 500+ changes

## 📊 Metrics

### Current Statistics

- **Workflows**: 8 active
- **Test Coverage**: 48 tests (100% passing)
- **Node Versions**: 3 (18, 20, 22)
- **Security Alerts**: 0
- **Documentation**: 800+ lines

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Test Pass Rate | 100% | ✅ 100% |
| Build Time | <5 min | ✅ ~2 min |
| Deploy Time | <3 min | ✅ ~1 min |
| Security Alerts | 0 | ✅ 0 |

## 🤝 Contributing to CI/CD

### Improving Workflows

1. Edit workflow files in `.github/workflows/`
2. Test locally with [act](https://github.com/nektos/act) if possible
3. Create PR with changes
4. Document changes in CI_CD_GUIDE.md

### Adding New Workflows

1. Create new `.yml` file in `.github/workflows/`
2. Follow existing patterns
3. Add documentation
4. Update this README
5. Test thoroughly

### Reporting Issues

Found a problem with CI/CD?

1. Check [CI_CD_GUIDE.md](CI_CD_GUIDE.md) troubleshooting
2. Search existing issues
3. Create new issue with:
   - Workflow name
   - Error message
   - Steps to reproduce

## 🔍 Monitoring

### Where to Check

1. **Actions Tab**
   - All workflow runs
   - Execution logs
   - Artifacts

2. **Security Tab**
   - CodeQL alerts
   - Dependabot alerts
   - Advisories

3. **Pull Requests**
   - Check results
   - Automated comments
   - Coverage reports

## 📚 Resources

### External Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [Vitest Documentation](https://vitest.dev/)

### Internal Documentation

- [Main README](../README.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
- [Changelog](../CHANGELOG.md)

## 🎓 Learning Path

**For New Contributors:**

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Review [CI_CD_SUMMARY.md](CI_CD_SUMMARY.md)
3. Check [CI_CD_GUIDE.md](CI_CD_GUIDE.md)
4. Make your first contribution!

**For Maintainers:**

1. Review [CI_CD_ARCHITECTURE.md](CI_CD_ARCHITECTURE.md)
2. Understand [CI_CD_GUIDE.md](CI_CD_GUIDE.md)
3. Monitor workflows regularly
4. Keep documentation updated

## ❓ FAQ

**Q: Why are there so many workflows?**  
A: Each workflow has a specific purpose, making them easier to maintain and faster to run in parallel.

**Q: How do I add a new dependency?**  
A: Just update package.json. Dependabot will help keep it secure.

**Q: Can I skip CI checks?**  
A: No, but you can request maintainer review if there's a legitimate issue.

**Q: How often does Dependabot run?**  
A: Weekly on Mondays at 09:00 UTC.

**Q: Where do I report security issues?**  
A: See [SECURITY.md](../SECURITY.md) for responsible disclosure.

## 🎉 Success Stories

This CI/CD framework provides:

- ✅ 100% test automation
- ✅ Multi-version compatibility testing
- ✅ Automated security scanning
- ✅ Zero-touch deployments
- ✅ Comprehensive documentation
- ✅ Developer-friendly workflows

---

**Maintained by**: tsDice team  
**Last Updated**: November 14, 2024  
**Status**: ✅ Active and Production-Ready

For questions or suggestions, open a [Discussion](https://github.com/zophiezlan/tsdice/discussions)!
