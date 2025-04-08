/**
 * Represents the state of the application.
 * @property {string} page_id - ID của trang đang nhắn tin.
 * @property {string} client_id - ID của khách hàng đang nhắn tin.
 * @property {string} [locale] - Locale hiện tại.
 * @property {number} current_width - Kích thước chiều rộng hiện tại ở page cha.
 * @property {MessageInfo[]} list_message - Danh sách tin nhắn.
 * @property {MessageInfo[]} list_unread_message - Danh sách tin nhắn chưa đọc.
 * @property {MessageInfo} [latest_message] - Tin nhắn mới nhất.
 * @property {boolean} show_popup - Trạng thái đóng mở popup.
 * @property {boolean} is_init - Trạng thái khởi tạo client.
 * @property {number} unread_count - Số lượng tin nhắn chưa đọc.
 * @property {string | null} [preview_url] - Url ảnh muốn xem preview.
 * @property {boolean} loading_global - Loading global.
 * @property {Object} user_info - Thông tin người dùng.
 * @property {string} user_info.user_name - Tên người dùng.
 * @property {string} user_info.user_phone - Số điện thoại người dùng.
 * @property {string} user_info.user_email - Email người dùng.
 */
export interface AppState {
  /** ID của trang đang nhắn tin */
  page_id: string
  /** ID của khách hàng đang nhắn tin */
  client_id: string
  /** locale hiện tại */
  locale?: string
  /** Kích thước chiều rộng hiện tại ở page cha */
  current_width: number
  /** Kích thước chiều cao của màn hình hiện tại */
  current_height: number
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
  /** Url ảnh muốn xem preview  */
  preview_url?: string | null
  /** loading global */
  loading_global: boolean

  /** Thông tin người dùng */
  user_info?: {
    /** tên User */
    user_name: string
    /** SDT user */
    user_phone: string
    /** Email user */
    user_email: string
    /**
     * Thông tin user_id
     */
    client_id: string
  }
  /** Trạng thái ai */
  is_ai?: boolean
  /**
   * Thông tin trạng thái viewport của page cha
   */
  no_viewport?: boolean
  /**
   * Danh sách nhân viên
   */
  staff_list?: EmployeeList
  /**
   * Thông tin AI
   */
  page_info_ai?: {
    /**
     * Tên trợ lý ảo
     */
    ai_agent_id?: string
    /**
     * id trang
     */
    page_id?: string
    /**
     * ID khách hàng
     */
    fb_client_id?: string
    /**
     * Tên page
     */
    page_name?: string
    /**
     * Tên khách hàng
     */
    current_staff_name?: string
    /**
     * Cờ bật trạng thái AI
     */
    is_active_ai_agent?: boolean
  }
  /**Typing status */
  typing_status?: boolean | undefined
  /**
   * refresh data
   */
  refresh_data?: boolean
  /**
   * Tin nhắn suggest của khách hàng
   */
  suggest_message?: string
  /**
   * embed position
   */
  embed_position?: string
  /**
   * Embed position detail
   */
  embed_position_detail?: {
    bottom?: number
    right?: number
    left?: number
  }
  /**
   * AI_ID
   */
  ai_id?: boolean
  /**
   * Trạng thái ẩn avatar nhân viên
   */
  is_avatar?: boolean
  /**
   * page_avatar
   */
  page_avatar?: string
}
/** Định nghĩa kiểu dữ liệu cho danh sách nhân viên */
interface EmployeeList {
  /** Danh sách nhân viên
   * @params {string} key - Mã nhân viên
   */
  [key: string]: Employee
}
