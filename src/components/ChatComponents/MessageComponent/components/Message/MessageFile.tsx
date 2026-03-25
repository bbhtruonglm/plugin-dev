import { ReactComponent as FileIcon } from '@/assets/document-text.svg'
import { getFileExtension, getFilenameFromUrl } from '@/utils/file'
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import { t } from 'i18next'

/**
 * Thành phần hiển thị tin nhắn chứa file đính kèm.
 * Tại sao: Cần hiển thị nội dung văn bản đi kèm (nếu có) và khung thông tin file để người dùng có thể nhận diện và tải về.
 * @param {any} data - Dữ liệu tin nhắn bao gồm văn bản và các tệp đính kèm
 * @returns {JSX.Element | null} - Giao diện tin nhắn file hoặc null nếu không có file
 */
function MessageFile({ data }: { data: any }) {
  /** Ẩn component nếu không có file đính kèm hợp lệ */
  if (data?.message_attachments?.[0]?.type !== 'file') {
    return null
  }

  /** Lấy thông tin tệp tin đầu tiên */
  const FILE_INFO = data.message_attachments[0]
  /** Trích xuất tên file */
  const FILENAME = getFilenameFromUrl(FILE_INFO?.payload?.url) || ''
  /** Lấy phần mở rộng của file */
  const EXTENSION = getFileExtension(FILENAME)

  /** Định nghĩa màu sắc và phong cách dựa trên loại file */
  const FILE_STYLES: Record<string, { color: string; bg: string }> = {
    pdf: { color: 'text-red-600', bg: 'bg-red-50' },
    doc: { color: 'text-blue-600', bg: 'bg-blue-50' },
    docx: { color: 'text-blue-600', bg: 'bg-blue-50' },
    xls: { color: 'text-green-600', bg: 'bg-green-50' },
    xlsx: { color: 'text-green-600', bg: 'bg-green-50' },
    zip: { color: 'text-amber-600', bg: 'bg-amber-50' },
    rar: { color: 'text-amber-600', bg: 'bg-amber-50' },
    default: { color: 'text-slate-600', bg: 'bg-slate-100' },
  }

  /** Lấy style hiện tại hoặc fallback về mặc định */
  const { color: ICON_COLOR, bg: ICON_BG } =
    FILE_STYLES[EXTENSION] || FILE_STYLES.default

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Nội dung văn bản đi kèm nếu có */}
      {data?.message_text && (
        <div className="text-sm text-slate-800 break-words whitespace-pre-line">
          {data.message_text}
        </div>
      )}

      {/* Thẻ tập tin đính kèm với hiệu ứng hover */}
      <a
        href={FILE_INFO?.payload?.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all duration-300 no-underline group"
      >
        {/* Biểu tượng file với chỉ báo loại file */}
        <div
          className={`relative flex-shrink-0 w-12 h-12 ${ICON_BG} rounded-xl flex items-center justify-center shadow-sm border border-transparent group-hover:shadow-md transition-all`}
        >
          <FileIcon className={`size-7 ${ICON_COLOR} group-hover:scale-110 transition-transform`} />
          {/* Nhãn phần mở rộng được gắn lên icon */}
          {EXTENSION && (
            <div
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded shadow-sm border border-white ${ICON_BG} ${ICON_COLOR} text-[8px] font-black uppercase leading-none`}
            >
              {EXTENSION}
            </div>
          )}
        </div>

        {/* Thông tin chính của tệp tin */}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors mb-0">
            {FILENAME || t('download_file')}
          </p>
        </div>

        {/* Mũi tên chỉ hướng tải xuống */}
        <div className="flex-shrink-0 text-slate-500 group-hover:text-blue-400 transition-all">
         <ArrowDownTrayIcon className='size-5' />
        </div>
      </a>
    </div>
  )
}

export default MessageFile
