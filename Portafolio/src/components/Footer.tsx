import { motion } from 'framer-motion';
import s from './Footer.module.css';

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/EX1MA',
    icon: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/joel-contreras-bautista-06310b159',
    icon: <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />,
  },
  {
    label: 'Behance',
    href: 'https://www.behance.net/VereorNox',
    icon: <path d="M7.8 11.3c.9-.45 1.5-1.2 1.5-2.4C9.3 6.6 7.6 6 5.6 6H0v12h5.8c2.2 0 4.2-1.05 4.2-3.5 0-1.5-.7-2.6-2.2-3.2ZM2.6 8h2.4c.95 0 1.8.25 1.8 1.35 0 1-.66 1.4-1.6 1.4H2.6V8Zm2.7 8H2.6v-3.3h2.8c1.1 0 1.85.47 1.85 1.66 0 1.2-.9 1.64-1.95 1.64ZM17.3 8.6c-3.1 0-5.2 2.3-5.2 5.4 0 3.2 2 5.4 5.2 5.4 2.4 0 3.97-1.08 4.72-3.4h-2.4c-.26.86-1.35 1.32-2.2 1.32-1.63 0-2.49-.96-2.49-2.58h7.17c.11-3.25-1.9-6.14-4.8-6.14Zm-2.36 4.4c.09-1.33.97-2.17 2.3-2.17 1.39 0 2.09.82 2.2 2.17h-4.5ZM15 6.6h5.4V8H15V6.6Z" />,
  },
];

const NAV_LINKS = [
  { label: 'Sobre Mí',    id: 'about'    },
  { label: 'Habilidades', id: 'skills'   },
  { label: 'Proyectos',   id: 'projects' },
  { label: 'Trayectoria', id: 'experience' },
  { label: 'Contacto',    id: 'contact'  },
];

export const Footer = () => {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        {/* Top row */}
        <div className={s.top}>
          <div className={s.brand}>
            <span className={s.logo}>Joel Contreras</span>
            <p className={s.tagline}>
              Construyendo experiencias digitales con propósito y precisión.
            </p>
          </div>

          <nav className={s.nav}>
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} className={s.navLink} onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
          </nav>

          <div className={s.socials}>
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={s.socialBtn}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                aria-label={label}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{icon}</svg>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={s.divider} />

        {/* Bottom row */}
        <div className={s.bottom}>
          <p className={s.copy}>
            © {new Date().getFullYear()} Joel Contreras Bautista. Todos los derechos reservados.
          </p>
          <p className={s.made}>
            Hecho con React + GSAP ✦
          </p>
        </div>
      </div>
    </footer>
  );
};
