import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap';
import { useReveal } from '../animations/useReveal';
import skillsStyles from './SkillsSection.module.css';
import { prefersReducedMotion } from '../utils/motion';
import type { Role, Skill } from '../types';
import { designSkills, frontendSkills, softSkills, type SkillLevel } from '../data/skillGroups';

interface SkillsSectionProps { skillsList: Skill[]; role: Role; }

/* ── Infinite Marquee Row ──────────────────── */
const MarqueeRow = ({ skills, reverse = false }: { skills: Skill[]; reverse?: boolean }) => {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced  = prefersReducedMotion();

  useGSAP(() => {
    const wrap = wrapRef.current, track = trackRef.current;
    if (!wrap || !track || reduced) return;

    // Contenido duplicado → bucle continuo moviendo -50%
    const tween = gsap.fromTo(track,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, duration: skills.length * 3.2, ease: 'none', repeat: -1 },
    );
    // Arranca "a mitad" de muchas vueltas para poder correr también hacia atrás
    tween.totalTime(tween.duration() * 500);

    // Velocidad = sentido del scroll × impulso por velocidad × pausa al pasar el mouse
    const speed = { boost: 1, hover: 1 };
    let dir = 1;
    const apply = () => { tween.timeScale(dir * speed.boost * speed.hover); };
    gsap.ticker.add(apply);

    ScrollTrigger.create({
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: self => {
        dir = self.direction;
        const target = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 250);
        gsap.to(speed, {
          boost: target, duration: 0.2, overwrite: true,
          onComplete: () => { gsap.to(speed, { boost: 1, duration: 1.4, ease: 'power2.out' }); },
        });
      },
    });

    const slow = () => gsap.to(speed, { hover: 0, duration: 0.6, ease: 'power2.out' });
    const go   = () => gsap.to(speed, { hover: 1, duration: 0.8, ease: 'power2.in' });
    wrap.addEventListener('mouseenter', slow);
    wrap.addEventListener('mouseleave', go);

    return () => {
      gsap.ticker.remove(apply);
      wrap.removeEventListener('mouseenter', slow);
      wrap.removeEventListener('mouseleave', go);
    };
  }, { scope: wrapRef, dependencies: [skills, reverse, reduced], revertOnUpdate: true });

  // Sin animación se muestran una sola vez y en varias líneas
  const doubled = reduced ? skills : [...skills, ...skills];

  return (
    <div ref={wrapRef} className={skillsStyles.marqueeWrapper} style={reduced ? { maskImage: 'none', WebkitMaskImage: 'none' } : undefined}>
      <div ref={trackRef} className={skillsStyles.marqueeTrack} style={reduced ? { flexWrap: 'wrap' } : undefined}>
        {doubled.map((skill, i) => (
          <div key={i} data-chip className={skillsStyles.skillChip}>
            <img src={skill.icon} alt={skill.name} className={skillsStyles.chipIcon} />
            <span className={skillsStyles.chipName}>{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Tarjeta con barras de nivel ──────────── */
const LevelCard = ({ title, icon, skills }: { title: string; icon: string; skills: SkillLevel[] }) => (
  <div className={skillsStyles.groupCard} data-group>
    <h3 className={skillsStyles.groupTitle}><span aria-hidden="true">{icon}</span> {title}</h3>
    <ul className={skillsStyles.levels}>
      {skills.map(sk => (
        <li key={sk.name} className={skillsStyles.levelItem}>
          <div className={skillsStyles.levelHead}>
            <span className={skillsStyles.levelName}>
              {sk.name}{sk.note && <em className={skillsStyles.levelNote}>{sk.note}</em>}
            </span>
            <span className={skillsStyles.levelValue} data-level={sk.level}>{sk.level}%</span>
          </div>
          <div
            className={skillsStyles.levelTrack}
            role="meter" aria-valuenow={sk.level} aria-valuemin={0} aria-valuemax={100} aria-label={sk.name}
          >
            <span className={skillsStyles.levelFill} data-fill style={{ width: `${sk.level}%` }} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

/* ── Main Section ──────────────────────────── */
export const SkillsSection = ({ skillsList, role }: SkillsSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const rowsRef    = useRef<HTMLDivElement>(null);
  const groupsRef  = useRef<HTMLDivElement>(null);

  useReveal(sectionRef, [skillsList]);

  // Las fichas entran como una ola desde el centro
  useGSAP(() => {
    if (!rowsRef.current || prefersReducedMotion()) return;
    gsap.from(gsap.utils.toArray('[data-chip]', rowsRef.current), {
      autoAlpha: 0, y: 50, scale: 0.7, duration: 0.9, ease: 'back.out(1.8)', clearProps: 'transform,translate,rotate,scale',
      stagger: { each: 0.035, from: 'center' },
      scrollTrigger: { trigger: rowsRef.current, start: 'top 88%', once: true },
    });
  }, { scope: rowsRef, dependencies: [skillsList], revertOnUpdate: true });

  // Tarjetas de nivel: entran en cascada, las barras se llenan y el % cuenta
  useGSAP(() => {
    const box = groupsRef.current;
    if (!box || prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>('[data-group]', box);
    cards.forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true }, delay: i * 0.12 });
      tl.from(card, { autoAlpha: 0, y: 60, duration: 0.9, ease: 'expo.out', clearProps: 'transform,translate,rotate,scale' })
        .from(card.querySelectorAll('[data-fill]'), {
          scaleX: 0, transformOrigin: '0% 50%', duration: 1.3, stagger: 0.08, ease: 'expo.out',
        }, 0.25)
        .from(card.querySelectorAll('[data-soft]'), {
          autoAlpha: 0, scale: 0.6, y: 14, duration: 0.6, stagger: 0.05, ease: 'back.out(2)',
        }, 0.3);
      card.querySelectorAll<HTMLElement>('[data-level]').forEach((el, j) => {
        const target = Number(el.dataset.level), obj = { v: 0 };
        tl.to(obj, { v: target, duration: 1.3, ease: 'expo.out', onUpdate: () => { el.textContent = `${Math.round(obj.v)}%`; } }, 0.25 + j * 0.08);
      });
    });
  }, { scope: groupsRef, dependencies: [role], revertOnUpdate: true });

  const groups = [
    <LevelCard key="dev" title="Desarrollo Frontend" icon="</>" skills={frontendSkills} />,
    <LevelCard key="design" title="Diseño & Creatividad" icon="✦" skills={designSkills} />,
  ];
  if (role === 'designer') groups.reverse();

  // Split skills into two rows for dual marquee
  const half    = Math.ceil(skillsList.length / 2);
  const row1    = skillsList.slice(0, half);
  const row2    = skillsList.slice(half);

  return (
    <section id="skills" ref={sectionRef} className={skillsStyles.section}>
      {/* Header */}
      <div className="section-container" style={{ paddingBottom: 0 }}>
        <div className={skillsStyles.header}>
          <span className="section-label" data-reveal="label">Stack & Herramientas</span>
          <h2 className="section-title" data-reveal="title">Habilidades</h2>
          <p className="section-subtitle" data-reveal="lines">
            Tecnologías y herramientas que domino para construir productos de calidad.
          </p>
        </div>
      </div>

      {/* Dual marquee */}
      <div ref={rowsRef} className={skillsStyles.marqueesContainer}>
        <MarqueeRow skills={row1} reverse={false} />
        <MarqueeRow skills={row2} reverse={true}  />
      </div>

      {/* Detalle por área, con los niveles del CV */}
      <div ref={groupsRef} className={`section-container ${skillsStyles.groups}`}>
        {groups}
        <div className={skillsStyles.groupCard} data-group>
          <h3 className={skillsStyles.groupTitle}><span aria-hidden="true">◎</span> Habilidades Blandas</h3>
          <ul className={skillsStyles.softList}>
            {softSkills.map(sk => <li key={sk} data-soft className={skillsStyles.softChip}>{sk}</li>)}
          </ul>
          <div className={skillsStyles.learning}>
            <span className={skillsStyles.learningDot} aria-hidden="true" />
            <p>
              <strong>Aprendiendo ahora:</strong> arquitectura cloud con AWS.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
