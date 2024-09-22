import { apiImage } from '@/api/api'

/** Hàm tìm locale từ URL */
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
// Hàm trích xuất locale từ cuối URL
export function getLocaleFromURL(path: any) {
  // Lấy pathname từ URL
  //   const path = window.location.pathname
  console.log(path, 'path')
  // Lấy phần cuối của pathname (sau dấu '/')
  const pathSegments = path.split('/').filter(Boolean) // Loại bỏ các chuỗi rỗng

  // Giả sử các locale hợp lệ là 'en' và 'vn'
  const supportedLocales = ['en', 'vn']

  // Lấy locale từ phần cuối cùng của pathname
  const lastSegment = pathSegments[pathSegments.length - 1]
  console.log(lastSegment, 'lastSegment')

  // Kiểm tra xem segment cuối cùng có phải là locale hợp lệ hay không
  if (supportedLocales.includes(lastSegment)) {
    return lastSegment
  }

  // Trả về ngôn ngữ mặc định nếu không tìm thấy locale hợp lệ
  return 'vn' // 'en' là fallback
}

/**tạo bg dựa trên chữ cái */
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

/**cắt ra 2 ký tự đầu và cuối trong tên */
export const nameToLetter = (name?: string) => {
  // Xử lý xoá dấu tiếng việt và lấy ký tự đầu cuối trong tên
  return removeVietnameseTones(name)
    .match(/(\b\S)?/g)
    ?.join('')
    .match(/(^\S|\S$)?/g)
    ?.join('')
    .toUpperCase()
}
/** Xoá dấu tiếng việt */
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
