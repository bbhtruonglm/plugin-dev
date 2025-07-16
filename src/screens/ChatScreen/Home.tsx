import { selectClientName, selectLatestMessage } from '@/stores/appSlice'

import ChatOption from '@/components/HomeComponents/ChatOption'
import { HomeProps } from './type'
import SendMessage from '@/components/HomeComponents/SendMessage'
import UnreadMessage from '@/components/HomeComponents/UnreadMessage'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

function Home({
  onNavigate,
  onError,
  social_link,
  web_form,
  social_description,
}: HomeProps) {
  /** Dịch ngôn ngữ */
  const { t, i18n: I18N } = useTranslation()

  /** Client name */
  const CLIENT_NAME = useSelector(selectClientName)

  /**
   * Lấy thông tin từ web_form
   */
  const { is_active, source } = web_form || {}

  /**
   * Lấy title và description từ source
   */
  const { title, description } = source[I18N.language] || {}

  /**
   * Tin nhắn mới nhất
   */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  return (
    <div className="flex flex-col px-5 py-3 gap-y-5">
      {/* Greeting */}
      <div className="">
        <h1 className="text-2xl font-semibold">
          {CLIENT_NAME
            ? `${title || t('_hi')} ${CLIENT_NAME},` ||
              `${t('_hi')} ${CLIENT_NAME},`
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
        />
      )}

      {/* Send message */}

      <SendMessage
        onNavigate={onNavigate}
        onError={onError}
      />

      {/* Lựa chọn kênh liên lạc. Nếu không có list social thì ẩn đi */}
      {!!social_link?.length && (
        <ChatOption
          social_link={social_link}
          social_description={social_description[I18N.language]}
        />
      )}
    </div>
  )
}

export default Home
