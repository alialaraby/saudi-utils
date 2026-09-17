# Releasing

The intended first release is `0.1.0`. Later releases use a published GitHub Release as the only
automation trigger. Its tag must be exactly `v${package.version}` (for example, `v0.1.1`). The
`release.yml` workflow rejects prereleases, runs the complete quality and package audits, waits on
the protected `npm` environment, and stages the package through npm trusted publishing. A
maintainer must inspect and approve the staged artifact with 2FA before it becomes public.

Do not create a tag, publish a GitHub Release, or publish to npm until the applicable checklist
below is complete. Never add an npm token, `NODE_AUTH_TOKEN`, or other long-lived publishing secret
to this repository or its GitHub Actions settings.

## First-package publication and bootstrap

The registry lookup on 17 September 2026 returned `E404` for `saudi-utils`, so the unscoped name
was available at that time. Recheck immediately before publication because availability can
change.

npm requires a package to exist before a trusted publisher can be configured. Staged publishing
also cannot create a brand-new package. Consequently, `0.1.0` requires this one-time owner-operated
bootstrap:

1. Ensure the npm owner account has two-factor authentication enabled and the public GitHub
   repository is `https://github.com/alialaraby/saudi-utils`.
2. Merge the reviewed release-readiness work. In a clean checkout of the exact `main` commit to be
   published, replace the changelog's `Unreleased` heading with `0.1.0` and the publication date,
   then merge that focused release-preparation change.
3. Recheck `npm view saudi-utils`. Stop if it no longer returns `E404`; do not rename or publish
   over a package whose ownership is uncertain.
4. With Node.js 22 or newer and a current npm CLI, run:

   ```bash
   npm ci
   npm run docs:check
   npm run check
   npm run package:check
   npm pack --dry-run --json
   npm pack --json
   ```

5. Inspect the generated `saudi-utils-0.1.0.tgz` against the dry-run manifest. Authenticate
   interactively with `npm login`, verify the intended account with `npm whoami`, then publish that
   exact tarball with `npm publish ./saudi-utils-0.1.0.tgz --access public`. This is a direct
   publication and requires the owner's 2FA; it must not use an automation token.
6. Remove the local tarball. Verify the live npm version, access, README, license, repository, and
   installed artifact. Then create and push the annotated tag `v0.1.0` on the exact published
   commit.
7. Do **not** publish a GitHub Release for `v0.1.0`: that event would invoke `release.yml` and try
   to publish the already-existing version. The changelog and annotated tag are the bootstrap
   release record. GitHub Releases begin with the next version.
8. Now that the npm package page exists, configure trusted publishing and package access as
   described below. No trusted-publishing provenance can be attached retroactively to the manual
   bootstrap version; automated later releases must carry provenance.

Official npm references: [publishing an unscoped package](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/),
[trusted publishers](https://docs.npmjs.com/trusted-publishers/), and
[staged publishing](https://docs.npmjs.com/staged-publishing/).

## One-time owner configuration after bootstrap

### npm trusted publisher

In the `saudi-utils` package settings on npmjs.com, add a **GitHub Actions** trusted publisher with
these exact, case-sensitive values:

| npm field            | Value                 |
| -------------------- | --------------------- |
| Organization or user | `alialaraby`          |
| Repository           | `saudi-utils`         |
| Workflow filename    | `release.yml`         |
| Environment name     | `npm`                 |
| Allowed actions      | Stage-only publishing |

The workflow filename is only `release.yml`, not `.github/workflows/release.yml`. The checked-in
workflow uses `npm stage publish --access public`. Configure the trusted publisher to allow
`npm stage publish` but not direct `npm publish`. If the existing trusted-publisher connection is
direct-publish-only or also permits direct publishing, delete it and create a stage-only connection
with the exact identity above; npm does not allow an existing connection to be edited.

Staged publishing requires Node.js 22.14.0 or newer and npm 11.15.0 or newer. The workflow uses a
GitHub-hosted runner, Node.js 24.20.0, explicitly pinned npm 11.19.1, `id-token: write`, and the
`npm` environment. OIDC automatically creates provenance for public releases from this public
repository, so the workflow intentionally has neither an npm token nor a manual `--provenance`
flag.

After one staged OIDC release is approved successfully:

1. Open the package's **Settings → Publishing access**.
2. Select **Require two-factor authentication and disallow tokens**.
3. Revoke any existing automation or granular write tokens that are no longer needed.
4. Keep the trusted publisher; the token restriction does not disable its short-lived OIDC
   credentials.

### Protected GitHub environment

Create a GitHub environment named `npm` and configure it before the first automated release:

- require at least one maintainer reviewer;
- prevent self-review where the repository plan supports it;
- restrict deployment tags to the intended `v*` release pattern;
- disable administrator bypass where appropriate;
- add no npm token or publishing secret.

See GitHub's [environment protection documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
Repository administration permission is required to configure environments. npm package owner or
maintainer permission is required to configure the trusted publisher.

## Subsequent automated releases

1. Ensure `main` is current and CI passes on the supported Node.js lines.
2. Choose a non-prerelease semantic version. Prerelease publishing has no approved dist-tag policy
   and is rejected by the workflow.
3. Update `package.json`, `package-lock.json`, and `CHANGELOG.md` to the same version and release
   notes in a focused pull request.
4. Run locally with Node.js 22 or newer:

   ```bash
   npm ci
   npm run docs:check
   npm run check
   npm run package:check
   npm pack --dry-run --json
   ```

5. Merge only after review and green CI.
6. Create and push an annotated tag named exactly `v<version>` on the intended commit.
7. Draft a GitHub Release for that tag. Confirm the tag, version, commit, and notes, leave the
   prerelease option disabled, then publish the GitHub Release.
8. Review the waiting `npm` environment deployment. Approve it only after confirming the tag,
   commit, checks, manifest, and release notes.
9. The workflow builds, verifies, audits, and submits the package to npm's staging area through
   OIDC. Workflow success means the package is staged; it is not public yet.
10. From an interactively authenticated maintainer session using npm 11.15.0 or newer, list the
    staged versions and inspect the selected stage:

    ```bash
    npm stage list saudi-utils
    npm stage view <stage-id>
    ```

11. Download the exact staged tarball for additional local inspection when desired:

    ```bash
    npm stage download <stage-id>
    ```

12. After review, either approve the stage or reject it:

    ```bash
    npm stage approve <stage-id>
    npm stage reject <stage-id>
    ```

    Approval publishes the staged package to the registry and requires maintainer 2FA. Rejection
    permanently removes the staged package and also requires 2FA. Run only the command matching
    the review decision.

## Post-publication verification

- Confirm npm shows the expected version, README, MIT license, repository, and public access.
- Compare the published file list with the reviewed pack manifest and install the exact version in
  clean ESM and strict TypeScript consumers.
- For automated releases, confirm npm displays provenance linked to
  `alialaraby/saudi-utils`, `.github/workflows/release.yml`, the expected tag, and commit. Provenance
  proves the build origin, not that the package is defect-free.
- Confirm the GitHub Release, tag, `package.json`, lockfile, and changelog show the same version.
- Confirm the release workflow staged through OIDC and the protected `npm` environment, the
  maintainer approved the intended stage with 2FA, and no token was used.

## Corrections, deprecation, and rollback

Published registry data is immutable. Correct a defect with a new patch release: fix the issue,
add regression tests, update the changelog and version, and repeat the reviewed release process.
Never move an existing release tag or attempt to overwrite a published version.

If users must avoid a defective version, deprecate that exact version with a clear replacement:

```bash
npm deprecate saudi-utils@<version> "Use <corrected-version>: <reason>"
```

Deprecation is an owner action using interactive npm authentication; trusted publishing covers
publication, not administrative commands. Follow npm's
[deprecation guidance](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/).

Avoid unpublishing except for an exceptional security or accidental-disclosure case reviewed by
the owner. Prefer a corrective release plus deprecation. See npm's
[unpublish policy](https://docs.npmjs.com/policies/unpublish/).
