import { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
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

  // Subtle tilt on mouse move
  const onMove = (e: React.MouseEvent) => {
    const el  = cardRef.current!;
    const box = el.getBoundingClientRect();
    const rx  = ((e.clientY - box.top)  / box.height - 0.5) * 10;
    const ry  = ((e.clientX - box.left) / box.width  - 0.5) * -10;
    gsap.to(el, { rotateX: rx, rotateY: ry, duration: 0.35, ease: 'power2.out', transformPerspective: 900 });
  };

  const onLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  };

  const statusInfo = project.status ? STATUS_MAP[project.status] : null;

  return (
    <motion.div
      ref={cardRef}
      className={`${styles.card} ${project.highlight ? styles.highlighted : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* ── Image ── */}
      <div className={styles.imageWrap}>
        <img src={project.image} alt={project.title} className={styles.img} loading="lazy" />

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
            Proyecto para cliente · código privado
          </p>
        )}
        {project.demoLink && (
        <motion.a
          href={project.demoLink}
          target="_blank" rel="noreferrer"
          className={`${styles.btn} ${styles.btnPrimary}`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {project.demoLabel ?? 'Ver Demo'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </motion.a>
        )}
        {project.repoLink && (
        <motion.a
          href={project.repoLink}
          target="_blank" rel="noreferrer"
          className={`${styles.btn} ${styles.btnSecondary}`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Código
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </motion.a>
        )}
      </div>
    </motion.div>
  );
};
