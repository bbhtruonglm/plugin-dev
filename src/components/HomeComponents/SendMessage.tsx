import { ReactComponent as IconSend } from '@/assets/send.svg'
import { t } from 'i18next'
import { useNavigate } from 'react-router-dom'
interface SendMessageProps {
  page_id: String | null
  onNavigate: () => void
  onError: () => void
}
function SendMessage({ page_id, onNavigate, onError }: SendMessageProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => {
        // Có page_id thì thêm page_id và url, sau đó chuyển trang
        if (page_id && page_id !== null) {
          navigate(`/?page_id=${page_id}`)
          onNavigate()
        } else {
          // Không có page_id thì báo lỗi
          onError()
        }
      }}
      className="bg-white py-3 rounded-xl flex justify-between px-6 items-center shadow-md cursor-pointer"
    >
      <div>
        <h4 className="text-base font-semibold">{t('sendUs')}</h4>
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
