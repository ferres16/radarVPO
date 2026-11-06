import type { Locale } from '@/lib/i18n/locales';

type MessageTree = {
  nav: {
    home: string;
    published: string;
    publishedShort: string;
    launches: string;
    launchesShort: string;
    guide: string;
    pro: string;
    news: string;
    account: string;
    admin: string;
    login: string;
    logout: string;
    loggingOut: string;
    registerFree: string;
    openMenu: string;
    closeMenu: string;
    userMenu: string;
  };
  pro: {
    makePro: string;
    makeProWithPrice: string;
    discover: string;
    activate: string;
    monthly: string;
    alertsTitle: string;
    alertsDescription: string;
    heroLink: string;
    finalTitle: string;
    bannerLabel: string;
  };
  home: {
    registerFree: string;
    seeLatestPromos: string;
    seePromos: string;
    buyGuide: string;
    offerConsultCta: string;
    offerProCta: string;
    seePromosFallback: string;
  };
  footer: {
    tagline: string;
    support: string;
    legalNote: string;
    contact: string;
    legalNotice: string;
    terms: string;
    privacy: string;
    cookies: string;
    manageCookies: string;
    siteLinks: string;
    language: string;
  };
  common: {
    language: string;
  };
};

export const messages: Record<Locale, MessageTree> = {
  es: {
    nav: {
      home: 'Inicio',
      published: 'Promociones publicadas',
      publishedShort: 'Publicadas',
      launches: 'Próximos lanzamientos',
      launchesShort: 'Lanzamientos',
      guide: 'Guía',
      pro: 'Radar VPO PRO',
      news: 'Noticias',
      account: 'Mi cuenta',
      admin: 'Panel admin',
      login: 'Entrar',
      logout: 'Cerrar sesión',
      loggingOut: 'Cerrando sesión...',
      registerFree: 'Regístrate gratis',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      userMenu: 'Menú de usuario',
    },
    pro: {
      makePro: 'Hazte PRO',
      makeProWithPrice: 'Hazte PRO · {price}',
      discover: 'Descubrir Radar VPO PRO',
      activate: 'Activar PRO',
      monthly: 'Suscripción mensual',
      alertsTitle: 'Recibe avisos por SMS y email',
      alertsDescription:
        'Consultar la web es gratis. Con Radar VPO PRO te avisamos cuando se publica una nueva promoción o detectamos un próximo lanzamiento. {price}.',
      heroLink: 'Descubre Radar VPO PRO',
      finalTitle: 'Avisos sin revisar las webs cada día',
      bannerLabel: 'Radar VPO PRO',
    },
    home: {
      registerFree: 'Regístrate gratis',
      seeLatestPromos: 'Ver las últimas promociones',
      seePromos: 'Ver promociones',
      buyGuide: 'Comprar la guía',
      offerConsultCta: 'Regístrate gratis',
      offerProCta: 'Hazte PRO',
      seePromosFallback: 'Ver promociones',
    },
    footer: {
      tagline:
        'Consulta promociones de vivienda protegida en Cataluña, entiende el proceso con una guía y recibe alertas con Radar VPO PRO.',
      support: 'Soporte (compras, acceso y problemas técnicos):',
      legalNote: 'Información orientativa; no sustituye fuentes oficiales.',
      contact: 'Contacto',
      legalNotice: 'Aviso legal',
      terms: 'Condiciones',
      privacy: 'Privacidad',
      cookies: 'Cookies',
      manageCookies: 'Gestionar cookies',
      siteLinks: 'Enlaces del sitio',
      language: 'Idioma',
    },
    common: {
      language: 'Idioma',
    },
  },
  ca: {
    nav: {
      home: 'Inici',
      published: 'Promocions publicades',
      publishedShort: 'Publicades',
      launches: 'Propers llançaments',
      launchesShort: 'Llançaments',
      guide: 'Guia',
      pro: 'Radar VPO PRO',
      news: 'Notícies',
      account: 'El meu compte',
      admin: 'Panel admin',
      login: 'Entrar',
      logout: 'Tancar sessió',
      loggingOut: 'Tancant sessió...',
      registerFree: 'Registra’t gratis',
      openMenu: 'Obrir menú',
      closeMenu: 'Tancar menú',
      userMenu: 'Menú d’usuari',
    },
    pro: {
      makePro: 'Fes-te PRO',
      makeProWithPrice: 'Fes-te PRO · {price}',
      discover: 'Descobreix Radar VPO PRO',
      activate: 'Activa PRO',
      monthly: 'Subscripció mensual',
      alertsTitle: 'Rep avisos per SMS i correu',
      alertsDescription:
        'Consultar el web és gratis. Amb Radar VPO PRO t’avisem quan es publica una promoció nova o detectem un proper llançament. {price}.',
      heroLink: 'Descobreix Radar VPO PRO',
      finalTitle: 'Avisos sense revisar els webs cada dia',
      bannerLabel: 'Radar VPO PRO',
    },
    home: {
      registerFree: 'Registra’t gratis',
      seeLatestPromos: 'Veure les últimes promocions',
      seePromos: 'Veure promocions',
      buyGuide: 'Comprar la guia',
      offerConsultCta: 'Registra’t gratis',
      offerProCta: 'Fes-te PRO',
      seePromosFallback: 'Veure promocions',
    },
    footer: {
      tagline:
        'Consulta promocions d’habitatge protegit a Catalunya, entén el procés amb una guia i rep alertes amb Radar VPO PRO.',
      support: 'Suport (compres, accés i problemes tècnics):',
      legalNote: 'Informació orientativa; no substitueix fonts oficials.',
      contact: 'Contacte',
      legalNotice: 'Avís legal',
      terms: 'Condicions',
      privacy: 'Privacitat',
      cookies: 'Galetes',
      manageCookies: 'Gestionar galetes',
      siteLinks: 'Enllaços del lloc',
      language: 'Idioma',
    },
    common: {
      language: 'Idioma',
    },
  },
};

export type Messages = MessageTree;

export function formatMessage(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.es;
}
