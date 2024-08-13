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
import validateConversation from './validate'

const keys = require('lodash')
const size = require('lodash')
interface ChatScreenProps {
  onCancel: () => void
  userId: string
}
type Message = {
  page_id: string
  client_id: string
  text: string
}

type MessageData = {
  conversation?: ConversationInfo
  /**dữ liệu tin nhắn mới */
  message?: MessageInfo
  /**dữ liệu nhân viên */
  staff?: StaffSocket
  /**tên sự kiện */
  event?: SocketEvent
  /**dữ liệu tin nhắn cần cập nhật */
  update_message?: MessageInfo
}
/**kết nối socket đến server */
function DetailChat({ onCancel, userId }: ChatScreenProps) {
  const [newData, setNewData] = useState([] as any)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [triggerFetch, setTrigerFetch] = useState(false)
  const [lastMessage, setLastMessage] = useState({} as any)
  const [isForceCloseSocket, setIsForceCloseSocket] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  // Ngăn kết nối mở lại
  useEffect(() => {
    return () => {
      closeSocketConnect()
    }
  }, [])
  // call api list tin nhan
  useEffect(() => {
    fetchMessage()
  }, [triggerFetch, lastMessage])

  function closeSocketConnect() {
    // gắn cờ ngăn chặn kết nối mở lại
    setIsForceCloseSocket(true)

    ws.current?.close()
  }
  // function goi list tin nhan
  const fetchMessage = async () => {
    setTrigerFetch(false)
    const response = await fetch(
      `https://dev-api.botbanhang.vn/v1/n7_public/embed/message/read_message?page_id=3861367970af4b7cadacaec5d1443473&client_id=${userId}`
    )
    const result = await response.json()
    console.log(result.data, 'result')
    setNewData(result.data.reverse())
  }
  // goi api xac dinh danh tinh khi mo socket
  const sendIdentifyMessage = () => {
    //check dieu kien, neu k function se trong trang thai connecting
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current?.send(
        JSON.stringify({
          page_id: '3861367970af4b7cadacaec5d1443473',
          client_id: userId,
          event: 'JOIN',
        })
      )
    } else {
      console.log('WebSocket is not open yet. Retrying...')
      setTimeout(sendIdentifyMessage, 100) // Thử lại sau 100ms nếu chưa kết nối
    }
  }
  // Handle websocket
  function onSocketFromChatboxServer() {
    // Kết nối tới WebSocket server
    ws.current = new WebSocket('wss://dev-api.botbanhang.vn/embed')
    // luu lai id vong lap ping
    let ping_interval_id: number | any

    ws.current.onopen = () => {
      // thong bao connect thanh cong
      console.log('WebSocket Connected')
      sendIdentifyMessage()
      if (ws.current?.readyState === WebSocket.OPEN) {
        // tu dong ping socket lien tuc 30s
        ping_interval_id = setInterval(
          () => ws.current?.send('ping'),
          1000 * 30
        )
      }
    }

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
      let { message } = socket_data
      // luu tin nhan moi nhat vao state
      setLastMessage(message)
    }

    // Khi kết nối bị đóng
    ws.current.onclose = () => {
      console.log('WebSocket Disconnected')
      // Loại bỏ vòng lặp tự động ping soket cũ
      clearInterval(ping_interval_id)

      // nếu đóng hoàn toàn thì không cho kết nổi tự mở lại nữa

      if (isForceCloseSocket) return
      setTimeout(() => onSocketFromChatboxServer(), 100)
    }

    // Nếu xảy ra lỗi
    ws.current.onerror = () => {
      ws.current?.close()
    }
  }
  // gui tin nhan di
  const sendMessage = async (e: any) => {
    const message: Message = {
      page_id: '3861367970af4b7cadacaec5d1443473',
      client_id: userId,
      text: input,
    }
    await fetch(
      'https://dev-api.botbanhang.vn/v1/n7_public/embed/message/send_message',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Nếu cần token xác thực
        },
        body: JSON.stringify({
          client_id: message.client_id,
          page_id: message.page_id,
          text: message.text,
        }),
      }
    )
    setTrigerFetch(true)
    setInput('')
  }
  // goi ham khoi tao socket
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

        {newData.map((item: any, index: number) => (
          <div
            className="flex flex-col"
            key={index}
          >
            {/* Hiển thị avatar theo role user / shop */}
            <div
              className={`flex w-full pb-4 gap-1 ${
                item.message_type === 'page'
                  ? ' justify-start items-end'
                  : ' justify-end items-end'
              }`}
            >
              {item.message_type === 'page' && (
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
              {item.message_type === 'client' && (
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
