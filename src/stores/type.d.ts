export interface AppState {
  /** ID của trang đang nhắn tin */
  page_id: string
  /** ID của khách hàng đang nhắn tin */
  client_id: string
  /** locale hiện tại */
  locale?: string
  /** Kích thước chiều rộng hiện tại ở page cha */
  current_width: number
}
