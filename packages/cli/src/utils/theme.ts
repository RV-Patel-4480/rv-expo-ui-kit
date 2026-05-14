export function injectThemeTokens(content: string, theme: any) {
  let result = content;

  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      const placeholder = `__COLOR_${key.toUpperCase()}__`;
      result = result.replace(new RegExp(placeholder, "g"), value as string);
    }
  }

  if (theme.spacing) {
    for (const [key, value] of Object.entries(theme.spacing)) {
      const placeholder = `__SPACING_${key.toUpperCase()}__`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    }
  }

  if (theme.borderRadius) {
    for (const [key, value] of Object.entries(theme.borderRadius)) {
      const placeholder = `__RADIUS_${key.toUpperCase()}__`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    }
  }

  if (theme.fontSize) {
    for (const [key, value] of Object.entries(theme.fontSize)) {
      const placeholder = `__FONTSIZE_${key.toUpperCase()}__`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    }
  }

  return result;
}
