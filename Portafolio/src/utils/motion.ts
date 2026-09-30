/** true si el usuario pidió reducir el movimiento en su sistema operativo */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
