# Pressable

A themed pressable component that extends React Native's native `Pressable`. It automatically handles opacity feedback, loading states (with an activity spinner), and integrates with `expo-haptics` for tactile feedback.

## Installation

```bash
npx rv-expo-ui add pressable
```

## Usage

```tsx
import { Pressable } from "@/components/ui/Pressable";
import { Text } from "react-native";

export default function App() {
  return (
    <Pressable 
      haptic="light" 
      onPress={() => console.log('Pressed!')}
    >
      <Text>Submit</Text>
    </Pressable>
  );
}
```

## Props

Extends all native `PressableProps`, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `loading` | `boolean` | `false` | Shows a spinner and disables interaction. |
| `haptic` | `boolean \| "light" \| "medium" \| "heavy" \| "success" \| "warning" \| "error"` | `false` | Triggers haptic feedback on press. |
| `disabled` | `boolean` | `false` | Disables the button and lowers opacity. |
| `activeOpacity` | `number` | `0.7` | Opacity of the component while it is actively being pressed. |
