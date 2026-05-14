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
    container: { backgroundColor: "__COLOR_CARD__", borderColor: "__COLOR_BORDER__" },
    icon: null,
    iconText: {},
    messageText: { color: "__COLOR_FOREGROUND__" },
    descText: { color: "__COLOR_MUTEDFOREGROUND__" },
    actionText: { color: "__COLOR_PRIMARY__" },
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
    iconText: { color: "__COLOR_DESTRUCTIVE__" },
    messageText: { color: "__COLOR_DESTRUCTIVE__" },
    descText: { color: "#991B1B" },
    actionText: { color: "__COLOR_DESTRUCTIVE__" },
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
    left: __SPACING_LG__,
    right: __SPACING_LG__,
    zIndex: 9999,
    gap: __SPACING_SM__,
    pointerEvents: "box-none",
  },
  topContainer: {
    top: Platform.OS === "ios" ? 60 : 40,
  },
  bottomContainer: {
    bottom: Platform.OS === "ios" ? 40 : 24,
  },
  toast: {
    borderRadius: __RADIUS_LG__,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: __SPACING_MD__,
    paddingVertical: __SPACING_SM__,
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
    gap: __SPACING_SM__,
  },
  toastIcon: {
    fontSize: __FONTSIZE_MD__,
    lineHeight: 20,
  },
  toastText: {
    flex: 1,
    gap: 2,
  },
  toastMessage: {
    fontSize: __FONTSIZE_SM__,
    fontWeight: "500",
    lineHeight: 18,
  },
  toastDescription: {
    fontSize: __FONTSIZE_XS__,
    lineHeight: 16,
  },
  toastAction: {
    paddingHorizontal: __SPACING_SM__,
    paddingVertical: 2,
  },
  toastActionText: {
    fontSize: __FONTSIZE_SM__,
    fontWeight: "500",
  },
  dismissButton: {
    padding: 2,
  },
  dismissText: {
    fontSize: __FONTSIZE_XS__,
  },
});
