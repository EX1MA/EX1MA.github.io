import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import emailjs from '@emailjs/browser';
import gsap from 'gsap';
import s from './ContactSection.module.css';

export const ContactSection = () => {
  const form    = useRef<HTMLFormElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const isInView = useInView(headerRef, { once: true, amount: 0.4 });

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    if (form.current) {
      emailjs.sendForm('TU_SERVICE_ID', 'TU_TEMPLATE_ID', form.current, 'TU_PUBLIC_KEY')
        .then(() => {
          setStatus('success');
          form.current?.reset();
        })
        .catch(() => setStatus('error'));
    }
  };

  // Animate input border on focus
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    gsap.to(e.currentTarget, { '--border-glow': '1', duration: 0.3 });
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    gsap.to(e.currentTarget, { '--border-glow': '0', duration: 0.3 });
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden:   { opacity: 0, y: 30 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section id="contact" className="section-container">
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={s.header}
      >
        <span className="section-label">Contacto</span>
        <h2 className="section-title">¿Tienes un proyecto?</h2>
        <p className="section-subtitle">
          Cuéntame tu idea. Respondo en menos de 24 horas.
        </p>
      </motion.div>

      <div className={s.layout}>
        {/* Info column */}
        <motion.div
          className={s.infoCol}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {[
            { icon: '✉', label: 'Email', value: 'joelc309@gmail.com' },
            { icon: '📍', label: 'Ubicación', value: 'Naucalpan, Edo. Méx. · Remoto' },
            { icon: '⚡', label: 'Disponibilidad', value: 'Abierto a proyectos' },
          ].map(item => (
            <motion.div key={item.label} className={s.infoItem} variants={itemVariants}>
              <span className={s.infoIcon}>{item.icon}</span>
              <div>
                <p className={s.infoLabel}>{item.label}</p>
                <p className={s.infoValue}>{item.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Form column */}
        <motion.form
          ref={form}
          onSubmit={sendEmail}
          className={s.form}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div className={s.row} variants={itemVariants}>
            <div className={s.field}>
              <label className={s.label}>Nombre</label>
              <input
                type="text" name="user_name" required
                className={s.input}
                placeholder="Tu nombre"
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Email</label>
              <input
                type="email" name="user_email" required
                className={s.input}
                placeholder="tu@email.com"
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </motion.div>

          <motion.div className={s.field} variants={itemVariants}>
            <label className={s.label}>Mensaje</label>
            <textarea
              name="message" rows={5} required
              className={s.textarea}
              placeholder="Cuéntame tu proyecto..."
              onFocus={onFocus} onBlur={onBlur}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              className={s.submitBtn}
              disabled={status === 'sending'}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar Mensaje'}
              {status !== 'sending' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              )}
            </motion.button>

            {status === 'success' && (
              <motion.p
                className={s.successMsg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✓ ¡Mensaje enviado! Te responderé pronto.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                className={s.errorMsg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✕ Error al enviar. Intenta de nuevo.
              </motion.p>
            )}
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
};
