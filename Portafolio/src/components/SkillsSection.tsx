import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import skillsStyles from './SkillsSection.module.css';
import { prefersReducedMotion } from '../utils/motion';
import type { Skill } from '../types';

interface SkillsSectionProps { skillsList: Skill[]; }

/* ── Infinite Marquee Row ──────────────────── */
const MarqueeRow = ({ skills, reverse = false }: { skills: Skill[]; reverse?: boolean }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced  = prefersReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;

    // Duplicate content → seamless loop by moving -50%
    const duration = skills.length * 3.2;

    const tween = gsap.fromTo(
      track,
      { x: reverse ? '-50%' : '0%' },
      { x: reverse ? '0%' : '-50%', duration, ease: 'none', repeat: -1 }
    );

    // Pause on hover
    const container = track.parentElement!;
    const pause  = () => tween.pause();
    const resume = () => tween.resume();
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);

    return () => {
      tween.kill();
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
    };
  }, [skills, reverse, reduced]);

  // Sin animación se muestran una sola vez y en varias líneas
  const doubled = reduced ? skills : [...skills, ...skills];

  return (
    <div className={skillsStyles.marqueeWrapper} style={reduced ? { maskImage: 'none', WebkitMaskImage: 'none' } : undefined}>
      <div ref={trackRef} className={skillsStyles.marqueeTrack} style={reduced ? { flexWrap: 'wrap' } : undefined}>
        {doubled.map((skill, i) => (
          <div key={i} className={skillsStyles.skillChip}>
            <img src={skill.icon} alt={skill.name} className={skillsStyles.chipIcon} />
            <span className={skillsStyles.chipName}>{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main Section ──────────────────────────── */
export const SkillsSection = ({ skillsList }: SkillsSectionProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView  = useInView(headerRef, { once: true, amount: 0.5 });

  // Split skills into two rows for dual marquee
  const half    = Math.ceil(skillsList.length / 2);
  const row1    = skillsList.slice(0, half);
  const row2    = skillsList.slice(half);

  return (
    <section id="skills" className={skillsStyles.section}>
      {/* Header */}
      <div className="section-container" style={{ paddingBottom: 0 }}>
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className={skillsStyles.header}
        >
          <span className="section-label">Stack & Herramientas</span>
          <h2 className="section-title">Habilidades</h2>
          <p className="section-subtitle">
            Tecnologías y herramientas que domino para construir productos de calidad.
          </p>
        </motion.div>
      </div>

      {/* Dual marquee */}
      <motion.div
        className={skillsStyles.marqueesContainer}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <MarqueeRow skills={row1} reverse={false} />
        <MarqueeRow skills={row2} reverse={true}  />
      </motion.div>
    </section>
  );
};
