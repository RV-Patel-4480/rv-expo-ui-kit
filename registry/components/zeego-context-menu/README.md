# ZeegoContextMenu

A long-press context menu powered by [Zeego](https://zeego.dev). Similar to `ZeegoDropdownMenu`, but triggered via a long-press instead of a tap, and supports native iOS previews.

## Installation

```bash
npx rv-expo-ui add zeego-context-menu
```

## Usage

```tsx
import { ZeegoContextMenu } from "@/components/ui/ZeegoContextMenu";
import { Image } from "react-native";

export function ImageCard() {
  return (
    <ZeegoContextMenu
      items={[
        { key: "save", title: "Save Image", icon: "square.and.arrow.down", onSelect: () => {} }
      ]}
    >
      <Image source={{ uri: "https://example.com/image.jpg", width: 200, height: 200 }} />
    </ZeegoContextMenu>
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactElement` | **Required** | The element the user long-presses to trigger the context menu. |
| `items` | `ContextMenuItem[]` | `[]` | A flat list of options. |
| `groups` | `ContextMenuGroup[]`| `[]` | Grouped items separated by native dividers. |
| `preview` | `React.ReactElement` | `undefined` | Optional preview component shown on iOS during the long-press interaction. |

### ContextMenuItem

| Property | Type | Description |
|---|---|---|
| `key` | `string` | Unique identifier. |
| `title` | `string` | Primary label text. |
| `subtitle` | `string` | Optional secondary description text. |
| `icon` | `string` | SF Symbol (iOS) or Material Icon (Android) name. |
| `destructive` | `boolean` | Renders text in red to indicate a dangerous action. |
| `disabled` | `boolean` | Disables the item. |
| `onSelect` | `() => void` | Callback fired when the item is pressed. |
