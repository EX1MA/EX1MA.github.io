import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import navStyles from './Navbar.module.css';
import type { Role } from '../types';

gsap.registerPlugin(ScrollTrigger);

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
  const [active, setActive] = useState('');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // GSAP: scroll-triggered navbar backdrop
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -60',
        onEnter:    () => nav.classList.add(navStyles.scrolled),
        onLeaveBack:() => nav.classList.remove(navStyles.scrolled),
      });
    });
    return () => ctx.revert();
  }, []);

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
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const menuVariants = {
    closed: { x: '100%', opacity: 0 },
    open:   { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 90, damping: 20 } },
  };

  return (
    <nav ref={navRef} className={navStyles.navbar}>
      {/* Logo */}
      <div className={navStyles.logo} onClick={() => scrollTo('hero')}>
        {currentRole === 'developer' ? '<DevJoel />' : 'Joel·Design'}
      </div>

      {/* Desktop links */}
      <ul className={navStyles.desktopList}>
        {NAV_LINKS.map(({ id, label }) => (
          <li
            key={id}
            className={`${navStyles.navLink} ${active === id ? navStyles.activeLink : ''}`}
            onClick={() => scrollTo(id)}
          >
            {label}
            {active === id && (
              <motion.span
                layoutId="nav-underline"
                className={navStyles.underline}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className={navStyles.actions}>
        <div className={navStyles.roleSwitcher}>
          <button
            className={`${navStyles.roleBtn} ${currentRole === 'developer' ? navStyles.active : ''}`}
            onClick={() => onSwitchRole('developer')}
          >
            {'</>'} Dev
          </button>
          <button
            className={`${navStyles.roleBtn} ${currentRole === 'designer' ? navStyles.active : ''}`}
            onClick={() => onSwitchRole('designer')}
          >
            ✦ Diseño
          </button>
        </div>

        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className={navStyles.themeBtn} aria-label="Cambiar tema">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button className={navStyles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Menú">
          <span className={`${navStyles.bar} ${isOpen ? navStyles.barTop : ''}`} />
          <span className={`${navStyles.bar} ${isOpen ? navStyles.barMid : ''}`} />
          <span className={`${navStyles.bar} ${isOpen ? navStyles.barBot : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={navStyles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className={navStyles.mobileMenu}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <ul className={navStyles.mobileList}>
                {NAV_LINKS.map(({ id, label }) => (
                  <li key={id} onClick={() => scrollTo(id)}>{label}</li>
                ))}
                <li
                  className={navStyles.mobileRoleToggle}
                  onClick={() => onSwitchRole(currentRole === 'developer' ? 'designer' : 'developer')}
                >
                  Cambiar a {currentRole === 'developer' ? 'Diseñador' : 'Dev'}
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
