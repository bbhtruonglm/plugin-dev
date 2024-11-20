import InputChat from './components/InputChat'
import { useState } from 'react'

const ChatAI = () => {
  const [tab, setTab] = useState('chat')
  return (
    <div className="flex flex-col h-full justify-between w-96 relative border bg-bg-gradient">
      {/* Header tab */}
      <div className="flex h-14 border-b border-gray-400 w-full px-6 gap-x-2 text-sm font-medium text-gray-700 justify-between items-center">
        <div className="flex h-full">
          <div
            className={`flex w-fit h-full items-center cursor-pointer border-b-2 px-2 ${
              tab === 'chat'
                ? 'text-cyan-500 border-cyan-500 '
                : 'border-transparent'
            }`}
            onClick={() => {
              if (tab === 'chat') return
              setTab('chat')
            }}
          >
            AI Assistant
          </div>
          <div
            className={`flex w-fit h-full items-center cursor-pointer border-b-2 px-2 ${
              tab === 'detail'
                ? 'text-cyan-500 border-cyan-500 '
                : 'border-transparent'
            }`}
            onClick={() => {
              if (tab === 'detail') return
              setTab('detail')
            }}
          >
            Chi tiết
          </div>
        </div>
        <div>option</div>
      </div>
      {/* Chat content */}
      <div className="flex h-full overflow-y-auto scrollbar-thin scrollbar-webkit mb-20 p-4 pb-0"></div>
      {/* Input chat */}
      <div className="flex w-full h-24">
        <InputChat
          handleSend={(e: string) => {
            // sendMessage(e)
            // setLoading(true)
          }}
          loading={false}
          page_name={'page_name'}
          client_id={'user_id'}
          setLoading={(e: boolean) => {
            // setLoading(e)
          }}
          error_message={''}
        />
      </div>
    </div>
  )
}

export default ChatAI
