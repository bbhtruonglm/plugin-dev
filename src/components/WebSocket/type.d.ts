/** Định nghĩa tham số (Parameters) cho hàm WebSocket */
interface WebSocketProps {
  /**
   * ID của trang hiện tại.
   * @type {string | null}
   * @description Có thể là chuỗi nếu có ID trang, hoặc null nếu không có trang nào.
   */
  page_id: string | null

  /**
   * ID của client.
   * @type {string | null}
   * @description Có thể là chuỗi nếu có ID client, hoặc null nếu không có client nào.
   */
  client_id: string | null

  /**
   * Tham chiếu đến đối tượng WebSocket.
   * @type {React.MutableRefObject<WebSocket | null>}
   * @description Sử dụng React.MutableRefObject để giữ trạng thái WebSocket.
   */
  WS: React.MutableRefObject<WebSocket | null>

  /**
   * Hàm dispatch để gửi action đến Redux hoặc state management khác.
   * @type {Dispatch<any>}
   * @description Được sử dụng để cập nhật trạng thái ứng dụng.
   */
  dispatch: Dispatch<any>

  /**
   * Tham chiếu đến danh sách các tin nhắn chưa đọc.
   * @type {React.MutableRefObject<any[]>}
   * @description Sử dụng React.MutableRefObject để giữ trạng thái danh sách tin nhắn.
   */
  REF_LIST_UNREAD_MESSAGE: React.MutableRefObject<any[]>

  /**
   * Tham chiếu đến số lượng tin nhắn chưa đọc toàn cầu.
   * @type {React.MutableRefObject<number>}
   * @description Sử dụng React.MutableRefObject để giữ trạng thái số lượng.
   */
  REF_GLOBAL_UNREAD_MESSAGE_COUNT: React.MutableRefObject<number>

  /**
   * Tham chiếu đến thời gian cuối cùng đóng quick chat.
   * @type {React.MutableRefObject<string | null>}
   * @description Có thể là chuỗi nếu có thời gian, hoặc null nếu chưa có thời gian nào.
   */
  REF_LAST_TIME_CLOSE_QUICK_CHAT: React.MutableRefObject<string | null>

  /**
   * Tham chiếu đến trạng thái hiển thị quick chat.
   * @type {React.MutableRefObject<string | null>}
   * @description Có thể là chuỗi nếu hiển thị, hoặc null nếu không hiển thị.
   */
  REF_SHOW_QUICK_CHAT: React.MutableRefObject<string | null>

  /**
   * Tham chiếu đến biến boolean chỉ định có hiển thị hay không.
   * @type {React.MutableRefObject<boolean>}
   * @description Sử dụng để kiểm soát hiển thị của một phần trong ứng dụng.
   */
  IS_SHOW_REF: React.MutableRefObject<boolean>

  /**
   * Tham chiếu đến tab hiện tại.
   * @type {React.MutableRefObject<string>}
   * @description Sử dụng để theo dõi tab nào đang được chọn.
   */
  TAB_REF: React.MutableRefObject<string>

  /**
   * Địa chỉ API cho WebSocket.
   * @type {string}
   * @description Đây là chuỗi URL để kết nối đến WebSocket server.
   */
  SOCKET_API: string

  /**
   * Biến boolean xác định có nên đóng socket một cách cưỡng bức hay không.
   * @type {boolean}
   * @description Sử dụng để kiểm soát hành vi của WebSocket.
   */
  is_force_close_socket: boolean
}
