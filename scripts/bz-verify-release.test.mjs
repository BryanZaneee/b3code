import * as NodeAssert from "node:assert/strict";
import * as NodeTest from "node:test";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeOS from "node:os";
import * as NodeCrypto from "node:crypto";
import { verifyManifest } from "./bz-verify-release.mjs";
NodeTest.test("update assets require the right names, versions, hashes, and blockmaps", () => {
  const directory = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "bz-manifest-test-"));
  const version = "1.0.0";
  const bytes = Buffer.from("synthetic payload");
  const manifest = {
    version,
    files: ["dmg", "zip"].map((ext) => {
      const url = `BZ-Code-${version}-arm64.${ext}`;
      NodeFS.writeFileSync(NodePath.join(directory, url), bytes);
      NodeFS.writeFileSync(NodePath.join(directory, `${url}.blockmap`), "map");
      return {
        url,
        size: bytes.length,
        sha512: NodeCrypto.createHash("sha512").update(bytes).digest("base64"),
      };
    }),
  };
  verifyManifest(manifest, directory, version);
  NodeAssert.throws(() => verifyManifest(manifest, directory, "1.0.1"));
  const corrupted = structuredClone(manifest);
  corrupted.files[0].sha512 = "bad";
  NodeAssert.throws(() => verifyManifest(corrupted, directory, version));
  const upstream = structuredClone(manifest);
  upstream.files[0].url = "T3-Code-1.0.0-arm64.dmg";
  NodeAssert.throws(() => verifyManifest(upstream, directory, version));
});
