import ChatOption from '@/components/HomeComponents/ChatOption'
import { HomeProps } from './type'
import SendMessage from '@/components/HomeComponents/SendMessage'
import { t } from 'i18next'

function Home({
  onNavigate,
  onError,
  social_link,
  client_name,
  web_form,
  social_description,
}: HomeProps) {
  return (
    <div className="flex flex-col px-5 py-3 gap-y-4">
      {/* Greeting */}
      {web_form?.is_active ? (
        <div className="">
          <h1 className="text-2xl font-semibold">
            {client_name
              ? web_form?.source?.title + ' ' + client_name + ','
              : t('welcome')}
          </h1>
          <h2 className="text-xl font-medium">
            {web_form?.source
              ? web_form?.source?.description
              : t('welcomeMessage')}
          </h2>
        </div>
      ) : (
        <div className="">
          <h1 className="text-2xl font-semibold truncate">
            {client_name ? t('_hi') + client_name + ',' : t('welcome')}
          </h1>
          <h2 className="text-xl font-medium">{t('welcomeMessage')}</h2>
        </div>
      )}
      {/* Send message */}
      <SendMessage
        // page_id={page_id}
        onNavigate={onNavigate}
        onError={onError}
        client_name={client_name}
      />

      {/* Lựa chọn kênh liên lạc . 
        Nếu không có list social thì ẩn đi
      */}
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
