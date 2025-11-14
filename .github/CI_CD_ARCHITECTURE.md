# CI/CD Architecture

This document provides a visual representation of the tsDice CI/CD pipeline architecture.

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   Local Development       │
                    │   • npm run lint          │
                    │   • npm run format        │
                    │   • npm test              │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │   Git Push / Create PR    │
                    └───────────┬───────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         GitHub Actions Triggers                           │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │ On Push   │   │  On PR    │   │ Scheduled │
        │ (main/dev)│   │           │   │ (weekly)  │
        └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
```

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CI Workflow (ci.yml)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐        │
│  │   Lint Job   │      │   Test Job   │      │ Security Job │        │
│  ├──────────────┤      ├──────────────┤      ├──────────────┤        │
│  │ • ESLint     │      │ Node 18.x    │      │ npm audit    │        │
│  │ • Prettier   │      │ Node 20.x    │      │ production   │        │
│  │              │      │ Node 22.x    │      │ dependencies │        │
│  │              │      │              │      │              │        │
│  │              │      │ • Run tests  │      │              │        │
│  │              │      │ • Coverage   │      │              │        │
│  │              │      │ • Codecov    │      │              │        │
│  └──────────────┘      └──────────────┘      └──────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      CodeQL Workflow (codeql.yml)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Security Analysis                                               │ │
│  │  • Initialize CodeQL                                             │ │
│  │  • Analyze JavaScript code                                       │ │
│  │  • security-extended queries                                     │ │
│  │  • security-and-quality queries                                  │ │
│  │  • Report to GitHub Security tab                                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Triggers: Push, PR, Weekly (Monday 00:00 UTC)                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    PR Validation (pr-validation.yml)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Comprehensive PR Checks                                         │ │
│  │  1. Lint code                                                    │ │
│  │  2. Check formatting                                             │ │
│  │  3. Run tests                                                    │ │
│  │  4. Generate coverage                                            │ │
│  │  5. Validate PR title (conventional commits)                     │ │
│  │  6. Check file sizes                                             │ │
│  │  7. Post results as PR comment                                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    Deploy Workflow (deploy.yml)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐                    ┌──────────────┐                 │
│  │  Build Job   │ ──────────────────▶│  Deploy Job  │                 │
│  ├──────────────┤                    ├──────────────┤                 │
│  │ • Checkout   │                    │ • Deploy to  │                 │
│  │ • Install    │                    │   GitHub     │                 │
│  │ • Run tests  │                    │   Pages      │                 │
│  │ • Prepare    │                    │              │                 │
│  │   artifact   │                    │              │                 │
│  └──────────────┘                    └──────────────┘                 │
│                                                                         │
│  Trigger: Push to main branch                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Automation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Dependabot (dependabot.yml)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Weekly Schedule (Monday 09:00)                                        │
│          │                                                              │
│          ├──▶ npm Ecosystem                                            │
│          │    • Check for updates                                      │
│          │    • Create PR with changes                                 │
│          │    • Label: "dependencies", "npm"                           │
│          │                                                              │
│          └──▶ GitHub Actions                                           │
│               • Check for action updates                               │
│               • Create PR with changes                                 │
│               • Label: "dependencies", "github-actions"                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      Auto Labeler (labeler.yml)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  On PR Open/Update                                                     │
│          │                                                              │
│          ├──▶ File-based Labels                                        │
│          │    • documentation (*.md)                                   │
│          │    • javascript (*.js)                                      │
│          │    • tests (tests/*)                                        │
│          │    • ci/cd (.github/workflows/*)                            │
│          │    • dependencies (package.json)                            │
│          │                                                              │
│          └──▶ Size Labels                                              │
│               • size/XS (<10 changes)                                  │
│               • size/S (<50 changes)                                   │
│               • size/M (<200 changes)                                  │
│               • size/L (<500 changes)                                  │
│               • size/XL (500+ changes)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      Stale Management (stale.yml)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Daily Schedule (00:00 UTC)                                            │
│          │                                                              │
│          ├──▶ Issues                                                   │
│          │    • Mark stale after 60 days                              │
│          │    • Close after 7 more days                               │
│          │    • Exempt: pinned, security, bug                         │
│          │                                                              │
│          └──▶ Pull Requests                                            │
│               • Mark stale after 30 days                               │
│               • Close after 14 more days                               │
│               • Exempt: pinned, security, wip                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Release Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Release Workflow (release.yml)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Tag Created (v*.*.*)                                                  │
│          │                                                              │
│          ▼                                                              │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  1. Checkout code                                              │   │
│  │  2. Install dependencies                                       │   │
│  │  3. Run tests & linting                                        │   │
│  │  4. Generate changelog from commits                            │   │
│  │  5. Create release archives (zip & tar.gz)                     │   │
│  │  6. Create GitHub Release with artifacts                       │   │
│  │  7. Update release branch                                      │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Artifacts:                                                            │
│  • tsdice-{version}.zip                                                │
│  • tsdice-{version}.tar.gz                                             │
│  • CHANGELOG.txt                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Performance Monitoring

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Performance Workflow (performance.yml)                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐              ┌──────────────────┐               │
│  │  Lighthouse CI   │              │  Bundle Size     │               │
│  ├──────────────────┤              ├──────────────────┤               │
│  │ • Performance    │              │ • Calculate      │               │
│  │ • Accessibility  │              │   file sizes     │               │
│  │ • Best Practices │              │ • Generate       │               │
│  │ • SEO           │              │   report         │               │
│  │                 │              │ • Comment on PR  │               │
│  └──────────────────┘              └──────────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Developer
    │
    │ 1. Write code
    │
    ▼
Local Environment
    │ • Lint (npm run lint)
    │ • Format (npm run format)
    │ • Test (npm test)
    │
    │ 2. Commit & Push
    │
    ▼
GitHub Repository
    │
    │ 3. Trigger workflows
    │
    ├──▶ CI Workflow ──────────────┐
    │                              │
    ├──▶ CodeQL Analysis ──────────┤
    │                              │
    ├──▶ PR Validation ────────────┤
    │                              ├──▶ Results ──▶ GitHub UI
    ├──▶ Auto Labeler ─────────────┤               (Checks, Comments)
    │                              │
    └──▶ Performance Monitoring ───┘
    │
    │ 4. On PR merge to main
    │
    ▼
Deploy Workflow
    │
    │ • Build artifact
    │ • Deploy to GitHub Pages
    │
    ▼
Production Environment
    │ https://github.io/zophiezlan/tsdice
    │
    └──▶ Live Application
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Security Architecture                          │
└─────────────────────────────────────────────────────────────────────────┘

Layer 1: Static Analysis
┌────────────────────────────────────────────────────────────────────────┐
│ CodeQL                                                                 │
│ • Scans: Weekly + Every PR                                            │
│ • Queries: security-extended, security-and-quality                    │
│ • Reports: GitHub Security tab                                        │
└────────────────────────────────────────────────────────────────────────┘

Layer 2: Dependency Scanning
┌────────────────────────────────────────────────────────────────────────┐
│ npm audit                                                              │
│ • Runs: Every CI pipeline                                             │
│ • Checks: Production dependencies                                     │
│ • Alert Level: High                                                   │
└────────────────────────────────────────────────────────────────────────┘

Layer 3: Automated Updates
┌────────────────────────────────────────────────────────────────────────┐
│ Dependabot                                                             │
│ • Schedule: Weekly (Monday 09:00)                                     │
│ • Ecosystems: npm, github-actions                                     │
│ • Auto-creates: Security update PRs                                   │
└────────────────────────────────────────────────────────────────────────┘

Layer 4: Policy & Process
┌────────────────────────────────────────────────────────────────────────┐
│ Security Policy (SECURITY.md)                                          │
│ • Responsible disclosure process                                      │
│ • Contact methods                                                     │
│ • Response timeline                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        External Integrations                            │
└─────────────────────────────────────────────────────────────────────────┘

GitHub Features
├── Actions (Workflows)
├── Security (CodeQL alerts)
├── Pages (Deployment)
├── Releases (Artifacts)
└── Discussions (Community)

Optional Integrations
├── Codecov (Coverage reports)
├── Slack/Discord (Notifications)
└── Status badges (README)

Future Possibilities
├── Visual regression testing
├── E2E testing
├── Performance budgets
└── Multi-environment deployment
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Monitoring Dashboard                          │
└─────────────────────────────────────────────────────────────────────────┘

GitHub Actions Tab
├── Workflow runs (success/failure)
├── Execution times
└── Artifact downloads

GitHub Security Tab
├── CodeQL alerts
├── Dependabot alerts
└── Security advisories

GitHub Insights
├── Code frequency
├── Contributors
└── Traffic

Pull Requests
├── Automated check results
├── Coverage reports
└── Performance metrics
```

## Key Performance Indicators

| Metric          | Target | Current         |
| --------------- | ------ | --------------- |
| Test Pass Rate  | 100%   | ✅ 100% (48/48) |
| Code Coverage   | >80%   | ✅ Tracked      |
| Security Alerts | 0      | ✅ 0            |
| Build Time      | <5 min | ✅ ~2 min       |
| Deploy Time     | <3 min | ✅ ~1 min       |
| PR Turnaround   | <24h   | ✅ Automated    |

---

**Last Updated**: November 14, 2024  
**Maintained By**: CI/CD Team
