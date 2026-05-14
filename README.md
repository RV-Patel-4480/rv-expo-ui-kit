# RV Expo UI Kit

A production-ready, beautifully designed, and accessible component registry for Expo and React Native, inspired by shadcn/ui. 

**This is not a traditional npm library.** You do not install it as a dependency. Instead, you use the CLI to copy the source code of the components directly into your project. This gives you full ownership and control to customize the components to fit your exact needs.

## Features
- **Zero Lock-in:** Components are downloaded directly into your source code.
- **Type Safe:** Built entirely with TypeScript.
- **Themable:** Centralized `theme.ts` generated automatically in your project.
- **Platform Native:** Components like Zeego adapt to use native iOS/Android menus.

## Getting Started

### 1. Initialization
Run the `init` command in your Expo project to set up the configuration and generate your default theme:
```bash
npx rv-expo-ui init
```
*This will create a `rv-expo-ui.json` file and a `theme.ts` file in your components directory.*

### 2. Install a Component
Add components one by one as you need them:
```bash
npx rv-expo-ui add pressable
```
The CLI will fetch the component from the registry, save it to your project, and automatically install any required npm dependencies (like `expo-haptics` or `zeego`).

### 3. See Available Components
You can view a list of all components available in the registry, and see which ones you've already installed:
```bash
npx rv-expo-ui list
```

## Available Components

Click on any component below to see its detailed documentation, props, and usage guide:

- [Pressable](./registry/components/pressable/README.md)
- [Toast](./registry/components/toast/README.md)
- [Zeego Dropdown Menu](./registry/components/zeego-dropdown/README.md)
- [Zeego Context Menu](./registry/components/zeego-context-menu/README.md)
- [Bottom Sheet](./registry/components/bottom-sheet/README.md)

## Creating Custom Components
If you are developing this kit and want to add a new component to the registry:
```bash
node scripts/new-component.js my-new-component
```
This scaffolds the folder structure and adds the initial configuration to `registry.json`.
