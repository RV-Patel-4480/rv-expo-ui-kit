/**
 * Toast + useToast
 * iOS 26-style glass notification toasts with stacking, Dynamic Island animation,
 * haptics, auto color-scheme, and global imperative API.
 * Installed by rv-expo-ui — edit freely after install.
 *
 * Setup:  Add <ToastProvider /> inside your root layout.
 * Hook:   const { show } = useToast(); show({ message: 'Done!', variant: 'success' });
 * Global: import { toast } from './Toast'; toast.show({ message: 'Done!' });
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
  PanResponder,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// ─── Default app icon (resolved at runtime from native assets) ────────────────

// On iOS resolves to AppIcon; on Android to the launcher mipmap.
// Falls back to undefined — the <Image> onError handles this gracefully.
const DEFAULT_APP_ICON: ImageSourcePropType | undefined = Platform.select<ImageSourcePropType>({
  ios: { uri: "AppIcon" },
  android: { uri: "mipmap/ic_launcher" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";
export type ToastPosition = "top" | "bottom";

export interface ToastOptions {
  /** Main title text shown in the notification */
  message: string;
  /** Optional subtitle / body text */
  description?: string;
  /** Max lines for description. Default: 2 */
  descriptionLines?: number;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. 0 = persistent. Default: 3500 */
  duration?: number;
  /** "top" (Dynamic Island) or "bottom". Default: "top" */
  position?: ToastPosition;
  /** Trigger haptic feedback on show. Default: true */
  haptic?: boolean;
  /**
   * Custom icon source. Defaults to the app's launcher icon.
   * Pass `null` to hide the icon entirely.
   */
  icon?: ImageSourcePropType | null | undefined;
  /**
   * Completely replace the default notification body with your own JSX.
   * When provided, `message`, `description` and `icon` are ignored.
   */
  content?: React.ReactNode;
  /** Action button shown at bottom-right of the toast */
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

// ─── Global imperative API ────────────────────────────────────────────────────

let toastRef: ToastContextValue | null = null;

export const toast = {
  show: (opts: ToastOptions): string => {
    if (!toastRef) {
      console.warn("[Toast] ToastProvider is not mounted.");
      return "";
    }
    return toastRef.show(opts);
  },
  dismiss: (id: string) => {
    if (toastRef) toastRef.dismiss(id);
  },
  dismissAll: () => {
    if (toastRef) toastRef.dismissAll();
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  const show = useCallback((opts: ToastOptions): string => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      variant: "default",
      duration: 3500,
      position: "top",
      haptic: true,
      descriptionLines: 2,
      ...opts,
      id,
    };
    setToasts((prev) => [...prev, item]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  useEffect(() => {
    toastRef = { show, dismiss, dismissAll };
    return () => {
      toastRef = null;
    };
  }, [show, dismiss, dismissAll]);

  const topToasts = toasts.filter((t) => t.position === "top");
  const bottomToasts = toasts.filter((t) => t.position === "bottom");

  // Only render the newest MAX_VISIBLE toasts
  const visibleTop = topToasts.slice(-MAX_VISIBLE);
  const visibleBottom = bottomToasts.slice(-MAX_VISIBLE);

  const topOffset = Math.max(insets.top, 16);
  const bottomOffset = Math.max(insets.bottom, 24);

  return (
    <ToastContext.Provider value={{ show, dismiss, dismissAll }}>
      {children}

      {/* ── Top stack (Dynamic Island) ── */}
      <View
        style={[styles.stackContainer, { top: topOffset }]}
        pointerEvents="box-none"
      >
        {visibleTop.map((t, stackIndex) => {
          // stackIndex 0 = oldest (back), last = newest (front)
          const depth = visibleTop.length - 1 - stackIndex; // 0 = front
          return (
            <ToastCard
              key={t.id}
              item={t}
              depth={depth}
              onDismiss={() => dismiss(t.id)}
              position="top"
            />
          );
        })}
      </View>

      {/* ── Bottom stack ── */}
      <View
        style={[styles.stackContainer, { bottom: bottomOffset }]}
        pointerEvents="box-none"
      >
        {visibleBottom.map((t, stackIndex) => {
          const depth = visibleBottom.length - 1 - stackIndex;
          return (
            <ToastCard
              key={t.id}
              item={t}
              depth={depth}
              onDismiss={() => dismiss(t.id)}
              position="bottom"
            />
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Toast Card ───────────────────────────────────────────────────────────────

// iOS collapsed stack constants
const STACK_PEEK = 10;        // px the back card peeks below the front card
const STACK_SCALE_STEP = 0.05; // 5% smaller per depth level
const SCREEN_WIDTH = Dimensions.get("window").width;

function ToastCard({
  item,
  depth,
  onDismiss,
  position,
}: {
  item: ToastItem;
  depth: number; // 0 = front / newest
  onDismiss: () => void;
  position: "top" | "bottom";
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animation values
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === "top" ? -50 : 50)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (item.duration && item.duration > 0) {
      timerRef.current = setTimeout(exitAndDismiss, item.duration);
    }
  }, [item.duration, onDismiss]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // ── Exit Animation ────────────────────────────────────────────────────────
  const exitAndDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === "top" ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [onDismiss, position, scale, opacity, translateY]);

  // ── PanResponder for Swipe Gestures ────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > SCREEN_WIDTH * 0.3) {
          // Dismiss on large swipe
          Animated.timing(pan.x, {
            toValue: gestureState.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDismiss());
        } else {
          // Reset position
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  // ── Mount: haptic + entry animation ───────────────────────────────────────
  useEffect(() => {
    // Haptics
    if (item.haptic) {
      switch (item.variant) {
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "error":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Expand + fade in + slide down
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
    ]).start();

    startTimer();
    return clearTimer;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stacking visual transforms ─────────────────────────────────────────────
  // Stable Animated refs initialised with the card's INITIAL depth.
  // A useEffect below animates them whenever `depth` prop changes so that
  // opacity / position update correctly as new toasts arrive or are dismissed.
  const stackTranslateYAnim = useRef(
    new Animated.Value(position === "top" ? depth * STACK_PEEK : -(depth * STACK_PEEK))
  ).current;
  const stackOpacityAnim = useRef(
    new Animated.Value(depth === 0 ? 1 : depth === 1 ? 0.75 : 0.50)
  ).current;
  const stackScaleAnim = useRef(
    new Animated.Value(1 - depth * STACK_SCALE_STEP)
  ).current;

  // Animate stacking values whenever this card's depth changes (e.g. new toast arrives)
  useEffect(() => {
    const targetY = position === "top" ? depth * STACK_PEEK : -(depth * STACK_PEEK);
    const targetOp = depth === 0 ? 1 : depth === 1 ? 0.75 : 0.50;
    const targetSc = 1 - depth * STACK_SCALE_STEP;
    Animated.parallel([
      Animated.spring(stackTranslateYAnim, { toValue: targetY, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.spring(stackOpacityAnim, { toValue: targetOp, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.spring(stackScaleAnim, { toValue: targetSc, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, [depth]); // eslint-disable-line react-hooks/exhaustive-deps

  const combinedTranslateY = useRef(
    Animated.add(translateY, stackTranslateYAnim)
  ).current;
  // Entry opacity (0→1) multiplied by stack depth opacity (no extra dim from depth on entry)
  const combinedOpacity = useRef(
    Animated.multiply(opacity, stackOpacityAnim)
  ).current;

  // ── Glass colors (variant-tinted) ─────────────────────────────────────────
  const glass = getGlassTheme(isDark, item.variant ?? "default");

  // Variant accent color for the icon badge border
  const accent = variantAccent[item.variant ?? "default"];

  return (
    <Animated.View
      // Only the front card (depth=0) should receive touch events.
      // Back cards are visual depth indicators only.
      {...(depth === 0 ? panResponder.panHandlers : {})}
      pointerEvents={depth === 0 ? "auto" : "none"}
      style={[
        styles.cardWrapper,
        position === "bottom" ? { bottom: 0 } : { top: 0 },
        {
          zIndex: MAX_VISIBLE - depth,
          opacity: combinedOpacity,
          transform: [
            { translateX: pan.x },
            { translateY: combinedTranslateY },
            { scale: stackScaleAnim },
          ],
        },
      ]}
    >
      <TouchableWithoutFeedback onPressIn={clearTimer} onPressOut={startTimer}>
        {/* ── Glass pill ── */}
        <View
          style={[
            styles.pill,
            {
              backgroundColor: glass.background,
              // Split border: top+left = neutral glass, bottom+right = variant accent
              // This creates the iOS-style diagonal accent border effect
              borderTopColor: glass.border,
              borderLeftColor: glass.border,
              borderBottomColor: accent.dot ?? glass.border,
              borderRightColor: accent.dot ?? glass.border,
              // @ts-ignore — RN 0.76+ supports this prop
              experimental_backgroundImage: glass.gradient,
            },
            Platform.select({
              ios: {
                shadowColor: accent.dot ?? "#000",
                shadowOffset: { width: 0, height: depth === 0 ? 10 : 4 },
                shadowOpacity: isDark ? 0.45 : 0.14,
                shadowRadius: depth === 0 ? 20 : 6,
              },
              android: { elevation: depth === 0 ? 10 : 4 },
            }),
          ]}
        >
          {item.content ? (
            // ── Fully custom body ──────────────────────────────────────────
            <View style={styles.customContentWrapper}>{item.content}</View>
          ) : (
            // ── Default iOS 26 notification layout ────────────────────────
            <View style={styles.row}>
              {/* App icon */}
              {item.icon !== null && (
                <View
                  style={[
                    styles.iconWrapper,
                    { borderColor: accent.iconBorder },
                  ]}
                >
                  <Image
                    source={item.icon ?? DEFAULT_APP_ICON}
                    style={styles.icon}
                    resizeMode="cover"
                    onError={() => { }}
                  />
                  {/* Variant accent dot */}
                  {accent.dot && (
                    <View
                      style={[
                        styles.accentDot,
                        {
                          backgroundColor: accent.dot,
                          borderColor: glass.background,
                        },
                      ]}
                    />
                  )}
                </View>
              )}

              {/* Text block */}
              <View style={styles.textBlock}>
                <Text
                  style={[styles.title, { color: glass.titleColor }]}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>
                {item.description ? (
                  <Text
                    style={[styles.description, { color: glass.descColor }]}
                    numberOfLines={item.descriptionLines ?? 2}
                  >
                    {item.description}
                  </Text>
                ) : null}

                {/* Action button */}
                {item.action ? (
                  <TouchableOpacity
                    onPress={() => {
                      item.action?.onPress();
                      exitAndDismiss();
                    }}
                    style={[styles.actionBtn, { borderColor: glass.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.actionLabel, { color: accent.dot ?? glass.titleColor }]}>
                      {item.action.label}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

// ─── Glass color tokens ────────────────────────────────────────────────────────

// Per-variant tint seeds: [r, g, b]
const VARIANT_RGB: Record<ToastVariant, [number, number, number]> = {
  default: [28, 28, 30],
  success: [30, 80, 40],
  error: [90, 20, 18],
  warning: [85, 55, 5],
  info: [10, 50, 100],
};

const VARIANT_RGB_LIGHT: Record<ToastVariant, [number, number, number]> = {
  default: [252, 252, 252],
  success: [220, 248, 228],
  error: [255, 225, 223],
  warning: [255, 240, 210],
  info: [218, 234, 255],
};

type GlassTheme = {
  background: string;
  gradient: string;
  border: string;
  titleColor: string;
  descColor: string;
};

function getGlassTheme(isDark: boolean, variant: ToastVariant): GlassTheme {
  if (isDark) {
    const [r, g, b] = VARIANT_RGB[variant];
    const isTinted = variant !== "default";
    return {
      background: `rgba(${r}, ${g}, ${b}, ${isTinted ? 0.88 : 0.82})`,
      gradient: isTinted
        ? `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(${r},${g},${b},0.05) 60%, rgba(0,0,0,0.20) 100%)`
        : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 60%, rgba(0,0,0,0.15) 100%)",
      border: isTinted
        ? `rgba(255, 255, 255, 0.18)`
        : "rgba(255, 255, 255, 0.13)",
      titleColor: "#FFFFFF",
      descColor: "rgba(235, 235, 245, 0.70)",
    };
  } else {
    const [r, g, b] = VARIANT_RGB_LIGHT[variant];
    const isTinted = variant !== "default";
    return {
      background: `rgba(${r}, ${g}, ${b}, ${isTinted ? 0.92 : 0.78})`,
      gradient: isTinted
        ? `linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(${r},${g},${b},0.60) 60%, rgba(${r},${g},${b},0.20) 100%)`
        : "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.55) 60%, rgba(200,200,210,0.15) 100%)",
      border: isTinted
        ? `rgba(0, 0, 0, 0.10)`
        : "rgba(60, 60, 67, 0.13)",
      titleColor: "#1C1C1E",
      descColor: "rgba(60, 60, 67, 0.65)",
    };
  }
}

// ─── Variant accent tokens ─────────────────────────────────────────────────────

const variantAccent: Record<
  ToastVariant,
  { dot: string | null; iconBorder: string }
> = {
  default: { dot: null, iconBorder: "rgba(120,120,128,0.22)" },
  success: { dot: "#34C759", iconBorder: "rgba(52,199,89,0.35)" },
  error: { dot: "#FF3B30", iconBorder: "rgba(255,59,48,0.35)" },
  warning: { dot: "#FF9F0A", iconBorder: "rgba(255,159,10,0.35)" },
  info: { dot: "#007AFF", iconBorder: "rgba(0,122,255,0.35)" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Containers ──
  stackContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  cardWrapper: {
    position: "absolute",
    left: 20,
    right: 20,
  },

  // ── Glass pill ──
  pill: {
    width: "100%",
    minHeight: 64,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // ── Default notification row ──
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  // ── App icon ──
  iconWrapper: {
    width: 38.33,
    height: 38.33,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "visible",
  },
  icon: {
    width: 38.33,
    height: 38.33,
    borderRadius: 10,
  },
  accentDot: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },

  // ── Text ──
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  description: {
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.1,
  },

  // ── Action ──
  actionBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Custom content ──
  customContentWrapper: {
    flex: 1,
  },
});
