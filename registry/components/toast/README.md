# Toast

A highly customizable, animated toast notification system with a built-in queue to prevent overlapping toasts.

## Installation

```bash
npx rv-expo-ui add toast
```

## Setup

Wrap your root layout with the `<ToastProvider>` so toasts can be rendered at the highest z-index across your entire app.

```tsx
// app/_layout.tsx
import { ToastProvider } from "@/components/ui/Toast";
import { Slot } from "expo-router";

export default function Layout() {
  return (
    <ToastProvider>
      <Slot />
    </ToastProvider>
  );
}
```

## Usage

Use the `useToast` hook from anywhere inside the provider to trigger a notification.

```tsx
import { useToast } from "@/components/ui/Toast";
import { Button } from "react-native";

export function ProfileForm() {
  const { show } = useToast();

  return (
    <Button 
      title="Save" 
      onPress={() => show({ message: 'Profile updated!', variant: 'success' })} 
    />
  );
}
```

## Toast Options (passed to `show()`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | **Required** | The primary text content of the toast. |
| `description` | `string` | `undefined` | Secondary text shown beneath the message. |
| `variant` | `"default" \| "success" \| "error" \| "warning"` | `"default"` | Controls the color scheme and icon. |
| `duration` | `number` | `3000` | How long the toast stays visible (in ms). |
