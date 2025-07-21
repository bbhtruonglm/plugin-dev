import { MessageProps } from '../../type'
import { isValidUrl } from '@/utils'

const MessageFallback = ({ data }: { data: MessageProps['data'] }) => {
  /** Nếu có dạng fallback thì trả về null
   *  hoặc dạng system thì trả về null
   */
  if (
    data?.message_type === 'system' ||
    data?.message_attachments?.[0]?.type !== 'fallback'
  )
    return null
  /** Lấy ra URL */
  const URL = isValidUrl(data.message_text) ? data.message_text : 'about:blank'

  return (
    <div className="flex p-2">
      <a
        className="text-sm min-h-4 break-words whitespace-pre-line overflow-hidden break-all text-ellipsis underline hover:text-blue-500"
        href={URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {data?.message_text || 'No link available'}
      </a>
    </div>
  )
}

export default MessageFallback
