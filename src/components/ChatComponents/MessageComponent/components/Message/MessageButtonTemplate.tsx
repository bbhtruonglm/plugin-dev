import { BtnType } from '../../../type'

const MessageButtonTemplate = ({ data }: any) => {
  /** Khai báo kiểu dữ liệu
   *
   */
  const IS_BUTTON_TEMPLATE =
    data?.message_attachments?.[0]?.type === 'template' &&
    data?.message_attachments?.[0]?.payload?.template_type === 'button'
  /** Nếu không phải dạng button template thì trả về null */
  if (!IS_BUTTON_TEMPLATE) return null
  /** Khai báo kiểu dữ liệu */
  const BUTTONS: BtnType[] = data.message_attachments[0]?.payload?.buttons || []

  return (
    <div className="flex flex-col p-2 gap-y-1">
      <h4 className="text-sm font-medium enter-line min-h-4 truncate">
        {data?.message_attachments?.[0]?.title}
      </h4>
      <div className="flex flex-col gap-y-2">
        {BUTTONS.map((button, index) => (
          <div
            key={index}
            onClick={() => {
              if (button?.type === 'web_url') {
                window.open(button?.url, '_blank')
              }
            }}
            className={`flex ${
              button?.type === 'web_url'
                ? 'bg-slate-800 cursor-pointer text-yellow-200'
                : 'bg-slate-200 text-black cursor-not-allowed'
            }  px-4 py-2 gap-1 rounded-lg justify-center items-center text-sm font-medium`}
          >
            {button?.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageButtonTemplate
