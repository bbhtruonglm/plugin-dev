import { selectGlobalClientId, selectPageId } from '@/stores/appSlice'

import { BtnType } from '../../../type'
import { useAPI } from '@/api/api'
import { useSelector } from 'react-redux'

const MessageButtonTemplate = ({ data }: any) => {
  const { DOMAIN_TRIGGER_BTN } = useAPI()
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

  /** Lấy client id */
  const USER_ID = useSelector(selectGlobalClientId)

  /** Lấy page id */
  const PAGE_ID = useSelector(selectPageId)
  const handlePostback = async (payload: string | undefined) => {
    /** Lấy id flow */
    const FLOW_ID = payload?.split('_')[1]
    /** End point trigger kích hoạt kịch bản */

    /**Payload */
    const PAYLOAD = {
      flow_id: FLOW_ID,
      client_id: USER_ID,
      page_id: PAGE_ID,
    }
    try {
      await fetch(DOMAIN_TRIGGER_BTN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'mjzollPs8nC8aGX4qDWnGmpClXl8BQZcV5F3TtXsITw',
        },
        body: JSON.stringify(PAYLOAD),
      })
    } catch (error) {}
  }

  /** Hàm click nút bấm */
  const handleOnClick = (button: any) => {
    /** Dạng web */
    if (button?.type === 'web_url') {
      window.open(button?.url, '_blank')
    }
    /** Dạng postback */
    if (button?.type === 'postback') {
      handlePostback(button?.payload)
    }
    /** Dạng sđt */
    if (button?.type === 'phone_number') {
      if (button?.payload) {
        window.open(`tel:${button.payload}`, '_blank')
      }
    }
  }

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
              handleOnClick(button)
            }}
            className={`flex ${
              button?.type === 'web_url' || button?.type === 'postback'
                ? 'bg-slate-800 hover:bg-slate-500 cursor-pointer text-yellow-200'
                : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
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
