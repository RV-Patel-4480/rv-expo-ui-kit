# rv-expo-ui

Production-ready Expo component registry. Install components directly into your project — like shadcn/ui, but for Expo.

## How it works

Components live in **this repo** as source files. When you run the CLI, it:
1. Fetches the component code from GitHub
2. Injects your project's theme tokens (colors, spacing, border radius)
3. Writes the file into your `components/ui/` folder
4. Installs required npm packages via `expo install`

You **own the code** after install — edit it freely.

---

## Quick start

```bash
# 1. Initialize in your Expo project
npx rv-expo-ui init

# 2. Browse available components
npx rv-expo-ui list

# 3. Add a component
npx rv-expo-ui add zeego-dropdown
```

---

## Commands

| Command | Description |
|---|---|
| `rv-expo-ui init` | Set up config file and output directory |
| `rv-expo-ui list` | List all available components |
| `rv-expo-ui add <name>` | Install a component into your project |
| `rv-expo-ui add <a> <b>` | Install multiple components at once |
| `rv-expo-ui info <name>` | Show details, deps, and usage for a component |

### Options for `add`

| Flag | Description |
|---|---|
| `--dir <path>` | Override output directory |
| `--no-install` | Skip dependency installation |
| `--overwrite` | Overwrite existing files without prompting |

---

## Theming

After `init`, a `rv-expo-ui.json` file is created at your project root:

```json
{
  "outputDir": "components/ui",
  "theme": {
    "colors": {
      "primary": "#6366F1",
      "background": "#FFFFFF",
      "foreground": "#18181B",
      "border": "#E4E4E7",
      "destructive": "#EF4444",
      "muted": "#F4F4F5",
      "mutedForeground": "#71717A",
      "popover": "#FFFFFF",
      "popoverForeground": "#18181B",
      "card": "#FFFFFF"
    },
    "borderRadius": {
      "sm": 4,
      "md": 8,
      "lg": 12
    },
    "spacing": {
      "xs": 4,
      "sm": 8,
      "md": 12,
      "lg": 16,
      "xl": 24
    },
    "fontSize": {
      "xs": 11,
      "sm": 13,
      "md": 15,
      "lg": 17
    }
  },
  "installedComponents": []
}
```

Token values are injected into component source at install time — so every component automatically matches your project's design system.

---

## Available components

| Name | Description | Dependencies |
|---|---|---|
| `zeego-dropdown` | Accessible dropdown menu | `zeego` |
| `zeego-context-menu` | Long-press context menu | `zeego` |
| `pressable` | Pressable with haptics + loading state | `expo-haptics` |
| `toast` | Animated toast with variants + queue | — |

---

## Adding your own components to the registry

1. Create a folder under `registry/components/<your-component-name>/`
2. Add your `.tsx` files — use token placeholders for theme values:
   - Colors: `"__COLOR_PRIMARY__"`, `"__COLOR_BORDER__"`, etc.
   - Spacing: `__SPACING_MD__`, `__SPACING_LG__`, etc.
   - Border radius: `__RADIUS_MD__`, `__RADIUS_LG__`, etc.
   - Font size: `__FONTSIZE_SM__`, `__FONTSIZE_MD__`, etc.
3. Add an entry to `registry/registry.json`
4. Push to GitHub — it's live immediately

### Token placeholder reference

| Placeholder | Default value |
|---|---|
| `__COLOR_PRIMARY__` | `#6366F1` |
| `__COLOR_BACKGROUND__` | `#FFFFFF` |
| `__COLOR_FOREGROUND__` | `#18181B` |
| `__COLOR_BORDER__` | `#E4E4E7` |
| `__COLOR_DESTRUCTIVE__` | `#EF4444` |
| `__COLOR_MUTED__` | `#F4F4F5` |
| `__COLOR_MUTEDFOREGROUND__` | `#71717A` |
| `__COLOR_POPOVER__` | `#FFFFFF` |
| `__COLOR_CARD__` | `#FFFFFF` |
| `__SPACING_XS__` | `4` |
| `__SPACING_SM__` | `8` |
| `__SPACING_MD__` | `12` |
| `__SPACING_LG__` | `16` |
| `__SPACING_XL__` | `24` |
| `__RADIUS_SM__` | `4` |
| `__RADIUS_MD__` | `8` |
| `__RADIUS_LG__` | `12` |
| `__FONTSIZE_XS__` | `11` |
| `__FONTSIZE_SM__` | `13` |
| `__FONTSIZE_MD__` | `15` |
| `__FONTSIZE_LG__` | `17` |

---

## Publishing the CLI

```bash
cd packages/cli
npm run build
npm publish --access public
```

Users can then run:
```bash
npx rv-expo-ui add zeego-dropdown
```

---

## Project structure

```
rv-expo-ui/
├── packages/
│   └── cli/                  ← The npx CLI tool
│       ├── src/
│       │   ├── index.ts
│       │   ├── config.ts
│       │   ├── commands/
│       │   │   ├── add.ts
│       │   │   ├── list.ts
│       │   │   ├── init.ts
│       │   │   └── info.ts
│       │   └── utils/
│       │       ├── registry.ts
│       │       ├── deps.ts
│       │       ├── theme.ts
│       │       └── project.ts
│       └── package.json
├── registry/
│   ├── registry.json         ← Component manifest
│   └── components/
│       ├── zeego-dropdown/
│       ├── zeego-context-menu/
│       ├── pressable/
│       └── toast/
└── README.md
```

---

## License

MIT
