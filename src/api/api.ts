import { ENV } from '.'

export const API_END_POINTS = {
  production: {
    SOCKET_API: ENV.APP_SOCKET_HOST,
    READ_MESSAGE_API: `${ENV.APP_BE_HOST}/embed/message/read_message`,
    SEND_MESSAGE_API: `${ENV.APP_BE_HOST}/embed/message/send_message`,
    INIT_CLIENT_API: `${ENV.APP_BE_HOST}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${ENV.APP_BE_HOST}/embed/page/read_page`,
    READ_CLIENT_INFO: `${ENV.APP_BE_HOST}/embed/conversation/read_client`,
    IMAGE: ENV.IMAGE_HOST,
    IMAGE_CDN: ENV.CDN,
    ID_WIDGET: ENV.ID_WIDGET,
    DATA_WIDGET: {
      APP: ENV.APP_URL,
      WIDGET: ENV.WIDGET_URL,
      CHATBOT: ENV.CHATBOT_URL,
      APP_V2: ENV.APP_V2_URL,
    },
    DOMAIN_TRIGGER_BTN: ENV.DOMAIN_TRIGGER_BTN,
  },
  development: {
    SOCKET_API: ENV.APP_SOCKET_HOST,
    READ_MESSAGE_API: `${ENV.APP_BE_HOST}/embed/message/read_message`,
    SEND_MESSAGE_API: `${ENV.APP_BE_HOST}/embed/message/send_message`,
    INIT_CLIENT_API: `${ENV.APP_BE_HOST}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${ENV.APP_BE_HOST}/embed/page/read_page`,
    READ_CLIENT_INFO: `${ENV.APP_BE_HOST}/embed/conversation/read_client`,
    IMAGE: ENV.IMAGE_HOST,
    IMAGE_CDN: ENV.CDN,
    ID_WIDGET: ENV.ID_WIDGET,
    DATA_WIDGET: {
      APP: ENV.APP_URL,
      WIDGET: ENV.WIDGET_URL,
      CHATBOT: ENV.CHATBOT_URL,
      APP_V2: ENV.APP_V2_URL,
    },
    DOMAIN_TRIGGER_BTN: ENV.DOMAIN_TRIGGER_BTN,
  },
} as const

/**
 * Lấy API theo môi trường hiện tại
 */
export const useAPI = () => {
  return (
    API_END_POINTS[ENV.APP_ENV as keyof typeof API_END_POINTS] ||
    API_END_POINTS.development
  )
}

/**
 * Hàm gọi API chung
 */
export const fetchAPI = async (url: string, method: string, body?: any) => {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}

/**
 * API lấy ảnh
 */
export const apiImage = (endpoint: string) => {
  const api = useAPI()
  return `${api.IMAGE}${endpoint}`
}
