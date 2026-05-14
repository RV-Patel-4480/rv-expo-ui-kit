# ZeegoDropdownMenu

An accessible, native dropdown menu powered by [Zeego](https://zeego.dev). It uses native UI components on iOS (`UIMenu`) and Android.

## Installation

```bash
npx rv-expo-ui add zeego-dropdown
```

## Usage

```tsx
import { ZeegoDropdownMenu } from "@/components/ui/ZeegoDropdownMenu";
import { Text } from "react-native";

export function OptionsMenu() {
  return (
    <ZeegoDropdownMenu
      trigger={<Text>Options</Text>}
      items={[
        { key: "edit", title: "Edit Profile", icon: "pencil", onSelect: () => {} },
        { key: "delete", title: "Delete Account", icon: "trash", destructive: true, onSelect: () => {} },
      ]}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `React.ReactElement` | **Required** | The React element the user taps to open the menu. |
| `items` | `DropdownMenuItem[]` | `[]` | A flat list of options. |
| `groups` | `DropdownMenuGroup[]`| `[]` | Grouped items separated by native dividers. |

### DropdownMenuItem

| Property | Type | Description |
|---|---|---|
| `key` | `string` | Unique identifier. |
| `title` | `string` | Primary label text. |
| `subtitle` | `string` | Optional secondary description text. |
| `icon` | `string` | SF Symbol (iOS) or Material Icon (Android) name. |
| `destructive` | `boolean` | Renders text in red to indicate a dangerous action. |
| `disabled` | `boolean` | Disables the item. |
| `onSelect` | `() => void` | Callback fired when the item is pressed. |
