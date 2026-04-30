export type CourseBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; title: string; text: string }
  | { type: 'steps'; steps: string[] };

export type CourseModule = {
  id: string;
  title: string;
  blocks: CourseBlock[];
};

export const guiaVpoEsencialModules: CourseModule[] = [
  {
    id: 'que-es-vpo',
    title: 'Modulo 1 - Que es una vivienda de VPO',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Las Viviendas de Proteccion Oficial (VPO) son inmuebles con precio limitado por ley, destinados a personas con ingresos dentro de rangos establecidos. La administracion regula su acceso para garantizar el derecho a una vivienda digna.',
      },
      {
        type: 'callout',
        title: 'Idea clave',
        text:
          'No es vivienda libre: hay requisitos, limites de precio y obligaciones de uso como residencia habitual.',
      },
    ],
  },
  {
    id: 'tipos-de-vpo',
    title: 'Modulo 2 - Tipos de VPO segun su regimen',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Puedes optar por alquiler o compra. En compra hay dos modalidades: pleno dominio o derecho de superficie.',
      },
      {
        type: 'list',
        items: [
          'Alquiler social: para situaciones de vulnerabilidad, con renta muy reducida.',
          'Alquiler asequible: para ingresos estables pero insuficientes para mercado libre.',
          'Compra en pleno dominio: compras piso y suelo. Precio limitado y residencia obligatoria.',
          'Compra en derecho de superficie: compras el piso pero no el suelo, con plazo de 50 a 75 anos.',
        ],
      },
      {
        type: 'callout',
        title: 'Referencia de ahorro',
        text:
          'Para un piso de 220.000 euros se estima una entrada del 20% + impuestos y gastos. En derecho de superficie el coste es menor al no pagar el suelo.',
      },
    ],
  },
  {
    id: 'tipos-promocion',
    title: 'Modulo 3 - Tipos de promocion y como se asignan',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Hay promociones publicas (administracion) y privadas (promotoras). La asignacion cambia por completo.',
      },
      {
        type: 'list',
        items: [
          'Promocion publica: suele adjudicarse por sorteo o antiguedad en el registro.',
          'Promocion privada: se asigna por orden de llegada. La velocidad lo es todo.',
          'En privadas debes registrarte en la promocion concreta con la promotora.',
        ],
      },
      {
        type: 'callout',
        title: 'Tip pro - Aviso previo',
        text:
          'El aviso previo suele salir unos 60 dias antes del anuncio oficial. Usalo para preparar documentacion y saber donde registrarte el primer dia.',
      },
    ],
  },
  {
    id: 'requisitos',
    title: 'Modulo 4 - Requisitos para acceder',
    blocks: [
      {
        type: 'list',
        items: [
          'Ser mayor de edad o menor emancipado.',
          'Estar empadronado en un municipio de Cataluna.',
          'No tener otra vivienda en propiedad (con excepciones).',
          'Destinar la vivienda a residencia habitual y permanente.',
        ],
      },
      {
        type: 'paragraph',
        text:
          'La administracion valida ingresos con la ultima declaracion de la renta. El dato clave es la casilla 435. Se suman todos los miembros de la unidad de convivencia.',
      },
      {
        type: 'callout',
        title: 'Tip pro - Calcula antes de aplicar',
        text:
          'Si estas fuera de los limites de ingresos segun la casilla 435, tu solicitud sera descartada. Ten tu renta descargada y lista.',
      },
    ],
  },
  {
    id: 'registro',
    title: 'Modulo 5 - Registro de solicitantes',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Estar inscrito en el Registro de Solicitantes de VPO es obligatorio. Sin registro no puedes acceder a ninguna promocion.',
      },
      {
        type: 'list',
        items: [
          'Validez: 1 ano, hay que renovarlo.',
          'Tramite online o presencial. Puede tardar hasta 2 meses.',
          'Guarda el volante de inscripcion: es obligatorio para apuntarte a promociones.',
        ],
      },
      {
        type: 'callout',
        title: 'Orden y estructura',
        text:
          'Crea una carpeta VPO con renta, empadronamiento, vida laboral y volante. En privadas necesitas reaccionar el primer dia.',
      },
    ],
  },
  {
    id: 'acceso-promociones',
    title: 'Modulo 6 - Como acceder a promociones',
    blocks: [
      {
        type: 'paragraph',
        text:
          'En promociones privadas el registro suele abrir al dia siguiente del anuncio oficial y se asigna por orden de llegada. En publicas se usa sorteo o antiguedad.',
      },
      {
        type: 'list',
        items: [
          'Privadas presenciales: puede requerir cola y pasar la noche.',
          'Privadas online: enviar solicitud en el segundo exacto de apertura.',
          'Publicas: aplica a todas para aumentar probabilidades.',
        ],
      },
      {
        type: 'callout',
        title: 'Errores comunes',
        text:
          'Llegar tarde, documentacion desactualizada o registro caducado son los motivos de exclusion mas habituales.',
      },
    ],
  },
  {
    id: 'documentacion',
    title: 'Modulo 7 - Documentacion clave',
    blocks: [
      {
        type: 'list',
        items: [
          'DNI o NIE en vigor.',
          'Certificado de empadronamiento.',
          'Libro de familia o certificados de convivencia.',
          'Volante de inscripcion en el Registro RHSPO.',
          'Declaracion de IRPF (casilla 435).',
          'Tres ultimas nominas o acreditacion laboral.',
          'Certificado negativo del catastro.',
        ],
      },
      {
        type: 'callout',
        title: 'Tip pro',
        text:
          'No mezcles archivos. Usa una carpeta en la nube con PDFs y otra fisica con originales para no perder tiempo en el registro.',
      },
    ],
  },
  {
    id: 'proceso-seleccion',
    title: 'Modulo 8 - Proceso tras ser seleccionado',
    blocks: [
      {
        type: 'steps',
        steps: [
          'Preseleccion y asignacion de vivienda.',
          'Firma del contrato de reserva.',
          'Contrato de arras (normalmente penitenciales).',
          'Visado del contrato por la administracion.',
          'Financiacion con el banco.',
          'Firma de compraventa ante notario.',
          'Post-firma: registro, suministros y entrada a vivir.',
        ],
      },
      {
        type: 'callout',
        title: 'Punto critico',
        text:
          'Sin visado administrativo el contrato no es valido. Lleva documentacion completa para no retrasar la operacion.',
      },
    ],
  },
  {
    id: 'marco-legal',
    title: 'Modulo 9 - Marco legal de la VPO',
    blocks: [
      {
        type: 'paragraph',
        text:
          'En Cataluna la VPO se regula principalmente por la Ley 18/2007 del derecho a la vivienda. Define obligaciones, limites de precio y control de la administracion.',
      },
      {
        type: 'list',
        items: [
          'Uso obligatorio como residencia habitual.',
          'Limitaciones de venta y precio durante el periodo de proteccion.',
          'Derecho de tanteo y retracto por parte de la Generalitat.',
          'Control y sanciones si se incumple la normativa.',
        ],
      },
      {
        type: 'callout',
        title: 'Tip pro',
        text:
          'Si necesitas mudarte temporalmente, pide autorizacion. Nunca dejes la vivienda vacia sin justificar.',
      },
    ],
  },
];
