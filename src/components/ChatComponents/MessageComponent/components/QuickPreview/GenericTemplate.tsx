import { MessageProps } from '@/components/ChatComponents/type'

const GenericTemplate = ({ data }: MessageProps) => {
  /** Lấy payload từ dữ liệu tin nhắn */
  const PAYLOAD = data?.message_attachments?.[0]?.payload
  /** Kiểm tra xem payload có chứa elements không */
  if (!PAYLOAD?.elements?.length) return null

  return (
    <div className="w-full grid grid-cols-1 gap-4">
      {PAYLOAD.elements.map((element, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-slate-200 bg-white shadow-sm p-4"
        >
          {element?.image_url && (
            <img
              src={element.image_url}
              alt="element"
              className="w-full h-40 object-cover rounded mb-2"
            />
          )}
          <h3 className="text-sm font-semibold mb-1">{element.title}</h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {element.subtitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {element.buttons?.map((btn, btnIdx) => (
              <button
                key={btnIdx}
                className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {btn.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GenericTemplate
