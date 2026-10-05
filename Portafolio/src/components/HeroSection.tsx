import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../animations/gsap';
import heroStyles from './HeroSection.module.css';
import { prefersReducedMotion } from '../utils/motion';
import { HeroRibbons } from './HeroRibbons';

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
}
interface HeroSectionProps { data: HeroData; introDelay?: number; }

/* ── Magnetic Button ─────────────────────── */
const MagneticButton = ({
  children, className, onClick,
}: { children: React.ReactNode; className: string; onClick: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const pull = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  // El botón se deja "atraer" por el cursor; quickTo reutiliza un tween por eje
  useGSAP(() => {
    pull.current = {
      x: gsap.quickTo(ref.current, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
      y: gsap.quickTo(ref.current, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
    };
  }, { scope: ref });

  const onMove = (e: React.MouseEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    pull.current?.x((e.clientX - box.left - box.width  / 2) * 0.32);
    pull.current?.y((e.clientY - box.top  - box.height / 2) * 0.32);
  };

  const onLeave = () => { pull.current?.x(0); pull.current?.y(0); };

  return (
    <button ref={ref} className={className} onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </button>
  );
};

// Profundidad de cada forma para el parallax con el mouse (más alto = se mueve más)
const SHAPE_DEPTHS = [0.9, 0.6, 1.4, 0.4, 1.1, 0.7, 1.6, 0.5];

/* ── Main Component ──────────────────────── */
export const HeroSection = ({ data, introDelay = 0.15 }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP((_context, contextSafe) => {
    const root = sectionRef.current;
    if (!root || !contextSafe) return;
    const q = gsap.utils.selector(root);

    // El degradado del apellido se reparte entre sus letras para que se vea continuo
    const paintGradient = () => {
      q('[data-gradient]').forEach((word: HTMLElement) => {
        const w = word.offsetWidth;
        word.querySelectorAll<HTMLElement>('[data-char]').forEach(ch => {
          ch.style.backgroundSize = `${w}px 100%`;
          ch.style.backgroundPosition = `${-ch.offsetLeft}px 0`;
        });
      });
    };
    paintGradient();
    window.addEventListener('resize', paintGradient);
    if (prefersReducedMotion()) return () => window.removeEventListener('resize', paintGradient);

    const shapes = q('[data-shape]');

    // Formas flotando en bucle (x/y) — independientes del parallax (xPercent/yPercent)
    shapes.forEach((el, i) => {
      gsap.to(el, {
        x: gsap.utils.random(-50, 50), y: gsap.utils.random(-60, 60),
        rotation: gsap.utils.random(-25, 25), scale: gsap.utils.random(0.85, 1.15),
        duration: gsap.utils.random(5, 9), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.4,
      });
    });

    // ── Entrada ── (espera a la fuente para que SplitText corte bien las líneas)
    const content = q('[data-content]');
    gsap.set(content, { autoAlpha: 0 });
    const intro = contextSafe(() => {
    gsap.set(content, { autoAlpha: 1 });
    const subtitle = SplitText.create(q('[data-subtitle]'), { type: 'words', mask: 'words' });
    const desc     = SplitText.create(q('[data-desc]'), { type: 'lines', mask: 'lines' });

    const tl = gsap.timeline({ delay: introDelay, defaults: { ease: 'expo.out' } });
    tl.from(shapes, { autoAlpha: 0, scale: 0, duration: 1.4, stagger: { each: 0.06, from: 'random' }, ease: 'back.out(1.6)' }, 0)
      .from(q('[data-pretitle]'), { autoAlpha: 0, y: 24, scale: 0.9, duration: 0.8 }, 0.1)
      .from(q('[data-char]'), {
        yPercent: 115, rotationX: -85, autoAlpha: 0, transformOrigin: '50% 100% -20px',
        duration: 1.2, stagger: 0.04,
      }, 0.2)
      .from(subtitle.words, { yPercent: 110, duration: 0.9, stagger: 0.05 }, '-=0.85')
      .from(desc.lines, { yPercent: 105, duration: 0.9, stagger: 0.09 }, '-=0.7')
      .from(q('[data-cta] > *'), { autoAlpha: 0, y: 26, scale: 0.92, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.6')
      .from(q('[data-scroll-indicator]'), { autoAlpha: 0, y: -12, duration: 0.8 }, '-=0.3');

    // ── Al salir con el scroll: el contenido sube y se desvanece, las formas se separan ──
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 } })
      .to(q('[data-content]'), { y: -120, autoAlpha: 0, scale: 0.96, ease: 'none' }, 0)
      .to(q('[data-shapes]'), { y: 160, ease: 'none' }, 0)
      .to(q('[data-ribbons]'), { autoAlpha: 0, yPercent: 12, ease: 'none' }, 0);
    });
    let alive = true; // si el componente se limpia antes de que cargue la fuente, no se ejecuta
    document.fonts.ready.then(() => { if (alive) intro(); });

    gsap.to(q('[data-scroll-mouse]'), { y: 9, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // ── Parallax con el mouse: cada forma se desplaza según su profundidad ──
    const movers = shapes.map((el, i) => ({
      x: gsap.quickTo(el, 'xPercent', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'yPercent', { duration: 1.2, ease: 'power3.out' }),
      d: SHAPE_DEPTHS[i % SHAPE_DEPTHS.length],
    }));
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach(m => { m.x(nx * m.d * 40); m.y(ny * m.d * 40); });
    };
    root.addEventListener('pointermove', onPointer);

    ScrollTrigger.refresh();
    return () => {
      alive = false;
      window.removeEventListener('resize', paintGradient);
      root.removeEventListener('pointermove', onPointer);
    };
  }, { scope: sectionRef, dependencies: [data, introDelay], revertOnUpdate: true });

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const titleWords = data.title.split(' ');

  return (
    <section id="hero" ref={sectionRef} className={heroStyles.hero}>

      {/* ── Animated mesh background ── */}
      <div className={heroStyles.mesh} aria-hidden="true" />

      {/* ── Cintas de luz (WebGL) ── */}
      <HeroRibbons />

      {/* ── Floating GSAP shapes ── */}
      <div data-shapes className={heroStyles.shapes} aria-hidden="true">
        {['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map(k => (
          <div key={k} data-shape className={`${heroStyles.shape} ${heroStyles[k]}`} />
        ))}
      </div>

      {/* ── Content ── */}
      <div data-content className={heroStyles.content}>

        <p data-pretitle className={heroStyles.preTitle}>
          <span className={heroStyles.preTitleDot} />
          Disponible para proyectos
        </p>

        {/* Letra por letra con giro 3D */}
        <h1 className={heroStyles.title} aria-label={data.title}>
          {titleWords.map((word, i) => (
            <span key={i} className={heroStyles.wordWrapper} aria-hidden="true">
              <span className={heroStyles.word} data-gradient={i === titleWords.length - 1 ? '' : undefined}>
                {[...word].map((ch, j) => (
                  <span key={j} data-char className={heroStyles.char}>{ch}</span>
                ))}
              </span>
            </span>
          ))}
        </h1>

        <h2 data-subtitle className={heroStyles.subtitle}>
          {data.subtitle}
        </h2>

        <p data-desc className={heroStyles.description}>
          {data.description}
        </p>

        <div data-cta className={heroStyles.buttons}>
          <MagneticButton className={heroStyles.primaryBtn} onClick={() => scrollTo('projects')}>
            {data.buttonText}
            <svg className={heroStyles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </MagneticButton>

          <MagneticButton className={heroStyles.secondaryBtn} onClick={() => scrollTo('contact')}>
            Hablemos
          </MagneticButton>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <button
        data-scroll-indicator
        className={heroStyles.scrollIndicator}
        onClick={() => scrollTo('about')}
        aria-label="Scroll hacia abajo"
      >
        <div data-scroll-mouse className={heroStyles.scrollMouse}>
          <div className={heroStyles.scrollWheel} />
        </div>
        <span className={heroStyles.scrollText}>Explorar</span>
      </button>

    </section>
  );
};
