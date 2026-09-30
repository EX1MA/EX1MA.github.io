import type { Project, Skill, Stat } from '../types';

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
      subtitle: "Desarrollador Frontend React",
      description: "Construyo experiencias web atractivas y funcionales con React, TypeScript y Node.js. Enfocado en el rendimiento, la accesibilidad y el código limpio.",
      buttonText: "Ver Proyectos"
    },
    about: {
      text: [
        "Soy un Desarrollador Frontend con más de 3 años de experiencia creando interfaces web modernas y de alto rendimiento. Me especializo en React y TypeScript, construyendo aplicaciones escalables con arquitectura de componentes sólida, estado global eficiente y código mantenible a largo plazo.",
        "Tengo un fuerte enfoque en la experiencia del usuario y la accesibilidad. Me apasiona la intersección entre el diseño y el desarrollo, lo que me permite crear productos que no solo funcionan perfectamente, sino que también se ven excepcionales. Disfruto trabajar en equipos ágiles, contribuyendo tanto en decisiones técnicas como en la visión del producto."
      ],
      stats: [
        { value: 3, label: "Años de Experiencia", suffix: "+" },
        { value: 12, label: "Proyectos Completados", suffix: "+" },
        { value: 10, label: "Tecnologías Dominadas", suffix: "+" }
      ]
    },
    projects: [
      {
        id: 1,
        title: "E-commerce Zapatos Premium",
        description: "Tienda online completa con carrito dinámico, pasarela de pago con Stripe y panel de administración. Arquitectura full-stack con Next.js y MongoDB.",
        longDescription: "Aplicación e-commerce de alto rendimiento con SSR para SEO óptimo. Incluye autenticación JWT, gestión de inventario en tiempo real, filtros avanzados por categoría y precio, y un dashboard de administración para gestionar productos y pedidos.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        technologies: ["React", "Next.js", "TypeScript", "Redux", "Node.js", "MongoDB", "Stripe", "JWT"],
        features: [
          "Carrito de compras con persistencia",
          "Pago seguro integrado con Stripe",
          "Autenticación y perfiles de usuario",
          "Panel de administración completo",
          "Búsqueda y filtros avanzados"
        ],
        demoLink: "#",
        repoLink: "#",
        year: 2024,
        status: "Completado",
        category: "E-Commerce",
        highlight: true
      },
      {
        id: 2,
        title: "App del Clima en Tiempo Real",
        description: "Aplicación meteorológica con pronóstico de 7 días, geolocalización automática e íconos animados. Construida con la API de OpenWeatherMap.",
        longDescription: "App de clima con interfaz limpia y animaciones fluidas que reaccionan según las condiciones meteorológicas. Detecta automáticamente la ubicación del usuario, permite buscar cualquier ciudad del mundo y guarda un historial de búsquedas recientes.",
        image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=1200&auto=format&fit=crop",
        technologies: ["React", "TypeScript", "OpenWeatherMap API", "CSS Modules", "Vite", "Geolocation API"],
        features: [
          "Geolocalización automática del usuario",
          "Pronóstico detallado a 7 días",
          "Búsqueda de ciudades en tiempo real",
          "Animaciones según condición climática",
          "Modo claro y oscuro"
        ],
        demoLink: "#",
        repoLink: "#",
        year: 2024,
        status: "Completado",
        category: "Aplicación Web"
      },
      {
        id: 3,
        title: "Dashboard de Analíticas",
        description: "Panel de control interactivo para visualización de datos con gráficos dinámicos, tablas con paginación y filtros en tiempo real. Stack moderno con React Query.",
        longDescription: "Dashboard empresarial que consume múltiples endpoints REST para mostrar KPIs, tendencias y reportes. Implementa React Query para caché inteligente de datos, Recharts para visualizaciones complejas y una tabla de datos con exportación a Excel y PDF.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        technologies: ["React", "TypeScript", "Recharts", "React Query", "Tailwind CSS", "REST API", "Vite"],
        features: [
          "Gráficos interactivos con Recharts",
          "Caché inteligente con React Query",
          "Filtros y búsqueda en tiempo real",
          "Exportar reportes a PDF/Excel",
          "Diseño responsivo y accesible"
        ],
        demoLink: "#",
        repoLink: "#",
        year: 2025,
        status: "En Desarrollo",
        category: "Dashboard"
      }
    ],
    skills: [
      { name: 'HTML5', icon: 'https://cdn.svgporn.com/logos/html-5.svg' },
      { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { name: 'JavaScript', icon: 'https://cdn.svgporn.com/logos/javascript.svg' },
      { name: 'TypeScript', icon: 'https://cdn.svgporn.com/logos/typescript-icon.svg' },
      { name: 'React', icon: 'https://cdn.svgporn.com/logos/react.svg' },
      { name: 'Next.js', icon: 'https://cdn.svgporn.com/logos/nextjs-icon.svg' },
      { name: 'Redux', icon: 'https://cdn.svgporn.com/logos/redux.svg' },
      { name: 'Tailwind', icon: 'https://cdn.svgporn.com/logos/tailwindcss-icon.svg' },
      { name: 'Node.js', icon: 'https://cdn.svgporn.com/logos/nodejs-icon.svg' },
      { name: 'Git', icon: 'https://cdn.svgporn.com/logos/git-icon.svg' },
      { name: 'Vite', icon: 'https://cdn.svgporn.com/logos/vite.svg' },
      { name: 'Figma', icon: 'https://cdn.svgporn.com/logos/figma.svg' }
    ]
  },

  designer: {
    themeColor: '#8e44ad',
    hero: {
      title: "Joel Contreras",
      subtitle: "Diseñador Visual & UI/UX",
      description: "Transformo ideas abstractas en interfaces digitales impactantes y centradas en el usuario. Del wireframe al prototipo interactivo, con ojo en cada detalle.",
      buttonText: "Ver Portafolio"
    },
    about: {
      text: [
        "Como Diseñador Visual y UI/UX, combino la investigación de usuarios con una fuerte sensibilidad estética para crear experiencias digitales memorables. Me especializo en el diseño de sistemas coherentes, prototipos interactivos de alta fidelidad y flujos de usuario optimizados que reducen la fricción y aumentan la conversión.",
        "Mi ventaja diferencial es entender tanto el diseño como el desarrollo. Esta visión híbrida me permite crear soluciones viables técnicamente, colaborar fluidamente con equipos de ingeniería y asegurar que el producto final sea fiel a la visión original. Cada píxel tiene una razón de ser."
      ],
      stats: [
        { value: 3, label: "Años Diseñando", suffix: "+" },
        { value: 50, label: "Diseños Entregados", suffix: "+" },
        { value: 8, label: "Herramientas Creativas", suffix: "+" }
      ]
    },
    projects: [
      {
        id: 101,
        title: "Rediseño App Bancaria (Fintech)",
        description: "Rediseño completo de UX/UI para app de banca móvil. Enfoque en simplicidad, confianza y accesibilidad. Flujos de onboarding, transferencias y gestión de tarjetas.",
        longDescription: "Proyecto de rediseño total de una aplicación de banca digital con más de 200,000 usuarios. El proceso incluyó auditoría UX, entrevistas con usuarios, benchmarking competitivo, wireframes de baja/alta fidelidad y prototipo interactivo validado con pruebas de usabilidad.",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Figma", "User Research", "Prototyping", "Design System", "Accessibility", "WCAG AA"],
        features: [
          "40 pantallas diseñadas en alta fidelidad",
          "Sistema de colores accesible WCAG AA",
          "Flujo de onboarding optimizado",
          "Prototipo interactivo validado",
          "Guía de estilos y componentes"
        ],
        demoLink: "https://dribbble.com/",
        repoLink: "#",
        year: 2024,
        status: "Completado",
        category: "UI/UX Design",
        highlight: true
      },
      {
        id: 102,
        title: "Dashboard Analítico Dark Mode",
        description: "Diseño de panel de control empresarial premium con modo oscuro nativo, visualización de KPIs complejos y un sistema de 30+ componentes reutilizables.",
        longDescription: "Dashboard diseñado para equipos de datos que necesitan visualizar métricas complejas de manera clara. El diseño enfatiza la legibilidad en sesiones largas con un modo oscuro cuidadosamente calibrado, jerarquía visual clara y componentes de data viz personalizados.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Adobe XD", "Data Visualization", "Dark Mode Design", "Iconography", "Motion Design"],
        features: [
          "30+ componentes custom documentados",
          "Sistema de variables de color completo",
          "Modo oscuro nativo y cuidado",
          "Librería de iconos personalizada",
          "Animaciones de transición de datos"
        ],
        demoLink: "https://dribbble.com/",
        repoLink: "#",
        year: 2024,
        status: "Completado",
        category: "UI Design"
      },
      {
        id: 103,
        title: "Design System Corporativo",
        description: "Sistema de diseño completo desde cero: tokens de diseño, 200+ componentes en Figma, guía de tipografía, paleta de colores sistemática y documentación de patrones.",
        longDescription: "Creación del design system oficial de una empresa de tecnología para unificar el look & feel de 5 productos digitales. El sistema reduce el tiempo de diseño en un 60% y asegura coherencia visual en todos los puntos de contacto con el usuario.",
        image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop",
        technologies: ["Figma", "Design Tokens", "Storybook", "Branding", "Typography", "Color Theory"],
        features: [
          "200+ componentes documentados",
          "Tokens de diseño exportables a CSS",
          "Guía de tipografía y escala modular",
          "Paleta de colores sistemática",
          "Patrones de interacción definidos"
        ],
        demoLink: "https://dribbble.com/",
        repoLink: "#",
        year: 2023,
        status: "Completado",
        category: "Design System"
      }
    ],
    skills: [
      { name: 'Figma', icon: 'https://cdn.svgporn.com/logos/figma.svg' },
      { name: 'Adobe XD', icon: 'https://cdn.svgporn.com/logos/adobe-xd.svg' },
      { name: 'Photoshop', icon: 'https://cdn.svgporn.com/logos/adobe-photoshop.svg' },
      { name: 'Illustrator', icon: 'https://cdn.svgporn.com/logos/adobe-illustrator.svg' },
      { name: 'After Effects', icon: 'https://cdn.svgporn.com/logos/adobe-after-effects.svg' },
      { name: 'Sketch', icon: 'https://cdn.svgporn.com/logos/sketch.svg' },
      { name: 'Blender', icon: 'https://cdn.svgporn.com/logos/blender-orange.svg' },
      { name: 'InVision', icon: 'https://cdn.svgporn.com/logos/invision.svg' },
      { name: 'Miro', icon: 'https://cdn.svgporn.com/logos/miro.svg' },
      { name: 'HTML/CSS', icon: 'https://cdn.svgporn.com/logos/html-5.svg' }
    ]
  }
};
