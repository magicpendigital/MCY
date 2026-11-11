import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

// iOS Safari zooms the page when a text field with a computed font size under 16px gets focus (INC-005). This static check keeps every
// text input, textarea and select in the app's stylesheets and inline styles at 16px or more. The Playwright spec ios-input-zoom.spec.ts
// measures the rendered learner screens; neither replaces a check on a real iPhone.
const root = path.resolve(import.meta.dirname, "..", "src");
const files = (dir, ext) => readdirSync(dir).flatMap(name => {
  const full = path.join(dir, name);
  return statSync(full).isDirectory() ? files(full, ext) : full.endsWith(ext) ? [full] : [];
});
const NOT_TEXT = /checkbox|radio|range|switch|type="file"|type=file|\[type=button\]|\[type="button"\]/;
const TEXT_CONTROL = /(^|[\s>+~,(])(input|textarea|select)\b/;

function smallSize(declarations) {
  const size = declarations.match(/(?:^|;|\s)font-size\s*:\s*(\d+(?:\.\d+)?)px/i) ?? declarations.match(/(?:^|;|\s)font\s*:\s*(?:[a-z-]+\s+)*(\d+(?:\.\d+)?)px/i);
  return size && Number(size[1]) < 16 ? Number(size[1]) : null;
}

test("no stylesheet rule gives a text input, textarea or select a font size under 16px", () => {
  const offenders = [];
  for (const file of files(root, ".css")) {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = match[1].trim().split(/\r?\n/).pop();
      const parts = match[1].split(",").map(s => s.trim()).filter(s => TEXT_CONTROL.test(s) && !NOT_TEXT.test(s));
      if (!parts.length || match[1].trim().startsWith("@")) continue;
      const size = smallSize(match[2]);
      if (size !== null) offenders.push(`${path.relative(root, file)}: ${parts.join(", ").slice(0, 80)} -> ${size}px (${selector.slice(0, 30)})`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("no inline style gives a text input, textarea or select a font size under 16px", () => {
  const offenders = [];
  for (const file of files(root, ".tsx")) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/<(input|textarea|select)\b[^>]*?style=\{\{([^}]*)\}\}/g)) {
      const size = match[2].match(/fontSize\s*:\s*(\d+(?:\.\d+)?)\b/);
      if (size && Number(size[1]) < 16) offenders.push(`${path.relative(root, file)}: <${match[1]}> fontSize ${size[1]}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("the checker itself flags small and accepts 16px sizes", () => {
  assert.equal(smallSize("padding: 1px; font-size: 13px;"), 13);
  assert.equal(smallSize("font: 15px var(--font-sans); padding: 0"), 15);
  assert.equal(smallSize("font-size: 16px"), null);
  assert.equal(smallSize("font: inherit"), null);
  assert.equal(smallSize("font-size: 1em"), null);
});
