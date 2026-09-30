import { useRef } from 'react';
import { gsap, useGSAP } from '../animations/gsap';
import { useReveal } from '../animations/useReveal';
import { prefersReducedMotion } from '../utils/motion';
import s from './ExperienceSection.module.css';
import { certifications, education, experience, languages } from '../data/experience';

export const CV_URL = `${import.meta.env.BASE_URL}cv-joel-contreras.pdf`;

export const ExperienceSection = () => {
  const sectionRef  = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLOListElement>(null);

  useReveal(sectionRef);

  useGSAP(() => {
    const list = timelineRef.current;
    if (!list || prefersReducedMotion()) return;

    // La línea se dibuja conforme se recorre la trayectoria
    gsap.fromTo(list.querySelector('[data-line]'), { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 65%', scrub: 0.8 },
    });

    // Cada puesto entra desde la izquierda y su punto se "enciende" al alcanzarlo
    gsap.utils.toArray<HTMLElement>('[data-job]', list).forEach(job => {
      gsap.timeline({ scrollTrigger: { trigger: job, start: 'top 75%', once: true } })
        .from(job.querySelector('[data-dot]'), { scale: 0, duration: 0.6, ease: 'back.out(3)' })
        .from(job.querySelectorAll('[data-job-part]'), {
          autoAlpha: 0, x: -30, duration: 0.8, stagger: 0.07, ease: 'expo.out',
        }, 0.05);
    });
  }, { scope: sectionRef });

  return (
  <section id="experience" ref={sectionRef} className="section-container">
    <div className={s.header}>
      <div>
        <span className="section-label" data-reveal="label">Trayectoria</span>
        <h2 className="section-title" data-reveal="title">Experiencia y Formación</h2>
        <p className="section-subtitle" data-reveal="lines">
          Más de 10 años entre el diseño gráfico y el desarrollo frontend.
        </p>
      </div>
      <a href={CV_URL} download data-reveal="up" className={s.cvBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        Descargar CV
      </a>
    </div>

    <div className={s.layout}>
      {/* Experiencia */}
      <ol ref={timelineRef} className={s.timeline}>
        <li data-line role="presentation" className={s.lineFill} />
        {experience.map(job => (
          <li
            key={job.company}
            data-job
            className={`${s.item} ${job.current ? s.current : ''}`}
          >
            <span data-dot className={s.dot} aria-hidden="true" />
            <div data-job-part className={s.itemHead}>
              <h3 className={s.role}>{job.role}</h3>
              <span className={s.period}>{job.period}</span>
            </div>
            <p data-job-part className={s.company}>
              {job.company}{job.place && <span className={s.place}> — {job.place}</span>}
            </p>
            <p data-job-part className={s.desc}>{job.description}</p>
          </li>
        ))}
      </ol>

      {/* Formación */}
      <div className={s.aside}>
        <div className={s.card} data-reveal="up">
          <h3 className={s.cardTitle}>Certificaciones</h3>
          <ul className={s.list}>
            {certifications.map(c => (
              <li key={c.title} className={s.cert}>
                <span className={s.certBadge} aria-hidden="true">{c.issuer.charAt(0)}</span>
                <div>
                  <p className={s.listTitle}>{c.title}</p>
                  <p className={s.listSub}>{c.issuer}{c.note && ` — ${c.note}`}</p>
                  <p className={s.year}>{c.year}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.card} data-reveal="up">
          <h3 className={s.cardTitle}>Educación</h3>
          <ul className={s.list}>
            {education.map(e => (
              <li key={e.title}>
                <p className={s.year}>{e.year}</p>
                <p className={s.listTitle}>{e.title}</p>
                <p className={s.listSub}>{e.school}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.card} data-reveal="up">
          <h3 className={s.cardTitle}>Idiomas</h3>
          <ul className={s.langs}>
            {languages.map(l => (
              <li key={l.name}>
                <span>{l.name}</span>
                <span className={s.level}>{l.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);
};
