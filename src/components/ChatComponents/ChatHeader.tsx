import React from 'react'
import avatar1 from '../../assets/avatar1.png'
import blackArrow from '../../assets/white-arrow.svg'
interface ChatScreenProps {
  onCancel: () => void
}
function ChatHeader({ onCancel }: ChatScreenProps) {
  return (
    <div className="flex bg-[#1E293B] h-16 w-full items-center py-3 px-5 gap-2">
      <img
        onClick={() => onCancel()}
        src={blackArrow}
        className="w-7 h-7"
        alt=""
      />
      <div className="flex gap-2">
        <img
          src={avatar1}
          className="mask is-squircle h-8 w-8"
          alt=""
        />
        <div>
          <h2 className="text-white text-sm font-medium">Hoàng Lan</h2>
          <h5 className="flex gap-1 items-center font-normal text-xs text-[#16A34A]">
            <div className="w-4 h-4 rounded-full bg-[#16A34A]"></div> Đang
            online
          </h5>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
