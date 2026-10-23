export type MessageTemplateSeed = {
  key: string;
  label: string;
  description: string;
  channel: 'email' | 'sms' | 'both';
  emailSubject: string | null;
  emailBody: string | null;
  smsBody: string | null;
  /** Si false, ensureDefaults deja active=false al crear/refrescar no custom. */
  active?: boolean;
};

/**
 * Subir al cambiar copy por defecto. ensureDefaults refresca filas con
 * isCustomized=false y seedRevision < este valor.
 */
export const MESSAGE_TEMPLATE_SEED_REVISION = 2;

/**
 * Variables: {{name}}, {{email}}, {{title}}, {{location}}, {{date}}, {{url}},
 * {{product}}, {{price}}, {{phone}}, {{access_until}}, {{billing_summary}}
 *
 * Avisos PRO: el cuerpo va dentro de envoltura slim (sin saludo/tarjeta duplicados).
 */
export const MESSAGE_TEMPLATE_SEEDS: MessageTemplateSeed[] = [
  {
    key: 'auth.verify_email',
    label: 'Auth · Verificar email',
    description: 'Confirmación de email al crear la cuenta',
    channel: 'email',
    emailSubject: 'Confirma tu email en Radar VPO',
    emailBody:
      '<p>Hola {{name}},</p><p>Gracias por registrarte en Radar VPO.</p><p>Confirma que esta dirección es tuya para completar la creación de tu cuenta.</p><p><a href="{{url}}">Confirmar mi email</a></p><p style="font-size:13px;color:#6b7280;">El enlace estará disponible durante 24 horas.</p><p style="font-size:13px;color:#6b7280;">Si no has creado esta cuenta, puedes ignorar este mensaje.</p><p>Radar VPO</p>',
    smsBody: null,
  },
  {
    key: 'auth.password_reset',
    label: 'Auth · Restablecer contraseña',
    description: 'Enlace de reset de contraseña',
    channel: 'email',
    emailSubject: 'Cambia tu contraseña de Radar VPO',
    emailBody:
      '<p>Hola {{name}},</p><p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.</p><p>Puedes elegir una nueva desde este enlace:</p><p><a href="{{url}}">Cambiar mi contraseña</a></p><p style="font-size:13px;color:#6b7280;">El enlace caduca en 1 hora.</p><p style="font-size:13px;color:#6b7280;">Si no has solicitado el cambio, no necesitas hacer nada.</p><p>Radar VPO</p>',
    smsBody: null,
  },
  {
    key: 'purchase.pro',
    label: 'Compra · Bienvenida PRO mensual',
    description: 'Tras confirmar pago y activar PRO mensual',
    channel: 'email',
    emailSubject: 'Tu Radar VPO PRO ya está activo',
    emailBody:
      '<p>Hola {{name}},</p><p>Gracias por confiar en Radar VPO.</p><p>Tu suscripción PRO ya está activa. Te enviaremos avisos cuando detectemos nuevos anuncios y publicaciones en las fuentes que seguimos.</p><p>En cada aviso indicaremos si se trata de un anuncio previo, con información orientativa, o de una publicación oficial que ya puedes consultar.</p><p>Para empezar, entra en tu cuenta y revisa las promociones disponibles.</p><p><a href="{{url}}">Entrar en mi cuenta</a></p><p>{{billing_summary}}</p><p style="font-size:13px;color:#6b7280;">Si tienes algún problema para acceder, responde a este correo.</p><p>Radar VPO</p>',
    smsBody: null,
  },
  {
    key: 'purchase.pro_pack',
    label: 'Compra · Pack PRO 3 meses + guía',
    description: 'Tras confirmar pack trimestral',
    channel: 'email',
    emailSubject: 'Tu pack PRO de tres meses está activo',
    emailBody:
      '<p>Hola {{name}},</p><p>Tu pack PRO de tres meses ya está activo y puedes acceder a <strong>{{product}}</strong>.</p><p>Puedes empezar por la guía para situarte y consultar los avisos de PRO cuando haya nuevas publicaciones.</p><p><a href="{{url}}">Abrir mi guía</a></p><p>Tu acceso PRO estará activo hasta <strong>{{access_until}}</strong>.</p><p>{{billing_summary}}</p><p>Gracias por elegir Radar VPO. Si tienes algún problema de acceso, responde a este correo.</p>',
    smsBody: null,
  },
  {
    key: 'purchase.course',
    label: 'Compra · Curso o guía',
    description: 'Tras comprar un curso/guía de pago',
    channel: 'email',
    emailSubject: 'Ya tienes acceso a {{product}}',
    emailBody:
      '<p>Hola {{name}},</p><p>Gracias por tu compra.</p><p>Hemos confirmado el pago de <strong>{{product}}</strong> y ya tienes acceso al contenido.</p><p><a href="{{url}}">Acceder a {{product}}</a></p><p>Importe pagado: {{price}}. Compra de pago único.</p><p>Puedes volver al contenido desde tu cuenta cuando lo necesites, durante el periodo de acceso indicado en tu compra.</p><p style="font-size:13px;color:#6b7280;">Si tienes algún problema para abrirlo, responde a este correo.</p><p>Radar VPO</p>',
    smsBody: null,
  },
  {
    key: 'cancel.pro_user_requested',
    label: 'Baja PRO · Solicitud recibida (manual)',
    description: 'Cuando la baja queda pendiente de gestión manual',
    channel: 'email',
    emailSubject: 'Hemos recibido tu solicitud de baja de PRO',
    emailBody:
      '<p>Hola {{name}},</p><p>Hemos recibido tu solicitud de baja de Radar VPO PRO.</p><p>La solicitud está pendiente de tramitarse. Te enviaremos otro correo cuando la renovación haya quedado cancelada.</p><p><a href="{{url}}">Ir a mi cuenta</a></p><p style="font-size:13px;color:#6b7280;">Si necesitas comunicar algún problema con esta solicitud, responde a este correo.</p><p>Radar VPO</p>',
    smsBody: null,
  },
  {
    key: 'cancel.pro_user',
    label: 'Baja PRO · Renovación cancelada',
    description: 'Cuando la renovación ya está cancelada (Stripe o admin)',
    channel: 'email',
    emailSubject: 'Renovación de Radar VPO PRO cancelada',
    emailBody:
      '<p>Hola {{name}},</p><p>Hemos cancelado la renovación de tu suscripción Radar VPO PRO.</p><p>Podrás seguir utilizando PRO hasta <strong>{{access_until}}</strong>. Después finalizará tu acceso y esta suscripción no volverá a renovarse.</p><p><a href="{{url}}">Consultar mi suscripción</a></p><p>Gracias por haber contado con Radar VPO.</p><p style="font-size:13px;color:#6b7280;">Si encuentras algún problema con la cancelación, responde a este correo.</p>',
    smsBody: null,
  },
  {
    key: 'cancel.pro_admin',
    label: 'Baja PRO · Aviso a administradores',
    description: 'Solicitud manual que requiere gestión',
    channel: 'email',
    emailSubject: '[Radar VPO] Baja PRO pendiente: {{name}}',
    emailBody:
      '<p>Se ha recibido una solicitud de baja que requiere gestión manual.</p><p>Nombre: <strong>{{name}}</strong><br/>Email: {{email}}</p><p>Comprueba el estado de la suscripción, tramita la cancelación y registra el resultado.</p><p>La confirmación al usuario debe enviarse cuando la cancelación se haya completado.</p><p><a href="{{url}}">Gestionar solicitud</a></p>',
    smsBody: null,
  },
  {
    key: 'pro.new_alert',
    label: 'PRO · Anuncio previo',
    description:
      'ALERTA: Propera adjudicació… (email; SMS solo si el usuario lo activó)',
    channel: 'both',
    emailSubject: 'Anuncio previo de VPO en {{location}}',
    emailBody:
      '<p>Hemos detectado un anuncio previo de vivienda protegida en <strong>{{location}}</strong>.</p><p>Puedes consultar la información disponible para conocer de qué promoción se trata.</p><p>Este anuncio todavía no confirma que se puedan presentar solicitudes. La fecha mostrada es orientativa y puede cambiar; la promoción podría no llegar a publicarse.</p><p><a href="{{url}}">Consultar el anuncio</a></p>',
    smsBody:
      'Radar VPO: anuncio previo en {{location}}. Fecha orientativa; apertura de solicitudes sin confirmar. {{url}}',
  },
  {
    key: 'pro.new_publication',
    label: 'PRO · Publicación oficial',
    description: 'Anunci d’inici… (email + SMS si el usuario activó SMS)',
    channel: 'both',
    emailSubject: 'Nueva publicación oficial en {{location}}',
    emailBody:
      '<p>Ya puedes consultar una nueva publicación oficial de vivienda protegida en <strong>{{location}}</strong>.</p><p>Antes de preparar una solicitud, revisa qué indica el documento sobre los requisitos, los plazos y la forma de presentación.</p><p><a href="{{url}}">Ver el PDF oficial</a></p><p>Consultar la publicación te permitirá comprobar si esta promoción encaja con tu situación.</p>',
    smsBody:
      'Radar VPO: nuevo anuncio oficial en {{location}}. Consulta requisitos y plazos en el PDF: {{url}}',
  },
  {
    key: 'pro.reminder_7d',
    label: 'PRO · Recordatorio ~1 semana (email)',
    description: 'Solo email, a quienes tienen la promoción guardada',
    channel: 'email',
    emailSubject: 'Fecha estimada en ~1 semana: {{location}}',
    emailBody:
      '<p>La fecha estimada que mostramos para esta promoción es <strong>{{date}}</strong>, dentro de aproximadamente una semana.</p><p>Puede ser un buen momento para volver a consultar la información disponible.</p><p>Recuerda que esta estimación no confirma la apertura de solicitudes ni representa una fecha límite para presentar documentación.</p><p><a href="{{url}}">Consultar la promoción</a></p>',
    smsBody:
      'Radar VPO: fecha estimada en 7 dias para {{location}}. No confirma apertura de solicitudes. {{url}}',
    active: true,
  },
  {
    key: 'pro.reminder_1d',
    label: 'PRO · Recordatorio ~1 día (desactivado)',
    description: 'Desactivado por defecto: genera expectativa fuerte',
    channel: 'email',
    emailSubject: 'Fecha estimada mañana: {{location}}',
    emailBody:
      '<p>La fecha estimada que figura para esta promoción es mañana, <strong>{{date}}</strong>.</p><p>Se trata de una referencia orientativa. No confirma que mañana se abra un plazo de solicitudes ni que debas presentar documentación ese día.</p><p><a href="{{url}}">Consultar la información disponible</a></p>',
    smsBody:
      'Radar VPO: fecha estimada manana en {{location}}. No confirma apertura de solicitudes. {{url}}',
    active: false,
  },
];
