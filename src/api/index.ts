export const ENV = {
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',

  /** Backend & Socket */
  APP_BE_HOST: import.meta.env.VITE_HOST_APP_BE_HOST,
  APP_SOCKET_HOST: import.meta.env.VITE_HOST_APP_SOCKET_HOST,

  /** Images & CDN */
  IMAGE_HOST: import.meta.env.VITE_HOST_IMAGE_HOST,
  CDN: import.meta.env.VITE_HOST_CDN,

  /** Domain & Widget */
  DOMAIN: import.meta.env.VITE_HOST_DOMAIN,
  ID_WIDGET: import.meta.env.VITE_HOST_ID_WIDGET,
  DOMAIN_TRIGGER_BTN: import.meta.env.VITE_HOST_DOMAIN_TRIGGER_BTN,

  /** API URLs */
  APP_URL: import.meta.env.VITE_HOST_APP_URL,
  WIDGET_URL: import.meta.env.VITE_HOST_WIDGET_URL,
  CHATBOT_URL: import.meta.env.VITE_HOST_CHATBOT_URL,
  APP_V2_URL: import.meta.env.VITE_HOST_APP_V2_URL,
}
