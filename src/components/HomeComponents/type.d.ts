/** Định nghĩa cấu trúc dữ liệu Quick chat Props */
interface SendMessageProps {
  /** Hàm chuyển trang */
  onNavigate: () => void
  /** Hàm báo lỗi */
  onError: () => void
  /** Số tin nhắn chưa đọc */
  unread_message_count: number
}
