# Contributing

Thanks for helping improve `machine-web-mcp`. This project aims to be predictable, minimal, and production‑ready.

## Quick Start

```bash
npm install
npm test
```

## Development Guidelines

- Keep dependencies minimal.
- Maintain backward compatibility in the MCP JSON schema.
- Prefer deterministic output; avoid randomness unless explicitly requested.
- Update tests for any behavioral change.
- Keep TypeScript strictness intact.

## Code Style

- Use plain TypeScript (no decorators).
- Keep functions small and composable.
- Avoid introducing global side effects.

## Testing

```bash
npm test
```

All tests must pass before opening a PR.

## Submitting Changes

1. Fork and create a feature branch.
2. Make focused changes with clear intent.
3. Run tests.
4. Open a PR with a concise description and rationale.

## Reporting Issues

Include:

- Reproduction steps
- Expected vs actual behavior
- Sample HTML / MCP JSON if applicable
- Environment details (Node version, framework, OS)
