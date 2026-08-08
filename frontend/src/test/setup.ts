import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom não implementa scrollIntoView; o Radix Select o chama ao abrir o menu
// para posicionar o item ativo.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = vi.fn();
}

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
    height?: number | string;
  }) => {
    // Em runtime real o ResponsiveContainer mede o container via ResizeObserver;
    // no jsdom não há medição, então usamos dimensões fixas. `height` pode vir
    // como '100%' (altura responsiva via CSS no container pai) — nesse caso
    // cai para o padrão de 300px.
    const w = typeof width === 'number' ? width : 800;
    const h = typeof height === 'number' ? height : 300;
    return React.createElement(
      'div',
      { style: { width: w, height: h } },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { width: w, height: h } as Record<string, unknown>)
          : child
      )
    );
  };

  return { ...recharts, ResponsiveContainer };
});
