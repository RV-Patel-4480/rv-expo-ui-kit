/**
 * ZeegoContextMenu
 * Long-press context menu powered by Zeego.
 * Installed by rv-expo-ui — edit freely after install.
 */
import React from "react";
import { StyleSheet, Platform } from "react-native";
import * as ContextMenu from "zeego/context-menu";
import { theme } from "./theme";

export interface ContextMenuItem {
  key: string;
  title: string;
  subtitle?: string;
  icon?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface ContextMenuGroup {
  groupKey: string;
  items: ContextMenuItem[];
}

export interface ContextMenuProps {
  children: React.ReactElement;
  items?: ContextMenuItem[];
  groups?: ContextMenuGroup[];
  /** Optional preview component shown on iOS during long-press */
  preview?: React.ReactElement;
}

export function ZeegoContextMenu({
  children,
  items = [],
  groups = [],
  preview,
}: ContextMenuProps) {
  const allGroups: ContextMenuGroup[] =
    groups.length > 0 ? groups : items.length > 0 ? [{ groupKey: "default", items }] : [];

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      {preview && (
        <ContextMenu.Preview>{() => preview}</ContextMenu.Preview>
      )}

      <ContextMenu.Content style={styles.content}>
        {allGroups.map((group, groupIndex) => (
          <React.Fragment key={group.groupKey}>
            {groupIndex > 0 && <ContextMenu.Separator style={styles.separator} />}
            <ContextMenu.Group>
              {group.items.map((item) => (
                <ContextMenu.Item
                  key={item.key}
                  onSelect={item.onSelect}
                  disabled={item.disabled}
                  destructive={item.destructive}
                  style={styles.item}
                >
                  {item.icon && (
                    <ContextMenu.ItemIcon
                      ios={{ name: item.icon }}
                      androidIconName={item.icon}
                    />
                  )}
                  <ContextMenu.ItemTitle
                    style={[
                      styles.itemTitle,
                      item.destructive && styles.destructiveText,
                    ]}
                  >
                    {item.title}
                  </ContextMenu.ItemTitle>
                  {item.subtitle && (
                    <ContextMenu.ItemSubtitle style={styles.itemSubtitle}>
                      {item.subtitle}
                    </ContextMenu.ItemSubtitle>
                  )}
                </ContextMenu.Item>
              ))}
            </ContextMenu.Group>
          </React.Fragment>
        ))}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: theme.colors.popover,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    minWidth: 200,
    ...Platform.select({
      android: { elevation: 8 },
    }),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  item: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  itemTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.popoverForeground,
  },
  itemSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
  destructiveText: {
    color: theme.colors.destructive,
  },
});
