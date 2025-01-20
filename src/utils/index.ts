import { MessageInfo } from './type'
import { apiImage } from '@/api/api'
import { t } from 'i18next'

/** Hàm tìm locale từ URL
 * @returns {string} mặc định là 'en'
 */
export function detectLocaleFromURL() {
  /** Lấy tất cả các phần của URL */
  const PATH_SEGMENTS = window.location.pathname.split('/').filter(Boolean)

  /** Giả sử các locale hợp lệ là 'en' và 'vn' */
  const SUPPORTED_LOCALES = ['en', 'vn']

  /** Kiểm tra xem có phần nào của URL khớp với một trong các locale không */
  for (const SEGMENT of PATH_SEGMENTS) {
    /**
     * Nếu SEGMENT khớp với một trong các locale hợp lệ
     */
    if (SUPPORTED_LOCALES.includes(SEGMENT)) {
      /** Trả về locale nếu tìm thấy */
      return SEGMENT
    }
  }

  /** Nếu không tìm thấy, trả về ngôn ngữ mặc định
   * 'en' là fallback
   */
  return 'en'
}

/** Hàm trích xuất locale từ cuối URL
 * @param {string} path: Đường dẫn URL
 * @return {string} mặc định là 'en'
 */
export function getLocaleFromURL(path: any) {
  /** Lấy phần cuối của pathname (sau dấu '/') */
  /** Loại bỏ các chuỗi rỗng */
  const PATH_SEGMENTS = path.split('/').filter(Boolean)

  /** Giả sử các locale hợp lệ là 'en' và 'vn' */
  const SUPPORTED_LOCALES = ['en', 'vn']

  /** Lấy locale từ phần cuối cùng của pathname */
  const LAST_SEGMENT = PATH_SEGMENTS[PATH_SEGMENTS.length - 1]

  /** Kiểm tra xem segment cuối cùng có phải là locale hợp lệ hay không */
  if (SUPPORTED_LOCALES.includes(LAST_SEGMENT)) {
    /**
     * Trả về locale nếu tìm thấy
     */
    return LAST_SEGMENT
  }

  /** Trả về ngôn ngữ mặc định nếu không tìm thấy locale hợp lệ */
  /** 'en' là fallback */
  return 'vn'
}

/**tạo bg dựa trên chữ cái
 * @param {string} client_name: tên người dùng
 * @return {string} mã màu rgb
 */
export function letterToColorCode(client_name?: string) {
  /**
   * Lấy ký tự đầu tiên trong tên người dùng
   */
  let character = client_name

  /** lấy chữ cái đầu tiên và Chuyển ký tự thành chữ thường */
  const INPUT = character?.charAt(0).toLowerCase()

  /** Chuyển đổi ký tự thành mã màu, Lấy mã Unicode và trừ đi mã 'a' (97) */
  let char_code = (INPUT?.charCodeAt(0) || 0) - 97

  /** Chuyển đổi số nguyên thành giá trị RGB */
  var red = (char_code * 30) % 256
  /**
   * Chuyển đổi số nguyên thành giá trị RGB
   */
  var green = (char_code * 20) % 256
  /**
   * Chuyển đổi số nguyên thành giá trị RGB
   */
  var blue = (char_code * 10) % 256

  return 'rgb(' + red + ', ' + green + ', ' + blue + ')'
}

/**cắt ra 2 ký tự đầu và cuối trong tên
 * @param {string} name: tên người dùng
 * @return {string} ký tự đầu và cuối
 */
export const nameToLetter = (name?: string) => {
  /** Xử lý xoá dấu tiếng việt và lấy ký tự đầu cuối trong tên */
  return removeVietnameseTones(name)
    .match(/(\b\S)?/g)
    ?.join('')
    .match(/(^\S|\S$)?/g)
    ?.join('')
    .toUpperCase()
}

/** Xoá dấu tiếng việt
 * @param {string} str: tên người dùng
 * @return {string} tên đã được xoá dấu
 */
export const removeVietnameseTones = (str?: string) => {
  /**
   * Nếu không có chuỗi đầu vào, trả về chuỗi rỗng
   */
  if (!str) return ''
  /**
   * Xoá dấu tiếng việt
   */
  return (
    str
      /** Tách các ký tự tiếng Việt thành dạng cơ bản */
      .normalize('NFD')
      /** Loại bỏ các dấu */
      .replace(/[\u0300-\u036f]/g, '')
      /** Thay thế chữ "đ" thành "d" */
      .replace(/đ/g, 'd')
      /** Thay thế chữ "Đ" thành "D" */
      .replace(/Đ/g, 'D')
      /** Chuyển thành chữ thường để dễ so sánh */
      .toLowerCase()
  )
}

/** Trả về link avatar
 * @param {string} id: Nhận vào id của nhân sự
 * @returns {string} link avatar
 */
export const renderAvatar = (id: string) => {
  /**
   * Link avatar của nhân sự
   */
  const LINK_AVATAR = apiImage(`/app/facebook/avatar/${id}?width=64&height=64`)
  /**
   * Trả về link avatar
   */
  return LINK_AVATAR
}
/** Trả về link avatar
 * @param {string} id: Nhận vào id của nhân sự
 * @returns {string} link avatar
 */
export const renderAvatarCDN = (id: string) => {
  /**
   * Link avatar của nhân sự
   */
  const LINK_AVATAR = `https://cdn.botbanhang.vn/media/s/${id}/user`
  /**
   * Trả về link avatar
   */
  return LINK_AVATAR
}

/** Chuyển đổi giờ, phút, giây */
export function formatDate(isoString?: string) {
  /**
   * Tạo đối tượng Date từ chuỗi ISO
   */
  const DATE = new Date(isoString || '')

  /** Lấy giờ */
  const HOUR = DATE.getHours().toString().padStart(2, '0')
  /**
   * Lấy phút
   */
  const MINUTE = DATE.getMinutes().toString().padStart(2, '0')
  /**
   * Lấy giây
   */
  const SECONDS = DATE.getSeconds().toString().padStart(2, '0')

  /** Lấy ngày */
  const DAY = DATE.getDate().toString().padStart(2, '0')
  /**
   * Lấy tháng
   * getMonth() trả về tháng từ 0-11
   */
  const MONTH = (DATE.getMonth() + 1).toString().padStart(2, '0')
  /**
   * Lấy năm
   */
  const YEAR = DATE.getFullYear()

  /** Kết hợp thành chuỗi theo định dạng mong muốn */
  return `${HOUR}:${MINUTE}:${SECONDS} ${DAY}/${MONTH}/${YEAR}`
}

/**
 * Function để tính số lượng đơn vị thời gian (giây, phút, giờ, ngày, tuần)
 * @param {number} seconds Tổng số giây cần chuyển đổi
 * @param {number} unitInSeconds Số giây trong một đơn vị thời gian (60s, 3600s, 86400s, 604800s)
 * @return {number} Số lượng đơn vị thời gian đã tính toán
 */
function calculateUnits(seconds: number, unitInSeconds: number) {
  /**
   * Sử dụng hàm Math.floor để làm tròn xuống
   */
  return Math.floor(seconds / unitInSeconds)
}

/**
 * Function tính thời gian cách hiện tại
 * @param {string} time_string: Thời gian chuyển đổi sang string
 * @return {string} thời gian cách hiện tại
 */
export function calculateTimeAgo(time_string: string) {
  /**
   * Tạo đối tượng Date từ chuỗi thời gian
   */
  const NOW = new Date()
  /** Chuỗi thời gian được chuyển thành đối tượng Date */
  const TIME = new Date(time_string)

  /** Sử dụng getTime() để chuyển Date thành số (mili-giây) */
  const DIFF_IN_SEC = Math.floor((NOW.getTime() - TIME.getTime()) / 1000)
  /**
   * Tính toán số lượng đơn vị thời gian (giây, phút, giờ, ngày, tuần)
   */
  const MINUTES = calculateUnits(DIFF_IN_SEC, 60)
  /**
   * Tính toán số lượng đơn vị thời gian ( giờ)
   */
  const HOURS = calculateUnits(DIFF_IN_SEC, 3600)
  /**
   * Tính toán số lượng đơn vị thời gian (ngày)
   */
  const DAYS = calculateUnits(DIFF_IN_SEC, 86400)
  /**
   * Tính toán số lượng đơn vị thời gian (tuần)
   */
  const WEEKS = calculateUnits(DIFF_IN_SEC, 604800)

  /** Tính toán thời gian hiển thị */
  if (DIFF_IN_SEC < 60) {
    /**
     * Nếu thời gian cách hiện tại nhỏ hơn 10 giây, trả về 'now'
     */
    if (DIFF_IN_SEC < 10) return t('now')
    /**
     * Trả về số giây cách hiện tại
     */
    return `${DIFF_IN_SEC}s ${t('ago')}`
    /**
     * Trả về số phút cách hiện tại
     */
  } else if (MINUTES < 60) {
    /**
     * Nếu số phút cách hiện tại nhỏ hơn 2 phút, trả về '1 phút trước'
     */
    return `${MINUTES}${t('m')} ${t('ago')}`
    /**
     * Trả về số giờ cách hiện tại
     */
  } else if (HOURS < 24) {
    /**
     * Nếu số giờ cách hiện tại nhỏ hơn 2 giờ, trả về '1 giờ trước'
     */
    return `${HOURS}h ${t('ago')}`
    /**
     * Trả về số ngày cách hiện tại
     */
  } else if (DAYS < 7) {
    /**
     * Nếu số ngày cách hiện tại nhỏ hơn 2 ngày, trả về '1 ngày trước'
     */
    return `${DAYS}d ${t('ago')}`
    /**
     * Trả về số tuần cách hiện tại
     */
  } else {
    /**
     * Nếu số tuần cách hiện tại nhỏ hơn 2 tuần, trả về '1 tuần trước'
     */
    return `${WEEKS}w ${t('ago')}`
  }
}

/** Hàm post message thông tin đến parent
 * @param {boolean} is_show: Kiểm tra xem popup hiển thị hay không?
 * @param {boolean} is_quick_chat: Kiểm tra xem có QUICK_CHAT không?
 *  @param {number} height: Chiều cao QUICK_CHAT (Do có nhiều case kích thước chiều cao)
 */
export const postMessageToParent = (
  is_show: boolean,
  is_quick_chat: boolean,
  height?: number,
  media_url?: string
) => {
  /** post message đến parent */
  window.parent.postMessage(
    {
      from: 'BBH-EMBED-IFRAME',
      is_show: is_show,
      is_quick_chat: is_quick_chat,
      height: height || 0,
      media_url: media_url || '',
    },
    '*'
  )
}

/** Thêm thời gian đóng popup vào localStorage
 * @param {string} page_id: Nhận với page_id
 */
export const saveTimeClosePopup = (page_id: string) => {
  /** Lưu vào thời gian đóng popup */
  localStorage.setItem(`last_time_close__${page_id}`, Date.now().toString())
}

/** Lưu thông tin quickchat count vào localStorage
 * @param {string} page_id: Nhận với page_id
 * @param {string} client_id: Nhận với client_id
 * @param {number} count : So luong tin nhan
 */
export const saveQuickChatCount = (
  page_id: String | null,
  client_id: String | null,
  count: number
) => {
  /** console.log(page_id, client_id, count) */
  if (!page_id || !client_id) return
  /** Lưu vào thời gian đóng popup */ /** Tính toán lưu count vào localStorage */
  localStorage.setItem(
    `count_unread__${page_id}__${client_id}`,
    count.toString()
  )
}

/** Lưu thông tin quickchat count vào localStorage
 * @param {string} page_id: Nhận với page_id
 * @param {string} client_id: Nhận với client_id
 * @param {object} body: Body message
 */
export const saveQuickChatLatestMessage = (
  page_id: String | null,
  client_id: String | null,
  body: MessageInfo | null
) => {
  /** lưu tin nhắn mới nhất vào localStorage */
  localStorage.setItem(
    `latest_message__${page_id}__${client_id}`,
    JSON.stringify(body)
  )
}

/** Hàm truncate
 * @param {string} str: Chuỗi cần truncate
 * @param {number} max_length: Chiều dài chuỗi cần truncate
 * @returns {string} Chuỗi đã truncate
 */
export const truncateString = (str: string, max_length: number) => {
  /** Trả về chuỗi rỗng nếu str là null hoặc undefined */
  if (!str) return ''
  /** Truncate nếu độ dài chuỗi lớn hơn max_length */
  return str.length > max_length ? str.substring(0, max_length) + '...' : str
}

/** Hàm truncate cho sentences
 * @param {string} str: Chuỗi cần truncate
 * • Lấy từ đầu tiên của trong tên
 * @param {number} max_length: Chiều dài chuỗi cần truncate
 * @returns {string} Chuỗi đã truncate
 */
export const truncateSentences = (str: string, max_length: number) => {
  /** Trả về chuỗi rỗng nếu str là null hoặc undefined */
  if (!str) return ''

  /** Tách chuỗi thành mảng từ */
  const WORDS = str.split(' ')
  /** Lấy từ đầu tiên */
  const FIRST_WORD = WORDS[0]

  /** Truncate nếu từ đầu tiên dài hơn max_length */
  return FIRST_WORD.length > max_length
    ? FIRST_WORD.substring(0, max_length) + '...'
    : FIRST_WORD
}
/** Hàm lấy tên file từ URL
 * @param {string} url: URL file
 * @return {string} Tên file
 */
export function extractMessageId(url: string | undefined) {
  /**
   * Nếu không có URL, trả về null
   */
  if (!url) return null
  /** Tìm vị trí của "message/" trong URL */
  const MESSAGE_INDEX = url.indexOf('message/')

  /** Kiểm tra xem chuỗi có chứa "message/" hay không */
  if (MESSAGE_INDEX !== -1) {
    /** Lấy phần chuỗi sau "message/" (cộng 8 vì "message/" có độ dài 8 ký tự) */
    const MESSAGE_ID = url.substring(MESSAGE_INDEX + 8)
    /** Trả về phần chuỗi sau "message/" */
    return MESSAGE_ID
  } else {
    /** Nếu không tìm thấy "message/" trong URL, trả về null */
    return null
  }
}
/**
 * Hàm parse string với JSON
 * @param {string} str - Chuỗi JSON
 * @return {any} - Trả về đối tượng nếu parse thành công, hoặc null nếu lỗi
 */

export const parsedString = (str: string): any => {
  /** Trả về null nếu chuỗi rỗng hoặc không xác định */
  if (!str) return null

  try {
    /** Thử parse chuỗi JSON */
    return JSON.parse(str)
  } catch (error) {
    /** Log lỗi ra console */
    console.error('Lỗi khi parse JSON:', error)
    /** Trả về null nếu parse không thành công */
    return null
  }
}

/**
 * Hàm kiểm tra nếu thời gian hiện tại lớn hơn last_time + 1 giờ
 * @param {number} last_time - Thời gian trước đó (timestamp)
 * @return {boolean} - Trả về true nếu thời gian hiện tại lớn hơn last_time 1 giờ, ngược lại trả về false
 */
export const checkTimeTillNow = (last_time: number) => {
  /** 1 giờ = 60 phút * 60 giây * 1000 milliseconds */
  const ONE_HOUR = 60 * 60 * 1000
  /**
   * Lấy thời gian hiện tại 30s
   */
  const THIRTY_SECOND = 30 * 1000
  /**
   * Lấy thời gian hiện tại
   */
  const NOW = Date.now()

  /** Trả về true nếu thời gian hiện tại lớn hơn last_time + 1 giờ */
  return NOW > last_time + ONE_HOUR
}
/** Hàm check URL có hợp lệ hay không
 * @param {string} string: Đường dẫn URL
 * @return {boolean} Co hợp lệ hay không
 */
export function isValidUrl(string: string) {
  try {
    /** Nếu URL không hợp lệ, sẽ ném ra lỗi. */
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/** chat app check css function */

/** Check tin nhắn có phải từ page không
 * @param {MessageInfo} message: Thông tin tin nhắn
 */
export const isValidPageMessage = (message: MessageInfo) => {
  /**
   * Trả về true nếu message_type là 'page'
   */
  return message?.message_type === 'page'
}

/** Check tin nhắn có file media kèm theo không
 * @param {MessageInfo} message: Thông tin tin nhắn
 * @param {string} type: Loại file
 */
export const hasAttachmentOfType = (message: MessageInfo, type: string) => {
  /**
   * Trả về true nếu message_attachments là mảng và có ít nhất một phần tử
   * và phần tử đầu tiên có type là type
   */
  return (
    message?.message_attachments &&
    message.message_attachments[0]?.type === type
  )
}

/** Hàm nhận vào key và giá trị đầu vào, trả về URL đầy đủ cho liên hệ tương ứng
 * @param key: string
 * @param value: string
 * @returns string
 */
export function renderURLPrefix(
  key: string,
  value: string
): string | undefined {
  /**
   * Kiểm tra key và trả về URL tương ứng
   */
  switch (key) {
    case 'PHONE':
      return `tel:${value}`
    case 'MAIL':
      return `mailto:${value}`
    case 'FACEBOOK':
      return `https://www.facebook.com/${value}`
    case 'INSTAGRAM':
      return `https://www.instagram.com/${value}`
    case 'WHATSAPP':
      return `https://wa.me/${value}`
    case 'ZALO':
      return `https://zalo.me/${value}`
    case 'TIKTOK':
      return `https://www.tiktok.com/@${value}`
    case 'THREADS':
      return `https://www.threads.net/@${value}`
    case 'TWITTER':
      return `https://x.com/${value}`
    case 'TELEGRAM':
      return `https://t.me/${value}`
    case 'YOUTUBE':
      return `https://www.youtube.com/@${value}`
    case 'LINKEDIN':
      return `https://www.linkedin.com/in/${value}`
    case 'REDDIT':
      return `https://www.reddit.com/user/${value}`
    case 'MESSENGER':
      return `https://m.me/${value}`
    case 'GITHUB':
      return `https://github.com/${value}`
    case 'PINTEREST':
      return `https://www.pinterest.com/${value}`
    case 'LINE':
      return `https://line.me/R/ti/p/${value}`
    case 'VIBER':
      return `viber://add?number=${value}`
    case 'DISCORD':
      return `https://discord.gg/${value}`
    case 'VK':
      return `https://vk.com/${value}`
    case 'TWITCH':
      return `https://www.twitch.tv/${value}`
    case 'APP_STORE':
      return `https://apps.apple.com/app/id${value}`
    case 'GOOGLE_PLAY_STORE':
      return `https://play.google.com/store/apps/details?id=${value}`
    case 'LINK_WEB':
      /** Trả về giá trị trực tiếp nếu là một link web thông thường */
      return value

    default:
      /** Trả về key nếu không khớp với bất kỳ case nào */
      return key
  }
}
/**
 *  Hàm render locale
 * @param value  giá trị locale
 * @returns   giá trị locale
 */
export function renderLocale(value: string) {
  /** Các map locale cần xử lý */
  const LOCALE_MAP: { [key: string]: string } = {
    vn: 'vi',
    vi: 'vi',
    us: 'en',
    en: 'en',
  }

  /** Kiểm tra và trả về kết quả theo map */
  return LOCALE_MAP[value.toLowerCase()] || value
}
