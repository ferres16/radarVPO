/**
 * Páginas de muestra desarrolladas (RV05): permiten valorar profundidad sin pagar.
 * Distinguen reglas generales de requisitos que dependen de cada convocatoria.
 */

export type GuideSamplePage = {
  id: string;
  kicker: string;
  title: string;
  reviewedAt: string;
  sources: Array<{ label: string; href: string }>;
  sections: Array<{
    heading: string;
    body: string[];
    callout?: string;
  }>;
};

export const GUIDE_SAMPLE_PAGES: GuideSamplePage[] = [
  {
    id: 'presupuesto',
    kicker: 'Ejemplo de presupuesto',
    title: 'El precio del piso no es el total a preparar',
    reviewedAt: '2026-10-29',
    sources: [
      {
        label: 'Agència de l’Habitatge de Catalunya — información general',
        href: 'https://habitatge.gencat.cat/',
      },
    ],
    sections: [
      {
        heading: 'Regla general',
        body: [
          'Además del precio de la vivienda, conviene prever reserva o arras, gastos de notaría e impuestos, y un colchón para imprevistos hasta la entrega.',
          'La guía muestra cómo montar una tabla sencilla con estas partidas para no confundir el precio anunciado con el dinero que necesitas tener disponible.',
        ],
      },
      {
        heading: 'Lo que depende de cada convocatoria',
        body: [
          'Porcentaje de reserva, plazos de pago y si el garaje o el trastero van aparte figuran en las bases de esa promoción concreta.',
          'No copies cifras de un ejemplo a otra convocatoria: contrastas siempre el PDF oficial.',
        ],
        callout: 'Esta muestra orienta el método. No garantiza que puedas optar ni que te adjudiquen una vivienda.',
      },
    ],
  },
  {
    id: 'proceso',
    kicker: 'Mapa del proceso',
    title: 'De interesarte a firmar: el orden habitual',
    reviewedAt: '2026-10-29',
    sources: [
      {
        label: 'Registre de Sol·licitants d’Habitatge de Catalunya',
        href: 'https://www.registresolicitants.cat/',
      },
    ],
    sections: [
      {
        heading: 'Regla general',
        body: [
          'El recorrido típico es: entender requisitos → inscripción o actualización en el registro cuando proceda → seguir convocatorias → presentar solicitud en plazo → selección → reserva/arras → visado y firma.',
          'Saltarse el orden suele traducirse en documentación incompleta o en perder el plazo.',
        ],
      },
      {
        heading: 'Lo que depende de cada convocatoria',
        body: [
          'Quién puede presentarse, si hay sorteo o baremo, y las fechas exactas las fija cada anuncio oficial.',
          'Una alerta de “próximo lanzamiento” no es todavía el inicio del procedimiento: solo la publicación oficial confirma plazos.',
        ],
      },
    ],
  },
  {
    id: 'checklist',
    kicker: 'Checklist de documentos',
    title: 'Tu carpeta base, antes de que abra el plazo',
    reviewedAt: '2026-10-29',
    sources: [
      {
        label: 'Documentación habitual en procesos de vivienda protegida (orientativo)',
        href: 'https://habitatge.gencat.cat/',
      },
    ],
    sections: [
      {
        heading: 'Regla general',
        body: [
          'Conviene tener localizados: identificación, empadronamiento, vida laboral o situación laboral, declaración de la renta o rentas, y datos de la unidad de convivencia.',
          'Organizar la carpeta con antelación reduce errores cuando el plazo es corto.',
        ],
      },
      {
        heading: 'Lo que depende de cada convocatoria',
        body: [
          'La lista exacta, el formato (digital/papel) y los certificados vigentes los marca cada base.',
          'Un documento válido para una promoción puede no servir para otra si cambia el criterio o la fecha de referencia.',
        ],
        callout: 'Radar VPO no presenta solicitudes ni revisa tu documentación personal.',
      },
    ],
  },
];
