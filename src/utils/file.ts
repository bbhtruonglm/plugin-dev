/**
 * Tập hợp các hàm tiện ích xử lý các tác vụ liên quan đến tệp tin.
 */

/**
 * Trích xuất tên tệp tin từ một đường dẫn URL.
 * Tại sao: Cần lấy tên tệp gốc để hiển thị cho người dùng thay vì hiển thị toàn bộ đường dẫn URL phức tạp.
 * @param {string} url - Đường dẫn URL chứa tệp tin
 * @returns {string | null} - Tên tệp tin đã được giải mã hoặc null nếu không hợp lệ
 */
export function getFilenameFromUrl(url: string | undefined): string | null {
  // Nếu không có URL hợp lệ thì kết thúc hàm
  if (!url) {
    return null
  }

  try {
    /** Phân tách URL bằng dấu '/' và loại bỏ các phần tử trống */
    const PATH_SEGMENTS = url.split('/').filter(Boolean)

    /** Lấy phần tử cuối cùng của mảng, đây chính là tên tệp tin */
    const FILENAME = PATH_SEGMENTS.pop()

    // Trả về tên tệp tin sau khi giải mã các ký tự URI (ví dụ: %20 -> khoảng trắng)
    return FILENAME ? decodeURIComponent(FILENAME) : null
  } catch (e) {
    // Trả về null nếu có bất kỳ lỗi nào xảy ra trong quá trình xử lý (ví dụ: URL sai định dạng)
    return null
  }
}

/**
 * Trích xuất phần mở rộng của tệp tin từ tên file hoặc URL.
 * Tại sao: Cần xác định loại tệp để hiển thị icon và màu sắc tương ứng trên UI.
 * @param {string} filename - Tên tệp tin hoặc đường dẫn URL
 * @returns {string} - Phần mở rộng (ví dụ: 'pdf', 'docx') hoặc chuỗi rỗng
 */
export function getFileExtension(filename: string | undefined): string {
  // Trả về chuỗi rỗng nếu không có dữ liệu đầu vào
  if (!filename) {
    return ''
  }

  /** Danh sách các định dạng file phổ biến để nhận diện từ URL động */
  const KNOWN_EXTENSIONS = [
    'pdf',
    'docx',
    'doc',
    'xls',
    'xlsx',
    'zip',
    'rar',
    'txt',
    'csv',
    'png',
    'jpg',
    'jpeg',
  ]

  // 1. Thử lấy theo định dạng truyền thống (.abc)
  const PARTS = filename.split('.')
  // Nếu có phần mở rộng
  if (PARTS.length > 1) {
    /** Lấy phần mở rộng */
    const EXT = PARTS.pop()?.toLowerCase() || ''
    // Kiểm tra nếu phần mở rộng không chứa ký tự đặc biệt của đường dẫn hoặc query
    if (EXT && !EXT.includes('/') && !EXT.includes('?')) {
      // Trả về phần mở rộng
      return EXT
    }
  }

  // 2. Xử lý các URL động không có dấu chấm (ví dụ: .../download/pdf)
  try {
    /** Tạo URL object */
    const URL_OBJ = new URL(filename)
    /** Tách URL thành các segment */
    const SEGMENTS = URL_OBJ.pathname.split('/').filter(Boolean)

    /** Kiểm tra segment cuối cùng của đường dẫn */
    const LAST_SEGMENT = SEGMENTS[SEGMENTS.length - 1]?.toLowerCase()
    // Nếu segment cuối cùng là một trong các định dạng file đã biết
    if (LAST_SEGMENT && KNOWN_EXTENSIONS.includes(LAST_SEGMENT)) {
      // Trả về phần mở rộng
      return LAST_SEGMENT
    }

    // Kiểm tra segment kế cuối nếu segment cuối là 'download' hoặc 'view'
    if (SEGMENTS.length > 1) {
      /** Lấy segment kế cuối */
      const PREV_SEGMENT = SEGMENTS[SEGMENTS.length - 2]?.toLowerCase()
      /** Nếu segment kế cuối là một trong các định dạng file đã biết */
      if (KNOWN_EXTENSIONS.includes(PREV_SEGMENT)) {
        // Trả về phần mở rộng
        return PREV_SEGMENT
      }
    }
  } catch (e) {
    /** Fallback: Thử cắt chuỗi thủ công theo dấu '/' nếu không phải URL hợp lệ */
    const SEGMENTS = filename.split('/').filter(Boolean)
    /** Lấy phần cuối cùng của mảng */
    const LAST_PART = SEGMENTS.pop()?.toLowerCase() || ''
    // Nếu segment cuối cùng là một trong các định dạng file đã biết
    if (KNOWN_EXTENSIONS.includes(LAST_PART)) {
      // Trả về phần mở rộng
      return LAST_PART
    }
  }

  return ''
}
