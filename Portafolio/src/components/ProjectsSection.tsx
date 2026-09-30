import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProjectCard } from './ProjectCard';
import s from './ProjectsSection.module.css';
import { prefersReducedMotion } from '../utils/motion';
import type { Project } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsSectionProps { projectsList: Project[]; }

export const ProjectsSection = ({ projectsList }: ProjectsSectionProps) => {
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const isInView    = useInView(headerRef, { once: true, amount: 0.5 });

  useEffect(() => {
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!section || !track) return;
    const reduced = prefersReducedMotion();

    const isMobile = window.innerWidth < 900;
    if (isMobile) {
      if (reduced) return;
      // Mobile: simple stagger reveal, no horizontal scroll
      const ctx = gsap.context(() => {
        gsap.fromTo(
          Array.from(track.children),
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 0.7, stagger: 0.18, ease: 'power3.out',
            scrollTrigger: { trigger: track, start: 'top 82%', once: true },
          }
        );
      }, section);
      return () => ctx.revert();
    }

    // Desktop: horizontal pin scroll
    const ctx = gsap.context(() => {
      const getAmount = () =>
        -(track.scrollWidth - section.clientWidth + 160); // 160px padding

      const tween = gsap.to(track, {
        x: getAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          end: () => `+=${Math.abs(getAmount())}`,
          invalidateOnRefresh: true,
        },
      });

      if (reduced) return;

      // Reveal each card as it enters the horizontal viewport.
      // Las que ya caben en pantalla se revelan al llegar a la sección,
      // para que no se vea vacía antes de que empiece el scroll horizontal.
      Array.from(track.children).forEach((card, i) => {
        const el = card as HTMLElement;
        const visibleAtStart = el.offsetLeft < section.clientWidth * 0.85;
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.88, y: 30 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.75,
            delay: visibleAtStart ? i * 0.12 : 0,
            ease: 'power3.out',
            scrollTrigger: visibleAtStart
              ? { trigger: section, start: 'top 70%', once: true }
              : { trigger: el, containerAnimation: tween, start: 'left 85%', once: true },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [projectsList]);

  return (
    <section id="projects" ref={sectionRef} className={s.section}>
      {/* Header */}
      <motion.div
        ref={headerRef}
        className={s.header}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <span className="section-label">Trabajo Selecto</span>
        <h2 className="section-title">Mis Proyectos</h2>
        <p className={s.scrollHint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Desliza para explorar
        </p>
      </motion.div>

      {/* Horizontal track */}
      <div ref={trackRef} className={s.track}>
        {projectsList.map((project, i) => (
          <div key={project.id} className={s.cardSlot}>
            <div className={s.projectNumber}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
};
