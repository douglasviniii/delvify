
'use client';

import { useEffect } from 'react';

export function ThemeInjector({ primaryColorHsl }: { primaryColorHsl: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColorHsl);
  }, [primaryColorHsl]);

  return null;
}
