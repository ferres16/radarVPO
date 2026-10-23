export type MessageTemplateSeed = {
  key: string;
  label: string;
  description: string;
  channel: 'email' | 'sms' | 'both';
  emailSubject: string | null;
  emailBody: string | null;
  smsBody: string | null;
};

/** Variables comunes: {{name}}, {{email}}, {{title}}, {{location}}, {{date}}, {{url}}, {{product}}, {{price}} */
export const MESSAGE_TEMPLATE_SEEDS: MessageTemplateSeed[] = [
  {
    key: 'pro.new_alert',
    label: 'PRO · Nueva alerta de lanzamiento',
    description: 'Cuando se detecta una ALERTA: Propera adjudicació…',
    channel: 'both',
    emailSubject: 'Nueva alerta VPO (fecha estimada): {{title}}',
    emailBody:
      'Hemos publicado una <strong>nueva alerta de próximo lanzamiento</strong> en Radar VPO PRO. La fecha es <strong>estimada</strong>: no siempre se publica a los 60 días y a veces no llega a publicarse.',
    smsBody:
      'Radar VPO PRO: nueva alerta en {{location}}. Fecha estimada, puede no publicarse. {{url}}',
  },
  {
    key: 'pro.new_publication',
    label: 'PRO · Nueva promoción publicada',
    description: "Cuando se publica un Anunci d'inici de procediment…",
    channel: 'both',
    emailSubject: 'Nueva promoción VPO publicada: {{title}}',
    emailBody:
      'Hay una <strong>nueva promoción publicada</strong> en Radar VPO. Puedes consultar el documento oficial de la promoción aquí:',
    smsBody:
      'Radar VPO PRO: nueva promoción publicada en {{location}}. {{url}}',
  },
  {
    key: 'pro.reminder_7d',
    label: 'PRO · Recordatorio ~1 semana',
    description: 'Cron diario: ~7 días antes de la fecha estimada',
    channel: 'both',
    emailSubject: 'Queda ~1 semana (fecha estimada): {{title}}',
    emailBody:
      'Queda <strong>alrededor de 1 semana</strong> para la fecha <strong>estimada</strong> de este lanzamiento. Esa fecha no está confirmada: no siempre se publica a los 60 días y a veces no se acaba publicando.',
    smsBody:
      'Radar VPO PRO: ~1 semana (fecha estimada, puede no publicarse) en {{location}}. {{url}}',
  },
  {
    key: 'pro.reminder_1d',
    label: 'PRO · Recordatorio ~1 día',
    description: 'Cron diario: ~1 día antes de la fecha estimada',
    channel: 'both',
    emailSubject: 'Fecha estimada mañana: {{title}}',
    emailBody:
      'Mañana es la fecha <strong>estimada</strong> de este lanzamiento. No siempre se publica exactamente entonces y a veces no llega a publicarse.',
    smsBody:
      'Radar VPO PRO: mañana es fecha estimada en {{location}}. Puede no publicarse. {{url}}',
  },
  {
    key: 'purchase.pro',
    label: 'Compra · Bienvenida PRO mensual',
    description: 'Tras pagar la suscripción PRO mensual',
    channel: 'email',
    emailSubject: 'Bienvenido a Radar VPO PRO',
    emailBody:
      '<p>Hola {{name}},</p><p>Tu suscripción <strong>Radar VPO PRO</strong> ya está activa. Recibirás avisos por email (y SMS si tienes móvil) cuando haya nuevas alertas o promociones.</p><p><a href="{{url}}">Ir a Mi cuenta</a></p>',
    smsBody: null,
  },
  {
    key: 'purchase.pro_pack',
    label: 'Compra · Pack PRO 3 meses + guía',
    description: 'Tras pagar el pack trimestral (incluye guía inicial)',
    channel: 'email',
    emailSubject: 'Pack PRO 3 meses activado (+ guía)',
    emailBody:
      '<p>Hola {{name}},</p><p>Tu <strong>pack PRO de 3 meses</strong> está activo y ya tienes acceso a la guía <strong>{{product}}</strong>.</p><p><a href="{{url}}">Abrir la guía</a></p>',
    smsBody: null,
  },
  {
    key: 'purchase.course',
    label: 'Compra · Curso o guía',
    description: 'Tras comprar un curso/guía de pago',
    channel: 'email',
    emailSubject: 'Acceso listo: {{product}}',
    emailBody:
      '<p>Hola {{name}},</p><p>El pago de <strong>{{product}}</strong> se ha confirmado. Ya puedes acceder al contenido.</p><p><a href="{{url}}">Abrir ahora</a></p>',
    smsBody: null,
  },
  {
    key: 'cancel.pro_user',
    label: 'Baja PRO · Confirmación al usuario',
    description: 'Cuando se procesa o confirma la baja de PRO',
    channel: 'email',
    emailSubject: 'Confirmación de baja de Radar VPO PRO',
    emailBody:
      '<p>Hola {{name}},</p><p>Hemos registrado la baja de tu suscripción PRO. Conservarás el acceso hasta el final del periodo ya pagado si aplica.</p><p><a href="{{url}}">Mi cuenta</a></p>',
    smsBody: null,
  },
  {
    key: 'cancel.pro_admin',
    label: 'Baja PRO · Aviso a administradores',
    description: 'Cuando un usuario solicita la baja (ruta manual)',
    channel: 'email',
    emailSubject: '[Radar VPO] Baja PRO solicitada: {{name}}',
    emailBody:
      '<p>Un usuario ha solicitado dar de baja VPO PRO.</p><p><strong>{{name}}</strong><br/>Email: {{email}}<br/>Teléfono: {{phone}}</p><p><a href="{{url}}">Ver anulaciones</a></p>',
    smsBody: null,
  },
  {
    key: 'auth.password_reset',
    label: 'Auth · Restablecer contraseña',
    description: 'Enlace de reset de contraseña',
    channel: 'email',
    emailSubject: 'Restablece tu contraseña de Radar VPO',
    emailBody:
      '<p>Hola {{name}},</p><p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Radar VPO.</p><p><a href="{{url}}">Restablecer contraseña</a></p><p style="font-size:13px;color:#6b7280;">El enlace caduca en 1 hora. Si no has solicitado este cambio, ignora este correo.</p>',
    smsBody: null,
  },
  {
    key: 'auth.verify_email',
    label: 'Auth · Verificar email',
    description: 'Confirmación de email antes de comprar o activar avisos',
    channel: 'email',
    emailSubject: 'Confirma tu email en Radar VPO',
    emailBody:
      '<p>Hola {{name}},</p><p>Confirma tu dirección de correo para poder comprar y recibir avisos PRO.</p><p><a href="{{url}}">Verificar email</a></p><p style="font-size:13px;color:#6b7280;">El enlace caduca en 24 horas.</p>',
    smsBody: null,
  },
];
