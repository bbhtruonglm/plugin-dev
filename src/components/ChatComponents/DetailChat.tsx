import { ChatScreenProps, Message } from './type'
import { fetchAPI, useAPI } from '@/api/api'
import { letterToColorCode, nameToLetter, renderAvatar } from '@/utils'
import {
  selectLatestMessage,
  selectListMessage,
  selectListUnreadMessage,
  selectPageId,
  selectStatusPopup,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
} from '@/stores/appSlice'
import { t, use } from 'i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ChatHeader from './ChatHeader'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import InitClient from './InitClient'
import InputChat from './InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import MessageComponent from './MessageComponent'
import _ from 'lodash'

/** Chi tiết component chat */
function DetailChat({
  onCancel,
  user_id,
  onInitClient,
  loading_init,
  setLoadingInit,
  invalid_page_id,
  error_message,
  setHideForMobile,
  page_name,
  staff_avatar,
  staff_name,
  loading_staff,
  client_name,
  employee_list,
  is_init,
}: ChatScreenProps) {
  /** Bắt vị trí end scroll ở bottom */
  const MESSAGE_END_REF = useRef<HTMLDivElement | null>(null)
  /** Bắt vị trí ref ở đầu tin nhắn */
  const MESSAGE_CONTAINER_REF = useRef<HTMLDivElement | null>(null)
  // lấy Api từ hooks api
  const { READ_MESSAGE_API, SEND_MESSAGE_API } = useAPI()

  // hàm dispatch đến store
  const dispatch = useDispatch()

  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)

  /** Trạng thái đóng mở popup */
  const SHOW_POPUP = useSelector(selectStatusPopup)

  /** List tin nhắn được lấy từ store */
  const LIST_MESSAGE = useSelector(selectListMessage)

  /** List tin nhắn chưa đọc được lấy từ store */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)

  /** TIn nhắn mới nhất từ store */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  /** Số bản ghi hiển thị trong 1 trang */
  const LIMIT = 20

  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(false)

  const [loading_more, setLoadingMore] = useState(false)
  const [has_more, setHasMore] = useState(true)
  const [scroll_at_bottom, setScrollAtBottom] = useState(true)
  const [show_jump_button, setShowJumpButton] = useState(false)

  /** Debounce để xử lý scroll
   * @param func
   * @param delay
   * @returns setTimeout
   */
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

  // call api list tin nhan
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (is_init) {
      // Đặt timeout để call API sau 1 giây
      timeoutId = setTimeout(() => {
        // Gọi API sau khi đợi 1 giây
        fetchMessage()
        console.log('API called after 1 second because is_init is true')
        // Call API hoặc xử lý logic tại đây
      }, 100)
    }

    // Khi user_id thay đổi thì gọi fetchMessage ngay lập tức
    if (user_id && !is_init) {
      fetchMessage()
    }

    // Cleanup: Hủy bỏ timeout nếu is_init thay đổi hoặc component bị unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user_id, is_init])

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
      /** Tạo đối tượng URL từ string */
      const URL_READ = new URL(READ_MESSAGE_API)

      //setup params
      const PARAMS = {
        // page_id: '3861367970af4b7cadacaec5d1443473',
        page_id: PAGE_ID,
        client_id: user_id,
        limit: LIMIT.toString(),
        skip: skip.toString(),
      }
      /** Thêm params vào URL */
      URL_READ.search = new URLSearchParams(PARAMS as any).toString()

      // Kết quả trả về
      const RES = await fetchAPI(URL_READ.toString(), 'GET')

      const RESULT = await RES

      if (RESULT.data.length === LIMIT) {
        // set call api se skip bn ban ghi
        setSkip(skip + RESULT.data.length)
      }

      // Loại bỏ những tin nhắn từ hệ thống
      const FILTER_RES = RESULT?.data.filter(
        (item: any) => item.message_type !== 'system'
      )
      console.log(FILTER_RES, 'FILTER_RES')

      //lưu data về phía trước do data đã bị reverse
      // setNewData([...FILTER_RES.reverse(), ...new_data])
      // console.log(FILTER_RES, 'FILTER_RES')
      dispatch(setListMessage([...FILTER_RES.reverse(), ...LIST_MESSAGE]))

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

  /** Hàm Xử lý gửi tin nhắn
   * @param {string} input - Nội dung tin nhắn text
   */
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
    /**
     * Trường hợp đang mở tab chat
     * - Người dùng gửi tin nhắn đi
     * - Page nhắn tin trả lời
     * Thì sẽ thêm vào store
     */

    if (_.keys(LATEST_MESSAGE).length !== 0) {
      // Lưu tin nhắn mới từ socket vào store
      dispatch(setListMessage([...LIST_MESSAGE, LATEST_MESSAGE]))

      // Nếu có tin nhắn từ websocket, scroll xuống cuối trang
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [LATEST_MESSAGE])

  useEffect(() => {
    /**
     * Trường hợp đang ở tab 'Message'
     * Nhưng khách hàng ẩn popup đi
     * Khi mở lại popup, Tin nhắn chưa đọc sẽ được thêm vào danh sách tin nhắn
     * sau khi thêm xong thì clear danh sách tin nhắn chưa đọc trong store
     */

    if (
      LIST_UNREAD_MESSAGE &&
      LIST_UNREAD_MESSAGE?.length !== 0 &&
      SHOW_POPUP
    ) {
      dispatch(setListMessage([...LIST_MESSAGE, ...LIST_UNREAD_MESSAGE]))
      dispatch(setListUnreadMessage([]))

      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [SHOW_POPUP, LIST_UNREAD_MESSAGE])

  /** Hàm kiểm tra nhân sự có tồn tại không
   * @string id: Nhan vao id của nhân sự
   * @returns {string} link avatar
   */
  const checkStaffExist = (id: string) => {
    // Nếu không có staff Id thì trả về ''
    if (!id) return ''

    // Xem nhân viên nhắn tin có tồn tại trong list nhân viên không
    const IS_STAFF_EXIST = employee_list?.find((item) =>
      id.includes(item?.fb_staff_id)
    )

    // Nếu không tồn tại thì trả về ''
    if (!IS_STAFF_EXIST) {
      return ''
    }

    // Lấy link avatar
    const LINK_AVATAR = renderAvatar(IS_STAFF_EXIST?.fb_staff_id)
    return LINK_AVATAR
  }

  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader
        onCancel={() => onCancel()}
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
                onInitClient({ ...e, page_id: PAGE_ID })
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
          LIST_MESSAGE &&
          LIST_MESSAGE.map((item: any, index: number) => (
            <div
              className="flex flex-col"
              key={index}
            >
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex w-full py-2 gap-1  ${
                  item?.message_type === 'system'
                    ? ' hidden justify-center'
                    : item?.message_type === 'page'
                    ? ' justify-start items-start'
                    : ' justify-end items-end'
                }`}
              >
                {item?.message_type === 'page' && (
                  <div className="flex rounded-lg">
                    <img
                      src={
                        checkStaffExist(item?.message_metadata) ||
                        './images/earth.svg'
                      }
                      className="w-6 h-6 rounded-lg "
                      alt=""
                    />
                  </div>
                )}

                {/* Phần nội dung tin nhắn được hiển thị */}
                <MessageComponent data={item} />

                {item?.message_type === 'client' && (
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
          className="absolute flex justify-center items-center h-7 w-7 shadow-md bg-white rounded-full z-[999999] bottom-[13%] right-[45%]"
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
          handleSend={(e: string) => {
            sendMessage(e)
            setLoading(true)
          }}
          loading={loading}
          page_name={page_name}
          client_id={user_id}
          setLoading={(e: boolean) => setLoading(e)}
        />
      )}
    </div>
  )
}

export default DetailChat
