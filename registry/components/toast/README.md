# Toast

An iOS 26-style glass notification toast system with dynamic stacking, swipe-to-dismiss, auto color-scheme, haptics, and a global imperative API that allows calling toasts from anywhere (even outside React).

## Installation

```bash
npx rv-expo-ui add toast
```

> **Note:** This component relies on `experimental_backgroundImage` available in React Native 0.76+ to achieve the glassmorphism gradient effect.

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

You can trigger a toast either via the `useToast` hook or the global `toast` object.

### Global API (Recommended)
You can call `toast.show()` from anywhere, including Redux thunks, Axios interceptors, or outside of React components entirely.

```tsx
import { toast } from "@/components/ui/Toast";
import { Button } from "react-native";

export function ProfileForm() {
  return (
    <Button 
      title="Save" 
      onPress={() => toast.show({ 
        message: 'Profile updated!', 
        variant: 'success' 
      })} 
    />
  );
}

// Inside a non-React file (e.g. api.ts)
export function handleError(error) {
  toast.show({
    message: "Network Error",
    description: error.message,
    variant: "error",
    position: "bottom"
  });
}
```

### Hook API
If you prefer, you can use the `useToast` hook.

```tsx
import { useToast } from "@/components/ui/Toast";

export function ProfileForm() {
  const { show, dismiss, dismissAll } = useToast();
  // ...
}
```

## Toast Options

Options you can pass to `toast.show(opts)` or `show(opts)`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | **Required** | The primary text content of the toast. |
| `description` | `string` | `undefined` | Secondary text shown beneath the message. |
| `descriptionLines`| `number` | `2` | Maximum number of lines for the description text. |
| `variant` | `"default" \| "success" \| "error" \| "warning" \| "info"` | `"default"` | Controls the color scheme, icon accent, and haptic feedback. |
| `duration` | `number` | `3500` | Auto-dismiss delay in milliseconds. `0` means persistent. |
| `position` | `"top" \| "bottom"` | `"top"` | Placement of the toast stack. |
| `haptic` | `boolean` | `true` | Whether to trigger haptic feedback on show. |
| `icon` | `ImageSourcePropType \| null` | App Icon | Custom icon source. Defaults to the app's native launcher icon. Pass `null` to hide. |
| `content` | `React.ReactNode` | `undefined` | Completely replace the default notification body with custom JSX. |
| `action` | `{ label: string, onPress: () => void }` | `undefined` | Optional action button shown beneath the text block. |

## Features

- **iOS 26 Notification UI**: Frosted glass styles that automatically respond to light/dark mode.
- **Dynamic Stacking**: Toasts gracefully slide and stack behind each other (max 3 visible) with scale and opacity animations.
- **Swipe Gestures**: Swipe horizontally to dismiss toasts.
- **Auto-pause**: Pressing and holding a toast pauses its auto-dismiss timer.
- **Variants & Haptics**: Built-in semantic variants with color-matched borders, shadow tints, and distinct haptic feedbacks.
- **Native App Icon**: Automatically fetches the host app's native icon (iOS `AppIcon` or Android `ic_launcher`) if no custom icon is provided.
