import { useRef } from 'react';
import { gsap, useGSAP } from '../animations/gsap';

export const ScrollProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(barRef.current, { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
  });

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
        transformOrigin: '0%',
        transform: 'scaleX(0)',
        zIndex: 9999,
      }}
    />
  );
};
