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
  const tilt    = useRef<{ rx: gsap.QuickToFunc; ry: gsap.QuickToFunc } | null>(null);

  // Inclinación suave siguiendo el mouse (quickTo reutiliza un solo tween por eje)
  useGSAP(() => {
    gsap.set(cardRef.current, { transformPerspective: 900 });
    tilt.current = {
      rx: gsap.quickTo(cardRef.current, 'rotationX', { duration: 0.5, ease: 'power3.out' }),
      ry: gsap.quickTo(cardRef.current, 'rotationY', { duration: 0.5, ease: 'power3.out' }),
    };
  }, { scope: cardRef });

  const onMove = (e: React.MouseEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    tilt.current?.rx(((e.clientY - box.top)  / box.height - 0.5) * 10);
    tilt.current?.ry(((e.clientX - box.left) / box.width  - 0.5) * -10);
  };

  const onLeave = () => {
    tilt.current?.rx(0);
    tilt.current?.ry(0);
  };

  const statusInfo = project.status ? STATUS_MAP[project.status] : null;

  return (
    <div
      ref={cardRef}
      data-card
      className={`${styles.card} ${project.highlight ? styles.highlighted : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* ── Image ── */}
      <div className={styles.imageWrap}>
        <div data-img className={styles.imgParallax}>
          <img src={project.image} alt={project.title} className={styles.img} loading="lazy" />
        </div>

        {/* Hover overlay */}
        <div className={styles.overlay}>
          <p className={styles.overlayLabel}>Stack Tecnológico</p>
          <div className={styles.overlayTags}>
            {project.technologies.map(t => <span key={t} className={styles.overlayTag}>{t}</span>)}
          </div>
        </div>

        {/* Badges */}
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
    </div>
  );
};
