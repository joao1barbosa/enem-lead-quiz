import { describe, it, expect } from 'vitest';
import { slideVariants, fadeVariants } from '../animation-variants';

describe('Animation Variants', () => {
  describe('slideVariants', () => {
    it('should have enter, center, and exit states', () => {
      expect(slideVariants).toHaveProperty('enter');
      expect(slideVariants).toHaveProperty('center');
      expect(slideVariants).toHaveProperty('exit');
    });

    it('should slide from right when direction is positive', () => {
      const enterVariant = slideVariants.enter(1);
      expect(enterVariant.x).toBe(1000);
      expect(enterVariant.opacity).toBe(0);
    });

    it('should slide from left when direction is negative', () => {
      const enterVariant = slideVariants.enter(-1);
      expect(enterVariant.x).toBe(-1000);
      expect(enterVariant.opacity).toBe(0);
    });

    it('should be centered in center state', () => {
      expect(slideVariants.center.x).toBe(0);
      expect(slideVariants.center.opacity).toBe(1);
    });
  });

  describe('fadeVariants', () => {
    it('should have initial, animate, and exit states', () => {
      expect(fadeVariants).toHaveProperty('initial');
      expect(fadeVariants).toHaveProperty('animate');
      expect(fadeVariants).toHaveProperty('exit');
    });

    it('should fade in from bottom', () => {
      expect(fadeVariants.initial.opacity).toBe(0);
      expect(fadeVariants.initial.y).toBe(20);
      expect(fadeVariants.animate.opacity).toBe(1);
      expect(fadeVariants.animate.y).toBe(0);
    });
  });
});
