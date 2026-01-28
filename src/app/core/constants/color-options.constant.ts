export interface ColorOption {
  value: string;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface ColorData {
  bgClass: string;
  borderClass: string;
  textClass: string;
  buttonClass?: string;
  textColorValue?: string;
  bgColorValue?: string;
}

// Predefined colors suitable for glassmorphism/liquid glass effects
// These colors work well with semi-transparent backgrounds and provide good text contrast
export const COLOR_OPTIONS: ColorOption[] = [
  {
    value: '#1d93c8',
    label: 'Ocean Blue',
    bgClass: 'bg-primary-500/20',
    borderClass: 'border-primary',
    textClass: 'text-primary!',
  },
  {
    value: '#3b82f6',
    label: 'Blue',
    bgClass: 'bg-blue-500/20',
    borderClass: 'border-blue-700',
    textClass: 'text-blue-700!',
  },
  {
    value: '#8b5cf6',
    label: 'Purple',
    bgClass: 'bg-purple-500/20',
    borderClass: 'border-purple-700',
    textClass: 'text-purple-700!',
  },
  {
    value: '#ec4899',
    label: 'Pink',
    bgClass: 'bg-pink-500/20',
    borderClass: 'border-pink-700',
    textClass: 'text-pink-700!',
  },
  {
    value: '#f59e0b',
    label: 'Amber',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-700',
    textClass: 'text-amber-700!',
  },
  {
    value: '#10b981',
    label: 'Green',
    bgClass: 'bg-green-500/20',
    borderClass: 'border-green-700',
    textClass: 'text-green-700!',
  },
  {
    value: '#06b6d4',
    label: 'Cyan',
    bgClass: 'bg-cyan-500/20',
    borderClass: 'border-cyan-700',
    textClass: 'text-cyan-700!',
  },
  {
    value: '#f97316',
    label: 'Orange',
    bgClass: 'bg-orange-500/20',
    borderClass: 'border-orange-700',
    textClass: 'text-orange-700!',
  },
  {
    value: '#6366f1',
    label: 'Indigo',
    bgClass: 'bg-indigo-500/20',
    borderClass: 'border-indigo-700',
    textClass: 'text-indigo-700!',
  },
  {
    value: '#14b8a6',
    label: 'Teal',
    bgClass: 'bg-teal-500/20',
    borderClass: 'border-teal-700',
    textClass: 'text-teal-700!',
  },
  {
    value: '#ef4444',
    label: 'Red',
    bgClass: 'bg-red-500/20',
    borderClass: 'border-red-700',
    textClass: 'text-red-700!',
  },
  {
    value: '#eab308',
    label: 'Yellow',
    bgClass: 'bg-yellow-500/20',
    borderClass: 'border-yellow-700',
    textClass: 'text-yellow-700!',
  },
  {
    value: '#84cc16',
    label: 'Lime',
    bgClass: 'bg-lime-500/20',
    borderClass: 'border-lime-700',
    textClass: 'text-lime-700!',
  },
  {
    value: '#0ea5e9',
    label: 'Sky Blue',
    bgClass: 'bg-sky-500/20',
    borderClass: 'border-sky-700',
    textClass: 'text-sky-700!',
  },
  {
    value: '#a855f7',
    label: 'Violet',
    bgClass: 'bg-violet-500/20',
    borderClass: 'border-violet-700',
    textClass: 'text-violet-700!',
  },
  {
    value: '#f43f5e',
    label: 'Rose',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-700',
    textClass: 'text-rose-700!',
  },
  {
    value: '#d97706',
    label: 'Brown',
    bgClass: 'bg-amber-600/20',
    borderClass: 'border-amber-800',
    textClass: 'text-amber-800!',
  },
  {
    value: '#6b7280',
    label: 'Gray',
    bgClass: 'bg-gray-500/20',
    borderClass: 'border-gray-700',
    textClass: 'text-gray-700!',
  },
  {
    value: '#1f2937',
    label: 'Dark',
    bgClass: 'bg-gray-800/20',
    borderClass: 'border-gray-900',
    textClass: 'text-gray-900!',
  },
  {
    value: '#ffffff',
    label: 'White',
    bgClass: 'bg-gray-100/20',
    borderClass: 'border-gray-300',
    textClass: 'text-gray-800!',
  },
  {
    value: '#ffd1dc',
    label: 'Pastel Pink',
    bgClass: 'bg-pink-200/20',
    borderClass: 'border-pink-300',
    textClass: 'text-pink-700!',
  },
  {
    value: '#b4d4ff',
    label: 'Pastel Blue',
    bgClass: 'bg-blue-200/20',
    borderClass: 'border-blue-300',
    textClass: 'text-blue-700!',
  },
  {
    value: '#c8e6c9',
    label: 'Pastel Green',
    bgClass: 'bg-green-200/20',
    borderClass: 'border-green-300',
    textClass: 'text-green-700!',
  },
  {
    value: '#fff9c4',
    label: 'Pastel Yellow',
    bgClass: 'bg-yellow-200/20',
    borderClass: 'border-yellow-300',
    textClass: 'text-yellow-700!',
  },
  {
    value: '#e1bee7',
    label: 'Pastel Purple',
    bgClass: 'bg-purple-200/20',
    borderClass: 'border-purple-300',
    textClass: 'text-purple-700!',
  },
  {
    value: '#ffe0b2',
    label: 'Pastel Orange',
    bgClass: 'bg-orange-200/20',
    borderClass: 'border-orange-300',
    textClass: 'text-orange-700!',
  },
  {
    value: '#b2ebf2',
    label: 'Pastel Cyan',
    bgClass: 'bg-cyan-200/20',
    borderClass: 'border-cyan-300',
    textClass: 'text-cyan-700!',
  },
  {
    value: '#ffccbc',
    label: 'Pastel Peach',
    bgClass: 'bg-orange-200/20',
    borderClass: 'border-orange-300',
    textClass: 'text-orange-700!',
  },
  {
    value: '#c5cae9',
    label: 'Pastel Lavender',
    bgClass: 'bg-indigo-200/20',
    borderClass: 'border-indigo-300',
    textClass: 'text-indigo-700!',
  },
  {
    value: '#ffb3ba',
    label: 'Pastel Coral',
    bgClass: 'bg-rose-200/20',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-700!',
  },
  {
    value: '#bae1ff',
    label: 'Pastel Sky',
    bgClass: 'bg-sky-200/20',
    borderClass: 'border-sky-300',
    textClass: 'text-sky-700!',
  },
  {
    value: '#dcedc8',
    label: 'Pastel Mint',
    bgClass: 'bg-lime-200/20',
    borderClass: 'border-lime-300',
    textClass: 'text-lime-700!',
  },
];

/**
 * Get color classes for a given color value
 * @param color - The hex color value (e.g., '#1d93c8')
 * @param includeButtonClass - Whether to include buttonClass in the result (for checklist items)
 * @returns Color classes object with bgClass, borderClass, textClass, and optionally buttonClass
 */
export function getColorData(color?: string, includeButtonClass: boolean = false): ColorData {
  const defaultColor: ColorData = {
    bgClass: 'bg-primary-500/20',
    borderClass: 'border-primary',
    textClass: 'text-primary!',
    textColorValue: 'var(--color-primary)',
    bgColorValue: 'var(--color-primary-500)',
    ...(includeButtonClass && {
      buttonClass: 'bg-primary-500/30 hover:bg-primary-500/40',
    }),
  };

  if (!color) return defaultColor;

  const colorOption = COLOR_OPTIONS.find((option) => option.value === color);
  if (!colorOption) return defaultColor;

  // For checklist items, use -500 border and -800 text, otherwise use original classes
  let borderClass = colorOption.borderClass;
  let textClass = colorOption.textClass;
  let textColorValue = colorOption.textClass.replace(/^text-/, 'var(--color-').replace(/!$/, '');
  let bgColorValue = colorOption.bgClass.replace(/^bg-/, 'var(--color-').replace(/!$/, '');

  if (includeButtonClass) {
    // Replace -700 with -500 for borders, -700 with -800 for text
    borderClass = colorOption.borderClass
      .replace(/-700$/, '-500')
      .replace(/^border-primary$/, 'border-primary-500');
    textClass = colorOption.textClass
      .replace(/-700$/, '-800')
      .replace(/^text-primary$/, 'text-primary-800!');
  }

  const result: ColorData = {
    bgClass: colorOption.bgClass,
    borderClass: borderClass,
    textClass: textClass,
    bgColorValue,
    textColorValue,
  };

  if (includeButtonClass) {
    // Generate button class from the color option
    // Extract color name from bgClass (e.g., 'bg-primary-500/20' -> 'primary', 'bg-blue-200/20' -> 'blue')
    const bgClassMatch = colorOption.bgClass.match(/bg-(\w+)-/);
    const colorName = bgClassMatch?.[1] || 'primary';

    // Special handling for primary color
    if (colorName === 'primary') {
      result.buttonClass = 'bg-primary-500/30 hover:bg-primary-500/40';
    } else {
      result.buttonClass = `bg-${colorName}-500/30 hover:bg-${colorName}-500/40`;
    }
  }

  return result;
}

export function getDefaultColor() {
  return getColorData();
}
