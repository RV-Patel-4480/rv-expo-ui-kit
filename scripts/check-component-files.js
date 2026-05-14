#!/usr/bin/env node
/**
 * Checks that every file listed in registry.json exists on disk.
 * Run in CI or locally: node scripts/check-component-files.js
 */
const fs = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(__dirname, "../registry/registry.json");
const COMPONENTS_DIR = path.join(__dirname, "../registry/components");

let errors = 0;

function error(msg) {
  console.error(`  ✕  ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  ✓  ${msg}`);
}

console.log("\nChecking component files...\n");

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));

for (const component of registry.components) {
  const componentDir = path.join(COMPONENTS_DIR, component.name);

  if (!fs.existsSync(componentDir)) {
    error(`Directory missing: registry/components/${component.name}/`);
    continue;
  }

  for (const file of component.files || []) {
    const filePath = path.join(componentDir, file);
    if (!fs.existsSync(filePath)) {
      error(`File missing: registry/components/${component.name}/${file}`);
    } else {
      ok(`registry/components/${component.name}/${file}`);
    }
  }
}

console.log();

if (errors > 0) {
  console.error(`  ${errors} missing file(s). Add them before pushing.\n`);
  process.exit(1);
} else {
  console.log("  All component files present.\n");
}
