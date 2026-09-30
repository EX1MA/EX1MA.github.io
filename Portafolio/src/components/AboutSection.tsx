import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './AboutSection.module.css';
import profilePic from '../assets/profile.jpg';
import type { Stat } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface AboutData { text: string[]; stats?: Stat[]; }
interface AboutSectionProps { data?: AboutData; }

export const AboutSection = ({ data }: AboutSectionProps) => {
  const sectionRef  = useRef<HTMLElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const isInView  = useInView(headerRef, { once: true, amount: 0.4 });

  // Parallax on profile image
  useEffect(() => {
    if (!imageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.5,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Text lines slide in
  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(textRef.current!.querySelectorAll('p')),
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0,
          duration: 0.75,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );
    }, textRef);
    return () => ctx.revert();
  }, [data]);

  // Stat counters + card entrance
  useEffect(() => {
    const stats = data?.stats;
    if (!statsRef.current || !stats?.length) return;
    const counters = Array.from(statsRef.current.querySelectorAll<HTMLSpanElement>('[data-counter]'));
    if (!counters.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(statsRef.current!.children),
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.65, stagger: 0.15, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        }
      );

      stats.forEach((stat, i) => {
        const el = counters[i];
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.value,
          duration: 2.5,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: () => { el.textContent = Math.round(obj.val) + stat.suffix; },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
    }, statsRef);
    return () => ctx.revert();
  }, [data?.stats]);

  if (!data?.text) return null;

  return (
    <section id="about" ref={sectionRef} className="section-container">
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={s.header}
      >
        <span className="section-label">Mi Historia</span>
        <h2 className="section-title">Sobre Mí</h2>
      </motion.div>

      {/* Profile + Text */}
      <div className={s.grid}>
        <div ref={imageRef} className={s.imageWrap}>
          <img src={profilePic} alt="Joel Contreras" className={s.profileImg} />
          <div className={s.imageBorder} />
          <div className={s.imageDecor} />
        </div>

        <div ref={textRef} className={s.textWrap}>
          {data.text.map((p, i) => <p key={i} className={s.paragraph}>{p}</p>)}
        </div>
      </div>

      {/* Animated Stats */}
      {data.stats?.length ? (
        <div ref={statsRef} className={s.statsGrid}>
          {data.stats.map((stat, i) => (
            <div key={i} className={s.statCard}>
              <span data-counter className={s.statValue}>0{stat.suffix}</span>
              <span className={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
