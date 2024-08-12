import React, { useEffect, useState } from 'react'

import ChatHeader from './ChatHeader'
import InputChat from './InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import MessageComponent from './MessageComponent'
import avatar1 from '../../assets/avatar1.png'
import avatar2 from '../../assets/avatar2.png'
import blackArrow from '../../assets/white-arrow.svg'

interface ChatScreenProps {
  onCancel: () => void
}
function DetailChat({ onCancel }: ChatScreenProps) {
  const initChatData = [
    {
      type: 'text',
      role: 'user',
      content: {
        text: 'Tôi muốn mua hàng',
      },
      avatar: avatar2,
    },
    {
      type: 'text',
      role: 'user',
      content: {
        text: 'Tôi muốn mua hàng',
      },
      avatar: avatar2,
    },
    {
      type: 'text',
      role: 'shop',
      content: {
        text: 'Bạn đang có nhu cầu mua trang phục hay các phụ kiện đính kèm',
      },
      avatar: avatar1,
    },
  ]
  const [dataMessage, setDataMessage] = useState(initChatData)
  const [newMessage, setNewMessage] = useState({
    role: 'user',
    content: { text: '' },
  })
  const [loading, setLoading] = useState(false)
  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader onCancel={onCancel} />
      {/* body */}
      <div className="p-2 mt-16 overflow-y-auto mb-16 scrollbar-thin scrollbar-webkit flex flex-col relative">
        {dataMessage.map((item) => (
          <div className="flex flex-col">
            <div
              className={`flex w-full pb-4 gap-1 ${
                item.role === 'shop'
                  ? ' justify-start items-end'
                  : ' justify-end items-end'
              }`}
            >
              {item.role === 'shop' && (
                <div className="flex rounded-lg">
                  <img
                    src={item.avatar}
                    className="w-6 h-6"
                    alt=""
                  />
                </div>
              )}
              <MessageComponent data={item} />
              {item.role !== 'shop' && (
                <div className="flex rounded-lg">
                  <img
                    src={item.avatar}
                    className="w-6 h-6"
                    alt=""
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="fixed bg-red-300 bottom-[25%] left-[50%] p-2 rounded-full text-xs z-50">
            {/* <Loading /> */}
            {/* <div className="w-6 h-6 border-2 border-t-transparent border-customBlue border-solid rounded-full custom-spinner"></div> */}
            <LoadingDots />
          </div>
        )}
      </div>
      {/* o input */}
      <InputChat
        handleSend={(e) => {
          // console.log(e, 'detail, hehehe')
          setLoading(true)
          let updateData = [
            ...dataMessage,
            {
              role: 'user',
              content: { text: e },
              avatar: avatar2,
              type: 'text',
            },
          ]
          setTimeout(() => {
            setLoading(false)
            setDataMessage(updateData)
          }, 1000)
        }}
        loading={loading}
      />
    </div>
  )
}

export default DetailChat
