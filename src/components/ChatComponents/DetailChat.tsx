import { ChatScreenProps, Message } from './type'
import { fetchAPI, useAPI } from '@/api/api'
import {
  selectGlobalUnreadCount,
  selectLatestMessage,
  selectListMessage,
  selectLoadingGlobal,
  selectPageId,
  selectStatusPopup,
  setGlobalUnreadCount,
  setListMessage,
  setLoadingGlobal,
} from '@/stores/appSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ChatHeader from './Header/ChatHeader'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import InitClient from './Body/InitClient'
import InputChat from './Body/InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import MessageBody from './Body/MessageBody'
import _ from 'lodash'
import { renderAvatar } from '@/utils'
// import InitClient from './InitClient'
import { t } from 'i18next'

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
  setIsInit,
}: ChatScreenProps) {
  /** Bắt vị trí end scroll ở bottom */
  const MESSAGE_END_REF = useRef<HTMLDivElement | null>(null)
  /** Bắt vị trí ref ở đầu tin nhắn */
  const MESSAGE_CONTAINER_REF = useRef<HTMLDivElement | null>(null)
  /** lấy Api từ hooks api */
  const { READ_MESSAGE_API, SEND_MESSAGE_API } = useAPI()

  /** hàm dispatch đến store */
  const dispatch = useDispatch()

  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)

  /** Trạng thái đóng mở popup */
  const SHOW_POPUP = useSelector(selectStatusPopup)

  /** List tin nhắn được lấy từ store */
  const LIST_MESSAGE = useSelector(selectListMessage)
  console.log(LIST_MESSAGE, 'LIST_MESSAGE')

  /** Số tin nhắn chưa đọc lấy trong STORE */
  const GLOBAL_UNREAD_COUNT = useSelector(selectGlobalUnreadCount)

  /** TIn nhắn mới nhất từ store */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  /** Loading global */
  const LOADING_GLOBAL = useSelector(selectLoadingGlobal)

  /** Số bản ghi hiển thị trong 1 trang */
  const LIMIT = 20

  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(false)

  const [loading_more, setLoadingMore] = useState(false)
  const [has_more, setHasMore] = useState(true)
  const [scroll_at_bottom, setScrollAtBottom] = useState(true)
  const [show_jump_button, setShowJumpButton] = useState(false)

  const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)

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

  /** Hàm gọi API để lấy tin nhắn */
  const fetchMessage = async () => {
    /** Đang loading hoặc không có thêm bản ghi sẽ không fetch data nữa */

    if (loading_more || !has_more) return
    /** Lấy vị trí scroll hiện tại, nếu k có thì return */
    const CONTAINER = MESSAGE_CONTAINER_REF.current
    /** Nếu không co REF thi return */
    if (!CONTAINER) return

    /** Lưu vị trí scroll */
    const SCROLL_POSITION = CONTAINER.scrollHeight - CONTAINER.scrollTop

    /** set loading_more = true để không call liên tục */

    try {
      setLoadingMore(true)
      /** Tạo đối tượng URL từ string */
      const URL_READ = new URL(READ_MESSAGE_API)

      /** setup params */
      const PARAMS = {
        page_id: PAGE_ID,
        client_id: user_id,
        limit: LIMIT.toString(),
        skip: skip.toString(),
      }

      /** Thêm params vào URL */
      URL_READ.search = new URLSearchParams(PARAMS as any).toString()

      /** Kết quả trả về */
      const RES = await fetchAPI(URL_READ.toString(), 'GET')

      /**
       * Lưu kết quả trả về
       */
      const RESULT = await RES

      if (RESULT.data.length === LIMIT) {
        /** set call api se skip bn ban ghi */
        setSkip(skip + RESULT.data.length)
      }

      /** Loại bỏ những tin nhắn từ hệ thống và tin nhắn dạng note */
      const FILTER_RES = RESULT?.data.filter(
        (item: any) =>
          item.message_type !== 'system' && item.message_type !== 'note'
      )
      console.log(FILTER_RES, 'FILTER_RES')

      /**
      * lưu data vào Store. Lưu về phía trước do data đã bị reverse
      // setNewData([...FILTER_RES.reverse(), ...new_data])
      // console.log(FILTER_RES, 'FILTER_RES')
      */

      dispatch(setListMessage([...FILTER_RES.reverse(), ...LIST_MESSAGE]))

      /** Dùng request animation frame hoặc settimeout ( độ trễ 0ms) */
      requestAnimationFrame(() => {
        if (CONTAINER) {
          /** Kiểm tra lại container trước khi sử dụng */
          CONTAINER.scrollTop = CONTAINER.scrollHeight - SCROLL_POSITION
        }
      })
      /** Nếu data trả về < LIMIT thì đã hết tin nhắn cũ */
      /** Nếu load trên limit bản ghi thì hasmore == false */
      if (RESULT.data.length !== LIMIT) {
        /** k còn data nữa */
        setHasMore(false)
      }
    } catch (error) {
    } finally {
    }
  }

  // Inside your component
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setLoadingGlobal(false))
      setLoadingMore(false)
    }, 200)

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timer)
    }
  }, [LIST_MESSAGE])

  /** Function kéo xuống dưới cùng */
  const scrollToBottom = () => {
    MESSAGE_END_REF.current?.scrollIntoView({ behavior: 'smooth' })
  }
  /** Fuction thực thi khi có hành động scroll */
  const handleScroll = useCallback(() => {
    /** Tạo ref nhận event trong message */
    const CONTAINER = MESSAGE_CONTAINER_REF.current
    /** Nếu không có REF thì bỏ qua */
    if (!CONTAINER) return
    /** Tính toàn vị trí top */

    /** Scroll lên top ( Theo vị trí tính toán) thì load thêm data cũ */
    if (CONTAINER.scrollTop <= 342 && !loading_more && has_more) {
      fetchMessage()
    }
    /**  vị trí bottom*/
    const AT_BOTTOM =
      CONTAINER.scrollTop + CONTAINER.clientHeight >= CONTAINER.scrollHeight - 1
    /** Lưu vị trí bottom */
    setScrollAtBottom(AT_BOTTOM)
    /** Set Hiển thị nút btn jump */
    setShowJumpButton(!AT_BOTTOM)
  }, [fetchMessage, loading_more, has_more])

  const debouncedScroll = useCallback(debounce(handleScroll, 200), [
    handleScroll,
  ])

  useEffect(() => {
    /* Sử dụng debounce để xử lý scroll */
    const CONTAINER = MESSAGE_CONTAINER_REF.current

    if (CONTAINER && !loading_more) {
      /** Sử dụng debounce */
      // const debouncedScroll = debounce(handleScroll, 200)
      CONTAINER.addEventListener('scroll', debouncedScroll)
      return () => {
        CONTAINER.removeEventListener('scroll', debouncedScroll)
      }
    }
  }, [handleScroll, loading_more])

  useEffect(() => {
    /** Cuộn xuống cuối mỗi khi danh sách tin nhắn thay đổi
     * Không check event khi đang scroll lên nữa, khi có tin nhắn mới auto scroll
     */

    if (scroll_at_bottom) {
      scrollToBottom()
    }
  }, [scroll_at_bottom])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    /** Nếu Mới khởi tạo client, call api fetch tin nhắn nhưng cần settimeout */
    if (is_init) {
      /** Đặt timeout để call API sau 0.1 giây */
      timeoutId = setTimeout(() => {
        /**  Gọi API sau khi đợi 1 giây */
        fetchMessage()
        /** Khi khởi tạo và call API sau 0.1 giây . set lại trạng thái Không là tin nhắn khởi tạo nữa */
        setIsInit()
        console.log('API called after 1 second because is_init is true')
      }, 100)
    }

    /** Khi user_id thay đổi, Trạng thái đã Khởi tạo thì gọi fetchMessage ngay lập tức */
    if (user_id && !is_init) {
      fetchMessage()
    }

    /** Cleanup: Hủy bỏ timeout nếu is_init thay đổi hoặc component bị unmount */
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user_id, is_init])

  /** Hàm Xử lý gửi tin nhắn
   * @param {string} input - Nội dung tin nhắn text
   */
  const sendMessage = async (input: any) => {
    /**  Nhắn toàn khoảng trắng không cho gửi đi */
    if (input.trim() === '') return
    /** Tiến hành gửi tin nhắn */
    try {
      /** Khởi tạo body tin nhắn */
      const MESSAGE: Message = {
        page_id: PAGE_ID,
        client_id: user_id,
        text: input,
      }
      /** Gọi api gửi tin nhắn */
      await fetchAPI(SEND_MESSAGE_API, 'POST', MESSAGE)

      /** Gửi tin nhắn thành công, scroll xuống cuối trang */
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

    if (_.keys(LATEST_MESSAGE).length !== 0 && !is_init) {
      // Lưu tin nhắn mới từ socket vào store
      dispatch(setListMessage([...LIST_MESSAGE, LATEST_MESSAGE]))
      setSkip(skip + 1)

      // Nếu có tin nhắn từ websocket, scroll xuống cuối trang
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [LATEST_MESSAGE, is_init])

  useEffect(() => {
    /**
     * Trường hợp đang ở tab 'Message'
     * Nhưng khách hàng ẩn popup đi
     * Khi mở lại popup, Tin nhắn chưa đọc sẽ được thêm vào danh sách tin nhắn
     * sau khi thêm xong thì clear danh sách tin nhắn chưa đọc trong store
     */

    /** Đoạn này chắc bỏ được */

    if (GLOBAL_UNREAD_COUNT && GLOBAL_UNREAD_COUNT > 0 && SHOW_POPUP) {
      /** Khi mở vào tin nhắn, Reset lại số lượng tin nhắn chưa đọc */
      dispatch(setGlobalUnreadCount(0))
      setTimeout(() => {
        /** Sau khi xử lý xong thì scroll xuống bottom */
        scrollToBottom()
      }, 100)
    }
  }, [SHOW_POPUP, GLOBAL_UNREAD_COUNT])

  /** Hàm kiểm tra nhân sự có tồn tại không
   * @string id: Nhan vao id của nhân sự
   * @returns {string} link avatar
   */
  const checkStaffExist = useCallback(
    (id: string) => {
      /** Nếu không có staff Id thì trả về '' */
      if (!id) return ''

      /** Xem nhân viên nhắn tin có tồn tại trong list nhân viên không */
      const IS_STAFF_EXIST = employee_list?.find((item) =>
        id.includes(item?.fb_staff_id)
      )

      /** Nếu không tồn tại thì trả về '' */
      if (!IS_STAFF_EXIST) {
        return ''
      }

      /** Lấy link avatar */
      const LINK_AVATAR = renderAvatar(IS_STAFF_EXIST?.fb_staff_id)
      return LINK_AVATAR
    },
    [employee_list]
  )

  return (
    <div className="flex flex-col w-full h-full absolute top-0">
      {/* header */}
      <ChatHeader
        onCancel={() => onCancel()}
        user_id={CLIENT_ID}
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
        {user_id && loading_more && (
          <div className="fixed bg-white-300 top-[12%] left-[48%] p-2 rounded-full text-xs z-50">
            <Loading />
          </div>
        )}
        {/* Không có page Id sẽ báo lỗi k kết nối với hệ thống */}
        {!user_id && error_message && !loading_more && (
          <h4 className="flex justify-center font-semibold text-red-600 whitespace-pre-line">
            {error_message}
          </h4>
        )}
        {/* Không có page Id sẽ báo lỗi */}
        {/* {!user_id && !error_message && Khi bấm vào chat lần đầu */}
        {!user_id && !error_message && (
          <div className="flex flex-col gap-2 ">
            <InitClient
              resetData={invalid_page_id}
              onInitClient={(e: any) => {
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
          !LOADING_GLOBAL &&
          LIST_MESSAGE &&
          LIST_MESSAGE.map((item: any, index: number) => (
            <div
              className="flex flex-col"
              key={index}
            >
              <MessageBody
                item={item}
                checkStaffExist={checkStaffExist}
                client_name={client_name}
              />
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
