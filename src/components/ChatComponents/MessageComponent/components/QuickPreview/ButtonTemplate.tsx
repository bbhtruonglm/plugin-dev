import { MessageProps } from '@/components/ChatComponents/type'

const ButtonTemplate = ({ data }: MessageProps) => {
  /** Lấy danh sách nút từ payload */
  const BUTTONS = data?.message_attachments?.[0]?.payload?.buttons || []

  return (
    <div className="w-full flex flex-col items-start gap-2">
      {BUTTONS.map((btn, idx) => (
        <button
          key={idx}
          className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => {
            // handleClick(btn)
          }}
        >
          {btn?.title || 'Action'}
        </button>
      ))}
    </div>
  )
}

export default ButtonTemplate
