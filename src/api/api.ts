import { VITE_APP_BE_HOST, VITE_APP_SOCKET_HOST } from './env/production'
import {
  VITE_APP_BE_HOST as VITE_APP_BE_HOST_DEVELOPMENT,
  VITE_APP_SOCKET_HOST as VITE_APP_SOCKET_HOST_DEVELOPMENT,
} from './env/staging'

/**
 * - Kiểu dữ liệu cho các đường dẫn API:
 */
type EndPointType = {
  /**
   * - Đường dẫn API cho môi trường production:
   */
  production: {
    SOCKET_API: string
    READ_MESSAGE_API: string
    SEND_MESSAGE_API: string
    INIT_CLIENT_API: string
    READ_PAGE_INFO: string
    READ_CLIENT_INFO: string
    IMAGE: string
  }
  /**
   * - Đường dẫn API cho môi trường staging:
   */
  development: {
    SOCKET_API: string
    READ_MESSAGE_API: string
    SEND_MESSAGE_API: string
    INIT_CLIENT_API: string
    READ_PAGE_INFO: string
    READ_CLIENT_INFO: string
    IMAGE: string
  }
}
/**
 * - Các đường dẫn API:
 */
const API_END_POINTS = {
  production: {
    SOCKET_API: VITE_APP_SOCKET_HOST,
    READ_MESSAGE_API: `${VITE_APP_BE_HOST}/embed/message/read_message`,
    SEND_MESSAGE_API: `${VITE_APP_BE_HOST}/embed/message/send_message`,
    INIT_CLIENT_API: `${VITE_APP_BE_HOST}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${VITE_APP_BE_HOST}/embed/page/read_page`,
    READ_CLIENT_INFO: `${VITE_APP_BE_HOST}/embed/conversation/read_client`,
    IMAGE: `https://chatbox-static-v3.botbanhang.vn`,
  },
  development: {
    SOCKET_API: VITE_APP_SOCKET_HOST_DEVELOPMENT,
    READ_MESSAGE_API: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/message/read_message`,
    SEND_MESSAGE_API: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/message/send_message`,
    INIT_CLIENT_API: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/page/read_page`, // sử dụng BE_HOST của production
    READ_CLIENT_INFO: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/conversation/read_client`, // sử dụng BE_HOST của production
    IMAGE: `https://chatbox-static-v3.botbanhang.vn`,
  },
  staging: {
    SOCKET_API: VITE_APP_SOCKET_HOST_DEVELOPMENT,
    READ_MESSAGE_API: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/message/read_message`,
    SEND_MESSAGE_API: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/message/send_message`,
    INIT_CLIENT_API: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/page/read_page`, // sử dụng BE_HOST của production
    READ_CLIENT_INFO: `${VITE_APP_BE_HOST_DEVELOPMENT}/embed/conversation/read_client`, // sử dụng BE_HOST của production
    IMAGE: `https://chatbox-static-v3.botbanhang.vn`,
  },
} as EndPointType
/**
 * - Hàm lấy api theo môi trường:
 */
export const useAPI = () => {
  /**
   *  Môi trường của ứng dụng:
   */
  const ENV = (import.meta.env.VITE_APP_ENV ||
    'development') as keyof EndPointType

  /**
   * - Trả về đường dẫn API theo môi trường:
   * mặc định là production nếu môi trường không hợp lệ
   */
  return API_END_POINTS[ENV] || API_END_POINTS.development
}
/**
 * - Hàm xử lý gọi api:
 * @param url - Đường dẫn API
 * @param method - Phương thức gọi API
 * @param body - Đồi tượng dữ liệu gọi API
 */
export const fetchAPI = async (url: string, method: string, body?: any) => {
  /**
   * - Gọi API:
   */
  const RES = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  /**
   * - Trả về dữ liệu API:
   */
  return RES.json()
}
/** api chung cho các api liên quan đến lấy ảnh */
export function apiImage(end_point: string) {
  /**
   * Môi trường của ứng dụng:
   */
  const ENV = (import.meta.env.VITE_APP_ENV ||
    'production') as keyof EndPointType

  /**
   * - Đường dẫn API:
   */
  const URI = `${API_END_POINTS[ENV]['IMAGE']}${end_point}`
  /**
   * - Trả về đường dẫn API:
   */
  return URI
}
