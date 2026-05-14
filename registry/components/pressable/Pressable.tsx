/**
 * Pressable
 * Themed pressable with opacity feedback, haptics, and loading state.
 * Installed by rv-expo-ui — edit freely after install.
 */
import React, { useCallback } from "react";
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme } from "./theme";

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export interface PressableProps extends Omit<RNPressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Show a spinner and disable interaction */
  loading?: boolean;
  /** Trigger haptic feedback on press */
  haptic?: boolean | HapticStyle;
  /** Disabled state */
  disabled?: boolean;
  /** Opacity when pressed (default: 0.7) */
  activeOpacity?: number;
}

export function Pressable({
  children,
  style,
  loading = false,
  haptic = false,
  disabled = false,
  activeOpacity = 0.7,
  onPress,
  ...rest
}: PressableProps) {
  const handlePress = useCallback(
    async (e: Parameters<NonNullable<RNPressableProps["onPress"]>>[0]) => {
      if (haptic) {
        const style = haptic === true ? "light" : haptic;
        try {
          switch (style) {
            case "light":
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
            case "medium":
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              break;
            case "heavy":
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              break;
            case "success":
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              break;
            case "warning":
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              break;
            case "error":
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              break;
          }
        } catch {
          // Haptics not supported on this device — fail silently
        }
      }
      onPress?.(e);
    },
    [haptic, onPress]
  );

  const isDisabled = disabled || loading;

  return (
    <RNPressable
      {...rest}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { opacity: pressed ? activeOpacity : 1 },
        isDisabled && styles.disabled,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color=theme.colors.mutedForeground />
        </View>
      ) : (
        children
      )}
    </RNPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
  },
  disabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
  },
});
