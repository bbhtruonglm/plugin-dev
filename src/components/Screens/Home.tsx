import ChatOption from '../HomeComponents/ChatOption'
import Help from '../HomeComponents/Help'
import IntroAI from '../HomeComponents/IntroAI'
import React from 'react'
import SendMessage from '../HomeComponents/SendMessage'
interface HomeProps {
  page_id: String | null
  onNavigate: () => void
  onError: () => void
  errorMessage: String | null
}
function Home({ page_id, onNavigate, onError, errorMessage }: HomeProps) {
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
        onNavigate={onNavigate}
        onError={onError}
      />
      {/* {errorMessage && (
        <h4 className="flex justify-center font-semibold text-red-600">
          {errorMessage}
        </h4>
      )} */}
      {/* Lựa chọn kênh liên lạc */}
      {/* <ChatOption /> */}
      {/* Giới thiệu AI */}
      {/* <IntroAI /> */}
      {/* Tìm kiếm trợ giúp */}
      {/* <Help /> */}
    </div>
  )
}

export default Home
