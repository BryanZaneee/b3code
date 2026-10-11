# BZ-Code

A personal macOS Apple Silicon desktop app for coding agents, with a terminal-style B icon,
its own application identity, and releases from [this repository](https://github.com/BryanZaneee/b3code/releases).

Uses your existing Claude Code, Codex, OpenCode, Cursor, Grok, and Antigravity integrations.
Projects, conversations, Git, worktrees, terminals, and provider execution use the original architecture.

Download the arm64 DMG, drag **BZ-Code.app** to Applications, and launch it there.
Unsigned personal builds are marked as prereleases; automatic installation requires Developer ID
signing. An end-to-end automatic-update test has not yet passed.

See [B3_MAINTENANCE.md](B3_MAINTENANCE.md) for setup, releases, signing, upstream sync,
update troubleshooting, and the validation status. The filename retains the original project brief's convention;
the application is named BZ-Code.

## Development

Requires Node 24, Vite+, Rust, and Xcode Command Line Tools.

```sh
vp i
vp run dev:desktop --home-dir /tmp/bz-code-dev
```

The built client can be launched without the development renderer:

```sh
vp run build:desktop
T3CODE_HOME=/tmp/bz-code-dev vp run start:desktop
```

## Attribution

Derived from [T3 Code](https://github.com/pingdotgg/t3code), originally developed by its upstream
contributors. This is an independent personal fork and is not an official release.
The original [MIT license](LICENSE), copyright notices, and dependency notices are retained.
