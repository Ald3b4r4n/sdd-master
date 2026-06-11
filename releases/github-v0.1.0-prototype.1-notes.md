# v0.1.0-prototype.1

SDD Master prototype prerelease alignment.

## Highlights

- Aligns package metadata and release documentation to `0.1.0-prototype.1`.
- Preserves the original `v0.1.0-prototype` tag without rewriting Git history.
- Prepares a new prerelease tag, `v0.1.0-prototype.1`, for the current project state.

## Validation

- `npm run check`
- `npm run release:check`
- `npm publish --dry-run --access public --tag prototype`
- `sdd master git --pre-push`

## Publication Status

- GitHub Release final publication: not performed.
- Real npm publication: not performed.
- npm tag for future prerelease publication: `prototype`.

No real environment files, credentials, private keys or sensitive data are included.
