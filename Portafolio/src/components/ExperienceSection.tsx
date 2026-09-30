import { motion } from 'framer-motion';
import s from './ExperienceSection.module.css';
import { certifications, education, experience, languages } from '../data/experience';

export const CV_URL = `${import.meta.env.BASE_URL}cv-joel-contreras.pdf`;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
};

export const ExperienceSection = () => (
  <section id="experience" className="section-container">
    <motion.div className={s.header} {...fadeUp} transition={{ duration: 0.6, ease: 'easeOut' }}>
      <div>
        <span className="section-label">Trayectoria</span>
        <h2 className="section-title">Experiencia y Formación</h2>
        <p className="section-subtitle">
          Más de 10 años entre el diseño gráfico y el desarrollo frontend.
        </p>
      </div>
      <a href={CV_URL} download className={s.cvBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        Descargar CV
      </a>
    </motion.div>

    <div className={s.layout}>
      {/* Experiencia */}
      <ol className={s.timeline}>
        {experience.map((job, i) => (
          <motion.li
            key={job.company}
            className={`${s.item} ${job.current ? s.current : ''}`}
            {...fadeUp}
            transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
          >
            <span className={s.dot} aria-hidden="true" />
            <div className={s.itemHead}>
              <h3 className={s.role}>{job.role}</h3>
              <span className={s.period}>{job.period}</span>
            </div>
            <p className={s.company}>
              {job.company}{job.place && <span className={s.place}> — {job.place}</span>}
            </p>
            <p className={s.desc}>{job.description}</p>
          </motion.li>
        ))}
      </ol>

      {/* Formación */}
      <div className={s.aside}>
        <motion.div className={s.card} {...fadeUp} transition={{ duration: 0.5, ease: 'easeOut' }}>
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
        </motion.div>

        <motion.div className={s.card} {...fadeUp} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}>
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
        </motion.div>

        <motion.div className={s.card} {...fadeUp} transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}>
          <h3 className={s.cardTitle}>Idiomas</h3>
          <ul className={s.langs}>
            {languages.map(l => (
              <li key={l.name}>
                <span>{l.name}</span>
                <span className={s.level}>{l.level}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);
