/** Preferencia del visitante para ocultar al zorro guía (se recuerda entre visitas) */
const KEY = 'fox-hidden';

export const isFoxHidden = () => {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
};

export const setFoxHidden = (hidden: boolean) => {
  try {
    if (hidden) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch { /* sin almacenamiento: la preferencia dura solo esta visita */ }
  window.dispatchEvent(new CustomEvent<boolean>('fox:visibility', { detail: hidden }));
};
