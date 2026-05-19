# Security Policy

## Supported versions

Only the latest published `0.x` minor receives security updates while the library
is in pre-1.0 status. After the `1.0.0` stabilisation release, the policy will
extend to the latest minor of each supported major.

| Version  | Supported |
| -------- | --------- |
| 0.10.x   | ✅        |
| < 0.10.0 | ❌        |

## Reporting a vulnerability

If you discover a security issue in `@bleizlabs/ui`, please do **not** open a
public GitHub issue. Instead, use one of the following private channels:

1. **GitHub Security Advisories** — preferred. Open a draft advisory at
   <https://github.com/BleizLabs/bleizlabs-ui/security/advisories/new>.
2. **Email** — `security@bleizlabs.eu` if GitHub Security Advisories is not
   suitable for your case.

Please include:

- A description of the vulnerability.
- Steps to reproduce or a proof-of-concept.
- The version of `@bleizlabs/ui` affected.
- Any known mitigations or workarounds.

## Response timeline

We will:

- Acknowledge receipt within **5 business days**.
- Provide an initial assessment within **10 business days**.
- Coordinate disclosure once a fix is ready.

There is no bug bounty program. Reporters who follow responsible disclosure are
credited in the published advisory unless they request anonymity.

## Out of scope

- Vulnerabilities in dependencies (`react`, `next`, etc.) — please report to the
  upstream project.
- Issues in consumer applications using the library — those are application-layer
  concerns owned by the consumer.
- Best-practice suggestions or hardening recommendations not tied to a specific
  vulnerability — please open a regular GitHub issue instead.
