# BZ-Code maintenance

BZ-Code is the application's name. `BryanZaneee/b3code` is the public fork's repository name.
The `B3_MAINTENANCE.md` filename follows the original brief. This is a personal macOS arm64 fork.

## Identity and data

`bz-branding.json` defines the product name, short name, bundle identifier (`com.bzcode.app`),
release repository, and default data directory. `assets/bz-icon.svg` is the editable terminal-style B icon.
Run `vp run icons:export` after changing it; `vp run icons:check` verifies every generated asset.
Desktop and web rendering use the existing branding bridge. Internal package names, RPC schemas,
CLI command names, provider integration identifiers, and localStorage keys stay compatible.

Production server data lives in `~/.bzcode/userdata`; the Electron profile lives in
`~/Library/Application Support/bzcode-v2`. Development uses `bzcode-dev` and a separate server home.
BZ-Code does not import the official application's old browser profile. Its macOS URL schemes
are `bzcode` and `bzcode-dev`; installing it does not register the official app's schemes.
Never set `T3CODE_HOME` to official production data. No existing official data is migrated or deleted.

## Run locally

Install Node 24 (the root engines constraint), Rust, and Xcode Command Line Tools.
Install the official Vite+ CLI using its installer from https://vite.plus. Then:

```sh
vp i
vp run dev:desktop --home-dir /tmp/bz-code-dev
```

If your global Vite+ default selects another Node version, prefix commands with
`VP_NODE_VERSION=24.18.0` or select an installed Node 24 with `vp env use`.
Keep the Vite+ and pnpm versions consistent with the repository's lockfile and package manager.
Do not set `VITE_HTTP_URL` or `VITE_WS_URL`.

The upstream development renderer exhausted Electron's request resources on this Mac. BZ-Code
now defaults desktop development to the existing bundled-dev renderer to avoid that failure.
If it reports `ERR_INSUFFICIENT_RESOURCES` or cannot load `src/main.tsx`, use the built client:

```sh
vp run build:desktop
T3CODE_HOME=/tmp/bz-code-dev vp run start:desktop
```

## Manual build and install

```sh
vp run build:desktop
vp run dist:desktop:artifact --platform mac --target dmg --arch arm64 --build-version 1.0.0 --skip-build --keep-stage
node scripts/bz-verify-release.mjs release 1.0.0
```

The build writes `release/BZ-Code-1.0.0-arm64.dmg`, the ZIP payload,
`latest-mac.yml`, and blockmaps. Always use a new monotonically increasing BZ-Code version
for a published release. A desktop release bundles its corresponding server and web client;
never update the server inside an installed app separately.

Open the DMG, copy BZ-Code.app to Applications, eject the DMG, and open the Applications copy.
The app bundles Electron, the local server, client, and native dependencies; installed use does
not require Node, Rust, Vite+, or the checkout. Coding providers are separate: install and
authenticate at least one provider on your Mac, then configure it in Settings.

Local builds are unsigned by default. macOS may require an explicit user approval to open one.
Do not disable Gatekeeper, remove quarantine as a workaround, or create fake signing credentials.

## Automated releases

The **BZ-Code macOS release** workflow supports two paths:

- Manual dispatch: builds and uploads Actions artifacts by default. Check `publish` to approve
  a GitHub Release. Supply an optional `X.Y.Z` version or let it select the next BZ-Code patch.
- Merge the `bz/upstream-sync` PR into `main`: your manual merge approves a release build and
  publication. Conflicted or failed syncs never merge or publish themselves.

Releases start at `1.0.0` and use `vX.Y.Z` tags. The workflow checks previously published versions,
rejects duplicates or downgrades, and skips publication when runtime sources match the previous
release. Documentation-only changes do not create another release.

The workflow builds only macOS arm64, validates focused tests and desktop/web/server/scripts types,
packages DMG plus ZIP, checks SHA-512 hashes and sizes, checks the embedded app identity and
fork feed, and uploads the complete assets. It creates a draft first, uploads all assets, then
publishes. Signed builds are stable; unsigned builds are explicitly marked prereleases and are
not offered to the default stable updater. A downloaded copy of the published manifest must match
what the build verified. Publication uses only the repository-scoped workflow token.

Enable Actions in the fork. Under Settings → Actions → General, allow workflows to create
pull requests. Upstream infrastructure, npm, hosted-web, mobile, other-platform release,
and relay-deployment workflows have been removed from this fork. Upstream history remains intact.
After upstream merges, inspect `.github/workflows`: only `ci.yml`, `release.yml`, and
`upstream-sync.yml` should be active. The sync validation rejects restored extra workflows.

## Signing and notarization

No valid signing identity was found on the development Mac during initial setup. Reliable
macOS automatic installation needs a Developer ID signed application. Install the first signed
DMG manually and use it as version A for the test below; an unsigned development installation
is not a validated starting point for automatic installation. See the official
[Electron requirements](https://www.electronjs.org/docs/latest/api/auto-updater) and
[electron-builder update documentation](https://www.electron.build/v26/docs/features/auto-update/).
A DMG alone cannot support the macOS updater; the ZIP and metadata must be published as well.

Add encrypted repository Actions secrets:

- `CSC_LINK`: base64 of a Developer ID Application certificate and private key exported as `.p12`.
- `CSC_KEY_PASSWORD`: the export password.
- `APPLE_API_KEY`: raw App Store Connect API `.p8` text.
- `APPLE_API_KEY_ID`: its Key ID.
- `APPLE_API_ISSUER`: its Issuer ID.

Use a certificate issued to your Apple Developer team. Never paste private keys or tokens into
source files, issues, or logs. The workflow writes the API key only to a private temporary file.
Partial credentials fail rather than silently producing unsigned releases. Signed artifacts must
pass `codesign`, Gatekeeper assessment, and notarization-ticket validation before publication.

Plain desktop signing does not require the upstream cloud service's Associated Domains profile.
The packager uses optional passkey entitlements only when a provisioning profile is explicitly
configured. If you choose to configure your own cloud/passkey integration later, use a profile
for `com.bzcode.app`, and set `T3CODE_APPLE_TEAM_ID`, `T3CODE_MACOS_PROVISIONING_PROFILE`, and
the corresponding Clerk RP domains. Never reuse a profile bound to the official application's ID.

For a local signed build, provide certificate and Apple API environment variables and add `--signed`.
Use the same Developer ID identity for consecutive releases. Do not claim automatic installation
works merely because signing or publication passed.

## Upstream synchronization

The **BZ-Code upstream sync** workflow checks upstream `main` twice a week and on manual dispatch.
It does nothing when upstream is already integrated. Otherwise it updates `bz/upstream-sync`,
merges current fork `main`, then merges upstream with normal Git merge semantics. It never
force-pushes over custom changes. Focused tests, types, icon checks, and a build validate the result.
A successful merge creates or updates one review PR. Failed validation makes it a draft and fails
the workflow with a link to the logs. Conflicts are reported in an issue and a draft PR with the file list and upstream commit.
The branch retains BZ-Code sources and commits only `BZ_UPSTREAM_CONFLICTS.md` until the merge
is resolved; no conflict markers or unvalidated upstream workflows are committed, and no release
is triggered. Remove that report after resolving the merge.

Review branding, feed isolation, data paths, provider behavior, optional external-service links,
and restored workflows before merging. Review remains manual. Never push to the upstream repository.

### Resolve conflicts

```sh
git fetch origin
git fetch upstream main
git switch bz/upstream-sync  # or create it from origin/main when no remote sync branch exists
git merge origin/main
git merge upstream/main
# Resolve files, retaining BZ-Code branding and identity.
git add <resolved-files>
git commit
# Run focused checks and build before pushing.
git push origin bz/upstream-sync
```

Do not reset the sync branch or choose every upstream version blindly. Re-run the sync workflow
and review its updated PR. Close the blocked issue once resolved. CI owns the validation record.

## Updates and server compatibility

The packaged feed is pinned to `BryanZaneee/b3code` even if upstream CI environment variables
are present. It preserves electron-updater's version comparison, explicit Download and Restart
confirmation, retry/error UI, and protection for running tasks. Updates replace the app bundle,
including its server, and preserve `~/.bzcode` and its Electron profile.

`T3CODE_DESKTOP_UPDATE_REPOSITORY` remains a compatible upstream build variable, but this fork's
packager intentionally ignores attempts to redirect it away from the repository in `bz-branding.json`.
This protects against accidentally packaging a BZ-Code app that fetches official builds.

Remote/independently installed official servers remain independently managed. Their official CLI
release source is retained, because this fork publishes no standalone server archives. Version and
protocol negotiation remain upstream-compatible, but an exact-version remote requirement can prevent
some combinations from connecting. Upgrade an independent server through its supported official
mechanism; do not point its downloads at this fork. Prefer the bundled local server for matching builds.
The desktop-managed server update path delegates to BZ-Code's own updater. The app's bundled CLI
launcher refuses an official CLI self-update and tells you to update the desktop app.

Optional remote cloud service support remains in source and is labeled Remote Connect in BZ-Code.
This fork does not provision that service or assume access to its production credentials. Local,
LAN, direct remote and SSH functionality remain available. Source builds omit cloud credentials by
default; official mobile/hosted clients are external clients, not BZ-Code releases.

## Troubleshoot updates

- No update: check the installed version, stable channel, release visibility, and whether a newer
  signed stable release exists in this fork. Unsigned prereleases are intentionally excluded.
- Missing manifest/payload: publish DMG, ZIP, `latest-mac.yml`, and both blockmaps together.
  Inspect the workflow's artifact-verification step; do not hand-edit hashes.
- Download failure: retry in Settings once networking recovers. The existing installed app remains
  usable. Logs are below `~/.bzcode/userdata/logs`.
- Install failure: check Developer ID continuity, signature, notarization, the app's location in
  Applications, and macOS permissions. Unsigned automatic installation is not supported.
- Wrong feed: inspect `BZ-Code.app/Contents/Resources/app-update.yml`; it must identify this fork.
  Stop testing if it points at the official repository.
- Server mismatch: upgrade BZ-Code as one app; do not replace `bin.mjs` or native modules manually.
- Publication interrupted: inspect the draft release and build run. Do not publish a draft with
  incomplete update assets. Repair or retire it before retrying a new version.

## End-to-end update acceptance

This must be performed with two signed releases using the same Developer ID identity:

1. Publish/install version A from Applications. Create a disposable project and conversation,
   configure at least one provider, run a harmless turn, and record the stored data location.
2. Publish newer signed version B through the BZ-Code workflow. Verify the public release includes
   the ZIP, metadata, hashes, and blockmaps and that its bundle ID is `com.bzcode.app`.
3. In version A, check for updates. Confirm version B and this fork's release link. Download,
   confirm installation, and restart. Confirm version B, BZ-Code icon/name, bundled-server connection,
   the same project/conversation, and a second provider turn.
4. Interrupt a download using a disposable app/profile or an isolated mock feed, then retry. Confirm
   the original app remains usable and data is intact. Never corrupt an actual published payload.
5. Record evidence for both frontend and bundled-server update behavior. Only then mark automatic
   installation validated. Focused failure-state tests alone are not an installed A→B test.

## Restore a previous release

Quit BZ-Code cleanly. Back up `~/.bzcode` and `~/Library/Application Support/bzcode-v2` before
changing versions. Download a known-good signed DMG from this fork's release history, preserve the
current application as a backup, and install the previous app. Pause update checks with
`T3CODE_DISABLE_AUTO_UPDATE=1` during investigation. Do not assume older code can read a database
migrated by newer code: restoring an older release may also require restoring its matching data backup.
Never restore over official app data, and never point rollback at official desktop artifacts.

## Privacy

Product telemetry is disabled by default. Provider sign-in and agent execution still contact the
provider you select. Git hosting, optional remote services, and updater checks contact their configured
services. This document describes this fork, not the original project's privacy policy.
Required upstream MIT copyright and third-party notices are retained; they are attribution, not product branding.

## Initial validation record

- Public fork and both local remotes verified; upstream history and MIT license retained.
- Original built desktop client and isolated bundled server launched successfully.
- Original development renderer hit a resource-loading error. BZ-Code uses the existing bundled-dev
  renderer by default; isolated development launch and local-server connection now pass.
- BZ-Code icon assets generated and inspected.
- Zero valid local Developer ID identities and no repository signing secrets were available. Signed
  A→B automatic installation, real interrupted update downloads, and notarization remain blocked.
- BZ-Code 1.0.0 launched from `/Applications/BZ-Code.app`, independently of the checkout. The
  bundled server connected, Codex completed a disposable conversation, terminal output and clean
  Git status were verified, and the conversation survived a clean quit/relaunch.
- Version 1.0.0 was manually replaced using the verified 1.0.1 DMG. The saved conversation,
  settings, project, and Codex connection persisted; a second Codex turn completed successfully.
  This validates manual replacement and data persistence, not automatic installation.
- The installed CLI refused `t3 update --yes` before any official release download.
- Desktop, web, server, and scripts typechecks passed. Changed test files were exercised; stale
  branding/handshake fixtures were corrected. macOS temporary-path fixtures use canonical paths.
- Both release-script self-checks, icon export checks, and GitHub workflow syntax checks passed.
- DMG, ZIP, blockmaps, and updater metadata were generated locally and verified for fork source,
  arm64 bundle identity, versions, sizes, and SHA-512 hashes.
- Live provider validation covers Codex. Other integrations remain implemented and have focused
  regression coverage; live authentication and execution were not tested for every provider.
- No automatic-update success is claimed before the signed installed A→B test.

The initial Actions checkout exposed two inherited vendored gitlinks without root submodule URLs.
Root `.gitmodules` now supplies those URLs; CI does not initialize the vendored submodules.

## Current scope and disk cleanup

At the user's request, work now focuses on the installed BZ-Code application. Extra Actions runs
were cancelled; release publication and signed automatic installation are not claimed as verified.
Docker was not used. Temporary clones, duplicate installers, and retained packaging stages were
removed. Development dependencies and runtime caches can be restored with `vp i` before rebuilding.
The fork source, installed app, settings, projects, and conversations are retained.
