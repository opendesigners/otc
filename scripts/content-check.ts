// Fails the build if any published content file still contains TODO, links to
// a route that won't exist in production, or has invalid frontmatter. Drafts
// (publish: false) may contain TODOs.
//
// Usage: pnpm content:check

import { findDraftLinks, loadAllContent } from "./lib/content.ts";

function main(): number {
  let docs;
  try {
    docs = loadAllContent();
  } catch (error) {
    console.error(`✗ ${(error as Error).message}`);
    return 1;
  }

  const blocking = docs.filter((doc) => doc.publish && doc.hasTodo);
  const drafts = docs.filter((doc) => !doc.publish);
  const draftLinks = findDraftLinks(docs);

  for (const doc of docs) {
    const status = !doc.publish ? "draft" : doc.hasTodo ? "TODO!" : "ok";
    console.log(`  ${status.padEnd(6)} content/${doc.file} → ${doc.route}`);
  }

  if (drafts.length > 0) {
    console.log(`\n${drafts.length} draft(s) hidden from production builds.`);
  }

  if (blocking.length > 0) {
    console.error(
      `\n✗ ${blocking.length} published file(s) still contain TODO:\n` +
        blocking.map((doc) => `  - content/${doc.file}`).join("\n") +
        `\nFill them in or set "publish: false".`,
    );
  }

  if (draftLinks.length > 0) {
    console.error(`\n✗ Published content links to unpublished pages:\n${draftLinks.map((p) => `  - ${p}`).join("\n")}`);
  }

  if (blocking.length > 0 || draftLinks.length > 0) return 1;

  console.log(`✓ ${docs.length} content files valid; no TODOs or draft links in published content.`);
  return 0;
}

process.exit(main());
