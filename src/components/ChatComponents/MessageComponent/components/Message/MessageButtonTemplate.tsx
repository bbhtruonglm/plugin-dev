// import { BtnType, Message } from '../../../type'
// import { fetchAPI, useAPI } from '@/api/api'
// import { selectGlobalClientId, selectPageId } from '@/stores/appSlice'

// import { useSelector } from 'react-redux'

// const MessageButtonTemplate = ({ data }: any) => {
//   /** Lấy Api từ hooks api */
//   const { DOMAIN_TRIGGER_BTN } = useAPI()
//   /** Khai báo kiểu dữ liệu
//    *
//    */
//   const IS_BUTTON_TEMPLATE =
//     data?.message_attachments?.[0]?.type === 'template' &&
//     data?.message_attachments?.[0]?.payload?.template_type === 'button'
//   /** Nếu không phải dạng button template thì trả về null */
//   if (!IS_BUTTON_TEMPLATE) return null
//   /** Khai báo kiểu dữ liệu */
//   const BUTTONS: BtnType[] = data.message_attachments[0]?.payload?.buttons || []
//   /** lấy Api từ hooks api */
//   const { SEND_MESSAGE_API } = useAPI()
//   /** Lấy client id */
//   const USER_ID = useSelector(selectGlobalClientId)

//   /** Lấy page id */
//   const PAGE_ID = useSelector(selectPageId)

//   /** Hàm postback */
//   const handlePostback = async (
//     message_id: string | undefined,
//     button_idx: number
//   ) => {
//     /**Payload */
//     const PAYLOAD = {
//       message_id: message_id,
//       client_id: USER_ID,
//       page_id: PAGE_ID,
//       button_index: button_idx,
//     }

//     /** call api */
//     try {
//       await fetch(DOMAIN_TRIGGER_BTN, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(PAYLOAD),
//       })
//     } catch (error) {}
//   }
//   /** Hàm gửi tin nhắn sử dụng api */
//   const sendMessage = async (text: string) => {
//     /** Lấy ID người dùng */
//     const META_DATA_ID = USER_ID

//     /** Khởi tạo body tin nhắn */
//     const MESSAGE: Message = {
//       page_id: PAGE_ID,
//       client_id: USER_ID,
//       text: text,
//       user_id: USER_ID,
//       ...(META_DATA_ID && {
//         metadata: `__user_normal__${META_DATA_ID}`,
//       }),
//       is_disable_ai: true,
//     }
//     /** Gọi api gửi tin nhắn */
//     await fetchAPI(SEND_MESSAGE_API, 'POST', MESSAGE)
//   }

//   /** Hàm click nút bấm */
//   const handleOnClick = (button: any, button_index: number) => {
//     /** Dạng web */
//     if (button?.type === 'web_url') {
//       window.open(button?.url, '_blank')
//     }
//     console.log(data, 'data')
//     /** Dạng postback */
//     if (button?.type === 'postback') {
//       /** Gọi gửi tin nhắn */
//       sendMessage(button.title)
//       /** Gọi hàm postback */
//       handlePostback(data?.message_mid, button_index)
//     }
//     /** Dạng sđt */
//     if (button?.type === 'phone_number') {
//       /** Nếu có payload */
//       if (button?.payload) {
//         /** Gọi sđt */
//         window.open(`tel:${button.payload}`, '_blank')
//       }
//     }
//   }

//   return (
//     <div className="flex flex-col p-2 gap-y-1">
//       <h4 className="text-sm font-medium enter-line">
//         {data?.message_attachments?.[0]?.title}
//       </h4>
//       <div className="flex flex-col gap-y-2">
//         {BUTTONS.map((button, index) => (
//           <div
//             key={index}
//             onClick={() => {
//               handleOnClick(button, index)
//             }}
//             className={`flex ${
//               button?.type === 'web_url' || button?.type === 'postback'
//                 ? 'bg-slate-800 hover:bg-slate-500 cursor-pointer text-yellow-200'
//                 : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
//             }  px-4 py-2 gap-1 rounded-lg justify-center items-center text-sm font-medium`}
//           >
//             {button?.title}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default MessageButtonTemplate

import { BtnType, Message } from '../../../type'
import { fetchAPI, useAPI } from '@/api/api'
import {
  selectClientName,
  selectGlobalClientId,
  selectPageId,
} from '@/stores/appSlice'

import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { useState } from 'react'

const MessageButtonTemplate = ({ data }: any) => {
  /** ✅ Tất cả hooks phải luôn ở trên cùng */
  const { DOMAIN_TRIGGER_BTN, SEND_MESSAGE_API } = useAPI()
  /** User id từ store */
  const USER_ID = useSelector(selectGlobalClientId)
  /** Page id từ store */
  const PAGE_ID = useSelector(selectPageId)
  /** Lấy tên khách hàng từ store */
  const CLIENT_NAME = useSelector(selectClientName)
  /** Trạng thái hiển thị  */
  const [show_full, setShowFull] = useState(false)

  /** ✅ Sau khi khai báo hooks mới kiểm tra điều kiện */
  const IS_BUTTON_TEMPLATE =
    data?.message_attachments?.[0]?.type === 'template' &&
    data?.message_attachments?.[0]?.payload?.template_type === 'button'
  /** Kiểm tra có phải trạng thái template k */
  if (!IS_BUTTON_TEMPLATE) {
    /** vẫn được return null, nhưng hooks không bị nhảy */
    return null
  }
  /** Khai báo các button */
  const BUTTONS: BtnType[] = data.message_attachments[0]?.payload?.buttons || []

  /** Gửi postback
   * @param message_id
   * @param button_idx
   */
  const handlePostback = async (
    message_id: string | undefined,
    button_idx: number,
  ) => {
    /** payload gửi lại, khi click btn */
    const PAYLOAD = {
      message_id,
      client_id: USER_ID,
      page_id: PAGE_ID,
      button_index: button_idx,
    }

    try {
      /** gọi đến domain trigger */
      await fetch(DOMAIN_TRIGGER_BTN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(PAYLOAD),
      })
    } catch (error) {
      console.error(error)
    }
  }

  /** Gửi tin nhắn
   * @param text
   */
  const sendMessage = async (text: string) => {
    /** lấy meta data */
    const META_DATA_ID = USER_ID
    /** Khai báo tin nhắn */
    const MESSAGE: Message = {
      page_id: PAGE_ID,
      client_id: USER_ID,
      text,
      user_id: USER_ID,
      ...(META_DATA_ID && {
        metadata: `__${CLIENT_NAME || t('anonymous')}__${META_DATA_ID}`,
      }),
      is_disable_ai: true,
    }
    /** Gửi tin nhắn */
    await fetchAPI(SEND_MESSAGE_API, 'POST', MESSAGE)
  }

  /** Xử lý khi click button
   * @param button
   * @param button_index
   */
  const handleOnClick = (button: any, button_index: number) => {
    /** Nếu là web url thì mở tab mới */
    if (button?.type === 'web_url') window.open(button?.url, '_blank')
    /** Nếu là postback thì gửi tin nhắn */
    if (button?.type === 'postback') {
      sendMessage(button.title)
      handlePostback(data?.message_mid, button_index)
    }
    /** Nếu là sdt thì mở sdt */
    if (button?.type === 'phone_number' && button?.payload) {
      window.open(`tel:${button.payload}`, '_blank')
    }
  }
  /** Tiêu đề của template */
  const TITLE = data?.message_attachments?.[0]?.title || ''

  return (
    <div className="flex flex-col p-2 gap-y-2">
      <div className="relative">
        <h4
          className={`text-sm font-medium whitespace-pre-line ${
            show_full ? '' : 'line-clamp-6 overflow-hidden text-ellipsis'
          }`}
        >
          {TITLE}
        </h4>

        {(TITLE.split('\n').length > 6 || TITLE.length > 200) && (
          <button
            onClick={() => setShowFull(!show_full)}
            className="text-blue-500 text-xs mt-1 hover:underline"
          >
            {show_full ? t('show_less') : t('show_more')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-y-2">
        {BUTTONS.map((button, index) => (
          <div
            key={index}
            onClick={() => handleOnClick(button, index)}
            className={`flex ${
              button?.type === 'web_url' || button?.type === 'postback'
                ? 'bg-slate-800 hover:bg-slate-500 cursor-pointer text-yellow-200'
                : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
            } px-4 py-2 gap-1 rounded-lg justify-center items-center text-sm font-medium`}
          >
            {button?.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageButtonTemplate
