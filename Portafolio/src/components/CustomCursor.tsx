import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './CustomCursor.module.css';
import { prefersReducedMotion } from '../utils/motion';

export const CustomCursor = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    // En pantallas táctiles o con movimiento reducido se usa el cursor normal
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return;

    // Center elements on mouse using GSAP percentages
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // Ultra-smooth quickTo — dot is instant, ring lags for organic feel
    const xDot  = gsap.quickTo(dot,  'x', { duration: 0.06, ease: 'power3' });
    const yDot  = gsap.quickTo(dot,  'y', { duration: 0.06, ease: 'power3' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.38, ease: 'power2' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.38, ease: 'power2' });

    let shown = false;
    const onMove = (e: MouseEvent) => {
      // Se muestran hasta el primer movimiento para no quedar fijos en la esquina
      if (!shown) { gsap.set([dot, ring], { visibility: 'visible' }); shown = true; }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        !!target.closest('a') ||
        !!target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (clickable) {
        gsap.to(ring, { scale: 2.2, opacity: 0.5, duration: 0.35, ease: 'power2.out' });
        gsap.to(dot,  { scale: 0.4, duration: 0.2 });
      } else {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
        gsap.to(dot,  { scale: 1, duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
};
