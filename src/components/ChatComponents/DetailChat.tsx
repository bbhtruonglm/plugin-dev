import { ChatScreenProps, Message } from './type'
import { debounce, keys } from 'lodash'
import { fetchAPI, useAPI } from '@/api/api'
import {
  selectGlobalClientId,
  selectGlobalUnreadCount,
  selectLatestMessage,
  selectListMessage,
  selectLoadingGlobal,
  selectPageId,
  selectPageInfoAI,
  selectRefreshData,
  selectStatusAI,
  selectStatusPopup,
  selectStatusViewport,
  selectTypingStatus,
  setGlobalUnreadCount,
  setListMessage,
  setLoadingGlobal,
  setRefreshData,
} from '@/stores/appSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ChatHeader from './Header/ChatHeader'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import InitClient from './Body/InitClient'
import InputChat from './Body/InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import LoadingJumping from '../Loading/LoadingJumping'
import MessageBody from './Body/MessageBody'
import { renderAvatarCDN } from '@/utils'
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
  /**
   * Global client ID
   */
  const CLIENT_ID_GLOBAL = useSelector(selectGlobalClientId)

  /** hàm dispatch đến store */
  const dispatch = useDispatch()
  /**
   * THông tin Refresh Data
   */
  const REFRESH_DATA = useSelector(selectRefreshData)

  /**
   * Trạng thái typing
   */
  const TYPING_STATUS = useSelector(selectTypingStatus)

  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)
  /**
   * CLIENT_ID
   */
  const CLIENT_ID = localStorage.getItem(`client_id_${PAGE_ID}`)

  /**
   * State loading khi gửi tin nhắn
   */
  const [skip, setSkip] = useState(0)
  /** Dùng ref để giữ giá trị của skip */
  const SKIP_REF = useRef(0)
  /**
   * Trạng thái loading khi gửi tin nhắn
   */
  const STATUSES = ['AI đang suy nghĩ', 'AI vẫn đang suy nghĩ', 'Sắp xong rồi!']
  /**
   * Trạng thái loading khi gửi tin nhắn
   */
  const [status_index, setStatusIndex] = useState(0)
  /**
   * Cập nhật trạng thái loading khi gửi tin nhắn
   */
  useEffect(() => {
    /**
     * Nếu trạng thái typing thay đổi
     */
    if (TYPING_STATUS) {
      /** Reset trạng thái khi bắt đầu typing */
      setStatusIndex(0)
      /**
       * Set interval để thay đổi trạng thái
       */
      const INTERVAL = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % STATUSES.length)
      }, 3000)

      return () => clearInterval(INTERVAL)
    } else {
      /** Reset khi ngừng typing */
      setStatusIndex(0)
    }
  }, [TYPING_STATUS])

  useEffect(() => {
    console.log(REFRESH_DATA, 'refresh detail chat')

    console.log(CLIENT_ID_GLOBAL, 'CLIENT_ID_GLOBAL')
    /**
     * Kiểm tra REFRESH_DATA và !CLIENT_ID
     */
    if (REFRESH_DATA && !CLIENT_ID_GLOBAL) {
      /**
       * Set lại các trạng thái của component
       */
      /**
       * có data
       */
      setHasMore(true)
      console.log(REFRESH_DATA, 'fetch data no CLIENT')
      /**
       * Set lại skip
       */
      SKIP_REF.current = 0
      /**
       * Set lại skip
       */
      setSkip(0)
    }
    /**
     * Đoạn này cần sửa lại
     */
    if (REFRESH_DATA && CLIENT_ID_GLOBAL) {
      console.log('fetch data has CLIENT')
      /**
       * Fetch data với client id truyền vào
       */
      fetchMessage(CLIENT_ID_GLOBAL)
      console.log('FETCH MESSAGE use Effect Refresh data')
      /**
       * Set lại trạng thái REFRESH_DATA
       */
      dispatch(setRefreshData(false))
    }
  }, [REFRESH_DATA, CLIENT_ID_GLOBAL])

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

  /**
   * Data client info
   */
  const CLIENT_INFO = useSelector(selectPageInfoAI)

  /**
   * Trạng thái Viewport
   */
  const NO_VIEWPORT = useSelector(selectStatusViewport)

  /** Trạng thái AI_STATUS */
  const AI_STATUS = useSelector(selectStatusAI)

  /** Số bản ghi hiển thị trong 1 trang */
  const LIMIT = 20

  /**
   * State loading khi gửi tin nhắn
   */
  const [loading, setLoading] = useState(false)
  /**
   * State loading khi gửi tin nhắn
   */
  const [loading_more, setLoadingMore] = useState(false)
  /**
   *  State có thêm tin nhắn không
   */
  const [has_more, setHasMore] = useState(true)
  /**
   *  State lưu tin nhắn mới
   */
  const [scroll_at_bottom, setScrollAtBottom] = useState(true)
  /**
   * State trạng thái nhanh chóng cuộn xuống dưới cùng
   */
  const [show_jump_button, setShowJumpButton] = useState(false)
  /**
   * State lưu lỗi khi upload file
   */
  const [error_upload, setErrorUpload] = useState('')
  /**
   * State lưu trạng thái loading khi khởi tạo client
   */
  const [is_generate_message, setIsGenerateMessage] = useState(true)

  /** Hàm gọi API để lấy tin nhắn */
  const fetchMessage = async (client_iddd?: string) => {
    console.log(client_iddd, 'hahahah')
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
      /** Set loading more */
      setLoadingMore(true)
      /** Tạo đối tượng URL từ string */
      const URL_READ = new URL(READ_MESSAGE_API)

      /** setup params */
      const PARAMS = {
        page_id: PAGE_ID,
        client_id: client_iddd,
        limit: LIMIT.toString(),
        // skip: skip.toString(),
        /** Lấy giá trị từ ref */
        skip: SKIP_REF.current.toString(),
      }

      /** Thêm params vào URL */
      URL_READ.search = new URLSearchParams(PARAMS as any).toString()

      /** Kết quả trả về */
      const RES = await fetchAPI(URL_READ.toString(), 'GET')

      /**
       * Lưu kết quả trả về
       */
      const RESULT = await RES
      /**
       * Nếu data trả về = LIMIT thì còn tin nhắn cũ
       */
      if (RESULT.data.length === LIMIT) {
        /** Cập nhật ref mà không gây re-render */
        SKIP_REF.current += RESULT.data.length

        /** set call api se skip bn ban ghi */
        setSkip(skip + RESULT.data.length)
      }

      /** Loại bỏ những tin nhắn từ hệ thống và tin nhắn dạng note */
      const FILTER_RES = RESULT?.data.filter(
        (item: any) =>
          item.message_type !== 'system' && item.message_type !== 'note'
      )

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

  /**
   * Hàm debounce xử lý scroll
   */
  useEffect(() => {
    const TIMER = setTimeout(() => {
      /**
       * Set loading more về false
       */
      dispatch(setLoadingGlobal(false))
      /**
       * Set loading more về false
       */
      setLoadingMore(false)
    }, 200)

    /** Cleanup function to clear the timeout */
    return () => {
      /**
       * Clear timeout
       */
      clearTimeout(TIMER)
    }
  }, [LIST_MESSAGE])

  /** Function kéo xuống dưới cùng */
  const scrollToBottom = () => {
    /** Cuộn xuống dưới cùng */
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
      /**
       * Nếu có client id thì mới fetch data
       */
      if (CLIENT_ID_GLOBAL) {
        fetchMessage(CLIENT_ID_GLOBAL)
        console.log('FETCH MESSAGE handle Scroll')
      }
    }
    /**  vị trí bottom*/
    const AT_BOTTOM =
      CONTAINER.scrollTop + CONTAINER.clientHeight >= CONTAINER.scrollHeight - 1
    /** Lưu vị trí bottom */
    setScrollAtBottom(AT_BOTTOM)
    /** Set Hiển thị nút btn jump */
    setShowJumpButton(!AT_BOTTOM)
  }, [fetchMessage, loading_more, has_more, CLIENT_ID_GLOBAL])
  /**
   * Hàm debounce xử lý scroll
   */
  const DEBOUNCED_SCROLL = useCallback(debounce(handleScroll, 200), [
    handleScroll,
  ])
  /**
   * Hàm debounce xử lý scroll
   */
  const DEBOUNCED_SCROLL_TO_BOTTOM = useCallback(
    debounce(scrollToBottom, 200),
    [scrollToBottom]
  )
  useEffect(() => {
    /* Sử dụng debounce để xử lý scroll */
    const CONTAINER = MESSAGE_CONTAINER_REF.current
    /**
     * Nếu có container thì thêm event scroll
     */
    if (CONTAINER && !loading_more) {
      /** Sử dụng debounce */

      CONTAINER.addEventListener('scroll', DEBOUNCED_SCROLL)
      return () => {
        CONTAINER.removeEventListener('scroll', DEBOUNCED_SCROLL)
      }
    }
  }, [handleScroll, loading_more])

  useEffect(() => {
    /** Cuộn xuống cuối mỗi khi danh sách tin nhắn thay đổi
     * Không check event khi đang scroll lên nữa, khi có tin nhắn mới auto scroll
     */
    if (scroll_at_bottom) {
      /**
       * Cuộn xuống dưới cùng
       */

      DEBOUNCED_SCROLL_TO_BOTTOM()
    }
  }, [scroll_at_bottom, DEBOUNCED_SCROLL_TO_BOTTOM])

  useEffect(() => {
    let timeout_id: NodeJS.Timeout

    if (AI_STATUS) return
    /** Nếu Mới khởi tạo client, call api fetch tin nhắn nhưng cần settimeout */
    if (is_init) {
      /** Đặt timeout để call API sau 0.1 giây */
      timeout_id = setTimeout(() => {
        /**  Gọi API sau khi đợi 1 giây */
        fetchMessage(CLIENT_ID as string)
        console.log('FETCH MESSAGE là INIT')
        /** Khi khởi tạo và call API sau 0.1 giây . set lại trạng thái Không là tin nhắn khởi tạo nữa */
        setIsInit()
        console.log('API called after 1 second because is_init is true')
      }, 100)
    }

    /** Khi user_id thay đổi, Trạng thái đã Khởi tạo thì gọi fetchMessage ngay lập tức */
    if (CLIENT_ID && !is_init) {
      fetchMessage(CLIENT_ID)
      console.log('FETCH MESSAGE Không phải init')
    }

    /** Cleanup: Hủy bỏ timeout nếu is_init thay đổi hoặc component bị unmount */
    return () => {
      /**
       *  Clear timeout
       */
      if (timeout_id) {
        clearTimeout(timeout_id)
      }
    }
  }, [CLIENT_ID, is_init])

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
    console.log(LATEST_MESSAGE, 'LATEST_MESSAGE')
    console.log(is_init, 'is_init')
    if (keys(LATEST_MESSAGE).length !== 0 && !is_init) {
      /** Lưu tin nhắn mới từ socket vào store */
      dispatch(setListMessage([...LIST_MESSAGE, LATEST_MESSAGE]))
      setSkip(skip + 1)

      /** Nếu có tin nhắn từ websocket, scroll xuống cuối trang */
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
      console.log('chatbox opened and has unread message')
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
      /** Lấy ID của nhân viên */
      const ID_DETECT = id.split('__')[2]
      /** Nếu không có staff Id thì trả về '' */
      if (!ID_DETECT) return ''
      /** Nếu có staff Id thì trả về link avatar */
      return renderAvatarCDN(ID_DETECT)
    },
    [employee_list]
  )

  return (
    <div
      className={`flex flex-col w-full h-full ${
        AI_STATUS && 'bg-ai-bg'
      }  relative`}
    >
      {/* header */}
      <div className={`${AI_STATUS ? 'hidden' : ''}`}>
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
      </div>
      {/* body */}
      <div
        ref={MESSAGE_CONTAINER_REF}
        className={`px-5 py-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-webkit flex flex-col relative ${
          AI_STATUS ? 'mt-0 mb-16' : user_id ? 'my-16' : 'mt-44'
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
        {!AI_STATUS && !user_id && !error_message && (
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
        {AI_STATUS && invalid_page_id && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('invalid_virtual_assistant')}
          </h4>
        )}
        {/* Hiển thị Phần chào mừng với AI */}
        {AI_STATUS &&
          LIST_MESSAGE.length == 0 &&
          user_id &&
          !LOADING_GLOBAL && (
            <div className="flex flex-col items-center gap-2.5">
              <img
                src="./images/assistant_bot.svg"
                alt=""
              />
              <div className="flex flex-col items-center gap-1">
                <h4 className="text-sm font-medium flex">
                  {CLIENT_INFO?.current_staff_name
                    ? t('_hi') + CLIENT_INFO?.current_staff_name
                    : t('_hi_')}
                  , {t('_im_your_virtual_assistant')}
                </h4>
                <div>
                  <h4 className="text-xs text-slate-500 text-center">
                    {t('_how_can_i_help_you')}
                  </h4>
                  <h4 className="text-xs text-slate-500 text-center">
                    {t('asking_anything')}
                  </h4>
                </div>
              </div>
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
        <div>
          {/* {TYPING_STATUS && user_id && (
            <div className="flex p-2 rounded-full bg-slate-300 w-fit">
              <LoadingDots />
            </div>
          )} */}
          {TYPING_STATUS && (
            <div className="text-lg font-semibold flex items-center gap-x-2 py-2 px-4 rounded-full bg-slate-300 w-fit">
              <span className="text-xs text-slate-700">
                {STATUSES[status_index]}
              </span>
              <div className="flex  ">
                <LoadingDots />
              </div>
            </div>
          )}
        </div>

        {/* Thẻ div này đóng vai trò là nơi đánh dấu để cuộn tới
         * khi có tin nhắn mới thì sẽ cuộn xuống dưới cùng
         */}
        {
          // !NO_VIEWPORT &&
          <div ref={MESSAGE_END_REF} />
        }

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
          className={`absolute flex justify-center items-center h-7 w-7 shadow-md bg-white rounded-full z-[999999] ${
            AI_STATUS ? 'bottom-[16%]' : 'bottom-[13%]'
          } right-[45%]`}
        >
          <Down
            width={10}
            height={5}
            stroke="#000000"
          />
        </button>
      )}
      {/** Khi upload lỗi, thông báo cho user */}
      {error_upload && (
        <div className="absolute bottom-[20%] left-[35%] bg-white shadow-lg rounded-lg p-2 w-full max-w-40 h-fit max-h-40 group">
          <div
            className="flex justify-between cursor-pointer relative "
            onClick={() => {
              setErrorUpload('')
            }}
          >
            <Close className="absolute top-0 right-0 bg-slate-500 p-1 rounded-full opacity-0 group-hover:opacity-100" />
          </div>
          <h4 className="text-red-500 text-sm break-words whitespace-pre-line">
            {error_upload}
          </h4>
        </div>
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
          handleError={(e: any) => {
            setErrorUpload(e)
          }}
        />
      )}
    </div>
  )
}

export default DetailChat
