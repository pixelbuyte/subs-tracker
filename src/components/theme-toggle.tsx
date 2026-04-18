'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

const EMPTY_SUBSCRIBE = () => () => {};

function useHydrated() {
  return useSyncExternalStore(EMPTY_SUBSCRIBE, () => true, () => false);
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useHydrated();

  const current = theme === 'system' ? resolvedTheme : theme;
  const isDark = current === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? (isDark ? <Sun className="size-4" /> : <Moon className="size-4" />) : (
        <span className="size-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{mounted ? (isDark ? 'Light' : 'Dark') : 'Theme'}</span>
    </Button>
  );
}

