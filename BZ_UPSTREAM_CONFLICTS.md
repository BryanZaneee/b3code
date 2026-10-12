Upstream sync needs manual conflict resolution.

Upstream commit: 0e7346ccd9427c06161e222319e718e6bd70887f

Conflicting files:
.github/workflows/mobile-eas-preview.yml
.github/workflows/mobile-eas-production.yml
.github/workflows/release-desktop.yml
apps/desktop/src/app/DesktopClerk.ts
apps/desktop/src/app/DesktopWebLinks.ts
apps/server/src/http.ts
apps/server/src/mcp/toolkits/orchestrator/tools.ts
apps/server/src/orchestration-v2/RestartContinuation.ts
apps/server/src/orchestration-v2/testkit/fixtures/muse_workflow/muse_transcript.ndjson
apps/server/src/provider/CodexProvider.ts
apps/web/src/components/desktop/DesktopWebLinkCoordinator.tsx
apps/web/src/versionSkew.ts
packages/shared/src/t3McpToolPresentation.ts

Fetch upstream/main and merge it into bz/upstream-sync locally. Preserve bz-branding.json, BZ icons, state isolation, and fork-only releases. See B3_MAINTENANCE.md.
