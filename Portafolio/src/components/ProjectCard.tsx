import { useRef } from 'react';
import { gsap, useGSAP } from '../animations/gsap';
import type { Project } from '../types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps { project: Project; }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  'Completado':    { label: '✓ Completado',   cls: styles.statusDone },
  'En Desarrollo': { label: '⚡ En Desarrollo', cls: styles.statusWip  },
  'Mantenimiento': { label: '↻ En mantenimiento', cls: styles.statusWip },
  'Concepto':      { label: '✦ Concepto',      cls: styles.statusIdea },
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const tilt    = useRef<{ rx: gsap.QuickToFunc; ry: gsap.QuickToFunc; lift: gsap.core.Tween } | null>(null);

  // Inclinación 3D con el mouse: la tarjeta gira y sus capas (badges, título, stack, botones)
  // se despegan a distintas alturas vía --lift. Solo con mouse y sin movimiento reducido.
  useGSAP(() => {
    const card = cardRef.current!;
    const mm = gsap.matchMedia();
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set(card, { transformPerspective: 1000 });
      tilt.current = {
        rx:   gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3.out' }),
        ry:   gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3.out' }),
        lift: gsap.to(card, { '--lift': 1, duration: 0.5, ease: 'power2.out', paused: true }),
      };
      return () => { tilt.current = null; };
    });
  }, { scope: cardRef });

  const onEnter = () => tilt.current?.lift.play();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - box.left) / box.width;
    const ny = (e.clientY - box.top)  / box.height;
    tilt.current.rx((ny - 0.5) * 16);
    tilt.current.ry((nx - 0.5) * -20);
    cardRef.current?.style.setProperty('--gx', `${nx * 100}%`);
    cardRef.current?.style.setProperty('--gy', `${ny * 100}%`);
  };

  const onLeave = () => {
    if (!tilt.current) return;
    tilt.current.rx(0);
    tilt.current.ry(0);
    tilt.current.lift.reverse();
  };

  const statusInfo = project.status ? STATUS_MAP[project.status] : null;

  return (
    // El hover se detecta en este contenedor que no gira: si fuera la tarjeta inclinada,
    // al rotar dejaría de estar bajo el cursor y parpadearía entre girar y aplanarse
    <div
      className={styles.hitArea}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
    <div
      ref={cardRef}
      data-card
      className={`${styles.card} ${project.highlight ? styles.highlighted : ''}`}
    >
      {/* ── Image ── */}
      <div className={styles.imageWrap}>
        <div data-img className={styles.imgParallax}>
          <img src={project.image} alt={project.title} className={styles.img} loading="lazy"
            style={project.pixelArt ? { imageRendering: 'pixelated' } : undefined} />
        </div>

        {/* Hover overlay (solo el fondo; el contenido flota en la capa de abajo) */}
        <div className={styles.overlay} />
      </div>

      {/* ── Capa flotante sobre la imagen: fuera del overflow para poder salir en 3D ── */}
      <div className={styles.imageLayer}>
        <div className={styles.overlayContent}>
          <p className={styles.overlayLabel}>Stack Tecnológico</p>
          <div className={styles.overlayTags}>
            {project.technologies.map(t => <span key={t} className={styles.overlayTag}>{t}</span>)}
          </div>
        </div>

        {project.year && <span className={styles.yearBadge}>{project.year}</span>}
        {statusInfo && (
          <span className={`${styles.statusBadge} ${statusInfo.cls}`}>{statusInfo.label}</span>
        )}
        {project.highlight && <span className={styles.ribbon}>★ Destacado</span>}
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        <div className={styles.meta}>
          {project.category && (
            <span className={styles.category}>{project.category}</span>
          )}
          {project.client && <span className={styles.client}>{project.client}</span>}
        </div>

        <h3 className={styles.title}>{project.title}</h3>
        <p  className={styles.desc}>{project.description}</p>

        {project.features && (
          <ul className={styles.features}>
            {project.features.slice(0, 4).map(f => (
              <li key={f} className={styles.featureItem}>
                <span className={styles.check}>✓</span> {f}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.tags}>
          {project.technologies.slice(0, 4).map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
          {project.technologies.length > 4 && (
            <span className={styles.tagMore}>+{project.technologies.length - 4}</span>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        {!project.demoLink && !project.repoLink && (
          <p className={styles.privateNote}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            {project.client === 'Proyecto personal' ? 'Proyecto personal' : 'Proyecto para cliente'} · código privado
          </p>
        )}
        {project.demoLink && (
        <a
          href={project.demoLink}
          target="_blank" rel="noreferrer"
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          {project.demoLabel ?? 'Ver Demo'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        )}
        {project.repoLink && (
        <a
          href={project.repoLink}
          target="_blank" rel="noreferrer"
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          Código
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </a>
        )}
      </div>

      <div className={styles.glare} aria-hidden="true" />
    </div>
    </div>
  );
};
