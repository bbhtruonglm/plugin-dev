export interface AppState {
  /** ID của trang đang nhắn tin */
  page_id: string
  /** ID của khách hàng đang nhắn tin */
  client_id: string
  /** locale hiện tại */
  locale?: string
  /** Kích thước chiều rộng hiện tại ở page cha */
  current_width: number
  /** Danh sách tin nhắn */
  list_message: MessageInfo[]
  /** Danh sách tin nhắn chưa đọc */
  list_unread_message: MessageInfo[]
  /** Tin nhắn mới nhất */
  latest_message?: MessageInfo
  /** Trạng thái đóng mở popup */
  show_popup: boolean
  /** Trạng thái khởi tạo client */
  is_init: boolean
  /** Số lượng tin nhắn chưa đọc */
  unread_count: number
}
