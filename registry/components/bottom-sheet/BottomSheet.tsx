/**
 * BottomSheet
 * Installed by rv-expo-ui — edit freely after install.
 */
import React from "react";
import { StyleSheet, View } from "react-native";

export interface BottomSheetProps {
  children?: React.ReactNode;
}

export function BottomSheet({ children }: BottomSheetProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: __RADIUS_MD__,
    backgroundColor: "__COLOR_CARD__",
    borderWidth: 1,
    borderColor: "__COLOR_BORDER__",
    padding: __SPACING_MD__,
  },
});
