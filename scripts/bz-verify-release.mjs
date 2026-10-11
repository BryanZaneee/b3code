import * as NodeAssert from "node:assert/strict";
import * as NodeCrypto from "node:crypto";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import * as NodeModule from "node:module";
import branding from "../bz-branding.json" with { type: "json" };
const { parse } = NodeModule.createRequire(new URL("../apps/server/package.json", import.meta.url))(
  "yaml",
);

export function verifyManifest(manifest, directory, version) {
  NodeAssert.equal(manifest.version, version);
  NodeAssert.ok(Array.isArray(manifest.files));
  for (const ext of ["dmg", "zip"]) {
    const name = `BZ-Code-${version}-arm64.${ext}`;
    const entry = manifest.files.find((f) => f.url === name);
    NodeAssert.ok(entry, `Missing ${name}`);
    const bytes = NodeFS.readFileSync(NodePath.join(directory, name));
    NodeAssert.equal(entry.size, bytes.length);
    NodeAssert.equal(entry.sha512, NodeCrypto.createHash("sha512").update(bytes).digest("base64"));
    NodeAssert.ok(NodeFS.readFileSync(NodePath.join(directory, `${name}.blockmap`)).length > 0);
  }
  NodeAssert.ok(
    manifest.files.every((f) => /^BZ-Code-[\d.]+-arm64\.(zip|dmg)$/.test(f.url)),
    "Unexpected update artifact",
  );
}

if (import.meta.main) {
  const [directory, version] = process.argv.slice(2);
  NodeAssert.match(version, /^\d+\.\d+\.\d+$/);
  const manifest = parse(NodeFS.readFileSync(NodePath.join(directory, "latest-mac.yml"), "utf8"));
  verifyManifest(manifest, directory, version);
  const zip = NodePath.join(directory, `BZ-Code-${version}-arm64.zip`);
  const feed = parse(
    NodeChildProcess.execFileSync(
      "unzip",
      ["-p", zip, "BZ-Code.app/Contents/Resources/app-update.yml"],
      {
        encoding: "utf8",
      },
    ),
  );
  NodeAssert.equal(feed.provider, "github");
  NodeAssert.equal(`${feed.owner}/${feed.repo}`, branding.repository);
  const plist = NodeChildProcess.execFileSync("unzip", [
    "-p",
    zip,
    "BZ-Code.app/Contents/Info.plist",
  ]);
  const info = JSON.parse(
    NodeChildProcess.execFileSync("plutil", ["-convert", "json", "-o", "-", "--", "-"], {
      input: plist,
      encoding: "utf8",
    }),
  );
  NodeAssert.equal(info.CFBundleIdentifier, branding.appId);
  NodeAssert.equal(info.CFBundleDisplayName || info.CFBundleName, branding.name);
  NodeAssert.equal(info.CFBundleShortVersionString, version);
  NodeAssert.ok(
    info.CFBundleURLTypes.flatMap((t) => t.CFBundleURLSchemes).every(
      (s) => !s.startsWith("t3code"),
    ),
  );
  if (process.env.BZ_VERIFY_SIGNED === "true") {
    const extracted = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "bz-release-signature-"));
    NodeChildProcess.execFileSync("ditto", ["-x", "-k", zip, extracted]);
    const app = NodePath.join(extracted, "BZ-Code.app");
    NodeAssert.ok(NodeFS.existsSync(app));
    NodeChildProcess.execFileSync("codesign", ["--verify", "--deep", "--strict", app]);
    NodeChildProcess.execFileSync("spctl", ["--assess", "--type", "execute", "--verbose", app]);
    NodeChildProcess.execFileSync("xcrun", ["stapler", "validate", app]);
  }
  console.log(
    `Verified BZ-Code ${version}: bundle identity, fork feed, arm64 assets, SHA-512 hashes, sizes, and blockmaps.`,
  );
}
