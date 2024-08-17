import IconSend from '../../assets/send.svg'
import React from 'react'
import { useNavigate } from 'react-router-dom'
interface SendMessageProps {
  page_id: String | null
  onNavigate: () => void
}
function SendMessage({ page_id, onNavigate }: SendMessageProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => {
        navigate(`/?page_id=${page_id}`)
        onNavigate()
      }}
      className="bg-white p-3 rounded-xl flex justify-between px-6 items-center shadow-md cursor-pointer"
    >
      <div>
        <h4 className="text-base font-semibold">Gửi tin nhắn đến chúng tôi</h4>
        <h5 className="flex gap-2 items-center text-sm text-onlineColor">
          <div className="w-3 h-3 rounded-full bg-onlineColor"></div> Chúng tôi
          đang online
        </h5>
      </div>
      <div>
        <img
          src={IconSend}
          alt=""
        />
      </div>
    </div>
  )
}

export default SendMessage
