import _, { size } from 'lodash'
import { fetchAPI, useAPI } from '@/api/api'
import { letterToColorCode, nameToLetter, renderAvatar } from '@/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

import ChatHeader from './ChatHeader'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import InitClient from './InitClient'
import InputChat from './InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import MessageComponent from './MessageComponent'
import { MessageInfo } from '@/utils/type'
import { selectPageId } from '@/stores/appSlice'
import { t } from 'i18next'
import { useSelector } from 'react-redux'

/** Chi tiết component chat */
function DetailChat({
  onCancel,
  user_id,
  onInitClient,
  loading_init,
  setLoadingInit,

  invalid_page_id,
  onResetInput,
  error_message,
  setHideForMobile,
  page_name,
  staff_avatar,
  staff_name,
  loading_staff,
  client_name,
  employee_list,
}: ChatScreenProps) {
  // Khởi tạo socket
  const WS = useRef<WebSocket | null>(null)
  /** Bắt vị trí end scroll ở bottom */
  const MESSAGE_END_REF = useRef<HTMLDivElement | null>(null)
  /** Bắt vị trí ref ở đầu tin nhắn */
  const MESSAGE_CONTAINER_REF = useRef<HTMLDivElement | null>(null)
  // lấy Api từ hooks api
  const { SOCKET_API, READ_MESSAGE_API, SEND_MESSAGE_API } = useAPI()

  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)

  const LIMIT = 20
  const [skip, setSkip] = useState(0)
  const [new_data, setNewData] = useState([] as any)
  const [loading, setLoading] = useState(false)
  const [last_message, setLastMessage] = useState({} as any)
  const [is_force_close_socket, setIsForceCloseSocket] = useState(false)
  const [loading_more, setLoadingMore] = useState(false)
  const [has_more, setHasMore] = useState(true)
  const [scroll_at_bottom, setScrollAtBottom] = useState(true)
  const [show_jump_button, setShowJumpButton] = useState(false)
  const [init_message, setInitMessage] = useState('')
  const [identity_send, setIdentitySent] = useState(false)

  let plugin_status = sessionStorage.getItem('plugin_status')
  console.log(plugin_status)

  /** Debounce để xử lý scroll */
  const debounce = (func: Function, delay: number) => {
    let debounce_timer: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
      clearTimeout(debounce_timer)
      debounce_timer = setTimeout(() => func(...args), delay)
    }
  }
  /** Function kéo xuống dưới cùng */
  const scrollToBottom = () => {
    MESSAGE_END_REF.current?.scrollIntoView({ behavior: 'smooth' })
  }
  // Fuction thực thi khi có hành động scroll
  const handleScroll = useCallback(() => {
    // Tạo ref nhận event trong message
    const CONTAINER = MESSAGE_CONTAINER_REF.current
    //không có ref thì bỏ qua
    if (!CONTAINER) return

    // Tính toàn vị trí top
    const SCROLL_THRESH_HOLD = CONTAINER.scrollHeight * 0.3 // 30% chiều cao

    // Scroll lên top ( Theo vị trí tính toán) thì load thêm data cũ
    if (CONTAINER.scrollTop <= SCROLL_THRESH_HOLD && !loading_more) {
      fetchMessage()
    }

    // vị trí bottom
    const AT_BOTTOM =
      CONTAINER.scrollTop + CONTAINER.clientHeight >= CONTAINER.scrollHeight - 1
    // Lưu vị trí bottom
    setScrollAtBottom(AT_BOTTOM)
    // Set Hiển thị nút btn jump
    setShowJumpButton(!AT_BOTTOM)
  }, [loading_more, has_more])

  // Sử dụng debounce để xử lý scroll
  useEffect(() => {
    const CONTAINER = MESSAGE_CONTAINER_REF.current
    if (CONTAINER) {
      const debouncedScroll = debounce(handleScroll, 1) // Sử dụng debounce
      CONTAINER.addEventListener('scroll', debouncedScroll)
      return () => {
        CONTAINER.removeEventListener('scroll', debouncedScroll)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    // Cuộn xuống cuối mỗi khi danh sách tin nhắn thay đổi
    // Không check event khi đang scroll lên nữa, khi có tin nhắn mới auto scroll

    if (scroll_at_bottom) {
      scrollToBottom()
    }
  }, [scroll_at_bottom])

  // Ngăn kết nối mở lại
  useEffect(() => {
    return () => {
      closeSocketConnect()
    }
  }, [])

  // call api list tin nhan
  useEffect(() => {
    // check có user Id sẽ send init message
    if (user_id) {
      onSocketFromChatboxServer()
      sendMessage(init_message)
      fetchMessage()
    }
  }, [user_id])

  /** Đóng kết nối socket */
  function closeSocketConnect() {
    // gắn cờ ngăn chặn kết nối mở lại
    setIsForceCloseSocket(true)
    WS.current?.close()
  }
  /** Hàm gọi API để lấy tin nhắn */
  const fetchMessage = async () => {
    // Đang loading hoặc không có thêm bản ghi sẽ không fetch data nữa
    if (loading_more || !has_more) return

    // Lấy vị trí scroll hiện tại, nếu k có thì return
    const CONTAINER = MESSAGE_CONTAINER_REF.current

    if (!CONTAINER) return
    const SCROLL_POSITION = CONTAINER.scrollHeight - CONTAINER.scrollTop

    // set loading_more = true de k call lien tuc
    setLoadingMore(true)

    try {
      const URL_READ = new URL(READ_MESSAGE_API)

      //setup params
      const PARAMS = {
        // page_id: '3861367970af4b7cadacaec5d1443473',
        page_id: PAGE_ID,
        client_id: user_id,
        limit: LIMIT.toString(),
        skip: skip.toString(),
      }
      URL_READ.search = new URLSearchParams(PARAMS as any).toString()

      const RES = await fetchAPI(URL_READ.toString(), 'GET')
      console.log(RES, 'RES')
      const RESULT = await RES
      if (RESULT.data.length === LIMIT) {
        // set call api se skip bn ban ghi
        setSkip(skip + RESULT.data.length)
      }

      const FILTER_RES = RESULT?.data.filter(
        (item: any) => item.message_type !== 'system'
      )

      console.log(FILTER_RES)
      //lưu data về phía trước do data đã bị reverse
      setNewData([...FILTER_RES.reverse(), ...new_data])

      setTimeout(() => {
        if (CONTAINER) {
          // Kiểm tra lại container trước khi sử dụng
          CONTAINER.scrollTop = CONTAINER.scrollHeight - SCROLL_POSITION
        }
      }, 10)
      // Neu data trả về k nhiều  = limit thì đã hết tin nhắn cũ
      // Nếu load trên limit bản ghi thì hasmore == false
      if (RESULT.data.length !== LIMIT) {
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
      const URL_READ = new URL(READ_MESSAGE_API)

      //setup params
      const params = {
        // page_id: '3861367970af4b7cadacaec5d1443473',
        page_id: PAGE_ID,
        client_id: user_id,
        limit: LIMIT.toString(),
        skip: skip.toString(),
      }
      URL_READ.search = new URLSearchParams(params as any).toString()

      const RES = await fetchAPI(URL_READ.toString(), 'GET')

      const RESULT = await RES

      if (RESULT.data.length === LIMIT) {
        // set call api se skip bn ban ghi
        setSkip(skip + RESULT.data.length)
      }

      //lưu data về phía trước do data đã bị reverse
      setNewData([...RESULT.data.reverse()])
    } catch (error) {
    } finally {
      // setLoadingMore(false)
      console.log('finally')
    }
  }

  /** Gọi api xác định danh tính khi mở WebSocket */
  const sendIdentifyMessage = () => {
    // Check điều kiện khi nào websocket đang readyState === websocket.OPEN thì mới gửi tin nhắn
    if (WS.current?.readyState === WebSocket.OPEN) {
      WS.current?.send(
        JSON.stringify({
          page_id: PAGE_ID,
          client_id: user_id,
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
    WS.current = new WebSocket(SOCKET_API || '')

    //Lưu lại id vòng lặp
    let ping_interval_id: number | any

    // kết nối được mở
    WS.current.onopen = () => {
      // Thông báo connect thành công
      console.log('WebSocket Connectedddd')

      // Gửi tin nhắn khởi tạo socket
      sendIdentifyMessage()

      // Nếu socket đang readyState === websocket.OPEN thì được gọi tin nhắn
      if (WS.current?.readyState === WebSocket.OPEN) {
        // tu dong ping socket lien tuc 30s
        ping_interval_id = setInterval(
          () => WS.current?.send('ping'),
          1000 * 25
        )
      } else {
        console.log('WebSocket is not open yet. Retrying...')
        // Thử lại sau 100ms nếu chưa kết nối
        setTimeout(sendIdentifyMessage, 100)
      }
    }

    // Khi có tin nhắn
    WS.current.onmessage = ({ data }) => {
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

      // Lấy tin nhắn từ socket
      let { message } = socket_data
      console.log(plugin_status, 'plugin_status')
      // Lưu tin nhắn mới nhất vào state
      setLastMessage(message)
    }

    // Khi kết nối bị đóng
    WS.current.onclose = () => {
      console.log('WebSocket Disconnected')
      // Loại bỏ vòng lặp tự động ping soket cũ
      clearInterval(ping_interval_id)

      // nếu đóng hoàn toàn thì không cho kết nổi tự mở lại nữa
      if (is_force_close_socket) return
      setTimeout(() => onSocketFromChatboxServer(), 100)
    }

    // Nếu xảy ra lỗi
    WS.current.onerror = () => {
      WS.current?.close()
    }
  }

  /** Hàm Xử lý gửi tin nhắn */
  const sendMessage = async (input: any) => {
    // Nhắn toàn khoảng trắng không cho gửi đi
    if (input.trim() === '') return
    // Tiến hành gửi tin nhắn
    try {
      // Khởi tạo body tin nhắn
      const message: Message = {
        page_id: PAGE_ID,
        client_id: user_id,
        text: input,
      }
      // Gọi api gửi tin nhắn
      await fetchAPI(SEND_MESSAGE_API, 'POST', message)

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
    if (identity_send && init_message && user_id) {
      fetchMessageInit()
      setInitMessage('')
      setLoadingMore(false)
      setIdentitySent(false)
    }
    // có tin tin nhắn từ socket (đã được lưu vào lastmessage)
    if (_.keys(last_message).length !== 0 && !init_message) {
      const DATA = [...new_data, last_message]
      setNewData(DATA)
      // Nếu có tin nhắn từ websocket, scroll xuống cuối trang
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [last_message, init_message, user_id, identity_send])

  /** Hàm kiểm tra nhân sự có tồn tại không */
  const checkStaffExist = (id: string) => {
    // Xem nhân viên nhắn tin có tồn tại trong list nhân viên không
    const IS_STAFF_EXIST = employee_list?.find((item) =>
      id.includes(item.fb_staff_id)
    )

    // Nếu không tồn tại thì trả về ''
    if (!IS_STAFF_EXIST) {
      return ''
    }

    // Lấy link avatar
    const LINK_AVATAR = renderAvatar(IS_STAFF_EXIST.fb_staff_id)
    return LINK_AVATAR
  }
  console.log(user_id, 'user_id')
  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader
        onCancel={onCancel}
        user_id={user_id}
        setHideForMobile={setHideForMobile}
        page_name={page_name}
        staff_avatar={staff_avatar}
        staff_name={staff_name}
        loading_staff={loading_staff}
        employee_list={employee_list}
        loading_chat_data={loading_more}
      />
      {/* body */}
      <div
        ref={MESSAGE_CONTAINER_REF}
        className={`px-5 py-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-webkit flex flex-col relative ${
          user_id ? 'my-16' : 'mt-44'
        }`}
      >
        {user_id && loading_more && <Loading />}
        {/* Không có page Id sẽ báo lỗi k kết nối với hệ thống */}
        {!user_id && error_message && (
          <h4 className="flex justify-center font-semibold text-red-600 whitespace-pre-line">
            {error_message}
          </h4>
        )}
        {/* Không có page Id sẽ báo lỗi */}
        {!user_id && !error_message && (
          <div className="flex flex-col gap-2 ">
            <InitClient
              resetData={invalid_page_id}
              onInitClient={(e) => {
                setLoadingInit(true)
                onInitClient({ ...e, PAGE_ID })
              }}
            />
            {invalid_page_id && (
              <h4 className="flex justify-center font-semibold text-red-600">
                {t('invalid_page_id')}
              </h4>
            )}
          </div>
        )}

        {/* render nội dung tin nhắn từ list có sẵn */}
        {user_id &&
          new_data &&
          new_data.map((item: any, index: number) => (
            <div
              className="flex flex-col"
              key={index}
            >
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex w-full py-2 gap-1  ${
                  item.message_type === 'system'
                    ? ' hidden justify-center'
                    : item.message_type === 'page'
                    ? ' justify-start items-start'
                    : ' justify-end items-end'
                }`}
              >
                {item.message_type === 'page' && (
                  <div className="flex rounded-lg">
                    {/* {checkStaffExist(item?.message_metadata)} */}
                    <img
                      src={
                        checkStaffExist(item?.message_metadata) ||
                        // staff_avatar ||
                        './images/earth.svg'
                      }
                      className="w-6 h-6 rounded-lg "
                      alt=""
                    />
                  </div>
                )}

                {/* Phần nội dung tin nhắn được hiển thị */}
                <MessageComponent
                  data={item}
                  userId={user_id}
                />

                {item.message_type === 'client' && (
                  <div
                    className="flex rounded-lg text-white text-sm items-center justify-center w-6 h-6"
                    style={{ background: letterToColorCode(client_name) }}
                  >
                    {nameToLetter(client_name)}
                  </div>
                )}
              </div>
            </div>
          ))}

        {/* Thẻ div này đóng vai trò là nơi đánh dấu để cuộn tới */}
        <div ref={MESSAGE_END_REF} />

        {/* Khi gửi tin nhắn sẽ hiển thị loading để call api */}
        {loading && (
          <div className="fixed bg-blue-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}

        {/* Khi khởi tạo sẽ hiển thị loading này */}
        {loading_init && (
          <div className="fixed bg-red-300 bottom-[22%] left-[48%] p-2 rounded-full text-xs z-50">
            <LoadingDots />
          </div>
        )}
      </div>
      {/* Hiển thị nút nhảy về cuối trang */}
      {show_jump_button && (
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

      {/* ô input  Khi có text trong input thì hiển thị thêm icon send */}
      {user_id && (
        <InputChat
          error_message={error_message}
          handleSend={(e) => {
            sendMessage(e)
            setLoading(true)
          }}
          loading={loading}
          page_name={page_name}
          client_id={user_id}
          setLoading={(e) => setLoading(e)}
        />
      )}
    </div>
  )
}

export default DetailChat
