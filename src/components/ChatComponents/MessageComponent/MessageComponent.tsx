import {
  selectEmbedPosition,
  selectEmbedPositionDetail,
  selectStatusAI,
  selectStatusPopup,
} from '@/stores/appSlice'

import MessageAudio from './components/Message/MessageAudio'
import MessageButtonTemplate from './components/Message/MessageButtonTemplate'
import MessageCouponTemplate from './components/Message/MessageCouponTemplate'
import MessageFallback from './components/Message/MessageFallback'
import MessageFile from './components/Message/MessageFile'
import MessageGenericTemplate from './components/Message/MessageGenericTemplate'
import MessageGenericTemplateNew from './components/Message/MessageGenericTemplateNew'
import MessageImage from './components/Message/MessageImage'
import MessageMediaTemplate from './components/Message/MessageMediaTemplate'
import { MessageProps } from '../type'
import MessageText from './components/Message/MessageText'
import MessageVideo from './components/Message/MessageVideo'
import React from 'react'
import { formatDate } from '@/utils'
import { useSelector } from 'react-redux'

// const getMessageClasses = (messageType: string, AI_STATUS?: boolean) => {
//   if (messageType === 'page') {
//     return AI_STATUS ? 'max-w-[80%] bg-[#f4f4f4]' : 'bg-messBg max-w-[60%]'
//   } else if (messageType === 'client') {
//     return 'bg-blue-100 max-w-[60%] self-end'
//   } else if (messageType === 'system') {
//     return 'text-center text-gray-500 text-sm py-2'
//   }
//   return ''
// }
/** Hàm render css khi check type tin nhắn
 * @param {string} messageType - Loại tin nhắn
 */
const getMessageClasses = (
  messageType: string,
  AI_STATUS?: boolean,
  template_type?: string
) => {
  /** Kiểm tra nếu messageType là 'page' */
  if (messageType === 'page') {
    /** Trả về các lớp CSS tương ứng nếu messageType là 'page' */
    if (AI_STATUS) {
      return ' max-w-[80%]'
    }

    /**
     * Mặc định trả về các lớp CSS cho messageType khác
     */
    return `${
      template_type === 'coupon' ? ' max-w-[80%]' : 'bg-white max-w-[60%]'
    } `
  }
  /** Kiểm tra nếu messageType là 'client' */
  if (messageType === 'client') {
    /**
     * Nếu AI_STATUS là true thì trả về các lớp CSS tương ứng
     */
    if (AI_STATUS) {
      return ' max-w-[80%] bg-messBg '
    }
    /** Nếu messageType không phải là 'system' hay 'page' */
    /** Trả về các lớp CSS mặc định cho các loại message khác */
    return ' bg-messBg max-w-[60%]'
  }
}

const MessageComponent = React.memo(({ data }: MessageProps) => {
  /** Trạng thái AI_STATUS */
  const AI_STATUS = useSelector(selectStatusAI)
  /** Hàm xử lý khi click xem preview ảnh */
  const SHOW_POPUP = useSelector(selectStatusPopup)
  /** Trạng thái vị trí của embed */
  const POSITION = useSelector(selectEmbedPosition)
  /** Trạng thái vị trí chi tiết của embed */
  const POSITION_DETAIL = useSelector(selectEmbedPositionDetail)
  /** Lấy kiểu tin nhắn từ dữ liệu */
  const MESSAGE_TYPE = data?.message_type || ''
  /** Lấy các lớp CSS dựa trên kiểu tin nhắn và trạng thái AI */
  const CONTAINER_CLASS = getMessageClasses(
    MESSAGE_TYPE,
    AI_STATUS,
    data?.message_attachments?.payload?.template_type
  )

  return (
    <div
      className={`group relative flex flex-col transition-all duration-300 ease-out gap-y-4 rounded-lg ${CONTAINER_CLASS}`}
      // className={`flex flex-col transition-all duration-300 ease-out gap-y-4 rounded-lg group relative ${getMessageClasses(
      //   data?.message_type
      // )}`}
    >
      {(MESSAGE_TYPE === 'page' || MESSAGE_TYPE === 'client') && (
        <div
          className={`absolute w-36 bottom-full ${
            data?.message_type === 'page' ? 'left-0' : 'right-0'
          }  text-xs font-semibold text-slate-700 bg-transparent rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          {formatDate(data?.time || data?.createdAt)}
        </div>
      )}

      <MessageText
        data={data}
        AI_STATUS={AI_STATUS}
      />
      <MessageImage
        data={data}
        SHOW_POPUP={SHOW_POPUP}
        POSITION={POSITION}
        POSITION_DETAIL={POSITION_DETAIL}
      />
      <MessageVideo data={data} />
      <MessageAudio data={data} />
      <MessageFile data={data} />
      <MessageButtonTemplate data={data} />
      <MessageCouponTemplate data={data} />
      <MessageGenericTemplate data={data} />
      <MessageGenericTemplateNew data={data} />
      <MessageMediaTemplate data={data} />
      <MessageFallback data={data} />
    </div>
  )
})

export default MessageComponent
