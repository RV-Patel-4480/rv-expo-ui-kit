#!/usr/bin/env node
/**
 * Scaffold a new component in the registry.
 * Usage: node scripts/new-component.js <component-name>
 *
 * Example: node scripts/new-component.js bottom-sheet
 */
const fs = require("fs");
const path = require("path");

const name = process.argv[2];

if (!name) {
  console.error("Usage: node scripts/new-component.js <component-name>");
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Component name must be lowercase kebab-case (e.g. bottom-sheet)");
  process.exit(1);
}

// PascalCase from kebab-case
const pascal = name
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");

const componentDir = path.join(__dirname, "../registry/components", name);

if (fs.existsSync(componentDir)) {
  console.error(`Component "${name}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(componentDir, { recursive: true });

// Component template
const componentSource = `/**
 * ${pascal}
 * Installed by rv-expo-ui — edit freely after install.
 */
import React from "react";
import { StyleSheet, View } from "react-native";

export interface ${pascal}Props {
  children?: React.ReactNode;
}

export function ${pascal}({ children }: ${pascal}Props) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: __RADIUS_MD__,
    backgroundColor: "__COLOR_CARD__",
    borderWidth: 1,
    borderColor: "__COLOR_BORDER__",
    padding: __SPACING_MD__,
  },
});
`;

fs.writeFileSync(path.join(componentDir, `${pascal}.tsx`), componentSource);

// meta placeholder in registry.json
const registryPath = path.join(__dirname, "../registry/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const alreadyExists = registry.components.some((c) => c.name === name);
if (!alreadyExists) {
  registry.components.push({
    name,
    description: `TODO: describe ${pascal}`,
    version: "1.0.0",
    files: [`${pascal}.tsx`],
    dependencies: [],
    peerDependencies: ["react-native", "expo"],
    tags: ["misc"],
    preview: `import { ${pascal} } from '@/components/ui/${pascal}';\n\n<${pascal} />`,
  });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

console.log(`
  ✓  Created registry/components/${name}/${pascal}.tsx
  ✓  Added entry to registry.json

  Next steps:
    1. Build your component in registry/components/${name}/${pascal}.tsx
    2. Use __COLOR_PRIMARY__, __SPACING_MD__, __RADIUS_MD__ etc. for theme tokens
    3. Update the "description", "dependencies", and "preview" in registry.json
    4. Run: node scripts/validate-registry.js
`);
