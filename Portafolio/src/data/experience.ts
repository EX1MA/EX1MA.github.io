import type { Certification, Education, Experience } from '../types';

export const experience: Experience[] = [
  {
    role: 'Frontend Developer',
    company: 'Miatech International SAC',
    period: 'Dic 2021 — Actual',
    current: true,
  },
  {
    role: 'Diseñador Gráfico · Frontend Developer',
    company: 'Mayahual',
    period: '2022 — 2024',
    description: 'Diseño de recursos visuales, maquetado y desarrollo del sitio web, mantenimiento de elementos del sitio e implementación de mejoras en la experiencia de usuario.',
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Ayuntamiento de Naucalpan',
    place: 'Naucalpan, Edo. Méx.',
    period: 'Jun 2020 — May 2023',
    description: 'Creación de contenido para comunicación interna, administración de material digital y asistencia a eventos relacionados con los proyectos del ayuntamiento.',
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Porto MX',
    place: 'Azcapotzalco, CDMX',
    period: 'Feb 2020 — Abr 2020',
    description: 'Manejo de identidades corporativas de filiales. Creación de contenido gráfico interno y externo y material para distintos clientes, incluyendo producción de video y redes sociales. Colaboración en eventos y activaciones de marca en coordinación con el área de marketing.',
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Sonido Absoluto S.A. de C.V.',
    place: 'Vallejo, CDMX',
    period: 'Sep 2018 — Nov 2018',
    description: 'Gestión de identidad corporativa y marcas. Diseño de catálogos digitales, empaque y etiquetas; recorte y fotografía de producto; materiales para redes sociales e impresión.',
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Visión Comercial Deportiva (Wilson)',
    place: 'Tlalnepantla, Edo. Méx.',
    period: 'Mar 2017 — Mar 2018',
    description: 'Optimización de material de impresión, coordinación de personal para agilizar procesos de producción, soporte de imagen corporativa y conocimiento del proceso de estampado textil.',
  },
  {
    role: 'Diseñador Gráfico Independiente',
    company: 'Kabuto-art (Autónomo)',
    place: 'Naucalpan y alrededores, Edo. Méx.',
    period: 'Feb 2016 — Abr 2017',
    description: 'Vectorización e ilustración digital, creación de identidad corporativa (logotipo, manual de identidad), ilustración para clientes y preparación de archivos para impresión y corte en distintos soportes.',
  },
  {
    role: 'Servicio Social',
    company: 'Ayuntamiento de Naucalpan',
    place: 'Edo. Méx.',
    period: '2016',
    description: 'Creación de publicidad para campañas institucionales, uso de imagen corporativa y elaboración de montajes con recursos impartidos por la organización.',
  },
];

export const education: Education[] = [
  { year: '2013 — 2016', title: 'Título en Diseño Gráfico', school: 'Universidad UNIMEX' },
  { year: '2011', title: 'Certificado Técnico en Computación', school: 'Preparatoria Universidad ICEL' },
];

export const certifications: Certification[] = [
  {
    year: '2025',
    title: 'Google UX Design Professional Certificate',
    issuer: 'Google · Coursera',
    note: 'Incluye fundamentos de IA aplicada a UX',
  },
  {
    year: '2023',
    title: 'Oracle Next Education — Front End',
    issuer: 'Oracle · Alura Latam',
    note: 'Programa completo de desarrollo frontend',
  },
];

export const languages = [
  { name: 'Español', level: 'Nativo' },
  { name: 'Inglés', level: 'Básico — Intermedio' },
];
