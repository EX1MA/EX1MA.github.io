import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../animations/gsap';
import { useReveal } from '../animations/useReveal';
import { prefersReducedMotion } from '../utils/motion';
import s from './AboutSection.module.css';
import profilePic from '../assets/profile.jpg';
import type { Stat } from '../types';
import { CV_URL } from './ExperienceSection';

// Foto real para el reverso de la tarjeta: basta con guardar
// src/assets/photo.jpg (o .png / .webp) y se usa automáticamente.
const photos = import.meta.glob<string>('../assets/photo.{jpg,jpeg,png,webp}', {
  eager: true, import: 'default',
});
const realPhoto = Object.values(photos)[0];

interface AboutData { text: string[]; stats?: Stat[]; }
interface AboutSectionProps { data?: AboutData; }

export const AboutSection = ({ data }: AboutSectionProps) => {
  const sectionRef  = useRef<HTMLElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);

  const [flipped, setFlipped] = useState(false);

  useReveal(sectionRef, [data]);

  useGSAP(() => {
    const section = sectionRef.current, image = imageRef.current, statsBox = statsRef.current;
    if (!section || !image) return;
    const counters = statsBox ? gsap.utils.toArray<HTMLElement>('[data-counter]', statsBox) : [];
    const stats = data?.stats ?? [];

    if (prefersReducedMotion()) {
      counters.forEach((el, i) => { if (stats[i]) el.textContent = stats[i].value + stats[i].suffix; });
      return;
    }

    // La tarjeta se descubre como una cortina y la imagen se asienta desde un zoom
    const flip = image.querySelector('[data-flip]');
    gsap.timeline({ scrollTrigger: { trigger: image, start: 'top 80%', once: true } })
      .fromTo(flip,
        { clipPath: 'inset(100% 0% 0% 0% round 24px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from(image.querySelectorAll('[data-front] img'), { scale: 1.35, duration: 1.6, ease: 'expo.out' }, 0.2)
      .from(image.querySelectorAll('[data-deco]'), { autoAlpha: 0, scale: 0.8, duration: 1, stagger: 0.1 }, 0.5);

    // Parallax suave de la imagen mientras la sección cruza la pantalla
    gsap.to(image, {
      y: -40, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
    });

    // Tarjetas de cifras + contadores
    if (statsBox && counters.length) {
      gsap.from(statsBox.children, {
        autoAlpha: 0, y: 60, rotationX: -35, transformOrigin: '50% 100%',
        duration: 1, stagger: 0.12, ease: 'expo.out', clearProps: 'transform,translate,rotate,scale', // deja libre el hover
        scrollTrigger: { trigger: statsBox, start: 'top 88%', once: true },
      });
      stats.forEach((stat, i) => {
        const el = counters[i];
        if (!el) return;
        const obj = { val: 0 };
        // el zorro guía mira los números mientras suben y brinca al terminar
        const first = i === 0, last = i === stats.length - 1;
        gsap.to(obj, {
          val: stat.value, duration: 2.2, ease: 'expo.out',
          onStart: () => { if (first) window.dispatchEvent(new Event('fox:count-start')); },
          onComplete: () => { if (last) window.dispatchEvent(new Event('fox:count-end')); },
          onUpdate: () => { el.textContent = Math.round(obj.val) + stat.suffix; },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
    }
  }, { scope: sectionRef, dependencies: [data], revertOnUpdate: true });

  if (!data?.text) return null;

  return (
    <section id="about" ref={sectionRef} className="section-container">
      <div className={s.header}>
        <span className="section-label" data-reveal="label">Mi Historia</span>
        <h2 className="section-title" data-reveal="title">Sobre <em>Mí</em></h2>
      </div>

      {/* Profile + Text */}
      <div className={s.grid}>
        <div ref={imageRef} className={s.imageWrap}>
          <button
            type="button"
            data-flip
            className={`${s.flipCard} ${flipped ? s.flipped : ''}`}
            onClick={() => { setFlipped(f => !f); window.dispatchEvent(new Event('fox:react')); }}
            aria-pressed={flipped}
            aria-label={flipped ? 'Mostrar ilustración' : 'Mostrar foto'}
          >
            <span className={s.flipInner}>
              <span data-front className={`${s.face} ${s.front}`}>
                <img src={profilePic} alt="Ilustración de Joel Contreras" className={s.profileImg} />
              </span>
              <span className={`${s.face} ${s.back}`}>
                {realPhoto ? (
                  <img src={realPhoto} alt="Foto de Joel Contreras" className={s.profileImg} />
                ) : (
                  <span className={s.monogram} aria-hidden="true">
                    <span className={s.monogramInitials}>JC</span>
                    <span className={s.monogramName}>Joel Contreras</span>
                  </span>
                )}
              </span>
            </span>
            <span className={s.flipHint} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
              </svg>
              {flipped ? 'Volver' : 'Gírame'}
            </span>
          </button>
          <div data-deco className={s.imageBorder} />
          <div data-deco className={s.imageDecor} />
        </div>

        <div className={s.textWrap}>
          {data.text.map((p, i) => <p key={i} data-reveal="lines" className={s.paragraph}>{p}</p>)}
          <a href={CV_URL} download data-reveal="up" className={s.cvLink}>
            Descargar CV (PDF)
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          </a>
        </div>
      </div>

      {/* Animated Stats */}
      {data.stats?.length ? (
        <div ref={statsRef} className={s.statsGrid} style={{ perspective: 900 }}>
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
