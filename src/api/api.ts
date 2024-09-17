import { VITE_APP_BE_HOST, VITE_APP_SOCKET_HOST } from './env/production'
import {
  VITE_APP_BE_HOST as VITE_APP_BE_HOST_STAGING,
  VITE_APP_SOCKET_HOST as VITE_APP_SOCKET_HOST_STAGING,
} from './env/staging'

const apiEndpoints = {
  production: {
    SOCKET_API: VITE_APP_SOCKET_HOST,
    READ_MESSAGE_API: `${VITE_APP_BE_HOST}/embed/message/read_message`,
    SEND_MESSAGE_API: `${VITE_APP_BE_HOST}/embed/message/send_message`,
    INIT_CLIENT_API: `${VITE_APP_BE_HOST}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${VITE_APP_BE_HOST}/embed/page/read_page`,
    READ_CLIENT_INFO: `${VITE_APP_BE_HOST}/embed/conversation/read_client`,
    IMAGE: `https://chatbox-static-v3.botbanhang.vn`,
  },
  staging: {
    SOCKET_API: VITE_APP_SOCKET_HOST_STAGING,
    READ_MESSAGE_API: `${VITE_APP_BE_HOST_STAGING}/embed/message/read_message`,
    SEND_MESSAGE_API: `${VITE_APP_BE_HOST_STAGING}/embed/message/send_message`,
    INIT_CLIENT_API: `${VITE_APP_BE_HOST_STAGING}/embed/conversation/init_identify`,
    READ_PAGE_INFO: `${VITE_APP_BE_HOST_STAGING}/embed/page/read_page`, // sử dụng BE_HOST của production
    READ_CLIENT_INFO: `${VITE_APP_BE_HOST_STAGING}/embed/conversation/read_client`, // sử dụng BE_HOST của production
    IMAGE: `https://chatbox-static-v3.botbanhang.vn`,
  },
}

export const useAPI = () => {
  const ENV = import.meta.env.VITE_APP_ENV || 'production'

  return apiEndpoints[ENV] || apiEndpoints.production // mặc định là production nếu môi trường không hợp lệ
}
/**
 * - Hàm xử lý gọi api:
 * @param url - Đường dẫn API
 * @param method - Phương thức gọi API
 * @param body - Đồi tượng dữ liệu gọi API
 */
export const fetchAPI = async (url: string, method: string, body?: any) => {
  const RES = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return RES.json()
}
/** api chung cho các api liên quan đến lấy ảnh */
export function apiImage(end_point: any) {
  const ENV = import.meta.env.VITE_APP_ENV || 'production'
  const URI = `${apiEndpoints[ENV]['IMAGE']}${end_point}`

  return URI
}
