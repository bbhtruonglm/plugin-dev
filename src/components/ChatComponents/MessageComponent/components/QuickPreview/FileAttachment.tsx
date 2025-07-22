import { ReactComponent as FileIcon } from '@/assets/document-text.svg'
import { MessageProps } from '@/components/ChatComponents/type'
import { extractMessageId } from '@/utils'

const FileAttachment = ({ data }: MessageProps) => {
  /** Lấy file từ dữ liệu tin nhắn */
  const FILE = data?.message_attachments?.[0]

  return (
    <div className="flex items-center w-full gap-2 rounded p-2 border border-slate-200 bg-white">
      <FileIcon className="w-6 h-6" />
      <div className="flex-1 overflow-hidden">
        <a
          href={FILE?.payload?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          {extractMessageId(data?.message_attachments?.[0]?.payload?.url)}
        </a>
      </div>
    </div>
  )
}

export default FileAttachment
