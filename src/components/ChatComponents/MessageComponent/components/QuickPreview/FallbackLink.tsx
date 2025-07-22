import { MessageProps } from '@/components/ChatComponents/type'
import { isValidUrl } from '@/utils'

const FallbackLink = ({ data }: MessageProps) => {
  /** Lấy văn bản từ dữ liệu tin nhắn */
  const TEXT = data?.message_text

  return (
    <div className="text-sm w-full line-clamp-2">
      {isValidUrl(TEXT) ? (
        <a
          href={TEXT}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {TEXT}
        </a>
      ) : (
        <p>{TEXT}</p>
      )}
    </div>
  )
}

export default FallbackLink
