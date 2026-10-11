# BZ-Code artwork

`bz-icon.svg` is the terminal-style BZ-Code icon source. Run `vp run icons:export` to generate all PNG and ICO assets, including Dock/Finder icons and browser favicons. Run `vp run icons:check` to verify the tracked exports. The existing Sharp dependency handles exports; Icon Composer is not required.

Legacy filenames are retained for upstream build compatibility. The older Icon Composer projects contain the replacement B mark, but are no longer used by desktop packaging. `scripts/lib/brand-assets.ts` maps the generated files to packaging.
