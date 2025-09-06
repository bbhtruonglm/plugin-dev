import COUPON_URL from '@/assets/coupon.png'
import { ElementType } from '../../../type'
const MessageGenericTemplateNew = ({ data }: any) => {
  /** Check giá trị generic template */
  const IS_GENERIC_TEMPLATE =
    data?.message_attachments?.type === 'template' &&
    data?.message_attachments?.payload?.template_type === 'generic'
  /** Nếu không phải dạng generic template thì trả về null */
  if (!IS_GENERIC_TEMPLATE) return null
  /** Khai báo kiểu dữ liệu */
  const ELEMENTS: ElementType[] =
    data.message_attachments?.payload?.elements || []

  return (
    <div className="flex gap-x-1 overflow-x-auto rounded-lg shadow-lg">
      {ELEMENTS.map((element, index) => (
        <div
          key={index}
          className="rounded-lg flex flex-col gap-x-2 flex-shrink-0 w-full"
        >
          <div className="cursor-pointer hover:brightness-90 rounded-t-lg overflow-hidden">
            <div className="bg-gray-50 rounded-lg w-full h-40">
              <img
                // src={element?.image_url}
                src={COUPON_URL}
                alt={element?.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-xs p-2">
            <div className="font-bold text-black truncate">
              {element?.title}
            </div>
            <div className="text-slate-500 truncate">{element?.subtitle}</div>
          </div>
          <div className="flex flex-col">
            {element?.buttons?.map((button, buttonIndex) => (
              <button
                key={buttonIndex}
                onClick={() => {
                  if (button?.type === 'web_url') {
                    window.open(button?.url, '_blank')
                  }
                }}
                className={`py-2 px-4 text-sm text-blue-500 font-medium flex items-center justify-center gap-1 border-t`}
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

export default MessageGenericTemplateNew
