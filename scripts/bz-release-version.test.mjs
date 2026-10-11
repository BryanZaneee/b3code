import * as NodeAssert from "node:assert/strict";
import * as NodeTest from "node:test";
import { nextReleaseVersion } from "./bz-release-version.mjs";
NodeTest.test("release versions are independent, monotonic, and reject invalid input", () => {
  NodeAssert.equal(nextReleaseVersion([]), "1.0.0");
  const releases = [
    { tag_name: "v1.0.9" },
    { tag_name: "v1.0.10" },
    { tag_name: "v3.0.0", draft: true },
  ];
  NodeAssert.equal(nextReleaseVersion(releases), "1.0.11");
  NodeAssert.equal(nextReleaseVersion(releases, "2.0.0"), "2.0.0");
  NodeAssert.throws(() => nextReleaseVersion(releases, "1.0.9"));
  NodeAssert.throws(() => nextReleaseVersion(releases, "1.0.0;echo bad"));
});
