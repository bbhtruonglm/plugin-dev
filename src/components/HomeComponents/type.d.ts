/** Định nghĩa cấu trúc dữ liệu Quick chat Props */
interface SendMessageProps {
  /** Hàm chuyển trang */
  onNavigate: () => void
  /** Hàm báo lỗi */
  onError: () => void
  /** Client name */
  client_name?: string | null
}
