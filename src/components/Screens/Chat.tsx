import React, { useState } from 'react'

import DetailChat from '../ChatComponents/DetailChat'

interface ChatProps {
  currentPosition: string
  setPosition: (e: string) => void
  userName: string
}
function ChatScreen({ currentPosition, setPosition, userName }: ChatProps) {
  const [position, setPos] = useState('overview')
  return (
    <div className="flex w-full h-full justify-center items-center flex-col">
      {position === 'overview' && (
        <div
          onClick={() => {
            setPos('detail')
            setPosition('detail')
          }}
          className="cursor-pointer flex justify-center items-center border-2 p-4 border-red-50 rounded-md"
        >
          Start to Chat
        </div>
      )}
      {position === 'detail' && (
        <DetailChat
          onCancel={() => {
            setPos('overview')
            setPosition('overview')
          }}
          userId={userName}
        />
      )}
    </div>
  )
}

export default ChatScreen
