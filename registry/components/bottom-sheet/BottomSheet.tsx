/**
 * BottomSheet
 * Installed by rv-expo-ui — edit freely after install.
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "./theme";

export interface BottomSheetProps {
  children?: React.ReactNode;
}

export function BottomSheet({ children }: BottomSheetProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
});
