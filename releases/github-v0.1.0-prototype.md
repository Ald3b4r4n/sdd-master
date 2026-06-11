# GitHub Release Notes — v0.1.0-prototype

## Status

Draft prepared. Not published as final release yet.

## Version

v0.1.0-prototype

## Stage

Prototype

## Summary

First public prototype of SDD Master, a specification-driven development framework for AI-assisted software projects.

## What is included

- npm package foundation.
- TypeScript CLI.
- `sdd master init`.
- Official SDD Master templates.
- `sdd master doctor`.
- Multi-agent instruction files.
- `sdd master agents`.
- Git/security checks.
- `sdd master git`.
- Premium README and SVG assets.
- Public documentation.
- GitHub CI without deploy or npm publish.
- Local release checks.
- npm dry-run validation.

## What is not included yet

- Real npm publication.
- GitHub Release final publication.
- External secret scanning tools such as gitleaks/trufflehog.
- Online skill search/installation.
- Full SDD workflow commands such as requirements, spec, plan, tasks, implement, audit and release.
- Production-grade plugin system.

## Safety notes

This release does not include environment files, private credentials, internal SDD state from consumer projects, or npm publication.

## Validation

Validated with:

- `npm run build`
- `npm test`
- `npm run smoke`
- `npm run package:check`
- `npm run pack:dry-run`
- `npm run release:check`
- `npm run check`
- `npm publish --dry-run --access public`
- `sdd master git --pre-push`

## Installation status

npm installation is planned for a future release.

For now, use local development instructions in the README.

## Repository

https://github.com/Ald3b4r4n/sdd-master
