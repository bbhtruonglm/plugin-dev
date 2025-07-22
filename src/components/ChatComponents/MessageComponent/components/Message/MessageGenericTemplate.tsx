import { ElementType } from '../../../type'

const MessageGenericTemplate = ({ data }: any) => {
  /** Check giá trị generic template */
  const IS_GENERIC_TEMPLATE =
    data?.message_attachments?.[0]?.type === 'template' &&
    data?.message_attachments?.[0]?.payload?.template_type === 'generic'
  /** Nếu không phải dạng generic template thì trả về null */
  if (!IS_GENERIC_TEMPLATE) return null
  /** Khai báo kiểu dữ liệu */
  const ELEMENTS: ElementType[] =
    data.message_attachments[0]?.payload?.elements || []

  return (
    <div className="flex gap-x-1 overflow-x-auto">
      {ELEMENTS.map((element, index) => (
        <div
          key={index}
          className="rounded-lg p-2 flex flex-col gap-x-2 flex-shrink-0 w-40"
        >
          <div className="cursor-pointer hover:brightness-90 rounded-lg overflow-hidden">
            <div className="bg-gray-50 rounded-lg w-[160px] h-[160px]">
              <img
                src={element?.image_url}
                alt={element?.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-black truncate">
              {element?.title}
            </div>
            <div className="text-slate-500 truncate">{element?.subtitle}</div>
          </div>
          <div className="flex flex-col gap-2">
            {element?.buttons?.map((button, buttonIndex) => (
              <button
                key={buttonIndex}
                onClick={() => {
                  if (button?.type === 'web_url') {
                    window.open(button?.url, '_blank')
                  }
                }}
                className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                  button.type === 'web_url'
                    ? 'bg-slate-800 text-yellow-200'
                    : 'bg-slate-200 text-black cursor-not-allowed'
                }`}
              >
                {button?.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageGenericTemplate
