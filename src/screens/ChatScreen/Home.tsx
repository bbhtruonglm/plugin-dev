import ChatOption from '@/components/HomeComponents/ChatOption'
import { HomeProps } from './type'
import SendMessage from '@/components/HomeComponents/SendMessage'
import UnreadMessage from '@/components/HomeComponents/UnreadMessage'
import { selectLatestMessage } from '@/stores/appSlice'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

function Home({
  onNavigate,
  onError,
  social_link,
  client_name,
  web_form,
  social_description,
}: HomeProps) {
  /**
   * Lấy thông tin từ web_form
   */
  const { is_active, source } = web_form || {}
  /**
   * Lấy title và description từ source
   */
  const { title, description } = source || {}

  /**
   * Tin nhắn mới nhất
   */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  return (
    <div className="flex flex-col px-5 py-3 gap-y-5">
      {/* Greeting */}
      <div className="">
        <h1 className="text-2xl font-semibold">
          {client_name
            ? `${title || t('_hi')} ${client_name},` ||
              `${t('_hi')} ${client_name},`
            : t('welcome')}
        </h1>
        <h2 className="text-xl font-medium">
          {description || t('welcomeMessage')}
        </h2>
      </div>

      {/* Send message */}
      {LATEST_MESSAGE && (
        <UnreadMessage
          onNavigate={onNavigate}
          onError={onError}
          client_name={client_name}
        />
      )}

      {/* Send message */}

      <SendMessage
        onNavigate={onNavigate}
        onError={onError}
        client_name={client_name}
      />

      {/* Lựa chọn kênh liên lạc. Nếu không có list social thì ẩn đi */}
      {!!social_link?.length && (
        <ChatOption
          social_link={social_link}
          social_description={social_description}
        />
      )}
      {/* Giới thiệu AI */}
      {/* <IntroAI /> */}
      {/* Tìm kiếm trợ giúp */}
      {/* <Help /> */}
    </div>
  )
}

export default Home
