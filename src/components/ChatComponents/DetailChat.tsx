import React, { useEffect, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

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
  userId: string
}
type IProps = {
  userId: string
  message: string
  timestamp: string
}
function DetailChat({ onCancel, userId }: ChatScreenProps) {
  // Data mẫu, với role khác hàng và shop
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
  const [message, setMessage] = useState('')
  const [receivedMessages, setReceivedMessages] = useState([] as any)
  const [loading, setLoading] = useState(false)

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `ws://localhost:8000?userId=${userId}`
  )

  const timestamp = new Date().toLocaleString('en-US', { hour12: false })

  const sendMessage = (message: any) => {
    setReceivedMessages([...receivedMessages, { message, userId, timestamp }])
    sendJsonMessage({ message, userId })
  }

  useEffect(() => {
    if (lastJsonMessage) {
      setReceivedMessages([...receivedMessages, lastJsonMessage])
    }
  }, [lastJsonMessage])

  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader onCancel={onCancel} />
      {/* body */}
      <div className="p-2 mt-16 overflow-y-auto mb-16 scrollbar-thin scrollbar-webkit flex flex-col relative">
        {/* render nội dung tin nhắn từ list có sẵn */}
        {receivedMessages.map((item: any) => (
          <div className="flex flex-col">
            {/* Hiển thị avatar theo role user / shop */}
            <div
              className={`flex w-full pb-4 gap-1 ${
                item.userId === 'Admin'
                  ? ' justify-center items-end'
                  : item.userId !== userId
                  ? ' justify-start items-end'
                  : ' justify-end items-end'
              }`}
            >
              {item.userId !== 'Admin' && item.userId !== userId && (
                <div className="flex rounded-lg">
                  <img
                    src={avatar1}
                    className="w-6 h-6"
                    alt=""
                  />
                </div>
              )}
              {/* Phần nội dung tin nhắn được hiển thị */}
              <MessageComponent
                data={item}
                userId={userId}
              />
              {item.userId !== 'Admin' && item.userId === userId && (
                <div className="flex rounded-lg">
                  <img
                    src={avatar2}
                    className="w-6 h-6"
                    alt=""
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Khi gửi tin nhắn sẽ hiển thị loading để call api */}
        {loading && (
          <div className="fixed bg-red-300 bottom-[25%] left-[50%] p-2 rounded-full text-xs z-50">
            {/* <Loading /> */}
            {/* <div className="w-6 h-6 border-2 border-t-transparent border-customBlue border-solid rounded-full custom-spinner"></div> */}
            <LoadingDots />
          </div>
        )}
      </div>
      {/* o input  Khi có text trong input thì hiển thị thêm icon send */}
      <InputChat
        handleSend={(e) => {
          // console.log(e, 'detail, hehehe')
          setLoading(true)
          // Thêm data mới nhập vào list có sẵn
          let updateData = [
            ...dataMessage,
            {
              role: 'user',
              content: { text: e },
              avatar: avatar2,
              type: 'text',
            },
          ]

          // giả sử loading // sau nó update lại data

          setTimeout(() => {
            setLoading(false)
            // setDataMessage(updateData)
            sendMessage(e)
          }, 1000)
        }}
        loading={loading}
      />
    </div>
  )
}

export default DetailChat
