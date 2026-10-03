import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/ScrollProgress';
import { CustomCursor } from './components/CustomCursor';
import { ScrollToTop } from './components/ScrollToTop';
import { FoxGuide } from './components/FoxGuide/FoxGuide';
import { MobileDock } from './components/MobileDock';

import { gsap, ScrollTrigger, SplitText } from './animations/gsap';
import { prefersReducedMotion } from './utils/motion';
import { portfolioData } from './data/portfolioData';
import './global.css';
import appStyles from './App.module.css';
import type { Role } from './types';

const ROLE_LABEL: Record<Role, string> = { developer: '</> Dev', designer: '✦ Diseño' };

function App() {
  const [role, setRole] = useState<Role>('developer');
  // La entrada del hero espera a que se levante la cortina tras un cambio de perfil
  const [introDelay, setIntroDelay] = useState(0.15);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef   = useRef<HTMLParagraphElement>(null);
  const busy       = useRef(false);

  const currentData = portfolioData[role];

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', currentData.themeColor);
    // La altura de la página cambia con el perfil: recalcula los ScrollTriggers
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [role, currentData.themeColor]);

  // Cortina de dos capas que barre la pantalla con el nombre del nuevo perfil
  // (App nunca se desmonta, así que la línea de tiempo no necesita limpieza)
  const switchRole = (next: Role) => {
    if (next === role || busy.current) return;
    if (prefersReducedMotion()) { setIntroDelay(0); setRole(next); return; }

    const overlay = overlayRef.current!;
    const label   = labelRef.current!;
    const layers  = overlay.querySelectorAll<HTMLElement>('[data-layer]');
    busy.current = true;

    label.textContent = ROLE_LABEL[next];
    const split = SplitText.create(label, { type: 'chars', mask: 'chars' });
    gsap.set(layers[1], { backgroundColor: portfolioData[next].themeColor });

    gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete: () => { split.revert(); busy.current = false; },
    })
      .set(overlay, { autoAlpha: 1 })
      .fromTo(layers, { yPercent: 100 }, { yPercent: 0, duration: 0.65, stagger: 0.09 })
      .from(split.chars, { yPercent: 120, duration: 0.55, stagger: 0.035, ease: 'expo.out' }, '-=0.25')
      .add(() => { setIntroDelay(0.7); setRole(next); })
      .to(split.chars, { yPercent: -120, duration: 0.4, stagger: 0.025, ease: 'expo.in' }, '+=0.3')
      .to(layers, { yPercent: -100, duration: 0.7, stagger: { each: 0.09, from: 'end' } }, '-=0.1')
      .set(overlay, { autoAlpha: 0 });
  };

  return (
    <div className={appStyles.appContainer}>
      <CustomCursor />
      <ScrollProgress />

      <Navbar currentRole={role} onSwitchRole={switchRole} />

      <main key={role}>
        <HeroSection data={currentData.hero} introDelay={introDelay} />
        <AboutSection data={currentData.about} />
        <SkillsSection skillsList={currentData.skills} role={role} />
        <ProjectsSection projectsList={currentData.projects} />
        <ExperienceSection />
        <ContactSection />
      </main>

      <Footer />
      <ScrollToTop />
      <MobileDock role={role} />
      <FoxGuide role={role} />

      <div ref={overlayRef} className={appStyles.roleOverlay} aria-hidden="true">
        <div data-layer className={appStyles.roleLayer} />
        <div data-layer className={`${appStyles.roleLayer} ${appStyles.roleLayerAccent}`}>
          <p ref={labelRef} className={appStyles.roleLabel} />
        </div>
      </div>
    </div>
  );
}

export default App;
