import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom não implementa ResizeObserver, usado pelo ResponsiveContainer do
// recharts para medir o container (largura/altura = 0 no teste). Para que os
// gráficos renderizem no ambiente de teste, o ResponsiveContainer é
// substituído por um wrapper de dimensões fixas que injeta width/height nos
// charts filhos.
vi.mock('recharts', async (importOriginal) => {
  const recharts = await importOriginal<typeof import('recharts')>();
  const React = await import('react');

  const ResponsiveContainer = ({
    children,
    width = '100%',
    height = 300,
  }: {
    children: React.ReactNode;
    width?: number | string;
    height?: number;
  }) => {
    const w = typeof width === 'number' ? width : 800;
    return React.createElement(
      'div',
      { style: { width: w, height } },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { width: w, height } as Record<string, unknown>)
          : child
      )
    );
  };

  return { ...recharts, ResponsiveContainer };
});
