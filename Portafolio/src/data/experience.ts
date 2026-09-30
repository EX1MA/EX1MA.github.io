import type { Certification, Education, Experience } from '../types';

export const experience: Experience[] = [
  {
    role: 'Diseñador Gráfico · Frontend Developer',
    company: 'Mayahual',
    period: '2022 — Actual',
    description: 'Diseño de recursos visuales, maquetado y desarrollo del sitio web, mantenimiento de elementos del sitio e implementación de mejoras en la experiencia de usuario.',
    current: true,
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Porto MX',
    place: 'Azcapotzalco, CDMX',
    period: '2020',
    description: 'Manejo de identidades corporativas de filiales. Creación de contenido para redes sociales, producción de videos para clientes y asistencia a activaciones de marca.',
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Sonido Absoluto S.A. de C.V.',
    place: 'Vallejo, CDMX',
    period: '2018',
    description: 'Gestión de identidad corporativa y marcas. Diseño de empaque, etiquetas, catálogos digitales y materiales para redes sociales e impresión.',
  },
  {
    role: 'Becario — Diseñador Gráfico',
    company: 'Visión Comercial Deportiva (Wilson)',
    place: 'Tlalnepantla, Edo. Méx.',
    period: '2017 — 2018',
    description: 'Optimización de material de impresión, coordinación de personal para agilizar procesos de producción, soporte de imagen corporativa y conocimiento del proceso de estampado textil.',
  },
  {
    role: 'Diseñador Gráfico',
    company: 'Kabuto-art (proyecto personal)',
    place: 'CDMX',
    period: '2015 — 2017',
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
  { year: '2016', title: 'Título en Diseño Gráfico', school: 'Universidad UNIMEX' },
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
