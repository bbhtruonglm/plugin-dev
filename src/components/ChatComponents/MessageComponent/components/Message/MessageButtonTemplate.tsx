import { BtnType, Message } from '../../../type'
import { fetchAPI, useAPI } from '@/api/api'
import { selectGlobalClientId, selectPageId } from '@/stores/appSlice'

import { useSelector } from 'react-redux'

const MessageButtonTemplate = ({ data }: any) => {
  /** Lấy Api từ hooks api */
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
  /** lấy Api từ hooks api */
  const { SEND_MESSAGE_API } = useAPI()
  /** Lấy client id */
  const USER_ID = useSelector(selectGlobalClientId)

  /** Lấy page id */
  const PAGE_ID = useSelector(selectPageId)

  /** Hàm postback */
  const handlePostback = async (
    message_id: string | undefined,
    button_idx: number
  ) => {
    /**Payload */
    const PAYLOAD = {
      message_id: message_id,
      client_id: USER_ID,
      page_id: PAGE_ID,
      button_index: button_idx,
    }

    /** call api */
    try {
      await fetch(DOMAIN_TRIGGER_BTN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(PAYLOAD),
      })
    } catch (error) {}
  }
  /** Hàm gửi tin nhắn sử dụng api */
  const sendMessage = async (text: string) => {
    /** Lấy ID người dùng */
    const META_DATA_ID = USER_ID

    /** Khởi tạo body tin nhắn */
    const MESSAGE: Message = {
      page_id: PAGE_ID,
      client_id: USER_ID,
      text: text,
      user_id: USER_ID,
      ...(META_DATA_ID && {
        metadata: `__user_normal__${META_DATA_ID}`,
      }),
      is_disable_ai: true,
    }
    /** Gọi api gửi tin nhắn */
    await fetchAPI(SEND_MESSAGE_API, 'POST', MESSAGE)
  }

  /** Hàm click nút bấm */
  const handleOnClick = (button: any, button_index: number) => {
    /** Dạng web */
    if (button?.type === 'web_url') {
      window.open(button?.url, '_blank')
    }
    console.log(data, 'data')
    /** Dạng postback */
    if (button?.type === 'postback') {
      /** Gọi gửi tin nhắn */
      sendMessage(button.title)
      /** Gọi hàm postback */
      handlePostback(data?.message_mid, button_index)
    }
    /** Dạng sđt */
    if (button?.type === 'phone_number') {
      /** Nếu có payload */
      if (button?.payload) {
        /** Gọi sđt */
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
              handleOnClick(button, index)
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
