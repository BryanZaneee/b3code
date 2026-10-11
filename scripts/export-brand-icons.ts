// @effect-diagnostics nodeBuiltinImport:off globalConsole:off - Build-time artwork export uses the existing Sharp dependency.
import * as NodeAssert from "node:assert/strict";
import * as NodeFSP from "node:fs/promises";
import * as NodeURL from "node:url";
import sharp from "sharp";
import { BRAND_ASSET_PATHS, DEVELOPMENT_PUBLIC_ICON_OVERRIDES } from "./lib/brand-assets.ts";

const root = new URL("../", import.meta.url);
const source = await NodeFSP.readFile(new URL("assets/bz-icon.svg", root));
const check = process.argv.includes("--check");
const generated = new Map<string, Buffer>();

// ICO supports PNG payloads; no additional icon converter is required.
function ico(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = header[7] = size === 256 ? 0 : size;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

for (const relative of Object.values(BRAND_ASSET_PATHS)) {
  if (relative.endsWith(".icon")) continue;
  const size = relative.includes("16x16")
    ? 16
    : relative.includes("32x32")
      ? 32
      : relative.includes("180")
        ? 180
        : relative.endsWith(".ico")
          ? 256
          : 1024;
  const png = await sharp(source).resize(size, size).png().toBuffer();
  const metadata = await sharp(png).metadata();
  NodeAssert.equal(metadata.width, size);
  NodeAssert.equal(metadata.height, size);
  generated.set(relative, relative.endsWith(".ico") ? ico(png, size) : png);
}
for (const override of DEVELOPMENT_PUBLIC_ICON_OVERRIDES) {
  generated.set(override.targetRelativePath, generated.get(override.sourceRelativePath)!);
}
for (const [relative, contents] of generated) {
  const target = new URL(relative, root);
  if (check)
    NodeAssert.ok((await NodeFSP.readFile(target)).equals(contents), `Stale icon: ${relative}`);
  else await NodeFSP.writeFile(target, contents);
}
console.log(
  `${check ? "Verified" : "Exported"} ${generated.size} BZ-Code icons from ${NodeURL.fileURLToPath(new URL("assets/bz-icon.svg", root))}.`,
);
