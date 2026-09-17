# Releasing

Releases use a published GitHub Release as the only automation trigger. The GitHub Release tag
must equal `v${package.version}`. The `release.yml` workflow rejects prereleases, runs the complete
quality and package audits, waits on the protected `npm` environment, and publishes with npm
trusted publishing.

Do not create a tag, GitHub Release, or npm publication until the Phase 11 readiness review is
complete and the owner-side configuration below has been verified.

## One-time owner configuration

### Repository and package

- The repository must be public at `https://github.com/alialaraby/saudi-utils` for npm provenance.
- Before publication, `package.json.repository.url` must exactly match the public GitHub repository
  URL. This metadata is intentionally deferred to Phase 11 and is not present yet.
- Confirm ownership and availability of the `saudi-utils` name on npm. The npm account performing
  setup must own the package or have maintainer access.
- The package must be public. Phase 11 is responsible for the explicit decision to remove
  `"private": true` and finalize `publishConfig`; this workflow does not bypass that safeguard.
- Enable two-factor authentication on maintainer npm and GitHub accounts.

Automatic npm provenance requires both a public repository and a public package. Private GitHub
repositories do not receive npm provenance even when OIDC trusted publishing succeeds.

### npm trusted publisher

In the npm package settings, add a **GitHub Actions** trusted publisher with these exact values:

| npm field            | Value                |
| -------------------- | -------------------- |
| Organization or user | `alialaraby`         |
| Repository           | `saudi-utils`        |
| Workflow filename    | `release.yml`        |
| Environment name     | `npm`                |
| Allowed action       | Direct `npm publish` |

The workflow filename is only the filename, not `.github/workflows/release.yml`. All configured
values are case-sensitive. npm requires Node.js 22.14.0 or newer and npm 11.5.1 or newer for trusted
publishing; the workflow uses Node.js 24.20.0 and installs npm 11.5.1.

Follow npm's [trusted publishing configuration](https://docs.npmjs.com/trusted-publishers/). Once
OIDC publishing works, configure npm publishing access to require 2FA and disallow traditional
publishing tokens.

No `NPM_TOKEN`, `NODE_AUTH_TOKEN`, GitHub secret, or other long-lived npm publishing credential is
required or accepted by this workflow. npm exchanges the GitHub OIDC identity for a short-lived
publish credential and automatically creates provenance; do not add a manual `--provenance` flag.

### First publication

npm's trusted-publisher setup begins in an existing package's settings. If `saudi-utils` has never
been published or otherwise created for the intended owner, the trusted publisher cannot be
attached yet. Phase 11 must verify the registry state and document the approved bootstrap process.
Any one-time initial publication requires separate explicit owner approval and interactive npm
authentication; do not place a bootstrap credential in GitHub Actions. After the package exists,
configure the trusted publisher above before using the automated release workflow.

### Protected GitHub environment

Create a GitHub environment named `npm` and configure it before publishing:

- require at least one maintainer reviewer;
- prevent self-review where the repository plan supports it;
- restrict deployment tags to the intended `v*` release pattern;
- disable administrator bypass where appropriate;
- add no npm token or publishing secret.

See GitHub's [environment protection documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
Repository administration permission is required to configure environments. npm package owner or
maintainer permission is required to configure the trusted publisher.

## Release checklist

1. Confirm Phase 11's packed-artifact, metadata, registry-name, and consumer checks are complete.
2. Ensure `main` is current and CI passes on Node.js 22, 24, and 26.
3. Choose a non-prerelease semantic version. Prerelease publishing has no approved dist-tag policy
   and is rejected by the workflow.
4. Update `package.json`, `package-lock.json`, and `CHANGELOG.md` to the same version and release
   notes. Confirm `"private": true` has been removed only as part of the approved Phase 11 work.
5. Run locally with Node.js 22 or newer:

   ```bash
   npm ci
   npm run docs:check
   npm run check
   npm run package:check
   npm run pack:dry-run
   ```

6. Merge the focused release-preparation pull request after review and green CI.
7. Create the annotated release tag `v<version>` from the intended commit.
8. Draft a GitHub Release for that exact tag. Ensure its version and notes match `package.json` and
   `CHANGELOG.md`, leave the prerelease option disabled, then publish the GitHub Release.
9. Review the waiting `npm` environment deployment. Approve it only after confirming the tag,
   commit, checks, package manifest, and release notes.
10. Confirm the workflow publishes with `npm publish --access public` and no token or manual
    provenance flag.

## Post-publication verification

- Confirm the npm page shows the expected version, README, license, repository, and public access.
- Inspect the published file list and install the exact version in a clean ESM/TypeScript consumer.
- Confirm npm displays provenance linked to the expected public GitHub repository, workflow, tag,
  and commit. Trusted publishing creates provenance automatically.
- Confirm the GitHub Release, tag, `package.json`, lockfile, and changelog all show the same version.
- Record any verification result required by the release checklist.

## Corrections, deprecation, and rollback

Published registry data is immutable. Correct a defect with a new patch release: fix the issue,
add regression tests, update the changelog and version, and repeat the normal reviewed release
process. Never move an existing release tag or attempt to overwrite a published version.

If users must avoid a defective version, deprecate that exact version with a clear replacement:

```bash
npm deprecate saudi-utils@<version> "Use <corrected-version>: <reason>"
```

Deprecation is an owner action using interactive npm authentication; trusted publishing covers
publication, not administrative commands. Follow npm's
[deprecation guidance](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/).

Avoid unpublishing except for an exceptional security or accidental-disclosure case reviewed by
the owner. Unpublishing can break downstream builds, cannot make a used name/version reusable, and
is restricted by npm policy. Prefer a corrective release plus deprecation. See npm's
[unpublish policy](https://docs.npmjs.com/policies/unpublish/).
