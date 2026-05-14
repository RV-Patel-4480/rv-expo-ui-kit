/**
 * Toast + useToast
 * Animated toast notifications with variants and queue support.
 * Installed by rv-expo-ui — edit freely after install.
 *
 * Setup: Add <ToastProvider /> inside your root layout.
 * Usage: const { show } = useToast(); show({ message: 'Done!', variant: 'success' });
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";
export type ToastPosition = "top" | "bottom";

export interface ToastOptions {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms, 0 = persistent
  position?: ToastPosition;
  action?: { label: string; onPress: () => void };
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  show: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((opts: ToastOptions): string => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { variant: "default", duration: 3500, position: "bottom", ...opts, id };
    setToasts((prev) => [...prev, item]);
    if (item.duration && item.duration > 0) {
      setTimeout(() => dismiss(id), item.duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  // Group by position
  const topToasts = toasts.filter((t) => t.position === "top");
  const bottomToasts = toasts.filter((t) => t.position === "bottom");

  return (
    <ToastContext.Provider value={{ show, dismiss, dismissAll }}>
      {children}
      <View style={[styles.container, styles.topContainer]} pointerEvents="box-none">
        {topToasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
      <View style={[styles.container, styles.bottomContainer]} pointerEvents="box-none">
        {bottomToasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Single Toast ──────────────────────────────────────────────────────────────

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(item.position === "top" ? -20 : 20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const variantStyle = variantStyles[item.variant || "default"];

  return (
    <Animated.View
      style={[styles.toast, variantStyle.container, { transform: [{ translateY }], opacity }]}
    >
      <View style={styles.toastContent}>
        {variantStyle.icon && (
          <Text style={[styles.toastIcon, variantStyle.iconText]}>{variantStyle.icon}</Text>
        )}
        <View style={styles.toastText}>
          <Text style={[styles.toastMessage, variantStyle.messageText]} numberOfLines={2}>
            {item.message}
          </Text>
          {item.description && (
            <Text style={[styles.toastDescription, variantStyle.descText]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        {item.action && (
          <TouchableOpacity onPress={() => { item.action?.onPress(); onDismiss(); }} style={styles.toastAction}>
            <Text style={[styles.toastActionText, variantStyle.actionText]}>{item.action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton} hitSlop={8}>
          <Text style={[styles.dismissText, variantStyle.descText]}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles = {
  default: {
    container: { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
    icon: null,
    iconText: {},
    messageText: { color: theme.colors.foreground },
    descText: { color: theme.colors.mutedForeground },
    actionText: { color: theme.colors.primary },
  },
  success: {
    container: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
    icon: "✓",
    iconText: { color: "#16A34A" },
    messageText: { color: "#15803D" },
    descText: { color: "#166534" },
    actionText: { color: "#16A34A" },
  },
  error: {
    container: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
    icon: "✕",
    iconText: { color: theme.colors.destructive },
    messageText: { color: theme.colors.destructive },
    descText: { color: "#991B1B" },
    actionText: { color: theme.colors.destructive },
  },
  warning: {
    container: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
    icon: "⚠",
    iconText: { color: "#D97706" },
    messageText: { color: "#92400E" },
    descText: { color: "#78350F" },
    actionText: { color: "#D97706" },
  },
  info: {
    container: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
    icon: "ℹ",
    iconText: { color: "#2563EB" },
    messageText: { color: "#1D4ED8" },
    descText: { color: "#1E40AF" },
    actionText: { color: "#2563EB" },
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 9999,
    gap: theme.spacing.sm,
    pointerEvents: "box-none",
  },
  topContainer: {
    top: Platform.OS === "ios" ? 60 : 40,
  },
  bottomContainer: {
    bottom: Platform.OS === "ios" ? 40 : 24,
  },
  toast: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  toastIcon: {
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  toastText: {
    flex: 1,
    gap: 2,
  },
  toastMessage: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    lineHeight: 18,
  },
  toastDescription: {
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
  },
  toastAction: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  toastActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
  },
  dismissButton: {
    padding: 2,
  },
  dismissText: {
    fontSize: theme.fontSize.xs,
  },
});
