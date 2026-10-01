import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap';
import styles from './ScrollToTop.module.css';

export const ScrollToTop = () => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    const btn = btnRef.current!;
    const reveal = gsap.fromTo(btn,
      { autoAlpha: 0, scale: 0.4, rotate: -90 },
      { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)', paused: true },
    );
    ScrollTrigger.create({
      start: 300,
      end: 'max',
      onEnter: () => reveal.play(),
      onLeaveBack: () => reveal.reverse(),
    });
  });

  return (
    <button
      ref={btnRef}
      onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); window.dispatchEvent(new Event('fox:sprint')); }}
      className={styles.scrollBtn}
      aria-label="Volver arriba"
    >
      ↑
    </button>
  );
};
