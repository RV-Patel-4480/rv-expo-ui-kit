/**
 * ZeegoDropdownMenu
 * Accessible dropdown menu powered by Zeego.
 * Installed by rv-expo-ui — edit freely after install.
 */
import React from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";

export interface DropdownMenuItem {
  key: string;
  title: string;
  subtitle?: string;
  icon?: string; // SF Symbol name (iOS) or Material icon name (Android)
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface DropdownMenuGroup {
  groupKey: string;
  items: DropdownMenuItem[];
}

export interface DropdownMenuProps {
  /** The element that opens the menu when pressed */
  trigger: React.ReactElement;
  /** Flat list of items, or grouped items */
  items?: DropdownMenuItem[];
  groups?: DropdownMenuGroup[];
}

export function ZeegoDropdownMenu({ trigger, items = [], groups = [] }: DropdownMenuProps) {
  const allGroups: DropdownMenuGroup[] =
    groups.length > 0 ? groups : items.length > 0 ? [{ groupKey: "default", items }] : [];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Content style={styles.content}>
        {allGroups.map((group, groupIndex) => (
          <React.Fragment key={group.groupKey}>
            {groupIndex > 0 && <DropdownMenu.Separator style={styles.separator} />}
            <DropdownMenu.Group>
              {group.items.map((item) => (
                <DropdownMenu.Item
                  key={item.key}
                  onSelect={item.onSelect}
                  disabled={item.disabled}
                  destructive={item.destructive}
                  style={styles.item}
                >
                  {item.icon && (
                    <DropdownMenu.ItemIcon
                      ios={{ name: item.icon }}
                      androidIconName={item.icon}
                    />
                  )}
                  <DropdownMenu.ItemTitle
                    style={[styles.itemTitle, item.destructive && styles.destructiveText]}
                  >
                    {item.title}
                  </DropdownMenu.ItemTitle>
                  {item.subtitle && (
                    <DropdownMenu.ItemSubtitle style={styles.itemSubtitle}>
                      {item.subtitle}
                    </DropdownMenu.ItemSubtitle>
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
          </React.Fragment>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "__COLOR_POPOVER__",
    borderRadius: __RADIUS_MD__,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "__COLOR_BORDER__",
    minWidth: 180,
    ...Platform.select({
      android: {
        elevation: 8,
      },
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
