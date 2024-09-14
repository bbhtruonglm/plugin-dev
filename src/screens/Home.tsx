import ChatOption from '@/components/HomeComponents/ChatOption'
import SendMessage from '@/components/HomeComponents/SendMessage'
import { t } from 'i18next'

interface HomeProps {
  page_id: String | null
  onNavigate: () => void
  onError: () => void
}
function Home({ page_id, onNavigate, onError }: HomeProps) {
  return (
    <div className="flex flex-col px-5 py-3 gap-y-4">
      {/* Greeting */}
      <div className="">
        <h1 className="text-2xl font-semibold">{t('welcome')}</h1>
        <h2 className="text-xl font-medium">{t('welcomeMessage')}</h2>
      </div>
      {/* Send message */}
      <SendMessage
        page_id={page_id}
        onNavigate={onNavigate}
        onError={onError}
      />

      {/* Lựa chọn kênh liên lạc */}
      <ChatOption />
      {/* Giới thiệu AI */}
      {/* <IntroAI /> */}
      {/* Tìm kiếm trợ giúp */}
      {/* <Help /> */}
    </div>
  )
}

export default Home
