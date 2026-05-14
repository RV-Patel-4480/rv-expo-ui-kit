/**
 * ZeegoContextMenu
 * Long-press context menu powered by Zeego.
 * Installed by rv-expo-ui — edit freely after install.
 */
import React from "react";
import { StyleSheet, Platform } from "react-native";
import * as ContextMenu from "zeego/context-menu";

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
    backgroundColor: "__COLOR_POPOVER__",
    borderRadius: __RADIUS_MD__,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "__COLOR_BORDER__",
    minWidth: 200,
    ...Platform.select({
      android: { elevation: 8 },
    }),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "__COLOR_BORDER__",
    marginVertical: 4,
  },
  item: {
    paddingHorizontal: __SPACING_MD__,
    paddingVertical: __SPACING_SM__,
    flexDirection: "row",
    alignItems: "center",
    gap: __SPACING_SM__,
  },
  itemTitle: {
    fontSize: __FONTSIZE_MD__,
    color: "__COLOR_POPOVERFFOREGROUND__",
  },
  itemSubtitle: {
    fontSize: __FONTSIZE_XS__,
    color: "__COLOR_MUTEDFOREGROUND__",
  },
  destructiveText: {
    color: "__COLOR_DESTRUCTIVE__",
  },
});
