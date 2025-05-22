import { useEffect } from 'react';
import { useAuth } from './useAuth';

export const useTheme = () => {
  const { user } = useAuth();

  useEffect(() => {
    const theme = user?.settings.theme || 'light';
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#141414' : '#f0f2f5';
  }, [user?.settings.theme]);

  return {
    isDark: user?.settings.theme === 'dark',
    isSystem: user?.settings.theme === 'system',
  };
}; 