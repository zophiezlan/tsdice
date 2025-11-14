# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

The tsDice team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via GitHub's private vulnerability reporting feature:

1. Go to the [Security Advisories](https://github.com/zophiezlan/tsdice/security/advisories) page
2. Click "Report a vulnerability"
3. Fill out the form with details about the vulnerability

Alternatively, you can email the maintainer directly (check the repository for contact information).

### What to Include

To help us understand and resolve the issue quickly, please include:

- Type of vulnerability (e.g., XSS, injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Fix Timeline**: Varies based on severity and complexity

### What to Expect

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Investigation**: We'll investigate and validate the report
3. **Resolution**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate public disclosure with you
5. **Credit**: We'll publicly thank you (unless you prefer to remain anonymous)

## Security Best Practices

When using tsDice:

1. **Keep Dependencies Updated**: Regularly update npm packages
2. **Use HTTPS**: Always serve the application over HTTPS in production
3. **Content Security Policy**: Implement appropriate CSP headers
4. **Input Validation**: The application handles user input for configurations - ensure your deployment environment is secure

## Automated Security

We use several automated tools to maintain security:

- **Dependabot**: Automated dependency updates
- **CodeQL**: Static code analysis for vulnerabilities
- **npm audit**: Regular dependency vulnerability scanning

## Security Updates

Security updates are released as patch versions and announced via:

- GitHub Security Advisories
- Release notes
- Repository notifications (for watchers)

## Bug Bounty Program

Currently, tsDice does not have a bug bounty program. However, we deeply appreciate security researchers who help keep the project secure, and we'll publicly acknowledge your contributions (with your permission).

## Questions

If you have questions about this security policy, please open a discussion in the [GitHub Discussions](https://github.com/zophiezlan/tsdice/discussions) section.
