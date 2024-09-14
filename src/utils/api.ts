import { REACT_APP_BE_HOST, REACT_APP_SOCKET_HOST } from './apis/production'
import {
  REACT_APP_BE_HOST as REACT_APP_BE_HOST_STAGING,
  REACT_APP_SOCKET_HOST as REACT_APP_SOCKET_HOST_STAGING,
} from './apis/staging'

export const useAPI = () => {
  let env = import.meta.env.VITE_APP_ENV || 'production'
  if (env === 'production') {
    const SOCKET_API = REACT_APP_SOCKET_HOST
    const READ_MESSAGE_API = REACT_APP_BE_HOST + '/embed/message/read_message'
    const SEND_MESSAGE_API = REACT_APP_BE_HOST + '/embed/message/send_message'
    const INIT_CLIENT_API =
      REACT_APP_BE_HOST + '/embed/conversation/init_identify'
    return { SOCKET_API, READ_MESSAGE_API, SEND_MESSAGE_API, INIT_CLIENT_API }
  } else {
    const SOCKET_API = REACT_APP_SOCKET_HOST_STAGING
    const READ_MESSAGE_API =
      REACT_APP_BE_HOST_STAGING + '/embed/message/read_message'
    const SEND_MESSAGE_API =
      REACT_APP_BE_HOST_STAGING + '/embed/message/send_message'
    const INIT_CLIENT_API =
      REACT_APP_BE_HOST_STAGING + '/embed/conversation/init_identify'
    return { SOCKET_API, READ_MESSAGE_API, SEND_MESSAGE_API, INIT_CLIENT_API }
  }
}
/**
 * - Hàm xử lý gọi api:
 * @param url - Đường dẫn API
 * @param method - Phương thức gọi API
 * @param body - Đồi tượng dữ liệu gọi API
 */
export const fetchAPI = async (url: string, method: string, body?: any) => {
  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return response.json()
}
