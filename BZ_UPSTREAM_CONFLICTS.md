Upstream sync needs manual conflict resolution.

Upstream commit: 42da166d131017335a1158d0b379dd68b8985796

Conflicting files:
.github/workflows/cursor-hygiene-webhook.yml
.github/workflows/mobile-eas-preview.yml
.github/workflows/mobile-eas-production.yml
.github/workflows/release-desktop.yml
apps/desktop/scripts/electron-launcher.mjs
apps/desktop/src/app/DesktopClerk.ts
apps/desktop/src/app/DesktopWebLinks.ts
apps/server/src/cli/connect.ts
apps/server/src/http.ts
apps/server/src/mcp/toolkits/orchestrator/tools.ts
apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.test.ts
apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts
apps/server/src/orchestration-v2/RestartContinuation.ts
apps/server/src/orchestration-v2/runtimeLayer.test.ts
apps/server/src/orchestration-v2/testkit/fixtures/muse_workflow/muse_transcript.ndjson
apps/server/src/provider/CodexProvider.ts
apps/web/src/cloud/useCloudLinkController.ts
apps/web/src/components/desktop/DesktopWebLinkCoordinator.tsx
apps/web/src/components/settings/ConnectionsSettings.tsx
apps/web/src/versionSkew.ts
packages/client-runtime/src/connection/supervisor.test.ts
packages/provider-core/src/server/orchestrationInstructions.ts
packages/provider-muse/src/server/adapter.ts
packages/provider-muse/src/server/status.ts
packages/shared/src/t3McpToolPresentation.ts

Fetch upstream/main and merge it into bz/upstream-sync locally. Preserve bz-branding.json, BZ icons, state isolation, and fork-only releases. See B3_MAINTENANCE.md.
