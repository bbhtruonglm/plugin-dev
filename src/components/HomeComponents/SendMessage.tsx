import { ReactComponent as IconSend } from '@/assets/send.svg'
import { selectPageId } from '@/stores/appSlice'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function SendMessage({
  onNavigate,
  onError,
  unread_message_count = 0,
}: SendMessageProps) {
  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)
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
              unread_message_count ? 'block' : 'hidden'
            } flex justify-center items-center`}
          >
            {unread_message_count < 10 ? unread_message_count : '9+'}
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
