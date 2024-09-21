/** Cấu trúc dữ liệu Chat App */
interface ChatAppProps {
  /** Nút trigger bật tắt popup */
  handleBtn: () => void
  /** Trạng thái hiển thị popup */
  show: boolean
  /** Ẩn popup màn điện thoại */
  setHideForMobile?: () => void
}

// Định nghĩa kiểu dữ liệu cho danh sách nhân viên
interface EmployeeList {
  [key: string]: Employee
}
/** Cấu trúc dữ liệu Màn chat */
interface ChatProps {
  /** Hàm xử lý trở lại trang home */
  userOutChat: (e?: any) => void
  /** Tin nhắn khi có lỗi */
  error_message: String | null
  /** Hàm set tin nhắn lỗi */
  onError: () => void
  /** Ẩn ở trạng thái mobile */
  setHideForMobile?: () => void
  /** Tên trang */
  page_name?: string
  /** Danh sách nhân viên */
  employee_list?: { fb_staff_id: string; is_online: boolean }[]
}

interface HomeProps {
  /** Hàm điều hướng sang màn chat */
  onNavigate: () => void
  /** Hàm set Tin nhắn lỗi */
  onError: () => void
  /** Danh sách kênh liên lạc */
  social_link?: Array<any> | null
}
