import {
  ConversationInfo,
  MessageInfo,
  SocketEvent,
  StaffSocket,
} from '../../utils/type'
import React, { useEffect, useRef, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import ChatHeader from './ChatHeader'
import InputChat from './InputChat'
import LoadingDots from '../Loading/LoadingDot'
import MessageComponent from './MessageComponent'
import avatar1 from '../../assets/avatar1.png'
import avatar2 from '../../assets/avatar2.png'

const keys = require('lodash')
const size = require('lodash')
interface ChatScreenProps {
  onCancel: () => void
  userId: string
}
type Message = {
  sender: string
  content: string
  userId: string | null
}
/**kết nối socket đến server */
function DetailChat({ onCancel, userId }: ChatScreenProps) {
  const socketConnection = useRef<WebSocket | null>(null)

  const [receivedMessages, setReceivedMessages] = useState([] as any)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const [input, setInput] = useState('')
  const ws = useRef<WebSocket | null>(null)
  const [username, setUsername] = useState('')
  const [userIdd, setUserId] = useState<string | null>(null)

  const pageStore = {
    selected_page_id_list: [],
  }
  const chatbotUserStore = {
    chatbot_user: {
      fb_staff_id: '123123',
    },
  }
  // kết nối với socket server
  // const { sendJsonMessage, lastJsonMessage } = useWebSocket(
  //   `ws://localhost:8000?userId=${userId}`
  // )

  // const timestamp = new Date().toLocaleString('en-US', { hour12: false })

  // const sendMessage = (message: any) => {
  //   setReceivedMessages([...receivedMessages, { message, userId, timestamp }])
  //   sendJsonMessage({ message, userId })
  // }

  // useEffect(() => {
  //   if (lastJsonMessage) {
  //     setReceivedMessages([...receivedMessages, lastJsonMessage])
  //   }
  // }, [lastJsonMessage])

  // Handle websocket
  function onSocketFromChatboxServer() {
    // Kết nối tới WebSocket server
    ws.current = new WebSocket('')
    // luu lai id vong lap ping
    let ping_interval_id: number | any

    ws.current.onopen = () => {
      // thong bao connect thanh cong
      console.log('WebSocket Connected')
      ws.current?.send(
        JSON.stringify({
          list_page: keys(pageStore.selected_page_id_list),
          fb_staff_id: chatbotUserStore.chatbot_user?.fb_staff_id,
        })
      )
      // tu dong ping socket lien tuc 30s
      ping_interval_id = setInterval(() => ws.current?.send('ping'), 1000 * 30)
    }

    // ws.current.onmessage = async (event) => {
    //   let data: string

    //   if (event.data instanceof Blob) {
    //     data = await event.data.text()
    //   } else {
    //     data = event.data
    //   }

    //   try {
    //     const messageData = JSON.parse(data)
    //     if (messageData.type === 'WELCOME') {
    //       // Lưu ID người dùng khi kết nối
    //       setUserId(messageData.userId)
    //     } else {
    //       const newMessage: Message = {
    //         ...messageData,
    //         userId: messageData.userId,
    //       }
    //       setMessages((prevMessages) => [...prevMessages, newMessage])
    //     }
    //   } catch (err) {
    //     console.error('Failed to parse message data:', err)
    //   }
    // }

    //Khi có thông điệp từ socket gửi xuống

    ws.current.onmessage = ({ data }) => {
      if (!data || data === 'pong') return
      /**dữ liệu socket nhận được */
      let socket_data: {
        /**dữ liệu của khách hàng */
        conversation?: ConversationInfo
        /**dữ liệu tin nhắn mới */
        message?: MessageInfo
        /**dữ liệu nhân viên */
        staff?: StaffSocket
        /**tên sự kiện */
        event?: SocketEvent
        /**dữ liệu tin nhắn cần cập nhật */
        update_message?: MessageInfo
      } = {}

      // cố gắng giải mã dữ liệu
      try {
        socket_data = JSON.parse(data)
      } catch (e) {}

      if (!size(socket_data)) return

      let { conversation, message, update_message, event } = socket_data

      // gửi thông điệp đến component xử lý danh sách hội thoại
      // if (validateConversation(conversation, message))
      //   window.dispatchEvent(
      //     new CustomEvent('chatbox_socket_conversation', {
      //       detail: {
      //         conversation,
      //         event,
      //       },
      //     })
      //   )

      // gửi thông điệp đến component xử lý hiển thị danh sách tin nhắn
      if (size(message))
        window.dispatchEvent(
          new CustomEvent('chatbox_socket_message', { detail: message })
        )

      // gửi thông điệp cập nhật tin nhắn đã có
      if (size(update_message))
        window.dispatchEvent(
          new CustomEvent('chatbox_socket_update_message', {
            detail: update_message,
          })
        )

      // thông báo cho người dùng nếu là tin nhắn của khách hàng gửi cho page
      // if (message?.message_type === 'client') triggerAlert(conversation)
    }

    // Khi kết nối bị đóng
    ws.current.onclose = () => {
      console.log('WebSocket Disconnected')
      // Loại bỏ vòng lặp tự động ping soket cũ
      clearInterval(ping_interval_id)

      // nếu đóng hoàn toàn thì không cho kết nổi tự mở lại nữa

      // if (is_force_close_socket.value) return
      setTimeout(() => onSocketFromChatboxServer(), 100)
    }

    // Nếu xảy ra lỗi
    ws.current.onerror = () => {
      ws.current?.close()
    }
  }

  const sendMessage = (e: any) => {
    if (ws.current) {
      const message: Message = {
        content: input,
        sender: userId,
        userId: userIdd,
      }
      ws.current.send(JSON.stringify(message))
      setInput('')
    }
  }
  useEffect(() => {
    onSocketFromChatboxServer()
  }, [])

  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader onCancel={onCancel} />
      {/* body */}
      <div className="p-2 mt-16 overflow-y-auto mb-16 scrollbar-thin scrollbar-webkit flex flex-col relative">
        {/* render nội dung tin nhắn từ list có sẵn */}

        <div className="chat-messages flex-1 overflow-y-auto p-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="message mb-2"
            >
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>

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
          <div className="fixed bg-red-300 bottom-[25%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}
      </div>
      {/* o input  Khi có text trong input thì hiển thị thêm icon send */}
      <InputChat
        handleSend={(e) => {
          setLoading(true)
          // Thêm data mới nhập vào list có sẵn

          // giả sử loading // sau nó update lại data

          // setInput(e)
          setTimeout(() => {
            setLoading(false)
            // setDataMessage(updateData)
            sendMessage(e)
          }, 1000)
        }}
        loading={loading}
        onChangeText={(e) => {
          setInput(e)
        }}
      />
    </div>
  )
}

export default DetailChat
