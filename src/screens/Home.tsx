import ChatOption from '@/components/HomeComponents/ChatOption'
import SendMessage from '@/components/HomeComponents/SendMessage'
import { t } from 'i18next'

function Home({
  onNavigate,
  onError,
  social_link,
  unread_message_count,
}: HomeProps) {
  return (
    <div className="flex flex-col px-5 py-3 gap-y-4">
      {/* Greeting */}
      <div className="">
        <h1 className="text-2xl font-semibold">{t('welcome')}</h1>
        <h2 className="text-xl font-medium">{t('welcomeMessage')}</h2>
      </div>
      {/* Send message */}
      <SendMessage
        // page_id={page_id}
        onNavigate={onNavigate}
        onError={onError}
        unread_message_count={unread_message_count}
      />

      {/* Lựa chọn kênh liên lạc */}
      <ChatOption social_link={social_link} />
      {/* Giới thiệu AI */}
      {/* <IntroAI /> */}
      {/* Tìm kiếm trợ giúp */}
      {/* <Help /> */}
    </div>
  )
}

export default Home
