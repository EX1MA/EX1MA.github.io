import type { RefObject } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap';
import { prefersReducedMotion } from '../utils/motion';

/**
 * Revela al hacer scroll los elementos marcados dentro de `scope`:
 *  - data-reveal="label"  → la etiqueta (pill) aparece con un pequeño rebote
 *  - data-reveal="title"  → el título entra letra por letra desde una máscara
 *  - data-reveal="lines"  → el párrafo entra línea por línea
 *  - data-reveal="up"     → sube y aparece; los vecinos se agrupan en cascada
 */
export function useReveal(scope: RefObject<HTMLElement | null>, dependencies: unknown[] = []) {
  useGSAP(() => {
    const root = scope.current;
    if (!root || prefersReducedMotion()) return;
    const q = <T extends HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root);
    const once = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true });

    q('[data-reveal="label"]').forEach(el => {
      gsap.from(el, { autoAlpha: 0, scale: 0.6, y: 12, duration: 0.7, ease: 'back.out(2)', scrollTrigger: once(el) });
    });

    q('[data-reveal="title"]').forEach(el => {
      SplitText.create(el, {
        type: 'words,chars',
        mask: 'words',
        autoSplit: true,
        onSplit: self => gsap.from(self.chars, {
          yPercent: 115, rotate: 8, duration: 0.95, ease: 'expo.out', stagger: 0.022,
          scrollTrigger: once(el),
        }),
      });
    });

    q('[data-reveal="lines"]').forEach(el => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: self => gsap.from(self.lines, {
          yPercent: 105, duration: 0.9, ease: 'expo.out', stagger: 0.08,
          scrollTrigger: once(el, 'top 88%'),
        }),
      });
    });

    const ups = q('[data-reveal="up"]');
    if (ups.length) {
      gsap.set(ups, { autoAlpha: 0, y: 44 });
      ScrollTrigger.batch(ups, {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, y: 0, duration: 0.85, ease: 'expo.out', stagger: 0.09, overwrite: true,
          // Al terminar se quitan los estilos en línea para que los hovers con `translate` funcionen
          clearProps: 'transform,translate,rotate,scale',
        }),
      });
    }
  }, { scope, dependencies, revertOnUpdate: true });
}
