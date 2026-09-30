import { useState, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
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

import { portfolioData } from './data/portfolioData';
import './global.css'; 
import appStyles from './App.module.css';
import type { Role } from './types';

function App() {
  const [role, setRole] = useState<Role>('developer');
  
  const currentData = portfolioData[role];

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', currentData.themeColor);
  }, [role, currentData.themeColor]);

  return (
    <MotionConfig reducedMotion="user">
    <div className={appStyles.appContainer}>
      <CustomCursor />
      <ScrollProgress />
      
      <Navbar currentRole={role} onSwitchRole={setRole} />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={role}
          initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
          // filter vuelve a 'none' al terminar: un filter en <main> rompe el pin
          // (position: fixed) del scroll horizontal de Proyectos
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <HeroSection data={currentData.hero} />
          <AboutSection data={currentData.about} /> 
          <SkillsSection skillsList={currentData.skills} />
          <ProjectsSection projectsList={currentData.projects} />
          <ExperienceSection />
          <ContactSection />
        </motion.main>
      </AnimatePresence>
      
      <Footer />
      <ScrollToTop />
    </div>
    </MotionConfig>
  );
}

export default App;