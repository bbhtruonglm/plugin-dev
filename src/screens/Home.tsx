import ChatOption from 'components/HomeComponents/ChatOption'
import SendMessage from 'components/HomeComponents/SendMessage'

interface HomeProps {
  page_id: String | null
  on_navigate: () => void
  onError: () => void
}
function Home({ page_id, on_navigate, onError }: HomeProps) {
  return (
    <div className="flex flex-col px-5 py-3 gap-y-4">
      {/* Greeting */}
      <div className="">
        <h1 className="text-2xl font-semibold">Xin chào,</h1>
        <h2 className="text-xl font-medium">
          Chúng tôi có thể hỗ trợ được gì bạn?
        </h2>
      </div>
      {/* Send message */}
      <SendMessage
        page_id={page_id}
        on_navigate={on_navigate}
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
