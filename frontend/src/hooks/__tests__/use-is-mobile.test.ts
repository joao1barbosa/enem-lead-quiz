import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-is-mobile';

type MediaQueryListener = (event: { matches: boolean }) => void;

interface MediaQueryListMock {
  matches: boolean;
  media: string;
  onchange: null;
  addEventListener: (...args: any[]) => void;
  removeEventListener: (...args: any[]) => void;
  addListener: (...args: any[]) => void;
  removeListener: (...args: any[]) => void;
  dispatchEvent: (...args: any[]) => void;
}

/** Substitui window.matchMedia por um mock controlável pelo teste (RNF-03). */
function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<MediaQueryListener>();

  const mediaQueryList: MediaQueryListMock = {
    matches: initialMatches,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: MediaQueryListener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn(
      (_event: string, listener: MediaQueryListener) => {
        listeners.delete(listener);
      },
    ),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

  return {
    mediaQueryList,
    /** Emula a mudança de viewport disparando os listeners registrados. */
    setMatches(next: boolean) {
      mediaQueryList.matches = next;
      listeners.forEach((listener) => listener({ matches: next }));
    },
  };
}

describe('useIsMobile', () => {
  it('should return true when viewport is mobile (max-width: 767px)', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false when viewport is desktop', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should react to viewport changes', () => {
    const { setMatches } = mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => setMatches(true));
    expect(result.current).toBe(true);

    act(() => setMatches(false));
    expect(result.current).toBe(false);
  });

  it('should remove the media query listener on unmount', () => {
    const { mediaQueryList } = mockMatchMedia(true);

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });
});
