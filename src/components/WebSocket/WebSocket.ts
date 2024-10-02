import {
  checkTimeTillNow,
  saveQuickChatCount,
  saveQuickChatLatestMessage,
} from '@/utils'
import {
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setListUnreadMessage,
} from '@/stores/appSlice'

import { MessageInfo } from '@/utils/type'
import { size } from 'lodash'

/**
 * Gọi API xác định danh tính khi mở WebSocket
 * @param {string | null} page_id - ID trang
 * @param {string | null} client_id - ID khách hàng
 */
const sendIdentifyMessage = (
  page_id: string | null,
  client_id: string | null,
  WS: React.MutableRefObject<WebSocket | null> // Sử dụng Ref để giữ trạng thái WebSocket
) => {
  // Kiểm tra điều kiện khi nào WebSocket đang ở trạng thái OPEN thì mới gửi tin nhắn
  if (WS.current?.readyState === WebSocket.OPEN) {
    WS.current?.send(
      JSON.stringify({
        page_id: page_id,
        client_id: client_id,
        event: 'JOIN',
      })
    )
  } else {
    // Nếu chưa kết nối, thử lại sau một khoảng thời gian nhất định
    console.log('WebSocket is not open yet. Retrying...')
    setTimeout(() => sendIdentifyMessage(page_id, client_id, WS), 100) // Thử lại sau 100ms nếu chưa kết nối
  }
}
/**  Cấu hình websocket
 * - Kết nối tới WebSocket server
 * - Gọi tin nhắn khởi tạo socket
 * - Tu dụng socket để nhận tin nhắn
 * @param {string} page_id - ID trang
 * @param {string} client_id - ID khách hàng
 *
 */
export function onSocketFromChatboxServer({
  page_id,
  client_id,
  WS,
  dispatch,
  REF_LIST_UNREAD_MESSAGE,
  REF_GLOBAL_UNREAD_MESSAGE_COUNT,
  REF_LAST_TIME_CLOSE_QUICK_CHAT,
  REF_SHOW_QUICK_CHAT,
  IS_SHOW_REF,
  TAB_REF,
  SOCKET_API,
  is_force_close_socket,
}: WebSocketProps) {
  // Kết nối tới WebSocket server
  WS.current = new WebSocket(SOCKET_API || '')

  //Lưu lại id vòng lặp
  let ping_interval_id: number | any

  // kết nối được mở
  WS.current.onopen = () => {
    // Thông báo connect thành công
    console.log('WebSocket Connectedddd')

    // Gửi tin nhắn khởi tạo socket
    sendIdentifyMessage(page_id, client_id, WS)

    // Nếu socket đang readyState === websocket.OPEN thì được gọi tin nhắn
    if (WS.current?.readyState === WebSocket.OPEN) {
      // tu dong ping socket lien tuc 30s
      ping_interval_id = setInterval(() => WS.current?.send('ping'), 1000 * 25)
    } else {
      console.log('WebSocket is not open yet. Retrying...')
      // Thử lại sau 100ms nếu chưa kết nối
      setTimeout(sendIdentifyMessage, 100)
    }
  }

  // Khi có tin nhắn
  WS.current.onmessage = ({ data }) => {
    if (!data || data === 'pong') return
    /**dữ liệu socket nhận được */
    let socket_data: {
      /**dữ liệu tin nhắn mới */
      message?: MessageInfo
    } = {}

    /**  cố gắng giải mã dữ liệu*/
    try {
      socket_data = JSON.parse(data)
    } catch (e) {}

    /** Kiểm tra socket_data có dữ liệu không */
    if (!size(socket_data)) return

    /** Lấy tin nhắn từ socket */
    let { message } = socket_data

    /**
     * Phải lấy data trong REF,
     * Vì khi websocket, chỉ lưu giá trị lúc mới khởi tạo
     * Dù có thay đổi cũng không bắt được sự kiện
     */

    /** nếu có tin nhắn. Popup đóng hoặc đang ở tab home */
    if (message && (!IS_SHOW_REF.current || TAB_REF.current !== 'message')) {
      /** Không hiển thị tin nhắn hệ thống  và ghi chú*/
      if (
        message?.message_type !== 'system' &&
        message?.message_type !== 'note'
      ) {
        /** Check thời gian đóng QUICK_CHAT */
        if (REF_SHOW_QUICK_CHAT.current === 'hide_quick_chat') {
          /** Kiểm tra thời gian đóng QUICK_CHAT
           * Nếu hơn 1h thì bật lại dưới 1h thì không làm gì cả
           */
          const CHECK_TIME_TILL_NOW = checkTimeTillNow(
            Number(REF_LAST_TIME_CLOSE_QUICK_CHAT.current)
          )
          /** Kiểm tra thời gian đóng QUICK_CHAT đã hơn 1h chưa */
          if (CHECK_TIME_TILL_NOW) {
            /** Đổi trạng thái QuICK_CHAT thành 'show_quick_chat' */
            /** Bật show QUICK_CHAT lên */
            localStorage.setItem(
              `status_quick_chat__${page_id}`,
              'show_quick_chat'
            )
          }
        }
        /** Cần lưu ý (với data của redux, WS đang lưu giá trị [] ban đầu)
         * còn setList message thì lấy giá trị LIST_UNREAD_MESSAGE và push thêm tin nhắn vào.
         * Lúc này LIST_UNREAD_MESSAGE mặc định là []
         * dispatch(setListUnreadMessage([...LIST_UNREAD_MESSAGE, message]))
         */
        dispatch(
          setListUnreadMessage([...REF_LIST_UNREAD_MESSAGE.current, message])
        )
        dispatch(
          setGlobalUnreadCount(REF_GLOBAL_UNREAD_MESSAGE_COUNT.current + 1)
        )
        /** Tính toán lưu count vào localStorage */
        saveQuickChatCount(
          page_id,
          client_id,
          REF_GLOBAL_UNREAD_MESSAGE_COUNT.current + 1
        )

        /** lưu tin nhắn mới nhất vào localStorage */
        saveQuickChatLatestMessage(page_id, client_id, message)
        /** Lưu tin nhắn mới nhất vào store */
        dispatch(setLatestMessageGlobal(message))
      }
    }
    /** Nếu có tin nhắn popup mở và ở tab chat */
    if (message && IS_SHOW_REF.current && TAB_REF.current === 'message') {
      /** Không nhận tin nhắn từ hệ thống */
      if (message?.message_type !== 'system') {
        dispatch(setLatestMessageGlobal(message))

        /** Cần lưu ý (với data của redux, WS đang lưu giá trị [] ban đầu)
         * Vì Latest mesage chỉ gọi hàm setListMessage
         * còn setList message thì lấy giá trị LIST_MESSAGE và push thêm tin nhắn vào.
         * Lúc này LIST_MESSAGE mặc định là []
         * dispatch(setListMessage([...LIST_MESSAGE, message]))
         */
      }
    }
  }

  /** Khi kết nối bị đóng */
  WS.current.onclose = () => {
    console.log('WebSocket Disconnected')
    clearInterval(ping_interval_id)

    if (is_force_close_socket) return

    setTimeout(
      () =>
        onSocketFromChatboxServer({
          page_id,
          client_id,
          WS,
          dispatch,
          REF_LIST_UNREAD_MESSAGE,
          REF_GLOBAL_UNREAD_MESSAGE_COUNT,
          REF_LAST_TIME_CLOSE_QUICK_CHAT,
          REF_SHOW_QUICK_CHAT,
          IS_SHOW_REF,
          TAB_REF,
          SOCKET_API,
          is_force_close_socket,
        }),
      100
    )
  }
  /** Khi có lỗi */
  WS.current.onerror = () => {
    WS.current?.close()
  }
}

/**
 * Đóng kết nối socket
 * @param {React.MutableRefObject<WebSocket | null>} WS - WebSocket reference
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsForceCloseSocket - Hàm để đánh dấu trạng thái đóng socket
 */
export function closeSocketConnect(
  WS: React.MutableRefObject<WebSocket | null>,
  setIsForceCloseSocket: React.Dispatch<React.SetStateAction<boolean>>
) {
  /** Gắn cờ ngăn chặn kết nối tự động mở lại */
  setIsForceCloseSocket(true)

  /** Đóng kết nối WebSocket hiện tại */
  if (WS.current) {
    WS.current.close()
  }
}
