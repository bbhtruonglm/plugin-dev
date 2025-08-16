import { MessageProps } from '@/components/ChatComponents/type'

const ButtonTemplate = ({ data }: MessageProps) => {
  /** Lấy danh sách nút từ payload */
  const BUTTONS = data?.message_attachments?.[0]?.payload?.buttons || []

  return (
    <div className="flex flex-col p-2 gap-y-1 w-full">
      <h4 className="text-sm font-medium enter-line min-h-4 truncate">
        {data?.message_attachments?.[0]?.title}
      </h4>
      <div className=" flex flex-col items-start w-1/2 gap-2">
        {BUTTONS.map((button, idx) => (
          <div
            key={idx}
            onClick={() => {}}
            className={`flex ${
              button?.type === 'web_url' || button?.type === 'postback'
                ? 'bg-slate-800 hover:bg-slate-500 cursor-pointer text-yellow-200'
                : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
            }  px-4 py-1 gap-1 w-full rounded-lg justify-center items-center text-sm font-medium`}
          >
            {button?.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ButtonTemplate
