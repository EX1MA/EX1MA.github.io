import type { Project, Skill, Stat } from '../types';
import foxCard from '../assets/fox/zorro-card.png';

export interface RoleContent {
  themeColor: string;
  hero: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
  };
  about: {
    text: string[];
    stats: Stat[];
  };
  projects: Project[];
  skills: Skill[];
}

export const portfolioData: Record<'developer' | 'designer', RoleContent> = {
  developer: {
    themeColor: '#d35400',
    hero: {
      title: "Joel Contreras",
      subtitle: "Frontend Developer · Angular & React · UI/UX Móvil",
      description: "Desarrollo interfaces web responsivas con Angular, React y TypeScript, y diseño la experiencia UI/UX de apps móviles para Android e iOS: llevo cada proyecto desde el concepto visual hasta el código.",
      buttonText: "Ver Proyectos"
    },
    about: {
      text: [
        "Soy diseñador gráfico titulado por la UNIMEX y desarrollador frontend. Desde diciembre de 2021 trabajo como Frontend Developer en Miatech International, donde desarrollé el frontend del portal de facturación de Aeroméxico en México con Angular y TypeScript. De 2022 a 2024 también diseñé, desarrollé y mantuve el sitio web de Mayahual.",
        "Mi perfil mixto me permite llevar un proyecto desde la conceptualización visual hasta la implementación en código. Me formé en frontend con Oracle Next Education (Alura Latam), tengo el certificado de Google UX Design y actualmente me estoy formando en arquitectura cloud con AWS."
      ],
      stats: [
        { value: 4, label: "Años en Desarrollo Frontend", suffix: "+" },
        { value: 10, label: "Años en Diseño Gráfico", suffix: "+" },
        { value: 2, label: "Certificaciones", suffix: "" }
      ]
    },
    projects: [
      {
        id: 1,
        title: "Portal de Facturación México",
        client: "Aeroméxico · Miatech",
        description: "Desarrollo completo del frontend para el portal de facturación de Aeroméxico en México: interfaces responsivas e integración con APIs para un flujo de facturación eficiente.",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Angular", "TypeScript", "HTML5", "CSS3", "APIs REST"],
        features: [
          "Frontend completo del portal",
          "Interfaces responsivas",
          "Integración con APIs",
          "Flujo de facturación eficiente"
        ],
        status: "Completado",
        category: "Portal Web",
        highlight: true
      },
      {
        id: 2,
        title: "Portal Web — Lotes de Inversión",
        client: "Mayahual",
        description: "Diseño y desarrollo frontend del sitio institucional para la comercialización de lotes de inversión, con maquetado completo, recursos visuales propios y mantenimiento continuo.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
        technologies: ["HTML5", "CSS3", "JavaScript", "UI Design"],
        features: [
          "Diseño y maquetado completo del sitio",
          "Recursos visuales propios",
          "Mejoras de experiencia de usuario",
          "Mantenimiento continuo"
        ],
        year: 2022,
        status: "Completado",
        category: "Sitio Institucional"
      },
      {
        id: 3,
        title: "Landing Page — Torneos Kyokushin México",
        client: "Freelance",
        description: "Landing page para el registro e información de torneos de artes marciales. Diseño visual y desarrollo frontend completo.",
        image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1200&auto=format&fit=crop",
        technologies: ["HTML5", "CSS3", "JavaScript", "Vite"],
        features: [
          "Registro a torneos",
          "Información de eventos",
          "Diseño visual propio",
          "Desarrollo frontend completo"
        ],
        status: "Completado",
        category: "Landing Page"
      },
      {
        id: 4,
        title: "PC Remote",
        client: "Proyecto personal",
        description: "Web app instalable (PWA) para controlar la PC desde el celular: ratón, teclado, sonido, apps, archivos, terminal y pantalla en vivo. Servidor FastAPI accesible solo por HTTPS dentro de Tailscale.",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Python", "FastAPI", "PWA", "JavaScript", "Tailscale", "xterm.js"],
        features: [
          "Touchpad, teclado y atajos del sistema",
          "Control de música y volumen",
          "Envío de archivos y portapapeles",
          "Terminal real y pantalla en vivo"
        ],
        year: 2026,
        status: "Completado",
        category: "Web App · PWA"
      },
      {
        id: 5,
        title: "BuddyFinance",
        client: "Proyecto personal",
        description: "App Android de finanzas personales para controlar gastos, ingresos, créditos vehiculares, presupuestos y metas de ahorro. 100% local y sin conexión a internet.",
        image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Kotlin", "Jetpack Compose", "Material 3", "Room", "MVVM", "WorkManager"],
        features: [
          "Gastos, ingresos y presupuestos",
          "Gráficas y resumen mensual",
          "PIN y huella digital",
          "Widget y exportación a CSV"
        ],
        year: 2026,
        status: "Completado",
        category: "App Android"
      },
      {
        id: 6,
        title: "Habitus",
        client: "Proyecto personal",
        description: "App de hábitos personales con Kotlin Multiplatform: un solo código compartido para Android (Jetpack Compose) e iOS, con base de datos local multiplataforma.",
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Kotlin Multiplatform", "Jetpack Compose", "SQLDelight", "Clean Architecture"],
        features: [
          "Crear, editar y eliminar hábitos",
          "Seguimiento de progreso diario",
          "Base de datos local multiplataforma",
          "Código compartido Android / iOS"
        ],
        year: 2025,
        status: "En Desarrollo",
        category: "App Multiplataforma"
      },
      {
        id: 7,
        title: "Zorro guía de este portafolio",
        client: "Proyecto personal · este sitio",
        description: "La mascota en pixel art que te acompaña mientras navegas: un motor de animación propio en canvas que reacciona al scroll, al cursor, al tema y al formulario, y hasta brinca sobre el DOM.",
        image: foxCard,
        pixelArt: true,
        technologies: ["TypeScript", "Canvas 2D", "GSAP", "ScrollTrigger", "React"],
        features: [
          "Motor propio a resolución nativa de pixel art",
          "Reacciona al scroll, el cursor, el tema y el formulario",
          "Acrobacias sobre elementos reales de la página",
          "Respeta el movimiento reducido y se puede ocultar"
        ],
        demoLink: "https://github.com/EX1MA/EX1MA.github.io/tree/main/Portafolio/src/components/FoxGuide",
        demoLabel: "Ver el código",
        year: 2026,
        status: "Completado",
        category: "Animación · Canvas"
      }
    ],
    skills: [
      { name: 'HTML5', icon: 'https://cdn.svgporn.com/logos/html-5.svg' },
      { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { name: 'JavaScript', icon: 'https://cdn.svgporn.com/logos/javascript.svg' },
      { name: 'TypeScript', icon: 'https://cdn.svgporn.com/logos/typescript-icon.svg' },
      { name: 'Angular', icon: 'https://cdn.svgporn.com/logos/angular-icon.svg' },
      { name: 'React', icon: 'https://cdn.svgporn.com/logos/react.svg' },
      { name: 'Next.js', icon: 'https://cdn.svgporn.com/logos/nextjs-icon.svg' },
      { name: 'Vite', icon: 'https://cdn.svgporn.com/logos/vite.svg' },
      { name: 'Python', icon: 'https://cdn.svgporn.com/logos/python.svg' },
      { name: 'Kotlin', icon: 'https://cdn.svgporn.com/logos/kotlin-icon.svg' },
      { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
      { name: 'Figma', icon: 'https://cdn.svgporn.com/logos/figma.svg' }
    ]
  },

  designer: {
    themeColor: '#8e44ad',
    hero: {
      title: "Joel Contreras",
      subtitle: "Diseñador Gráfico & UI/UX Web y Móvil",
      description: "Más de 10 años creando identidades corporativas, ilustración, empaque y contenido digital. Certificado en Google UX Design, diseño interfaces web y apps móviles para Android e iOS que sí se pueden construir, porque también las programo.",
      buttonText: "Ver Portafolio"
    },
    about: {
      text: [
        "Soy diseñador gráfico con más de 10 años de experiencia en identidad corporativa, ilustración digital, empaque y contenido para redes sociales. He trabajado para el Ayuntamiento de Naucalpan y con marcas como Porto MX, Sonido Absoluto y Visión Comercial Deportiva (Wilson), además de mi propio proyecto, Kabuto-art.",
        "Con el certificado de Google UX Design y experiencia como desarrollador frontend, combino el diseño visual con el pensamiento UX: diseño pensando en cómo se va a construir, desde la conceptualización hasta el archivo final para impresión o web."
      ],
      stats: [
        { value: 10, label: "Años Diseñando", suffix: "+" },
        { value: 6, label: "Empresas y Proyectos", suffix: "" },
        { value: 8, label: "Herramientas Creativas", suffix: "" }
      ]
    },
    projects: [
      {
        id: 101,
        title: "Identidad e Ilustración — Kabuto-art",
        client: "Proyecto personal",
        description: "Vectorización e ilustración digital, creación de identidades corporativas completas (logotipo y manual de identidad) e ilustración para clientes.",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Illustrator", "Photoshop", "Identidad", "Ilustración"],
        features: [
          "Logotipos y manuales de identidad",
          "Vectorización e ilustración digital",
          "Ilustración para clientes",
          "Archivos para impresión y corte"
        ],
        demoLink: "https://www.behance.net/VereorNox",
        demoLabel: "Ver en Behance",
        year: 2015,
        status: "Completado",
        category: "Identidad & Ilustración",
        highlight: true
      },
      {
        id: 102,
        title: "Marca, Empaque y Catálogos",
        client: "Sonido Absoluto",
        description: "Gestión de identidad corporativa y marcas: diseño de empaque, etiquetas, catálogos digitales y materiales para redes sociales e impresión.",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Illustrator", "Photoshop", "InDesign", "Packaging"],
        features: [
          "Identidad corporativa y marcas",
          "Diseño de empaque y etiquetas",
          "Catálogos digitales",
          "Material para redes e impresión"
        ],
        demoLink: "https://www.behance.net/VereorNox",
        demoLabel: "Ver en Behance",
        year: 2018,
        status: "Completado",
        category: "Branding & Packaging"
      },
      {
        id: 103,
        title: "Contenido Digital y Video",
        client: "Porto MX",
        description: "Manejo de identidades corporativas de filiales, creación de contenido para redes sociales, producción de videos para clientes y apoyo en activaciones de marca.",
        image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Photoshop", "Illustrator", "After Effects", "Premiere"],
        features: [
          "Identidades de filiales",
          "Contenido para redes sociales",
          "Producción de video para clientes",
          "Activaciones de marca"
        ],
        demoLink: "https://www.behance.net/VereorNox",
        demoLabel: "Ver en Behance",
        year: 2020,
        status: "Completado",
        category: "Contenido & Motion"
      },
      {
        id: 104,
        title: "Zorro guía — personaje en pixel art",
        client: "Proyecto personal · este sitio",
        description: "Mi avatar convertido en un personaje animado en pixel art: hoja de sprites limpia y unificada, cuadros intermedios para que respire y mueva la cola, y accesorios que cambian según el perfil.",
        image: foxCard,
        pixelArt: true,
        technologies: ["Pixel art", "Animación por cuadros", "Personaje", "GSAP"],
        features: [
          "Paleta unificada de 9 colores",
          "Cuadros intermedios: cola, respiración y parpadeo",
          "Lentes en el perfil Dev y boina en Diseño",
          "Efectos en pixel art: polvo, corazones, notas"
        ],
        year: 2026,
        status: "Completado",
        category: "Personaje · Pixel art"
      }
    ],
    skills: [
      { name: 'Photoshop', icon: 'https://cdn.svgporn.com/logos/adobe-photoshop.svg' },
      { name: 'Illustrator', icon: 'https://cdn.svgporn.com/logos/adobe-illustrator.svg' },
      { name: 'Figma', icon: 'https://cdn.svgporn.com/logos/figma.svg' },
      { name: 'After Effects', icon: 'https://cdn.svgporn.com/logos/adobe-after-effects.svg' },
      { name: 'Cinema 4D', icon: 'https://cdn.simpleicons.org/cinema4d/5a7bd8' },
      { name: 'InDesign', icon: 'https://cdn.svgporn.com/logos/adobe-indesign.svg' },
      { name: 'Premiere', icon: 'https://cdn.svgporn.com/logos/adobe-premiere.svg' },
      { name: 'HTML/CSS', icon: 'https://cdn.svgporn.com/logos/html-5.svg' }
    ]
  }
};
