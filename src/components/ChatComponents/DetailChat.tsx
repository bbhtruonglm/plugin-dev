import { READ_MESSAGE_API, SEND_MESSAGE_API, SOCKET_API } from '../../utils/api'
import { useCallback, useEffect, useRef, useState } from 'react'

import ChatHeader from './ChatHeader'
import { ReactComponent as Down } from '../../assets/arrow.svg'
import InitClient from './InitClient'
import InputChat from './InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import MessageComponent from './MessageComponent'
import { MessageInfo } from '../../utils/type'
import avatar1 from '../../assets/avatar1.png'
import avatar2 from '../../assets/avatar2.png'

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL
const READ_MESSAGE_URL = process.env.REACT_APP_READ_MESSAGE_URL
const SEND_MESSAGE_URL = process.env.REACT_APP_SEND_MESSAGE_URL

const size = require('lodash')
interface ChatScreenProps {
  onCancel: () => void
  userId: string
  onInitClient: (e: any) => void
  loadingInit: boolean
  setLoadingInit: (e: any) => void
  pageId: String | null
  invalidPageId: boolean
  onResetInput: () => void
  errorMessage: String | null
  onError: () => void
  setHide?: () => void
  currentW: Number | null
}
type Message = {
  page_id: String | null
  client_id: string
  text: string
}
type Temp_Message = {
  message_text: string
  message_mid: string
}

/**kết nối socket đến server */
function DetailChat({
  onCancel,
  userId,
  onInitClient,
  loadingInit,
  setLoadingInit,
  pageId,
  invalidPageId,
  onResetInput,
  errorMessage,
  onError,
  setHide,
  currentW,
}: ChatScreenProps) {
  const [newData, setNewData] = useState([] as any)
  const [loading, setLoading] = useState(false)

  const [lastMessage, setLastMessage] = useState({} as any)
  const [isForceCloseSocket, setIsForceCloseSocket] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [scrollAtBottom, setScrollAtBottom] = useState(true)
  const [showJumpButton, setShowJumpButton] = useState(false)
  const [initMessage, setInitMessage] = useState('')
  const [errorInit, setErrorInit] = useState(false)
  const [identitySent, setIdentitySent] = useState(false)

  // Thông tin user khi khởi tạo chat
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  //Bắt các event scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  // Debounce để xu lý scroll
  const debounce = (func: Function, delay: number) => {
    let debounceTimer: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => func(...args), delay)
    }
  }
  //Function kéo xuống dưới cùng
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  // Fuction thực thi khi có hành động scroll
  const handleScroll = useCallback(() => {
    // Tạo ref nhận event trong message
    const container = messagesContainerRef.current
    //không có ref thì bỏ qua
    if (!container) return

    // Tính toàn vị trí top
    const scrollThreshold = container.scrollHeight * 0.3 // 30% chiều cao

    // Scroll lên top ( Theo vị trí tính toán) thì load thêm data cũ
    if (container.scrollTop <= scrollThreshold && !loadingMore) {
      fetchMessage()
    }

    // vị trí bottom
    const atBottom =
      container.scrollTop + container.clientHeight >= container.scrollHeight - 1
    // Lưu vị trí bottom
    setScrollAtBottom(atBottom)
    // Set Hiển thị nút btn jump
    setShowJumpButton(!atBottom)
  }, [loadingMore, hasMore])

  // Sử dụng debounce để xử lý scroll
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      const debouncedScroll = debounce(handleScroll, 1) // Sử dụng debounce
      container.addEventListener('scroll', debouncedScroll)
      return () => {
        container.removeEventListener('scroll', debouncedScroll)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    // Cuộn xuống cuối mỗi khi danh sách tin nhắn thay đổi
    // Không check event khi đang scroll lên nữa, khi có tin nhắn mới auto scroll

    if (scrollAtBottom) {
      // if (scrollAtBottom) {
      scrollToBottom()
    }
  }, [scrollAtBottom])

  // Ngăn kết nối mở lại
  useEffect(() => {
    return () => {
      closeSocketConnect()
    }
  }, [])
  // call api list tin nhan
  useEffect(() => {
    //Nếu có clientId thì mới fetch api

    if (userId) {
      onSocketFromChatboxServer()
      // check có user Id sẽ send init message
      sendMessage(initMessage)
      fetchMessage()
    }
  }, [userId])

  // Check khi đã có pageId nhưng bị sai, reset ô input của người dùng
  useEffect(() => {
    setEmail('')
    setName('')
    setPhone('')
  }, [invalidPageId])

  //Đóng kết nối socket
  function closeSocketConnect() {
    // gắn cờ ngăn chặn kết nối mở lại
    setIsForceCloseSocket(true)

    ws.current?.close()
  }
  // function goi list tin nhan
  const fetchMessage = async () => {
    // đang loading hoặc không có thêm bản ghi sẽ không fetch data nữa

    if (loadingMore || !hasMore) return

    // Lấy vị trí scroll hiện tại, nếu k có thì return
    const container = messagesContainerRef.current

    if (!container) return
    const scrollPosition = container.scrollHeight - container.scrollTop

    // set loadingMore = true de k call lien tuc
    setLoadingMore(true)

    try {
      const url = new URL(READ_MESSAGE_API ?? '')

      //setup params
      const params = {
        // page_id: '3861367970af4b7cadacaec5d1443473',
        page_id: pageId,
        client_id: userId,
        limit: limit.toString(),
        skip: skip.toString(),
      }
      url.search = new URLSearchParams(params as any).toString()
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Nếu cần token xác thực
        },
      })

      const result = await response.json()
      if (result.data.length === limit) {
        // set call api se skip bn ban ghi
        setSkip(skip + result.data.length)
      }

      //lưu data về phía trước do data đã bị reverse

      setNewData([...result.data.reverse(), ...newData])

      setTimeout(() => {
        if (container) {
          // Kiểm tra lại container trước khi sử dụng
          container.scrollTop = container.scrollHeight - scrollPosition
        }
      }, 10)
      // Neu data trả về k nhiều  = limit thì đã hết tin nhắn cũ
      // Nếu load trên limit bản ghi thì hasmore == false
      if (result.data.length !== limit) {
        // k còn data nữa
        setHasMore(false)
      }
    } catch (error) {
    } finally {
      setLoadingMore(false)
    }
  }

  // Tạo ra function chỉ để call lần đầu
  const fetchMessageInit = async () => {
    try {
      const url = new URL(READ_MESSAGE_API ?? '')

      //setup params
      const params = {
        // page_id: '3861367970af4b7cadacaec5d1443473',
        page_id: pageId,
        client_id: userId,
        limit: limit.toString(),
        skip: skip.toString(),
      }
      url.search = new URLSearchParams(params as any).toString()
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Nếu cần token xác thực
        },
      })

      const result = await response.json()

      if (result.data.length === limit) {
        // set call api se skip bn ban ghi
        setSkip(skip + result.data.length)
      }

      //lưu data về phía trước do data đã bị reverse
      setNewData([...result.data.reverse()])
    } catch (error) {
    } finally {
      // setLoadingMore(false)
      console.log('finally')
    }
  }

  /** Gọi api xác định danh tính khi mở WebSocket */
  const sendIdentifyMessage = () => {
    // Check điều kiện khi nào websocket đang readyState === websocket.OPEN thì mới gửi tin nhắn
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current?.send(
        JSON.stringify({
          page_id: pageId,
          client_id: userId,
          event: 'JOIN',
        })
      )
      // Khi kết nối thành công thì mới trigger để gọi tin nhắn khởi tạo
      setIdentitySent(true)
    } else {
      // Nếu chưa kết nối mở lại gọi lai tin nhắn
      console.log('WebSocket is not open yet. Retrying...')
      setTimeout(sendIdentifyMessage, 100) // Thử lại sau 100ms nếu chưa kết nối
    }
  }

  /**  Cấu hình websocket */
  function onSocketFromChatboxServer() {
    // Kết nối tới WebSocket server
    ws.current = new WebSocket(SOCKET_API ?? '')
    // console.log(SOCKET_API, 'socket url')
    // luu lai id vong lap ping
    let ping_interval_id: number | any

    ws.current.onopen = () => {
      // Thông báo connect thành công
      console.log('WebSocket Connectedddd')
      // Gửi tin nhắn khởi tạo socket
      sendIdentifyMessage()

      if (ws.current?.readyState === WebSocket.OPEN) {
        // tu dong ping socket lien tuc 30s

        ping_interval_id = setInterval(
          () => ws.current?.send('ping'),
          1000 * 25
        )
      } else {
        console.log('WebSocket is not open yet. Retrying...')
        setTimeout(sendIdentifyMessage, 100) // Thử lại sau 100ms nếu chưa kết nối
      }
    }

    ws.current.onmessage = ({ data }) => {
      if (!data || data === 'pong') return
      /**dữ liệu socket nhận được */
      let socket_data: {
        /**dữ liệu tin nhắn mới */
        message?: MessageInfo
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
  const sendMessage = async (input: any) => {
    if (input.trim() === '') return
    try {
      const message: Message = {
        page_id: pageId,
        client_id: userId,
        text: input,
      }

      await fetch(SEND_MESSAGE_API ?? '', {
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
      })

      //Gửi tin nhắn thành công, scroll xuống cuối trang
      scrollToBottom()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Khi socket trả về last message sẽ read message 1 lần

    // có tin nhắn khởi tạo + userId + websocket được kết nối (Khởi tạo lần đầu)
    if (identitySent && initMessage && userId) {
      fetchMessageInit()
      setInitMessage('')
      setLoadingMore(false)
      setIdentitySent(false)
    }
    // có tin tin nhắn từ socket (Lưu vào lastmessage)
    if (Object.keys(lastMessage).length !== 0 && !initMessage) {
      const dataaa = [...newData, lastMessage]
      setNewData(dataaa)
      // Nếu có tin nhắn từ websocket, scroll xuống cuối trang
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [lastMessage, initMessage, userId, identitySent])

  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader
        onCancel={onCancel}
        userId={userId}
        setHide={setHide}
        currentW={currentW}
      />
      {/* body */}
      <div
        ref={messagesContainerRef}
        className={`px-5 py-3 gap-4 overflow-y-auto mb-16 scrollbar-thin scrollbar-webkit flex flex-col relative ${
          userId ? 'mt-16' : 'mt-[174px]'
        }`}
      >
        {userId && loadingMore && <Loading />}
        {/* Không có page Id sẽ báo lỗi k kết nối với hệ thống */}
        {!userId && errorMessage && (
          <h4 className="flex justify-center font-semibold text-red-600 whitespace-pre-line">
            {errorMessage}
          </h4>
        )}
        {!userId && !errorMessage && (
          <div className="flex flex-col gap-2 ">
            <InitClient
              setUsername={(e) => {
                setName(e)
                onResetInput()
              }}
              setUserEmail={(e) => {
                setEmail(e)
                onResetInput()
              }}
              setUserPhone={(e) => {
                setPhone(e)
                onResetInput()
              }}
              resetData={invalidPageId}
              onError={(e) => {
                // bao gồm sai định dạng email và sdt
                setErrorInit(e)
              }}
            />
            {invalidPageId && (
              <h4 className="flex justify-center font-semibold text-red-600">
                Thông tin Page không đúng
              </h4>
            )}
          </div>
        )}

        {/* render nội dung tin nhắn từ list có sẵn */}
        {userId &&
          newData.map((item: any, index: number) => (
            <div
              className="flex flex-col"
              key={index}
            >
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex w-full py-2 gap-1 ${
                  item.message_type === 'page'
                    ? ' justify-start items-start'
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

        <div ref={messagesEndRef} />
        {/* Khi gửi tin nhắn sẽ hiển thị loading để call api */}
        {loading && (
          <div className="fixed bg-blue-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}

        {/* Khi khởi tạo sẽ hiển thị loading này */}
        {loadingInit && (
          <div className="fixed bg-red-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}
      </div>
      {/* Hiển thị nút nhảy về cuối trang */}
      {showJumpButton && (
        <button
          onClick={scrollToBottom}
          className="absolute flex justify-center items-center h-[30px] w-[30px] shadow-md bg-white rounded-full z-[999999] bottom-[13%] right-[45%]"
        >
          <Down
            width={10}
            height={5}
            stroke="#000000"
          />
        </button>
      )}

      {/* o input  Khi có text trong input thì hiển thị thêm icon send */}
      <InputChat
        errorMessage={errorMessage}
        handleSend={(e) => {
          // Khi chua co clientId Call function Khởi tạo
          if (!userId) {
            //  Nếu không có lỗi khi khởi tạo tin nhắn thì thực hiện hành động sau
            if (!errorInit) {
              setLoadingInit(true)
              onInitClient({
                phone,
                email,
                name,
                page_id: pageId,
              })
              setLoadingMore(true)
              setInitMessage(e)
              // hasmore = true để fetch api 1 lần
              setHasMore(true)
            }
          } else {
            // có clientId thì gửi tin nhắn như bình thường
            sendMessage(e)
            setLoading(true)
          }
        }}
        loading={loading}
        onChangeText={(e) => {}}
      />
    </div>
  )
}

export default DetailChat
