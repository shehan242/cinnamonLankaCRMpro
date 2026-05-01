
'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeManager() {
  const { companySettings } = useAppStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      // Apply the chosen primary color to the CSS variable
      if (companySettings.primaryColor) {
        root.style.setProperty('--primary', companySettings.primaryColor);
        // Also update the ring color to match for focus states
        root.style.setProperty('--ring', companySettings.primaryColor);
      }
    }
  }, [companySettings.primaryColor]);

  return null;
}
