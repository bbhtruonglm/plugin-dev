import { selectListUnreadMessage, selectPageId } from '@/stores/appSlice'

import { ReactComponent as IconSend } from '@/assets/send.svg'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function SendMessage({ onNavigate, onError }: SendMessageProps) {
  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)
  /** Số tin nhắn chưa đọc từ store */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)
  /** Chỉ lấy tin nhắn chưa đọc từ page, không lấy từ client */
  const LIST_UNREAD_MESSAGE_FILTER = LIST_UNREAD_MESSAGE.filter(
    (item) => item.message_type === 'page'
  )

  return (
    <div
      onClick={() => {
        if (PAGE_ID && PAGE_ID !== null) {
          // Có page_id thì thêm page_id và url, sau đó chuyển trang
          onNavigate()
        } else {
          // Không có page_id thì báo lỗi
          onError()
        }
      }}
      className="bg-white py-3 rounded-xl flex justify-between px-6 items-center shadow-md cursor-pointer"
    >
      <div>
        <h4 className="text-base font-semibold flex items-center gap-x-1">
          {t('sendUs')}
          <span
            className={`text-white bg-red-500 text-xxs rounded-full h-4 w-4 ${
              !LIST_UNREAD_MESSAGE_FILTER?.length ? 'hidden' : 'block'
            } flex justify-center items-center`}
          >
            {LIST_UNREAD_MESSAGE_FILTER?.length < 10
              ? LIST_UNREAD_MESSAGE_FILTER?.length
              : '9+'}
          </span>
        </h4>
        <h5 className="flex gap-2 items-center text-sm text-onlineColor">
          <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
          {t('we_are_online')}
        </h5>
      </div>
      <div>
        <IconSend />
      </div>
    </div>
  )
}

export default SendMessage
