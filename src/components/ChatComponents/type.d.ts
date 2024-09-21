/** cấu trúc dữ liệu chi tiết tin nhắn*/
interface ChatScreenProps {
  /** Sự kiện trở lại trang chủ */
  onCancel: () => void
  /** client_id */
  user_id: string
  /** Hàm khởi tạo client */
  onInitClient: (e: any) => void
  /** Loading khi khởi tạo client */
  loading_init: boolean
  /** Hàm set loading khởi tạo client */
  setLoadingInit: (e: any) => void

  /** sai id trang */
  invalid_page_id: boolean
  /** Hàm reset input */
  onResetInput?: () => void
  /** Tin nhắn báo lỗi */
  error_message: String | null
  /** sự kiện tắt popup ở header trạng thái mobile (btn close) */
  setHideForMobile?: () => void

  /** tên trang */
  page_name?: string
  /** avatar nhân viên */
  staff_avatar?: string
  /** ten nhân viên */
  staff_name?: string
  /** loading nhân viên */
  loading_staff?: boolean
  /** Tên khách hàng */
  client_name?: string
  /** Danh sách nhân sự page */
  employee_list?: Employee[]
}
/** Kiểu dữ liệu nhân viên */
type Employee = {
  /** ID nhân viên */
  fb_staff_id: string
  /** trạng thái online */
  is_online: boolean
}

/** Kiểu dữ liệu tin nhắn text*/
type Message = {
  /** ID trang */
  page_id: String | null
  /** ID khách hàng */
  client_id: string
  /** Nội dung tin nhắn */
  text: string
}
/** Cấu trúc dữ liệu header */
interface ChatHeaderProps {
  /** Thoát ra màn home */
  onCancel: () => void
  /** client_id */
  user_id: string
  /** Tắt popup trạng thái mobile */
  setHideForMobile?: () => void

  /** tên trang */
  page_name?: string
  /** avatar nhân viên */
  staff_avatar?: string
  /** Tên nhân viên */
  staff_name?: string
  /** loading nhân viên */
  loading_staff?: boolean
  /** Danh sách nhân sự page */
  employee_list?: Employee[]
  /** Loading chat data */
  loading_chat_data?: boolean
}

/** Cấu trúc dữ liệu input */
interface InputProps {
  handleSend: (e: any) => void
  loading: boolean
  error_message: String | null
  page_name?: string
  client_id: string
  setLoading: (e: boolean) => void
}
/** Cấu trức dữ liệu upload */
interface UploadProps {
  setPreviewUrl: (url: File) => void
}
