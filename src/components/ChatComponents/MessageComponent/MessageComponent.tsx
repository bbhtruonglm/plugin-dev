import { BtnType, ElementType, MessageProps } from '../type'
import {
  extractMessageId,
  formatDate,
  isValidUrl,
  postMessageToParent,
} from '@/utils'
import { selectStatusPopup, setGlobalPreviewUrl } from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'

import AudioPlayer from './AudioPlayer'
import { ReactComponent as FileIcon } from '@/assets/document-text.svg'
import React from 'react'
import VideoPlayer from './VideoPlayter'

const MessageComponent = React.memo(({ data }: MessageProps) => {
  /** Hàm render css khi check type tin nhắn */
  const getMessageClasses = (messageType: string) => {
    /** Kiểm tra nếu messageType là 'page' */
    if (messageType === 'page') {
      /** Trả về các lớp CSS tương ứng nếu messageType là 'page' */
      return 'bg-white max-w-[60%]'
    }
    // else if (messageType === 'note') {
    //   return 'max-w-[60%] bg-[#D8F6CB]'
    // }
    if (messageType === 'client') {
      /** Nếu messageType không phải là 'system' hay 'page' */
      /** Trả về các lớp CSS mặc định cho các loại message khác */
      return 'bg-messBg max-w-[60%]'
    }
  }

  const dispatch = useDispatch()
  /** Hàm xử lý khi click xem preview ảnh
   * @param {string} url - Link preview
   * @action lưu URL vào stroe
   * @action gọi đến sdk để thay đổi kích thước hiển thị
   */
  const handleClickPreview = (url?: string) => {
    if (!url) return
    /** Lưu vào STORE */
    dispatch(setGlobalPreviewUrl(url))
    /** Click vào ảnh thì gửi thông tin cho sdk
     * Có thể lưu data và STORE
     */
    postMessageToParent(SHOW_POPUP, false, 674, url)
  }
  /** Trạng thái Đóng/ Mở Popup */
  const SHOW_POPUP = useSelector(selectStatusPopup)
  return (
    <div
      className={`flex flex-col transition-all duration-300 ease-out overflow-hidden gap-y-4 rounded-lg group relative ${getMessageClasses(
        data?.message_type
      )}`}
    >
      {/* Tooltip */}
      <div
        className={`absolute w-36 bottom-full ${
          data?.message_type === 'page' ? 'left-0' : 'right-0'
        }  text-xs font-semibold text-slate-700 bg-transparent rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        {formatDate(data?.time || data?.createdAt)}
      </div>
      {/* Hiện thị data dạng text */}
      {data?.message_text &&
        data?.message_type !== 'system' &&
        data?.message_type !== 'note' &&
        (!data?.message_attachments?.length ||
          !data?.message_attachments?.[0]?.type) && (
          <div className="flex p-2">
            <p className="text-sm min-h-4 break-words whitespace-pre-line">
              {data?.message_text}
            </p>
          </div>
        )}
    </div>
  )
})

export default MessageComponent
function dispatch(arg0: {
  payload: string | null | undefined
  type: 'app/setGlobalPreviewUrl'
}) {
  throw new Error('Function not implemented.')
}
