import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap';
import { prefersReducedMotion } from '../utils/motion';
import type { Role } from '../types';
import s from './MobileDock.module.css';

/*
  Barra de navegación "líquida" para celular (estilo menisco):
  la sección activa es una burbuja que sobresale de la barra y el borde superior
  se hunde a su alrededor. Al cambiar de sección la burbuja viaja (y se estira),
  y el hueco la sigue con un poco de retraso, como si la barra se derritiera.
  También se puede arrastrar la burbuja y soltarla sobre otra sección.
*/

const TABS = [
  { id: 'about',      label: 'Sobre mí',    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></> },
  { id: 'skills',     label: 'Habilidades', icon: <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" /> },
  { id: 'projects',   label: 'Proyectos',   icon: <><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /></> },
  { id: 'experience', label: 'Trayectoria', icon: <><circle cx="6" cy="5.5" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="M8.5 5.5H15a3.5 3.5 0 0 1 0 7H9a3.5 3.5 0 0 0 0 7h6.5" /></> },
  { id: 'contact',    label: 'Contacto',    icon: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7.5l8.5 6 8.5-6" /></> },
];

// Un tono por sección, dentro de la paleta de cada perfil
const PALETTE: Record<Role, string[]> = {
  developer: ['#f39c12', '#e67e22', '#ff7a59', '#d4a017', '#d35400'],
  designer:  ['#b07cc6', '#9b59b6', '#d16ba5', '#7d5fff', '#8e44ad'],
};

const H = 60;          // alto de la barra
const R = 20;          // radio de la burbuja
const BEAD_Y = 2;      // centro de la burbuja respecto al borde superior
const NOTCH = 25;      // radio del hueco (burbuja + separación)
const DEPTH = BEAD_Y + NOTCH;
const SHOULDER = 8;    // suavizado donde el hueco se une al borde
const CORNER = 20;
const PAD = 10;        // margen lateral de las pestañas
const FOX_EDGE = 46;   // dónde se para el zorro (px desde el borde de la pantalla)

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Rectángulo redondeado con un hueco en forma de U en el borde superior, centrado en cx */
const shape = (W: number, cx: number, depth: number) => {
  const r = CORNER;
  const k = clamp(depth / DEPTH, 0, 1);
  const hw = (NOTCH + SHOULDER) * k;
  const x1 = clamp(cx - hw, r, W - r), x2 = clamp(cx + hw, r, W - r);
  const notch = k < 0.01
    ? ''
    : `L${x1} 0 C${cx - hw * 0.55} 0 ${cx - hw * 0.62} ${depth} ${cx} ${depth} ` +
      `C${cx + hw * 0.62} ${depth} ${cx + hw * 0.55} 0 ${x2} 0 `;
  return `M${r} 0 ${notch}L${W - r} 0 A${r} ${r} 0 0 1 ${W} ${r} L${W} ${H - r} ` +
    `A${r} ${r} 0 0 1 ${W - r} ${H} L${r} ${H} A${r} ${r} 0 0 1 0 ${H - r} L0 ${r} A${r} ${r} 0 0 1 ${r} 0 Z`;
};

/** Centro (x, relativo a la barra) de la pestaña i */
const slotCenter = (root: HTMLElement | null, i: number) => {
  const W = root?.clientWidth ?? 0;
  return PAD + ((W - PAD * 2) / TABS.length) * (i + 0.5);
};

/** El zorro se para sobre la barra, del lado contrario a la burbuja (root null = sin barra) */
const dockFoxOn = (root: HTMLElement | null, i: number) => {
  if (!root) {
    window.dispatchEvent(new CustomEvent('fox:dock', { detail: { inset: 0, spot: null } }));
    return;
  }
  const rect = root.getBoundingClientRect();
  const beadAbs = rect.left + slotCenter(root, i);
  const spot = i < 0 || beadAbs >= window.innerWidth / 2 ? FOX_EDGE : window.innerWidth - FOX_EDGE;
  window.dispatchEvent(new CustomEvent('fox:dock', { detail: { inset: window.innerHeight - rect.top, spot } }));
};

export const MobileDock = ({ role }: { role: Role }) => {
  const [active, setActive] = useState(-1);
  const rootRef  = useRef<HTMLElement>(null);
  const pathRef  = useRef<SVGPathElement>(null);
  const beadRef  = useRef<HTMLButtonElement>(null);
  const glowRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  // estado de dibujo: x de la burbuja, x del hueco (va detrás), profundidad, salto y tamaño
  const st       = useRef({ x: 0, nx: 0, depth: 0, lift: 0, scale: 0, prevX: 0 });
  const enabled  = useRef(false);  // true solo en pantallas angostas
  const locked   = useRef(false);  // mientras hace scroll a una sección elegida, ignora el scroll
  const dragging = useRef(false);
  const activeRef = useRef(-1);     // copia de `active` para los manejadores fuera de React

  const tabX = (i: number) => slotCenter(rootRef.current, i);
  const dockFox = (i: number) => dockFoxOn(enabled.current ? rootRef.current : null, i);

  // ── Dibujo por cuadro (solo en celular) ──
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', () => {
      enabled.current = true;
      const reduced = prefersReducedMotion();
      const draw = () => {
        const root = rootRef.current, path = pathRef.current, bead = beadRef.current;
        if (!root || !path || !bead) return;
        const v = st.current;
        v.nx += (v.x - v.nx) * (reduced ? 1 : 0.2);
        const stretch = Math.min(Math.abs(v.x - v.prevX) / 16, 0.35);
        v.prevX = v.x;
        path.setAttribute('d', shape(root.clientWidth, v.nx, v.depth));
        bead.style.transform =
          `translate(${v.x - R}px, ${-v.lift}px) scale(${v.scale * (1 + stretch)}, ${v.scale * (1 - stretch * 0.55)})`;
        glowRef.current!.style.transform = `translateX(${v.x}px) translateX(-50%) scale(${v.scale})`;
        labelRef.current!.style.transform = `translateX(${v.x}px) translateX(-50%)`;
        labelRef.current!.style.opacity = String(v.scale);
      };
      gsap.ticker.add(draw);
      const onResize = () => {
        const i = activeRef.current;
        if (i >= 0) { st.current.x = st.current.nx = tabX(i); }
        dockFox(i);
      };
      const onRequest = () => dockFox(activeRef.current);
      window.addEventListener('resize', onResize);
      window.addEventListener('fox:dock-request', onRequest);
      dockFox(activeRef.current);
      return () => {
        gsap.ticker.remove(draw);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('fox:dock-request', onRequest);
        enabled.current = false;
        dockFox(-1);
      };
    });
  });

  // ── La burbuja viaja a la sección activa ──
  useEffect(() => {
    activeRef.current = active;
    const v = st.current;
    const bead = beadRef.current, glow = glowRef.current;
    if (!bead || !glow) return;
    const reduced = prefersReducedMotion();
    if (active < 0) {
      gsap.to(v, { scale: 0, depth: 0, duration: reduced ? 0 : 0.35, ease: 'power2.in', overwrite: 'auto' });
    } else {
      const x = slotCenter(rootRef.current, active);
      const color = PALETTE[role][active];
      if (reduced) {
        Object.assign(v, { x, nx: x, depth: DEPTH, scale: 1, lift: 0 });
      } else if (v.scale < 0.1) {
        // primera aparición: emerge de la barra
        v.x = v.nx = v.prevX = x;
        gsap.to(v, { scale: 1, depth: DEPTH, duration: 0.6, ease: 'back.out(2)', overwrite: 'auto' });
        gsap.fromTo(v, { lift: -14 }, { lift: 0, duration: 0.7, ease: 'back.out(2.5)' });
      } else if (!dragging.current) {
        gsap.to(v, { x, depth: DEPTH, scale: 1, duration: 0.75, ease: 'elastic.out(1, 0.7)', overwrite: 'auto' });
        gsap.timeline()
          .to(v, { lift: 12, duration: 0.16, ease: 'power2.out' })
          .to(v, { lift: 0, duration: 0.5, ease: 'bounce.out' });
      }
      gsap.to(bead, { backgroundColor: color, duration: reduced ? 0 : 0.4 });
      gsap.to(glow, { backgroundColor: color, duration: reduced ? 0 : 0.4 });
      labelRef.current!.style.color = color;
    }
    dockFoxOn(enabled.current ? rootRef.current : null, active);
  }, [active, role]);

  // ── Sección activa según el scroll (las secciones se vuelven a montar al cambiar de perfil) ──
  useGSAP(() => {
    const triggers: ScrollTrigger[] = [];
    const id = requestAnimationFrame(() => {
      [{ id: 'hero', i: -1 }, ...TABS.map((t, i) => ({ id: t.id, i }))].forEach(({ id, i }) => {
        const el = document.getElementById(id);
        if (!el) return;
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: self => { if (self.isActive && !locked.current) setActive(i); },
        }));
      });
    });
    return () => { cancelAnimationFrame(id); triggers.forEach(t => t.kill()); };
  }, { dependencies: [role] });

  // ── Ir a una sección (toque o al soltar la burbuja) ──
  const select = (i: number) => {
    const el = document.getElementById(TABS[i].id);
    if (!el) return;
    locked.current = true;
    setActive(i);
    const unlock = () => { locked.current = false; window.removeEventListener('scrollend', unlock); };
    window.addEventListener('scrollend', unlock);
    window.setTimeout(unlock, 1600);
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  // ── Arrastrar la burbuja ──
  const onBeadDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activeRef.current < 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    gsap.killTweensOf(st.current, 'x');
    gsap.to(st.current, { lift: 8, duration: 0.2, overwrite: 'auto' });
  };
  const onBeadMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    st.current.x = clamp(e.clientX - rect.left, tabX(0), tabX(TABS.length - 1));
  };
  const onBeadUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const W = rootRef.current?.clientWidth ?? 0;
    const slot = (W - PAD * 2) / TABS.length;
    const i = clamp(Math.floor((st.current.x - PAD) / slot), 0, TABS.length - 1);
    gsap.to(st.current, { x: tabX(i), duration: 0.6, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
    gsap.to(st.current, { lift: 0, duration: 0.45, ease: 'bounce.out' });
    if (i !== activeRef.current) select(i);
  };

  const current = active >= 0 ? TABS[active] : null;

  return (
    <nav ref={rootRef} className={s.dock} aria-label="Secciones">
      <div ref={glowRef} className={s.glow} aria-hidden="true" />
      <svg className={s.shape} aria-hidden="true">
        <path ref={pathRef} />
      </svg>

      <div className={s.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t.id}
            className={s.tab}
            aria-label={t.label}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => select(i)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">{t.icon}</svg>
          </button>
        ))}
      </div>

      <span ref={labelRef} className={s.label} aria-hidden="true">{current?.label}</span>

      <button
        ref={beadRef}
        className={s.bead}
        aria-hidden="true"
        tabIndex={-1}
        onPointerDown={onBeadDown}
        onPointerMove={onBeadMove}
        onPointerUp={onBeadUp}
        onPointerCancel={onBeadUp}
      >
        {current && <svg viewBox="0 0 24 24">{current.icon}</svg>}
      </button>
    </nav>
  );
};
