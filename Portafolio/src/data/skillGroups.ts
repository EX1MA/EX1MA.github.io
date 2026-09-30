// Niveles tomados de las barras del CV (cv-joel-contreras.pdf)
export interface SkillLevel { name: string; level: number; note?: string; }

export const frontendSkills: SkillLevel[] = [
  { name: 'HTML5 / CSS3', level: 88 },
  { name: 'TypeScript / JavaScript', level: 75 },
  { name: 'Angular', level: 70 },
  { name: 'Next.js / React', level: 65 },
  { name: 'Python / Vite', level: 58 },
  { name: 'AWS', level: 35, note: 'En formación' },
];

export const designSkills: SkillLevel[] = [
  { name: 'Photoshop', level: 92 },
  { name: 'Illustrator', level: 88 },
  { name: 'Figma / UI Design', level: 85 },
  { name: 'After Effects', level: 78 },
  { name: 'InDesign / Premiere', level: 72 },
  { name: 'Cinema 4D', level: 65 },
];

export const softSkills = ['Creatividad', 'Liderazgo', 'Aprendizaje continuo', 'Trabajo en equipo', 'Pensamiento UX'];
