import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../animations/gsap';
import { useReveal } from '../animations/useReveal';
import { prefersReducedMotion } from '../utils/motion';
import s from './ContactSection.module.css';

const CONTACT_EMAIL = 'joelc309@gmail.com';
// Web3Forms reenvía los mensajes a joelc309@gmail.com. La access key es
// pública por diseño: solo permite enviar a ese correo.
const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_KEY = '487867e3-52dd-488f-bafb-8ade429a3f0e';

export const ContactSection = () => {
  const form    = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState('');

  useReveal(sectionRef);

  // El aviso de éxito o error aparece con un pequeño rebote
  useGSAP(() => {
    if (status !== 'success' && status !== 'error') return;
    if (prefersReducedMotion()) return;
    gsap.from('[data-status]', { autoAlpha: 0, y: 12, scale: 0.97, duration: 0.6, ease: 'back.out(2)' });
  }, { scope: sectionRef, dependencies: [status] });

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;
    setStatus('sending');

    const data = new FormData(form.current);
    // Campo trampa: los bots lo llenan, las personas no lo ven
    if (data.get('_honey')) { setStatus('success'); return; }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject:    `Nuevo mensaje del portafolio — ${data.get('user_name')}`,
          from_name:  'Portafolio ex1ma.github.io',
          name:       data.get('user_name'),
          email:      data.get('user_email'), // Web3Forms lo usa como Reply-To
          message:    data.get('message'),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success !== true) throw new Error(json.message);
      setStatus('success');
      form.current.reset();
      window.dispatchEvent(new Event('fox:celebrate')); // el zorro guía celebra
    } catch {
      // Si el servicio falla, el mismo mensaje se puede mandar por correo
      const subject = `Mensaje del portafolio — ${data.get('user_name')}`;
      const body = `${data.get('message')}\n\n— ${data.get('user_name')} (${data.get('user_email')})`;
      setFallback(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      setStatus('error');
    }
  };

  // Animate input border on focus
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    gsap.to(e.currentTarget, { '--border-glow': '1', duration: 0.3 });
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    gsap.to(e.currentTarget, { '--border-glow': '0', duration: 0.3 });
  };


  return (
    <section id="contact" ref={sectionRef} className="section-container">
      <div className={s.header}>
        <span className="section-label" data-reveal="label">Contacto</span>
        <h2 className="section-title" data-reveal="title">¿Tienes un <em>proyecto</em>?</h2>
        <p className="section-subtitle" data-reveal="lines">
          Cuéntame tu idea. Respondo en menos de 24 horas.
        </p>
      </div>

      <div className={s.layout}>
        {/* Info column */}
        <div className={s.infoCol}>
          {[
            { icon: '✉', label: 'Email', value: 'joelc309@gmail.com' },
            { icon: '📍', label: 'Ubicación', value: 'Naucalpan, Edo. Méx. · Remoto' },
            { icon: '⚡', label: 'Disponibilidad', value: 'Abierto a proyectos' },
          ].map(item => (
            <div key={item.label} className={s.infoItem} data-reveal="up">
              <span className={s.infoIcon}>{item.icon}</span>
              <div>
                <p className={s.infoLabel}>{item.label}</p>
                <p className={s.infoValue}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form column */}
        <form
          ref={form}
          onSubmit={sendEmail}
          className={s.form}
        >
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />

          <div className={s.row} data-reveal="up">
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
          </div>

          <div className={s.field} data-reveal="up">
            <label className={s.label}>Mensaje</label>
            <textarea
              name="message" rows={5} required
              className={s.textarea}
              placeholder="Cuéntame tu proyecto..."
              onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          <div data-reveal="up">
            <button
              type="submit"
              className={s.submitBtn}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar Mensaje'}
              {status !== 'sending' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              )}
            </button>

            {status === 'success' && (
              <p
                data-status
                role="status"
                className={s.successMsg}
              >
                ✓ ¡Mensaje enviado! Te responderé pronto.
              </p>
            )}
            {status === 'error' && (
              <p
                data-status
                role="status"
                className={s.errorMsg}
              >
                ✕ No se pudo enviar desde aquí.{' '}
                <a href={fallback} className={s.fallbackLink}>Envíalo por correo</a>{' '}
                (ya va escrito) o intenta de nuevo.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};
