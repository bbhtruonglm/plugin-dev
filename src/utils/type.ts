export type PageType =
  | 'FB_MESS'
  | 'ZALO_OA'
  | 'WEBSITE'
  | 'FB_WHATSAPP'
  | 'FB_INSTAGRAM'

/**dữ liệu của một khách hàng */
export interface ConversationInfo {
  /**key cho vitual scroll */
  data_key?: string
  /**gắn cờ đặc biệt để có thể ẩn hội thoại đi */
  is_hidden?: boolean
  /**id của trang */
  fb_page_id: string
  /**id của khách hàng */
  fb_client_id: string
  /**kiểu của hội thoại này */
  platform_type?: PageType
  /**id của nhân viên được assign cho khách này */
  fb_staff_id?: string
  /**tên khách hàng */
  client_name?: string
  /**ảnh đại diện của khách hàng nếu có */
  client_avatar?: string
  /**tin nhắn cuối cùng */
  last_message?: string
  /**tin nhắn cuối cùng của ai */
  last_message_type: 'client' | 'page'
  /**danh sách id các nhãn được gắn */
  label_id?: string[]
  /**đếm tổng sổ các tin nhắn chưa đọc */
  unread_message_amount?: number
  /**thời gian tin nhắn cuối cùng được gửi */
  last_message_time?: number
  /**sdt của khách hàng */
  client_phone?: string
  /**email của khách hàng */
  client_email?: string
  /**thông tin thêm của khách hàng */
  client_bio?: {
    /**uid fb quét được */
    fb_uid?: string
    /**thông tin khách hàng */
    fb_info?: Record<string, any>
  }
  /**snap dữ liệu của nhân viên được chỉ định nếu có */
  snap_staff?: {
    /**tên nhân viên */
    name?: string
  }
  /**thời gian cuối cùng mà user đọc tin nhắn */
  last_read_message?: string
  /**id và thời gian cuối cùng nhân viên đã đọc hội thoại này */
  staff_read?: {
    [index: string]: number
  }
  /**đánh dấu khách hàng này là spam */
  is_spam_fb?: boolean
  /**gắn thêm cờ, đánh dấu hội thoại này là chưa đọc */
  is_force_unread?: boolean
}

/**dữ liệu của một tin nhắn */
export interface MessageInfo {
  /**id bản ghi mongo */
  _id: string
  /**tin nhắn này thuộc loại gì */
  platform_type?: 'FB_MESS' | 'FB_POST'
  /**id trang */
  fb_page_id: string
  /**id khách hàng */
  fb_client_id: string
  /**tin nhắn được gửi từ đâu */
  message_type: 'page' | 'client' | 'system' | 'note' | 'activity'
  /**thời gian tin được gửi */
  time: string
  /**nội dung tin nhắn văn bản */
  message_text?: string
  /**nội dung tin nhắn dạng postback - người dùng click vào button */
  postback_title?: string
  /**nội dung tệp đính kèm */
  message_attachments?: AttachmentInfo[]
  /**id của tin nhắn ở hệ thống chính */
  message_mid?: string
  /**thông tin thêm của tin nhắn này */
  message_metadata?: string
  /** id quảng cáo */
  ad_id?: string
  /** id bài post fb */
  fb_post_id?: string
  /**dữ liệu khi comment */
  comment?: FacebookCommentPost
  /**thời gian tạo bản ghi của server */
  createdAt: string
  /**mid của tin được reply nếu có */
  replay_mid?: string
  /**nội dung tin nhắn trước đó được reply nếu có */
  snap_replay_message?: MessageInfo
  /**dữ liệu của AI */
  ai?: MessageAiData[]
  /**
   * Trạng thái typing
   */
  sender_action: 'typing_on' | 'typing_off'
}

/**dữ liệu 1 file */
export interface AttachmentInfo {
  /**thêm index để mapping */
  index?: number
  /**file là dạng gì */
  type?: 'image' | 'video' | 'audio' | 'file' | 'template' | 'fallback'
  /**tiêu đề */
  title?: string
  /**đường link */
  url?: string
  /**nội dung dữ liệu */
  payload?: {
    /**đường dẫn của file */
    url?: string
    /**kiểu của tin nhắn này */
    template_type?: 'button' | 'generic' | 'media'
    /**dữ liệu tin nhắn dạng carousel */
    elements?: AttachmentPayload[]
    /**dữ liệu của nút bấm */
    buttons?: ChatbotButton[]
    /**tiêu đề trang */
    title?: string
  }
}

/**dữ liệu của một bình luận */
export interface FacebookCommentPost {
  comment_id: string
  from?: {
    id?: string
    name?: string
  }
  message: string
  photo?: string
  /**gắn cờ đã load hết child comment */
  done_load_comment?: boolean
  /**phân trang */
  skip_comment?: number
  child_comments?: FacebookCommentPost[]

  // * Flag
  new_comment?: string
  sending_message?: boolean

  // * Time
  createdAt?: string
}

/**dữ liệu AI của một phần tử */
export interface MessageAiData {
  /**sdt */
  phone?: string
  /**email */
  email?: string
  /**địa chỉ */
  address?: string
  /**cảm xúc */
  emotion?: string
  /**dữ liệu được orc từ media -> text */
  ocr?: string
  /**dữ liệu được chuyển từ text -> CTA */
  cta?: string
  /**id mongo tự tạo */
  _id?: string
}

/**dữ liệu kiểu slider */
export interface AttachmentPayload {
  /**tiêu đề */
  title?: string
  /**chú thích */
  subtitle?: string
  /**link ảnh hiển thị */
  image_url?: string
  /**link của video - tạo thêm */
  video_url?: string
  /**link của audio - tạo thêm */
  audio_url?: string
  /**link của file - tạo thêm */
  file_url?: string
  /**link của cả khối */
  item_url?: string
  /**dữ liệu của nút bấm */
  buttons?: ChatbotButton[]

  /**kiểu của file */
  media_type?: 'image' | 'video'
  /**đường link của file */
  url?: string
}

/**kiểu của nút */
export type ButtonType =
  | 'postback'
  | 'web_url'
  | 'phone_number'
  | 'bbh_place_order'
  | 'bbh_create_transaction'
  | 'bbh_schedule_appointment'

/**dữ liệu dạng nút bấm */
export interface ChatbotButton {
  /**dạng của nút này */
  type?: ButtonType
  /**tiêu đề của nút */
  title?: string
  /**hành động của nút này */
  payload?: string
  /**link của nút */
  url?: string
}

/** */
export interface StaffSocket {
  fb_staff_id: string
  online_status: boolean
}

/**tên sự kiện socket 
 
* đồng bộ trạng thái dữ liệu, không đẩy lên đầu
*/
export type SocketEvent = 'SYNC_DATA'

/** Init widget */
export interface InitWidget {
  /**Địa chỉ miền của ứng dụng Chatbox */
  APP: string
  /**Địa chỉ miền của Chatbox Widget */
  WIDGET: string
  /**Địa chỉ miền của Chatbot */
  CHATBOT: string
  /** Địa chỉn miền ứng dụng Chatbox version 2 */
  APP_V2: string
}
