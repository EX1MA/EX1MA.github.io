import { useRef } from 'react';
import { gsap, useGSAP } from '../animations/gsap';
import { useReveal } from '../animations/useReveal';
import { ProjectCard } from './ProjectCard';
import s from './ProjectsSection.module.css';
import { prefersReducedMotion } from '../utils/motion';
import type { Project } from '../types';

interface ProjectsSectionProps { projectsList: Project[]; }

export const ProjectsSection = ({ projectsList }: ProjectsSectionProps) => {
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useReveal(sectionRef, [projectsList]);

  useGSAP(() => {
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!section || !track) return;
    const reduced = prefersReducedMotion();
    const slots = gsap.utils.toArray<HTMLElement>(track.children);
    const mm = gsap.matchMedia();

    // ── Móvil: lista vertical, cada tarjeta entra al llegar a ella ──
    mm.add('(max-width: 899px)', () => {
      if (reduced) return;
      slots.forEach(slot => {
        gsap.from(slot, {
          autoAlpha: 0, y: 70, rotationX: -18, transformOrigin: '50% 0%', duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: slot, start: 'top 88%', once: true },
        });
      });
    });

    // ── Escritorio: la sección se fija y las tarjetas se deslizan en horizontal ──
    mm.add('(min-width: 900px)', () => {
      const getAmount = () => -(track.scrollWidth - section.clientWidth + 160); // 160px padding
      const setProgress = gsap.quickSetter(progressRef.current, 'scaleX');

      const tween = gsap.to(track, {
        x: getAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          end: () => `+=${Math.abs(getAmount())}`,
          invalidateOnRefresh: true,
          onUpdate: self => setProgress(self.progress),
        },
      });

      if (reduced) return;

      slots.forEach((slot, i) => {
        // Las tarjetas que ya caben en pantalla se revelan al llegar a la sección;
        // el resto, cuando entran por la derecha durante el scroll horizontal
        const visibleAtStart = slot.offsetLeft < section.clientWidth * 0.85;
        const trigger = visibleAtStart
          ? { trigger: section, start: 'top 70%', once: true }
          : { trigger: slot, containerAnimation: tween, start: 'left 88%', once: true };

        gsap.timeline({ scrollTrigger: trigger, delay: visibleAtStart ? i * 0.12 : 0 })
          .from(slot.querySelector('[data-card]'), {
            autoAlpha: 0, x: 120, rotationY: -24, transformPerspective: 1200, transformOrigin: '0% 50%',
            duration: 1.1, ease: 'expo.out',
          })
          .from(slot.querySelector('[data-number]'), { yPercent: 100, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.15);

        // Parallax de la imagen dentro de su marco mientras la tarjeta cruza la pantalla
        gsap.fromTo(slot.querySelector('[data-img]'), { xPercent: -7 }, {
          xPercent: 7, ease: 'none',
          scrollTrigger: { trigger: slot, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [projectsList], revertOnUpdate: true });

  return (
    <section id="projects" ref={sectionRef} className={s.section}>
      {/* Header */}
      <div className={s.header}>
        <span className="section-label" data-reveal="label">Trabajo Selecto</span>
        <h2 className="section-title" data-reveal="title">Mis Proyectos</h2>
        <div className={s.hintRow} data-reveal="up">
          <p className={s.scrollHint}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Desliza para explorar
          </p>
          <span className={s.progress} aria-hidden="true"><span ref={progressRef} className={s.progressBar} /></span>
        </div>
      </div>

      {/* Horizontal track */}
      <div ref={trackRef} className={s.track}>
        {projectsList.map((project, i) => (
          <div key={project.id} className={s.cardSlot}>
            <div className={s.projectNumber} aria-hidden="true">
              <span data-number style={{ display: 'inline-block' }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
};
