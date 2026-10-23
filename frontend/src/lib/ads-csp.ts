/**
 * Orígenes que AdSense / Funding Choices (mensaje UE) necesitan en la CSP.
 * @see https://support.google.com/adsense/answer/12638613
 */
export const ADSENSE_SCRIPT_SRC = [
  'https://pagead2.googlesyndication.com',
  'https://googleads.g.doubleclick.net',
  'https://tpc.googlesyndication.com',
  'https://www.google.com',
  'https://www.gstatic.com',
  'https://fundingchoicesmessages.google.com',
  'https://ep1.adtrafficquality.google',
  'https://ep2.adtrafficquality.google',
  'https://www.googletagservices.com',
  'https://adservice.google.com',
  'https://www.googleadservices.com',
  'https://partner.googleadservices.com',
  'https://*.adtrafficquality.google',
  'https://*.googlesyndication.com',
].join(' ');

export const ADSENSE_CONNECT_SRC = [
  ADSENSE_SCRIPT_SRC,
  'https://*.google.com',
  'https://*.g.doubleclick.net',
  'https://*.gstatic.com',
  'https://csi.gstatic.com',
].join(' ');

export const ADSENSE_FRAME_SRC = [
  'https://googleads.g.doubleclick.net',
  'https://tpc.googlesyndication.com',
  'https://pagead2.googlesyndication.com',
  'https://www.google.com',
  'https://fundingchoicesmessages.google.com',
  'https://ep1.adtrafficquality.google',
  'https://ep2.adtrafficquality.google',
  'https://*.adtrafficquality.google',
  'https://*.googlesyndication.com',
].join(' ');
