import { useState, useEffect } from 'react';

/**
 * Hook que detecta se o viewport está em tamanho mobile (< 768px).
 * Usa window.matchMedia para detecção performática e reage a mudanças de viewport.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    // Estado inicial
    setIsMobile(mediaQuery.matches);

    // Listener para mudanças de viewport
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}
