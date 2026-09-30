import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import heroStyles from './HeroSection.module.css';

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
}
interface HeroSectionProps { data: HeroData; }

/* ── Magnetic Button ─────────────────────── */
const MagneticButton = ({
  children, className, onClick,
}: { children: React.ReactNode; className: string; onClick: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el  = ref.current!;
    const box = el.getBoundingClientRect();
    const dx  = e.clientX - box.left - box.width  / 2;
    const dy  = e.clientY - box.top  - box.height / 2;
    gsap.to(el, { x: dx * 0.32, y: dy * 0.32, duration: 0.3, ease: 'power2.out' });
  };

  const onLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  );
};

/* ── Main Component ──────────────────────── */
export const HeroSection = ({ data }: HeroSectionProps) => {
  const shapesRef   = useRef<HTMLDivElement>(null);
  const preTitleRef = useRef<HTMLParagraphElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const descRef     = useRef<HTMLParagraphElement>(null);
  const buttonsRef  = useRef<HTMLDivElement>(null);
  const tlRef       = useRef<gsap.core.Timeline | null>(null);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /* Floating shapes (persistent) */
  useEffect(() => {
    if (!shapesRef.current) return;
    const els = gsap.utils.toArray<HTMLElement>(shapesRef.current.children);
    const tw = els.map((el, i) =>
      gsap.to(el, {
        x:        gsap.utils.random(-50, 50),
        y:        gsap.utils.random(-60, 60),
        rotation: gsap.utils.random(-25, 25),
        scale:    gsap.utils.random(0.85, 1.15),
        duration: gsap.utils.random(5, 9),
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.4,
      })
    );
    return () => { tw.forEach(t => t.kill()); };
  }, []);

  /* Entrance timeline (re-runs on role switch via remount) */
  useEffect(() => {
    if (!data) return;
    if (tlRef.current) tlRef.current.kill();

    // Get word spans inside the h1
    const words = titleRef.current
      ? Array.from(titleRef.current.querySelectorAll('[data-word]'))
      : [];

    const btnChildren = buttonsRef.current
      ? Array.from(buttonsRef.current.children)
      : [];

    // Set initial states
    gsap.set(preTitleRef.current, { opacity: 0, y: 24 });
    gsap.set(words,               { y: '110%' });
    gsap.set(subtitleRef.current, { opacity: 0, y: 28 });
    gsap.set(descRef.current,     { opacity: 0, y: 20 });
    gsap.set(btnChildren,         { opacity: 0, y: 18 });

    const tl = gsap.timeline({ delay: 0.15 });
    tlRef.current = tl;

    tl.to(preTitleRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
      .to(words,               { y: '0%',   duration: 0.85, stagger: 0.08, ease: 'power4.out' }, '-=0.2')
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, '-=0.45')
      .to(descRef.current,     { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.35')
      .to(btnChildren,         { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' }, '-=0.25');

    return () => { tl.kill(); };
  }, [data]);

  if (!data) return <div style={{ padding: 100, color: 'red' }}>Error: Faltan datos del Hero</div>;

  const titleWords = data.title.split(' ');

  return (
    <section id="hero" className={heroStyles.hero}>

      {/* ── Animated mesh background ── */}
      <div className={heroStyles.mesh} aria-hidden="true" />

      {/* ── Floating GSAP shapes ── */}
      <div ref={shapesRef} className={heroStyles.shapes} aria-hidden="true">
        <div className={`${heroStyles.shape} ${heroStyles.s1}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s2}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s3}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s4}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s5}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s6}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s7}`} />
        <div className={`${heroStyles.shape} ${heroStyles.s8}`} />
      </div>

      {/* ── Content ── */}
      <div className={heroStyles.content}>

        <p ref={preTitleRef} className={heroStyles.preTitle}>
          <span className={heroStyles.preTitleDot} />
          Disponible para proyectos
        </p>

        {/* Word-by-word reveal */}
        <h1 ref={titleRef} className={heroStyles.title}>
          {titleWords.map((word, i) => (
            <span key={i} className={heroStyles.wordWrapper}>
              <span data-word className={heroStyles.word}>{word}</span>
            </span>
          ))}
        </h1>

        <h2 ref={subtitleRef} className={heroStyles.subtitle}>
          {data.subtitle}
        </h2>

        <p ref={descRef} className={heroStyles.description}>
          {data.description}
        </p>

        <div ref={buttonsRef} className={heroStyles.buttons}>
          <MagneticButton
            className={heroStyles.primaryBtn}
            onClick={() => scrollTo('projects')}
          >
            {data.buttonText}
            <svg className={heroStyles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </MagneticButton>

          <MagneticButton
            className={heroStyles.secondaryBtn}
            onClick={() => scrollTo('contact')}
          >
            Hablemos
          </MagneticButton>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        className={heroStyles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        onClick={() => scrollTo('about')}
        aria-label="Scroll hacia abajo"
      >
        <motion.div
          className={heroStyles.scrollMouse}
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={heroStyles.scrollWheel} />
        </motion.div>
        <span className={heroStyles.scrollText}>Explorar</span>
      </motion.button>

    </section>
  );
};
