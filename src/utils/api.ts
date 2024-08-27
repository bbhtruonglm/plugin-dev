import { REACT_APP_BE_HOST, REACT_APP_SOCKET_HOST } from './apis/production'
import {
  REACT_APP_BE_HOST as REACT_APP_BE_HOST_STAGING,
  REACT_APP_SOCKET_HOST as REACT_APP_SOCKET_HOST_STAGING,
} from './apis/staging'

export const useAPI = () => {
  if (process.env.REACT_APP_ENV === 'production') {
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
// export const SOCKET_API = process.env.REACT_APP_SOCKET_HOST
// export const READ_MESSAGE_API =
//   process.env.REACT_APP_BE_HOST + '/embed/message/read_message'
// export const SEND_MESSAGE_API =
//   process.env.REACT_APP_BE_HOST + '/embed/message/send_message'
// export const INIT_CLIENT_API =
//   process.env.REACT_APP_BE_HOST + '/embed/conversation/init_identify'
