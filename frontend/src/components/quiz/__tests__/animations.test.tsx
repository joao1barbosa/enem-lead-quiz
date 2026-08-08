import { describe, it, expect } from 'vitest';
import { slideVariants, fadeVariants } from '../animation-variants';

type SlideVariants = {
  enter: (direction: number) => { x: number; opacity: number };
  center: { x: number; opacity: number };
  exit: (direction: number) => { x: number; opacity: number };
};

type FadeVariants = {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
};

describe('Animation Variants', () => {
  describe('slideVariants', () => {
    const variants = slideVariants as SlideVariants;

    it('should have enter, center, and exit states', () => {
      expect(slideVariants).toHaveProperty('enter');
      expect(slideVariants).toHaveProperty('center');
      expect(slideVariants).toHaveProperty('exit');
    });

    it('should slide from right when direction is positive', () => {
      const enterVariant = variants.enter(1);
      expect(enterVariant.x).toBe(1000);
      expect(enterVariant.opacity).toBe(0);
    });

    it('should slide from left when direction is negative', () => {
      const enterVariant = variants.enter(-1);
      expect(enterVariant.x).toBe(-1000);
      expect(enterVariant.opacity).toBe(0);
    });

    it('should be centered in center state', () => {
      expect(variants.center.x).toBe(0);
      expect(variants.center.opacity).toBe(1);
    });
  });

  describe('fadeVariants', () => {
    const variants = fadeVariants as FadeVariants;

    it('should have initial, animate, and exit states', () => {
      expect(fadeVariants).toHaveProperty('initial');
      expect(fadeVariants).toHaveProperty('animate');
      expect(fadeVariants).toHaveProperty('exit');
    });

    it('should fade in from bottom', () => {
      expect(variants.initial.opacity).toBe(0);
      expect(variants.initial.y).toBe(20);
      expect(variants.animate.opacity).toBe(1);
      expect(variants.animate.y).toBe(0);
    });
  });
});
