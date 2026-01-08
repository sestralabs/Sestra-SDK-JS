# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email us at: security@sestralabs.xyz
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Resolution Timeline**: Critical vulnerabilities will be addressed within 30 days
- **Disclosure**: We will coordinate with you on public disclosure timing

### Security Best Practices

When using this SDK:

1. **Never expose private keys** in client-side code
2. **Use environment variables** for sensitive configuration
3. **Validate all inputs** before passing to SDK methods
4. **Keep dependencies updated** to receive security patches
5. **Use HTTPS** for all API communications
6. **Implement rate limiting** in your applications

### Scope

The following are in scope for security reports:

- Authentication/authorization bypass
- Data exposure or leakage
- Code injection vulnerabilities
- Cryptographic weaknesses
- Denial of service vulnerabilities

### Out of Scope

- Issues in dependencies (report to respective maintainers)
- Social engineering attacks
- Physical security issues
- Issues requiring physical access

## Security Measures

This SDK implements the following security measures:

- **Type Safety**: Full TypeScript implementation with strict type checking
- **Input Validation**: All inputs are validated before processing
- **Secure Defaults**: Secure configuration defaults are used
- **Minimal Dependencies**: Limited external dependencies to reduce attack surface
- **Regular Audits**: Dependencies are regularly audited for vulnerabilities

## Responsible Disclosure

We follow responsible disclosure practices:

1. Reporter notifies us of the vulnerability
2. We acknowledge and investigate
3. We develop and test a fix
4. We release the fix
5. We publicly disclose after users have time to update

Thank you for helping keep Sestra SDK and our users safe!
