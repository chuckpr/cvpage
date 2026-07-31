// The list of variants Eleventy paginates over (see src/index.njk).
//
// Base variants come from variants.json and always deploy. Tailored variants
// come from the git-ignored tailored.json — they inherit a base variant and
// override it selectively, and build locally only. tailored.json is absent in
// CI and fresh clones, so this file yields exactly the base variants there and
// no /tailored/* page can ever leak to the deployed site.

const fs = require("fs");
const path = require("path");
const base = require("./variants.json");

// Base variants render bullet text under their own key.
const baseVariants = base.map((v) => ({ ...v, textVariant: v.key }));

// Load tailored.json defensively: read + parse rather than require(), so a
// missing file is not a hard MODULE_NOT_FOUND and `eleventy --serve` re-reads
// edits (Eleventy watches _data).
let tailored = [];
const tailoredPath = path.join(__dirname, "tailored.json");
try {
  if (fs.existsSync(tailoredPath)) {
    tailored = JSON.parse(fs.readFileSync(tailoredPath, "utf8"));
  }
} catch (e) {
  console.warn(`[renderVariants] ignoring unreadable tailored.json: ${e.message}`);
  tailored = [];
}

const byKey = Object.fromEntries(baseVariants.map((v) => [v.key, v]));

const resolved = tailored.map((t) => {
  const b = byKey[t.base];
  if (!b) throw new Error(`tailored variant "${t.key}" has unknown base "${t.base}"`);
  return {
    ...b,
    ...t,
    profile: { ...b.profile, ...(t.profile || {}) },
    skillClusters: t.skillClusters || b.skillClusters,
    select: t.select || b.select,
    publications: t.publications ?? b.publications,
    permalink: `/tailored/${t.key}/`,
    // Reuse the base variant's phrasing unless the tailored variant supplies its
    // own textVariant — a bullet with no matching phrasing falls back to its
    // base/text wording (see the noteText filter), so partial overrides are fine.
    textVariant: t.textVariant || b.textVariant,
  };
});

module.exports = [...baseVariants, ...resolved];
