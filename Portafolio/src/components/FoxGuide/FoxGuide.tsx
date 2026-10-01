import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../animations/gsap';
import { prefersReducedMotion } from '../../utils/motion';
import type { Role } from '../../types';
import { FoxEngine, type Scene, type SheetMeta } from './engine';
import { isFoxHidden } from './foxVisibility';
import sheetUrl from '../../assets/fox/zorro.png';
import sheetMeta from '../../assets/fox/zorro.json';
import styles from './FoxGuide.module.css';

/** Qué hace el zorro en cada sección (x = fracción del ancho de la ventana) */
const SCENES: { selector: string; scene: Scene; start?: string }[] = [
  { selector: '#hero',       scene: { x: 0.72, pose: 'sit',      face: 'pointer', hunt: true } },
  { selector: '#about',      scene: { x: 0.44, pose: 'think',    face: 'left' } },
  { selector: '#skills',     scene: { x: 0.52, pose: 'look_up',  face: 'right' } },
  { selector: '#projects',   scene: { x: 0.30, pose: 'projects', face: 'right' } },
  // en Trayectoria se sienta junto a la línea de tiempo (x se ajusta a la línea) y olfatea cada punto
  { selector: '#experience', scene: { x: 0.12, pose: 'trail',    face: 'left' } },
  { selector: '#contact',    scene: { x: 0.60, pose: 'sit',      face: 'pointer', hunt: true } },
  // el footer es bajo: al final de la página su borde queda al ~60% de la ventana
  { selector: 'footer',      scene: { x: 0.42, pose: 'sleep',    face: 'right' }, start: 'top 68%' },
];

/**
 * Zorro en pixel art que acompaña el recorrido: camina a su lugar en cada sección,
 * sigue el cursor en Hero y Contacto, y celebra cuando se envía el formulario.
 * Eventos globales: `fox:celebrate` (formulario enviado), `fox:react` (tarjeta girada),
 * `fox:sprint` (botón de subir) y `fox:count-start` / `fox:count-end` (contadores de Sobre mí).
 */
export function FoxGuide({ role }: { role: Role }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FoxEngine | null>(null);

  // Motor, ticker y eventos: se crean una sola vez
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.src = sheetUrl;
    const engine = new FoxEngine(canvas, img, sheetMeta as SheetMeta, prefersReducedMotion());
    engineRef.current = engine;

    let wasDark: boolean | undefined;
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      engine.setTheme({
        ink: cs.getPropertyValue('--text-color').trim() || '#1a1a1a',
        accent: cs.getPropertyValue('--accent-color').trim() || '#c9a227',
        primary: cs.getPropertyValue('--primary-color').trim() || '#d35400',
        dark,
      });
      // siesta al pasar a oscuro, se sacude al volver a claro (no en la carga inicial)
      if (wasDark !== undefined && dark !== wasDark) engine.themeChanged(dark);
      wasDark = dark;
    };
    readTheme();
    // el tema y el color del perfil cambian atributos de <html>
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });

    // el visitante puede ocultarlo desde el botón 🐾 del menú
    let hidden = isFoxHidden();
    const applyHidden = () => { canvas.style.display = hidden ? 'none' : ''; };
    applyHidden();
    const onVisibility = (e: Event) => { hidden = (e as CustomEvent<boolean>).detail; applyHidden(); };
    window.addEventListener('fox:visibility', onVisibility);

    const tick = (_time: number, deltaMs: number) => { if (!hidden) engine.tick(deltaMs / 1000); };
    gsap.ticker.add(tick);

    const onResize = () => engine.resize();
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse') engine.setPointer(e.clientX, e.clientY); };
    // formulario de contacto: escribir alegra al zorro; un correo inválido lo confunde
    const inContactForm = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('#contact form');
    const onInput = (e: Event) => { if (inContactForm(e.target)) engine.typing(); };
    // tarjetas de proyecto: las mira; botones de CV: va por el papel
    const closest = (t: EventTarget | null, sel: string) => (t instanceof Element ? t.closest(sel) : null);
    const onOver = (e: PointerEvent) => engine.setLooking(!!closest(e.target, '[data-card]'));
    const onClick = (e: MouseEvent) => { if (closest(e.target, 'a[download]')) engine.fetchCV(); };
    const onFocusOut = (e: FocusEvent) => {
      const el = e.target;
      if (inContactForm(el) && el instanceof HTMLInputElement && el.type === 'email' && el.value && !el.validity.valid) engine.confused();
    };
    const onLeave = () => engine.setPointer(undefined);
    const onCelebrate = () => engine.celebrate();
    const onReact = () => engine.react();
    const onSprint = () => engine.sprint();
    const onCountStart = () => engine.countStart();
    const onCountEnd = () => engine.countEnd();

    // inactividad: tras 30 s sin moverse, el zorro se duerme
    let idleTimer = 0;
    const onActivity = () => {
      engine.setIdle(false);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => engine.setIdle(true), 30_000);
    };
    onActivity();
    const ACTIVITY = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'] as const;
    ACTIVITY.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('fox:celebrate', onCelebrate);
    window.addEventListener('fox:react', onReact);
    window.addEventListener('fox:sprint', onSprint);
    window.addEventListener('fox:count-start', onCountStart);
    window.addEventListener('fox:count-end', onCountEnd);
    document.addEventListener('input', onInput);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('click', onClick);
    document.addEventListener('focusout', onFocusOut);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('fox:visibility', onVisibility);
      themeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('fox:celebrate', onCelebrate);
      window.removeEventListener('fox:react', onReact);
      window.removeEventListener('fox:sprint', onSprint);
      window.removeEventListener('fox:count-start', onCountStart);
      window.removeEventListener('fox:count-end', onCountEnd);
      ACTIVITY.forEach(ev => window.removeEventListener(ev, onActivity));
      window.clearTimeout(idleTimer);
      document.removeEventListener('input', onInput);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('click', onClick);
      document.removeEventListener('focusout', onFocusOut);
      engineRef.current = null;
    };
  }, []);

  // ScrollTriggers por sección; al cambiar de perfil las secciones se vuelven a montar
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setRole(role);
    const triggers: ScrollTrigger[] = [];
    const scenes = new Map<ScrollTrigger, Scene>();
    const selectors = new Map<ScrollTrigger, string>();
    let activeSelector = '';
    // si dos secciones están activas a la vez (Contacto y footer), manda la de más abajo
    const pick = () => {
      const active = triggers.filter(t => t.isActive);
      const last = active.sort((a, b) => a.start - b.start).pop();
      if (last) { engine.setScene(scenes.get(last)!); activeSelector = selectors.get(last) ?? ''; }
    };
    // Trayectoria: el zorro se sienta a la derecha de la línea y olfatea el punto que pasa a su altura
    const followTrail = (section: Element) => {
      const dots = section.querySelectorAll('[data-dot]');
      if (!dots.length) return;
      const stageH = engine.footprintCss;
      const top = window.innerHeight - stageH * 0.85, bottom = window.innerHeight - 10;
      let near = false;
      dots.forEach(d => {
        const r = d.getBoundingClientRect(), cy = r.top + r.height / 2;
        if (cy > top && cy < bottom) near = true;
      });
      const line = dots[0].getBoundingClientRect();
      engine.setTargetFrac((line.left + line.width / 2 + 95) / window.innerWidth);
      engine.setTrailNear(near);
    };
    // espera a que las secciones creen sus propios ScrollTriggers (pins incluidos)
    const id = requestAnimationFrame(() => {
      for (const { selector, scene, start } of SCENES) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const st = ScrollTrigger.create({
          trigger: el,
          start: start ?? 'top 55%',
          end: 'bottom 55%',
          onToggle: pick,
          onUpdate: self => {
            if (scene.pose === 'projects') engine.setScrollSpeed(self.getVelocity());
            if (scene.pose === 'trail' && self.isActive) followTrail(el);
          },
        });
        scenes.set(st, scene);
        selectors.set(st, selector);
        triggers.push(st);
      }
      ScrollTrigger.refresh();
      pick();
    });
    // ── Acrobacia en el Hero: brinca sobre las letras del nombre y cada una rebota al pisarla ──
    const chars = () => Array.from(document.querySelectorAll<HTMLElement>('#hero [data-char]'));
    const canAct = () => activeSelector === '#hero' && window.scrollY < 30 && window.innerWidth >= 900 && engine.idle;
    // sale sola una vez por visita (poco después de llegar al Hero); después, solo al pasar el cursor por el nombre
    const ACT_KEY = 'fox-name-act';
    const actedThisVisit = () => { try { return sessionStorage.getItem(ACT_KEY) === '1'; } catch { return true; } };
    let nextAct = performance.now() + 5500;
    const act = (e?: Event) => {
      const list = chars();
      if (!e && actedThisVisit()) return;
      if (!list.length || !canAct() || performance.now() < nextAct) return;
      const s = engine.cssScale;
      // de derecha a izquierda (empieza por la letra más cercana al zorro), una sí y una no
      const picked = list.filter((_, i) => i % 2 === 0 || i === list.length - 1).reverse();
      const pts = picked.map(el => {
        const r = el.getBoundingClientRect();
        // las mayúsculas y letras altas tienen la parte de arriba más alta que las minúsculas
        const tall = /[A-ZÁÉÍÓÚÑbdfhklt]/.test(el.textContent ?? '');
        return { x: (r.left + r.width / 2) / s, y: (r.top + r.height * (tall ? 0.2 : 0.42)) / s };
      });
      if (engine.perform(pts, i => bounce(picked[i]))) {
        nextAct = performance.now() + 12000;
        try { sessionStorage.setItem(ACT_KEY, '1'); } catch { /* sin almacenamiento: no pasa nada */ }
      }
    };
    const bounce = (el: HTMLElement) => gsap.timeline()
      .to(el, { y: 6, scaleY: 0.82, transformOrigin: '50% 100%', duration: 0.08, ease: 'power2.out' })
      .to(el, { y: -5, scaleY: 1.06, duration: 0.14, ease: 'power2.out' })
      .to(el, { y: 0, scaleY: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' });
    const timer = window.setInterval(() => act(), 1000);
    // pasar el cursor por el nombre lo invita a repetir (con pausa de 12 s entre acrobacias)
    const title = document.querySelector('#hero h1');
    title?.addEventListener('pointerenter', act);
    // ── Habilidades: cabezazo al chip que está bajo el cursor ──
    let nextBop = performance.now() + 3000;
    const bop = (chip: HTMLElement) => {
      if (activeSelector !== '#skills' || window.innerWidth < 900 || !engine.idle || performance.now() < nextBop) return;
      const s = engine.cssScale;
      // solo chips que alcanza de un salto razonable
      const r0 = chip.getBoundingClientRect();
      if (r0.bottom < window.innerHeight - 460 || r0.bottom > window.innerHeight - 140) return;
      const r = chip.getBoundingClientRect();
      // salta para que la cabeza toque la parte de abajo del chip
      const pt = { x: (r.left + r.width / 2) / s, y: r.bottom / s + 34, air: true };
      const target = chip;
      if (engine.perform([pt], () => gsap.timeline()
        .to(target, { y: -16, rotation: gsap.utils.random(-10, 10), duration: 0.16, ease: 'power2.out' })
        .to(target, { y: 0, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }))) nextBop = performance.now() + 4000;
    };
    const onChipOver = (e: PointerEvent) => {
      const chip = e.target instanceof Element ? e.target.closest<HTMLElement>('#skills [data-chip]') : null;
      if (chip) bop(chip);
    };
    document.addEventListener('pointerover', onChipOver);

    const onScroll = () => { if (activeSelector === '#hero' && window.scrollY > 40) engine.abortPerform(); };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(id);
      triggers.forEach(t => t.kill());
      window.clearInterval(timer);
      document.removeEventListener('pointerover', onChipOver);
      title?.removeEventListener('pointerenter', act);
      window.removeEventListener('scroll', onScroll);
    };
  }, [role]);

  return <canvas ref={canvasRef} className={styles.stage} aria-hidden="true" />;
}
