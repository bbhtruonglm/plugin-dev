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
