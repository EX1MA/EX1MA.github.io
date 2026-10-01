import { useState, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap';
import navStyles from './Navbar.module.css';
import { prefersReducedMotion } from '../utils/motion';
import type { Role } from '../types';
import { isFoxHidden, setFoxHidden } from './FoxGuide/foxVisibility';

const NAV_LINKS = [
  { id: 'about',    label: 'Sobre Mí' },
  { id: 'skills',   label: 'Habilidades' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'experience', label: 'Trayectoria' },
  { id: 'contact',  label: 'Contacto' },
];

interface NavbarProps {
  currentRole: Role;
  onSwitchRole: (role: Role) => void;
}

export const Navbar = ({ currentRole, onSwitchRole }: NavbarProps) => {
  const [isOpen,  setIsOpen]  = useState(false);
  const [theme,   setTheme]   = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [foxHidden, setFoxHiddenState] = useState(isFoxHidden);
  const [active, setActive] = useState('');
  const navRef       = useRef<HTMLElement>(null);
  const listRef      = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const switcherRef  = useRef<HTMLDivElement>(null);
  const thumbRef     = useRef<HTMLSpanElement>(null);
  const menuTl       = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef    = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fondo al hacer scroll, y se esconde al bajar / reaparece al subir
  useGSAP(() => {
    const nav = navRef.current!;
    const reduced = prefersReducedMotion();
    const show = gsap.quickTo(nav, 'yPercent', { duration: 0.45, ease: 'power3.out' });

    ScrollTrigger.create({
      start: 'top -60',
      end: 'max',
      onToggle: self => nav.classList.toggle(navStyles.scrolled, self.isActive),
      onUpdate: self => {
        if (reduced || isOpenRef.current) return;
        show(self.direction === 1 && self.scroll() > 400 ? -110 : 0);
      },
      onLeaveBack: () => show(0),
    });

    // Menú móvil: una sola línea de tiempo que se reproduce o se invierte
    const q = gsap.utils.selector(nav);
    menuTl.current = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .set(q('[data-mobile]'), { visibility: 'visible' })
      .fromTo(q('[data-backdrop]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
      .fromTo(q('[data-menu]'), { xPercent: 100 }, { xPercent: 0, duration: 0.7 }, 0)
      .fromTo(q('[data-menu] li'), { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06 }, 0.15);
    if (reduced) menuTl.current.duration(0.01);
  }, { scope: navRef });

  useEffect(() => {
    isOpenRef.current = isOpen;
    const tl = menuTl.current;
    if (!tl) return;
    if (isOpen) {
      gsap.to(navRef.current, { yPercent: 0, duration: 0.3 });
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.6).reverse();
    }
  }, [isOpen]);

  // Subrayado que se desliza hacia la sección activa
  useGSAP(() => {
    const list = listRef.current, bar = indicatorRef.current;
    if (!list || !bar) return;
    const place = (duration: number) => {
      const li = list.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (!li) { gsap.to(bar, { autoAlpha: 0, duration: 0.3 }); return; }
      gsap.to(bar, { x: li.offsetLeft, width: li.offsetWidth, autoAlpha: 1, duration, ease: 'expo.out', overwrite: true });
    };
    place(prefersReducedMotion() ? 0 : 0.6);
    const onResize = () => place(0);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, { dependencies: [active] });

  // Píldora del selector Dev / Diseño
  useGSAP(() => {
    const box = switcherRef.current, thumb = thumbRef.current;
    if (!box || !thumb) return;
    const place = (duration: number) => {
      const btn = box.querySelector<HTMLElement>(`[data-role="${currentRole}"]`);
      if (btn) gsap.to(thumb, { x: btn.offsetLeft - 3, width: btn.offsetWidth, duration, ease: 'back.out(1.4)', overwrite: true });
    };
    place(prefersReducedMotion() ? 0 : 0.55);
    const onResize = () => place(0);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, { dependencies: [currentRole] });

  // Track active section with IntersectionObserver
  useEffect(() => {
    const sections = NAV_LINKS.map(l => document.getElementById(l.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => s && observer.observe(s));
    return () => observer.disconnect();
  }, [currentRole]);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav ref={navRef} className={navStyles.navbar}>
      {/* Logo */}
      <div className={navStyles.logo} onClick={() => scrollTo('hero')}>
        {currentRole === 'developer' ? '<DevJoel />' : 'Joel·Design'}
      </div>

      {/* Desktop links */}
      <ul ref={listRef} className={navStyles.desktopList}>
        {NAV_LINKS.map(({ id, label }) => (
          <li
            key={id}
            data-id={id}
            className={`${navStyles.navLink} ${active === id ? navStyles.activeLink : ''}`}
            onClick={() => scrollTo(id)}
          >
            {label}
          </li>
        ))}
        <span ref={indicatorRef} className={navStyles.underline} aria-hidden="true" />
      </ul>

      {/* Actions */}
      <div className={navStyles.actions}>
        <div ref={switcherRef} className={navStyles.roleSwitcher}>
          <span ref={thumbRef} className={navStyles.roleThumb} aria-hidden="true" />
          <button
            data-role="developer"
            className={`${navStyles.roleBtn} ${currentRole === 'developer' ? navStyles.active : ''}`}
            onClick={() => onSwitchRole('developer')}
            aria-pressed={currentRole === 'developer'}
          >
            {'</>'} Dev
          </button>
          <button
            data-role="designer"
            className={`${navStyles.roleBtn} ${currentRole === 'designer' ? navStyles.active : ''}`}
            onClick={() => onSwitchRole('designer')}
            aria-pressed={currentRole === 'designer'}
          >
            ✦ Diseño
          </button>
        </div>

        <button
          onClick={() => { setFoxHidden(!foxHidden); setFoxHiddenState(!foxHidden); }}
          className={`${navStyles.themeBtn} ${foxHidden ? navStyles.foxOff : ''}`}
          aria-pressed={!foxHidden}
          aria-label={foxHidden ? 'Mostrar al zorro' : 'Ocultar al zorro'}
          title={foxHidden ? 'Mostrar al zorro' : 'Ocultar al zorro'}
        >
          🐾
        </button>

        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className={navStyles.themeBtn} aria-label="Cambiar tema">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button className={navStyles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Menú" aria-expanded={isOpen}>
          <span className={`${navStyles.bar} ${isOpen ? navStyles.barTop : ''}`} />
          <span className={`${navStyles.bar} ${isOpen ? navStyles.barMid : ''}`} />
          <span className={`${navStyles.bar} ${isOpen ? navStyles.barBot : ''}`} />
        </button>
      </div>

      {/* Mobile menu (siempre montado; GSAP lo muestra y lo oculta) */}
      <div data-mobile className={navStyles.mobileLayer} aria-hidden={!isOpen} inert={!isOpen}>
        <div data-backdrop className={navStyles.backdrop} onClick={() => setIsOpen(false)} />
        <div data-menu className={navStyles.mobileMenu}>
          <ul className={navStyles.mobileList}>
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id} onClick={() => scrollTo(id)}>{label}</li>
            ))}
            <li
              className={navStyles.mobileRoleToggle}
              onClick={() => { setIsOpen(false); onSwitchRole(currentRole === 'developer' ? 'designer' : 'developer'); }}
            >
              Cambiar a {currentRole === 'developer' ? 'Diseñador' : 'Dev'}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
