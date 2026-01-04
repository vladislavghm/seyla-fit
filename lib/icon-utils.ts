/**
 * Утилита для преобразования данных иконки из TinaCMS типов в типы компонента Icon
 */
export function normalizeIconData(
  icon: {
    name?: string | null;
    color?: string | null;
    style?: string | null;
  } | null | undefined,
  defaultSize?: string | number
): { name: string; color?: string; size?: string | number; style?: string } | null {
  if (!icon?.name) {
    return null;
  }

  return {
    name: icon.name,
    ...(defaultSize && { size: defaultSize }),
    ...(icon.color && { color: icon.color }),
    ...(icon.style && { style: icon.style }),
  };
}

