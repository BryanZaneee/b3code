import * as NodeAssert from "node:assert/strict";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import branding from "../bz-branding.json" with { type: "json" };

export function nextReleaseVersion(releases, requested = "") {
  const versions = releases
    .filter((r) => !r.draft && /^v\d+\.\d+\.\d+$/.test(r.tag_name))
    .map((r) => r.tag_name.slice(1).split(".").map(Number))
    .sort(compare);
  const latest = versions.at(-1);
  const version = requested || (latest ? `${latest[0]}.${latest[1]}.${latest[2] + 1}` : "1.0.0");
  NodeAssert.match(version, /^\d+\.\d+\.\d+$/);
  const parts = version.split(".").map(Number);
  NodeAssert.ok(parts.every(Number.isSafeInteger), "Invalid release version");
  NodeAssert.ok(
    !latest || compare(parts, latest) > 0,
    "Version must exceed every published BZ-Code release",
  );
  return version;
}
function compare(a, b) {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

if (import.meta.main) {
  NodeAssert.equal(process.env.GITHUB_REPOSITORY, branding.repository, "Release only to the fork");
  const pages = JSON.parse(
    NodeChildProcess.execFileSync(
      "gh",
      ["api", "--paginate", "--slurp", `repos/${branding.repository}/releases?per_page=100`],
      { encoding: "utf8" },
    ),
  );
  const releases = pages.flat();
  const previous = releases
    .filter((r) => !r.draft && /^v\d+\.\d+\.\d+$/.test(r.tag_name))
    .sort((a, b) =>
      compare(
        a.tag_name.slice(1).split(".").map(Number),
        b.tag_name.slice(1).split(".").map(Number),
      ),
    )
    .at(-1);
  let skip = false;
  if (previous && process.env.BZ_PUBLISH === "true") {
    const diff = NodeChildProcess.spawnSync("git", [
      "diff",
      "--quiet",
      previous.tag_name,
      "HEAD",
      "--",
      "apps/desktop",
      "apps/server",
      "apps/web",
      "packages",
      "native",
      "assets",
      "scripts",
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "bz-branding.json",
    ]);
    NodeAssert.ok(diff.status === 0 || diff.status === 1, "Could not compare the previous release");
    skip = diff.status === 0;
  }
  const version = skip
    ? previous.tag_name.slice(1)
    : nextReleaseVersion(releases, process.env.BZ_RELEASE_VERSION);
  NodeFS.appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\nskip=${skip}\n`);
}
