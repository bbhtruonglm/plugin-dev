import { MessageInfo } from '@/utils/type'

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
  /** có phải tin nhắn khởi tạo không ? */
  is_init: boolean

  /** TIn nhắn mới nhất */
  // latest_message?: any
  /** set Trạng thái Init */
  // setIsInit: (e: any) => void
  /** Tin nhắn chưa đọc */
  // list_unread_message?: MessageInfo[]
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
  /** Hàm gửi tin nhắn */
  handleSend: (e: any) => void
  /** Trạng thái loading */
  loading: boolean
  /** Tin nhắn báo lỗi */
  error_message: String | null
  /** Tên trang */
  page_name?: string
  /** ID khách hàng */
  client_id: string
  /** Hàm set loading */
  setLoading: (e: boolean) => void
}

/** Cấu trúc dữ liệu input */
interface InputQuickProps {
  /** Hàm gửi tin nhắn */
  handleSend: (e: any) => void
  /** Trạng thái loading */
  loading?: boolean
  /** Tên nhân viên */
  staff_name?: string
  /** Tin nhắn báo lỗi */
  error_message?: String | null
  /** Hàm set loading */
  setLoading?: (e: boolean) => void
}
/** Cấu trức dữ liệu upload */
interface UploadProps {
  /** Hàm upload file */
  setPreviewUrl: (url: File) => void
}

/**
 * Định nghĩa kiểu cho attachment của tin nhắn
 */
export interface MessageAttachment {
  /** Loại file đính kèm (ví dụ: audio, video, v.v.) */
  type?: string

  /**
   * Thông tin payload của file đính kèm
   */
  payload: {
    /** URL của file đính kèm (đường dẫn tới file) */
    url?: string | undefined

    /** Loại template cho nội dung đính kèm (ví dụ: generic, button template) */
    template_type?: string

    /** Mảng chứa các nút (buttons) của đính kèm */
    buttons?: BtnType[]

    /** Mảng chứa các phần tử (elements) của template */
    elements?: ElementType[]
  }

  /** Tiêu đề của file đính kèm */
  title?: string

  /** ID của attachment (nếu có) */
  _id?: string
}

/**
 * Định nghĩa kiểu cho phần tử (element) trong payload
 */
export type ElementType = {
  /** Tiêu đề của phần tử */
  title?: string

  /** Phụ đề của phần tử */
  subtitle?: string

  /** Đường dẫn URL của hình ảnh đại diện cho phần tử */
  image_url?: string

  /** Mảng chứa các nút (buttons) cho phần tử */
  buttons?: BtnType[]

  /** Hành động mặc định khi người dùng chọn phần tử */
  default_action?: Action[]
}

/**
 * Định nghĩa kiểu cho hành động của nút hoặc phần tử
 */
export type Action = {
  /** Loại hành động (ví dụ: link, postback) */
  type?: string

  /** Đường dẫn URL của hành động (nếu là link) */
  url?: string
}

/**
 * Định nghĩa kiểu cho nút (button) trong payload hoặc element
 */
export type BtnType = {
  /** Loại nút (ví dụ: web_url, postback) */
  type?: string

  /** Tiêu đề hiển thị trên nút */
  title?: string

  /** Dữ liệu gửi khi nút được bấm (cho loại nút postback) */
  payload?: string

  /** Đường dẫn URL nếu nút là loại liên kết (web_url) */
  url?: string
}

/**
 * Định nghĩa kiểu cho props của MessageComponent
 */
export interface MessageProps {
  height?: number

  data: {
    /** ID của tin nhắn */
    _id: string

    /** ID của trang Facebook */
    fb_page_id: string

    /** ID của client Facebook */
    fb_client_id: string

    /** Loại nền tảng (ví dụ: WEBSITE) */
    platform_type: string

    /** Loại tin nhắn (ví dụ: page) */
    message_type: string

    /** Nội dung tin nhắn Text */
    message_text: string

    /** ID của người gửi */
    sender_id: string

    /** ID của người nhận */
    recipient_id: string

    /** Thời gian gửi tin nhắn */
    time: string

    /** ID của tin nhắn */
    message_mid: string

    /** Danh sách các file đính kèm */
    message_attachments: MessageAttachment[]

    /** Metadata của tin nhắn */
    message_metadata: string

    /** Thời gian tạo */
    createdAt: string

    /** Thời gian cập nhật */
    updatedAt: string

    /** Phiên bản */
    __v: number

    /** Kích thước của các file đính kèm */
    attachment_size: any[]
  }
}
/** ĐỊnh nghĩa cấu trúc dữ liệu audio */
export interface AudioPlayerProps {
  /** url video */
  src?: string
}

/** ĐỊnh nghĩa cấu trúc dữ liệu video */
export interface VideoPlayerProps {
  /** url video */
  src: string
  /** độ rộng video */
  width?: string
  /** độ cao video */
  height?: string
}

/** ĐỊnh nghĩa cấu trúc khởi tạo Client ID */
interface InitClientProps {
  /** Hàm reset data */
  resetData: boolean
  /** Hàm khởi tạo client */
  onInitClient: (e?: any) => void
}
/** Định nghĩa cấu trúc dữ liệu input */
interface InputPropsInit {
  /** Tiêu đề  */
  title?: string
  /** Placeholder */
  placeholder?: string
  /** Hàm thay đổi nội dung */
  onChange?: (e: any) => void
  /** hàm check phím ấn */
  onKeyDown?: (e: any) => void
  /** Kiểu input */
  type?: 'text' | 'number' | 'email' | 'password' | 'tel'
  /** có bắt buộc hay không */
  required?: boolean
}
/** Cấu trúc params của modal */
interface ModalProps {
  /** Trạng thái đóng mở modal */
  is_open: boolean
  /** Hàm đóng modal */
  onClose: () => void
  /** Đối tượng con trong modal */
  children: React.ReactNode
}
