import ChatHeader from './ChatHeader'
import InputChat from './InputChat'
import React from 'react'
import avatar1 from '../../assets/avatar1.png'
import blackArrow from '../../assets/white-arrow.svg'

interface ChatScreenProps {
  onCancel: () => void
}
function DetailChat({ onCancel }: ChatScreenProps) {
  return (
    <div className="flex flex-col w-full h-full">
      {/* header */}
      <ChatHeader onCancel={onCancel} />
      {/* body */}
      <div className="p-2">chat body</div>
      {/* o input */}
      <InputChat />
    </div>
  )
}

export default DetailChat
