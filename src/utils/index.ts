import { apiImage } from '@/api/api'
import { t } from 'i18next'

/** Hàm tìm locale từ URL
 * @returns {string} mặc định là 'en'
 */
export function detectLocaleFromURL() {
  const pathSegments = window.location.pathname.split('/').filter(Boolean) // Lấy tất cả các phần của URL

  // Giả sử các locale hợp lệ là 'en' và 'vn'
  const supportedLocales = ['en', 'vn']

  // Kiểm tra xem có phần nào của URL khớp với một trong các locale không
  for (const segment of pathSegments) {
    if (supportedLocales.includes(segment)) {
      return segment // Trả về locale nếu tìm thấy
    }
  }

  // Nếu không tìm thấy, trả về ngôn ngữ mặc định
  return 'en' // 'en' là fallback
}

/** Hàm trích xuất locale từ cuối URL
 * @param {string} path: Đường dẫn URL
 * @return {string} mặc định là 'en'
 */
export function getLocaleFromURL(path: any) {
  // Lấy pathname từ URL
  // Lấy phần cuối của pathname (sau dấu '/')
  const PATH_SEGMENTS = path.split('/').filter(Boolean) // Loại bỏ các chuỗi rỗng

  // Giả sử các locale hợp lệ là 'en' và 'vn'
  const SUPPORTED_LOCALES = ['en', 'vn']

  // Lấy locale từ phần cuối cùng của pathname
  const LAST_SEGMENT = PATH_SEGMENTS[PATH_SEGMENTS.length - 1]

  // Kiểm tra xem segment cuối cùng có phải là locale hợp lệ hay không
  if (SUPPORTED_LOCALES.includes(LAST_SEGMENT)) {
    return LAST_SEGMENT
  }

  // Trả về ngôn ngữ mặc định nếu không tìm thấy locale hợp lệ
  return 'vn' // 'en' là fallback
}

/**tạo bg dựa trên chữ cái
 * @param {string} client_name: tên người dùng
 * @return {string} mã màu rgb
 */
export function letterToColorCode(client_name?: string) {
  let character = client_name

  // lấy chữ cái đầu tiên và Chuyển ký tự thành chữ thường
  const INPUT = character?.charAt(0).toLowerCase()

  // Chuyển đổi ký tự thành mã màu, Lấy mã Unicode và trừ đi mã 'a' (97)
  let char_code = (INPUT?.charCodeAt(0) || 0) - 97

  // Chuyển đổi số nguyên thành giá trị RGB
  var red = (char_code * 30) % 256
  var green = (char_code * 20) % 256
  var blue = (char_code * 10) % 256

  return 'rgb(' + red + ', ' + green + ', ' + blue + ')'
}

/**cắt ra 2 ký tự đầu và cuối trong tên
 * @param {string} name: tên người dùng
 * @return {string} ký tự đầu và cuối
 */
export const nameToLetter = (name?: string) => {
  // Xử lý xoá dấu tiếng việt và lấy ký tự đầu cuối trong tên
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
  if (!str) return ''
  return str
    .normalize('NFD') // Tách các ký tự tiếng Việt thành dạng cơ bản
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu
    .replace(/đ/g, 'd') // Thay thế chữ "đ" thành "d"
    .replace(/Đ/g, 'D') // Thay thế chữ "Đ" thành "D"
    .toLowerCase() // Chuyển thành chữ thường để dễ so sánh
}

/** Trả về link avatar
 * @param {string} id: Nhận vào id của nhân sự
 * @returns {string} link avatar
 */
export const renderAvatar = (id: string) => {
  const LINK_AVATAR = apiImage(`/app/facebook/avatar/${id}?width=64&height=64`)
  return LINK_AVATAR
}
/** Chuyển đổi giờ, phút, giây */
export function formatDate(isoString?: string) {
  const DATE = new Date(isoString || '')

  // Lấy giờ, phút, giây
  const HOUR = DATE.getHours().toString().padStart(2, '0')
  const MINUTE = DATE.getMinutes().toString().padStart(2, '0')
  const SECONDS = DATE.getSeconds().toString().padStart(2, '0')

  // Lấy ngày, tháng, năm
  const DAY = DATE.getDate().toString().padStart(2, '0')
  const MONTH = (DATE.getMonth() + 1).toString().padStart(2, '0') // getMonth() trả về tháng từ 0-11
  const YEAR = DATE.getFullYear()

  // Kết hợp thành chuỗi theo định dạng mong muốn
  return `${HOUR}:${MINUTE}:${SECONDS} ${DAY}/${MONTH}/${YEAR}`
}

/** Function tính thời gian cách hiện tại
 * @param {string} timeString: Thời gian chuyển đổi sang string
 * @return {string} thời gian cách hiện tại
 */
export function calculateTimeAgo(timeString: string) {
  console.log(timeString)
  const NOW = new Date() // Thời gian hiện tại
  const TIME = new Date(timeString) // Chuỗi thời gian được chuyển thành đối tượng Date
  console.log(NOW.getTime(), TIME.getTime())
  // Sử dụng getTime() để chuyển Date thành số (mili-giây)
  const DIFF_IN_SEC = Math.floor((NOW.getTime() - TIME.getTime()) / 1000)
  const MINUTES = Math.floor(DIFF_IN_SEC / 60)
  const HOURS = Math.floor(DIFF_IN_SEC / 3600)
  // const days = Math.floor(DIFF_IN_SEC / 86400)
  // const weeks = Math.floor(DIFF_IN_SEC / 604800)

  if (DIFF_IN_SEC < 60) {
    if (DIFF_IN_SEC < 10) return t('now')
    return `${DIFF_IN_SEC}s ${t('ago')}`
  } else if (MINUTES < 60) {
    return `${MINUTES}${t('m')} ${t('ago')}`
  } else if (HOURS < 24) {
    return `${HOURS}h ${t('ago')}`
  }
  // else if (days < 7) {
  //   return `${days}d ${t('ago')}`
  // } else {
  //   return `${weeks}w ${t('ago')}`
  // }
}

/** Hàm post message thông tin đến parent
 * @param {boolean} is_show: Kiểm tra xem popup hiển thị hay không?
 * @param {boolean} is_quick_chat: Kiểm tra xem có QUICK_CHAT không?
 *  @param {number} height: Chiều cao QUICK_CHAT (Do có nhiều case kích thước chiều cao)
 */
export const postMessageToParent = (
  is_show: boolean,
  is_quick_chat: boolean,
  height?: number
) => {
  // post message đến parent
  window.parent.postMessage(
    {
      from: 'BBH-EMBED-IFRAME',
      is_show: is_show,
      is_quick_chat: is_quick_chat,
      height: height || 0,
    },
    '*'
  )
}

/** Thêm thời gian đóng popup vào localStorage
 * @param {string} page_id: Nhận với page_id
 */
export const saveTimeClosePopup = (page_id: string) => {
  // Lưu vào thời gian đóng popup
  localStorage.setItem(`last_time_close__${page_id}`, Date.now().toString())
}

/** Hàm truncate
 * @param {string} str: Chuỗi cần truncate
 * @param {number} maxLength: Chiều dài chuỗi cần truncate
 * @returns {string} Chuỗi đã truncate
 */
export const truncateString = (str: string, maxLength: number) => {
  if (!str) return '' // Trả về chuỗi rỗng nếu str là null hoặc undefined
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

/** Hàm truncate cho sentences
 * @param {string} str: Chuỗi cần truncate
 * • Lấy từ đầu tiên của trong tên
 * @param {number} maxLength: Chiều dài chuỗi cần truncate
 * @returns {string} Chuỗi đã truncate
 */
export const truncateSentences = (str: string, maxLength: number) => {
  if (!str) return '' // Trả về chuỗi rỗng nếu str là null hoặc undefined

  const WORDS = str.split(' ') // Tách chuỗi thành mảng từ
  const FIRST_WORD = WORDS[0] // Lấy từ đầu tiên

  // Truncate nếu từ đầu tiên dài hơn maxLength
  return FIRST_WORD.length > maxLength
    ? FIRST_WORD.substring(0, maxLength) + '...'
    : FIRST_WORD
}
/** Hàm lấy tên file từ URL
 * @param {string} url: URL file
 * @return {string} Tên file
 */
export function extractMessageId(url: string | undefined) {
  if (!url) return null
  // Tìm vị trí của "message/" trong URL
  const MESSAGE_INDEX = url.indexOf('message/')

  // Kiểm tra xem chuỗi có chứa "message/" hay không
  if (MESSAGE_INDEX !== -1) {
    // Lấy phần chuỗi sau "message/" (cộng 8 vì "message/" có độ dài 8 ký tự)
    const MESSAGE_ID = url.substring(MESSAGE_INDEX + 8)
    return MESSAGE_ID // Trả về phần chuỗi sau "message/"
  } else {
    // Nếu không tìm thấy "message/" trong URL, trả về null
    return null
  }
}
