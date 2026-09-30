
export type Role = 'developer' | 'designer';

export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  technologies: string[];
  features?: string[];
  client?: string;
  /** Si no hay enlace, el botón no se muestra */
  demoLink?: string;
  demoLabel?: string;
  repoLink?: string;
  year?: number;
  status?: 'Completado' | 'En Desarrollo' | 'Mantenimiento' | 'Concepto';
  category?: string;
  highlight?: boolean;
}

export interface Skill {
  name: string;
  icon: string;
}

export interface Stat {
  value: number;
  label: string;
  suffix: string;
}

export interface Experience {
  role: string;
  company: string;
  place?: string;
  period: string;
  description: string;
  current?: boolean;
}

export interface Education {
  year: string;
  title: string;
  school: string;
}

export interface Certification {
  year: string;
  title: string;
  issuer: string;
  note?: string;
}
