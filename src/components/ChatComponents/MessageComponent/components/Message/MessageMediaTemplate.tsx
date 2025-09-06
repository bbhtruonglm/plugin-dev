import COUPON_URL from '@/assets/coupon.png'

/** Element type */
interface ElementType {
  /** Media type */
  media_type: 'image' | 'video'
  /** Media url */
  url: string
  /** Title */
  title?: string
  /** Subtitle */
  subtitle?: string
  /** Buttons */
  buttons?: Array<{ type: string; url?: string; title?: string }>
}

/** Payload type */
interface PayloadType {
  /** Template type */
  template_type: string
  /** element */
  elements: ElementType[]
}

/** Message attachments type */
interface MessageAttachments {
  /** Type */
  type: string
  /** Payload */
  payload: PayloadType
}

/** Data type */
interface Data {
  /** Message attachments */
  message_attachments?: MessageAttachments
  /** Message mids */
  message_mid?: string
}

const MessageMediaTemplate = ({ data }: { data: Data }) => {
  /** Kiểm tra nếu dạng template media */
  const IS_MEDIA_TEMPLATE =
    data?.message_attachments?.type === 'template' &&
    data?.message_attachments?.payload?.template_type === 'media'
  /** Nếu không phải dạng template media thì trả về null */
  if (!IS_MEDIA_TEMPLATE) return null
  /** Khai báo kiểu dữ liệu */
  const ELEMENTS: ElementType[] =
    data.message_attachments?.payload?.elements || []

  return (
    <div className="flex gap-4 overflow-x-auto rounded-lg">
      {ELEMENTS.map((element, index) => (
        <div
          key={index}
          className="flex flex-col flex-shrink-0 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Media section */}
          <div className="w-full h-48 overflow-hidden">
            {element.media_type === 'video' ? (
              <video
                src={element.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={element.url || COUPON_URL}
                alt={element.title || 'Media'}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Button section */}
          <div className="flex flex-col items-center justify-center p-3 hover:bg-slate-200">
            {element.buttons &&
              element.buttons.map((button, btnIndex) => (
                <button
                  key={btnIndex}
                  onClick={() =>
                    button.type === 'web_url' &&
                    window.open(button.url, '_blank')
                  }
                  className="w-full text-blue-500 text-sm font-medium  transition"
                >
                  {button.title}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageMediaTemplate
