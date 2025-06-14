import { ChatScreenProps, Message } from './type'
import { debounce, isEmpty, keys } from 'lodash'
import { fetchAPI, useAPI } from '@/api/api'
import { renderAvatarFromId, renderAvatarFromIdAgent } from '@/utils'
import {
  selectActiveAiAgent,
  selectAiId,
  selectConsultationGlobal,
  selectCurrentUserId,
  selectFixedDataClient,
  selectGlobalClientId,
  selectGlobalUnreadCount,
  selectIsAvatar,
  selectIsViewScreen,
  selectLatestMessage,
  selectListMessage,
  selectLoadingGlobal,
  selectPageAvatar,
  selectPageId,
  selectPageInfoAI,
  selectRefreshData,
  selectShowForm,
  selectStatusAI,
  selectStatusPopup,
  selectStatusViewport,
  selectTypingStatus,
  setGlobalUnreadCount,
  setListMessage,
  setLoadingGlobal,
  setRefreshData,
  setTypingStatus,
} from '@/stores/appSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ChatHeader from './Header/ChatHeader'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import InitClient from './Body/InitClient'
import InputChat from './Body/InputChat/InputChat'
import Loading from '../Loading/Loading'
import LoadingDots from '../Loading/LoadingDot'
import LoadingJumping from '../Loading/LoadingJumping'
import MessageBody from './Body/MessageBody'
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

  /** Trạng thái consultation */
  const GLOBAL_CONSULTATION = useSelector(selectConsultationGlobal)
  /**
   * CURRENT_USER_ID
   */
  const CURRENT_USER_ID = useSelector(selectCurrentUserId)

  console.log(CURRENT_USER_ID, 'CURRENT_USER_ID')

  /** hàm dispatch đến store */
  const dispatch = useDispatch()
  /**
   * Trạng thái có ID Trợ lý ảo
   */
  const NO_AI_ID = useSelector(selectAiId)

  /** IS View screen */
  const IS_VIEW_SCREEN = useSelector(selectIsViewScreen)
  /**
   * Trạng thái có ID Trợ lý ảo
   */
  const IS_ACTIVE_AGENT_AI = useSelector(selectActiveAiAgent)
  /** Trạng thái loaded */
  const [is_loaded, setIsLoaded] = useState(false)
  /** Set loaded */
  useEffect(() => {
    /**
     * Neu IS_ACTIVE_AGENT_AI la boolean
     */
    if (typeof IS_ACTIVE_AGENT_AI === 'boolean') {
      setIsLoaded(true)
    }
  }, [IS_ACTIVE_AGENT_AI])
  /** Biến check no message */
  const [check_no_message_ai, setCheckNoMessageAi] = useState(false)
  /** Delay time */
  let delay = 800
  /** Set timeout 0.4s thì bật cờ */
  useEffect(() => {
    if (!check_no_message_ai) {
      const timer = setTimeout(() => {
        setCheckNoMessageAi(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [check_no_message_ai])

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
   * Mock data trạng thái AI
   */
  const STATUSES = [
    t('ai_thinking'),
    t('ai_still_thinking'),
    t('ai_already_thinking'),
  ]
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
    /**
     * Kiểm tra REFRESH_DATA và !CLIENT_ID
     */
    if (REFRESH_DATA) {
      /**
       * có data
       */
      setHasMore(true)

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
      console.log('first ====', CLIENT_ID_GLOBAL)
      console.log('first ====', REFRESH_DATA)
      /**
       * Fetch data với client id truyền vào
       */
      fetchMessage(CLIENT_ID_GLOBAL)

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
   * show init client từ store
   */
  const FORM_BEFORE_CHAT = useSelector(selectShowForm)

  /** Fixed client info */
  const FIXED_CLIENT_INFO = useSelector(selectFixedDataClient)

  console.log(FIXED_CLIENT_INFO, 'FIXED_CLIENT_INFO')

  console.log(FORM_BEFORE_CHAT, 'FORM_BEFORE_CHAT')
  /**
   * State lưu user_id trong localStorage
   */
  const [local_user_id, setLocalUserId] = useState<string | null | undefined>(
    undefined
  )

  // Bước 1: Lấy user_id từ localStorage
  useEffect(() => {
    /**
     * Khi user_id khóng null
     */
    if (PAGE_ID === undefined) return
    /**
     * Lấy user_id trong localStorage
     */
    const STORED_CLIENT_ID = localStorage.getItem(`client_id_${PAGE_ID}`)
    /** Lưu user_id */
    setLocalUserId(STORED_CLIENT_ID) // có thể là null nếu chưa có
  }, [PAGE_ID, user_id])

  /** Bước 2: Chỉ chạy logic anonymous khi đã biết chắc chắn user_id là null */
  useEffect(() => {
    console.log(
      FORM_BEFORE_CHAT,
      local_user_id,
      FIXED_CLIENT_INFO,
      GLOBAL_CONSULTATION,
      'chay vao day'
    )

    console.log(
      local_user_id === undefined,
      'chay vao day local_user_id === undefined'
    )
    console.log(AI_STATUS, 'chay vao day AI_STATUS')
    console.log(!PAGE_ID, 'chay vao day PAGE_ID')
    console.log(FIXED_CLIENT_INFO, 'chay vao day FIXED_CLIENT_INFO')
    /** Đnag load thông tin */
    if (
      local_user_id === undefined ||
      AI_STATUS ||
      !PAGE_ID ||
      FIXED_CLIENT_INFO
    )
      return // Đang load từ localStorage, chưa xong

    /**
     * Khi user_id khóng null
     */
    if (!isEmpty(FORM_BEFORE_CHAT)) {
      /**
       * Khi chưa tạo tài khoản ẩn danh
       */
      if (!FORM_BEFORE_CHAT?.is_active && !local_user_id) {
        /** Tạo thành tài khoản ẩn danh */
        onInitClient({
          name: t('anonymous'),
          page_id: PAGE_ID,
        })
      }
    }
  }, [
    FORM_BEFORE_CHAT,
    local_user_id,
    AI_STATUS,
    IS_VIEW_SCREEN,
    GLOBAL_CONSULTATION,
  ])

  /** Hàm gọi API để lấy tin nhắn */
  const fetchMessage = async (client_iddd?: string) => {
    console.log(loading_more, 'loading_more')
    console.log(has_more, 'has_more')
    /** Đang loading hoặc không có thêm bản ghi sẽ không fetch data nữa */
    if (loading_more || !has_more) return
    /** Lấy vị trí scroll hiện tại, nếu k có thì return */
    const CONTAINER = MESSAGE_CONTAINER_REF.current
    console.log(CONTAINER, 'CONTAINER')
    /** Nếu không co REF thi return */
    if (!CONTAINER) return

    /** Lưu vị trí scroll */
    const SCROLL_POSITION = CONTAINER.scrollHeight - CONTAINER.scrollTop

    /** set loading_more = true để không call liên tục */

    try {
      if (AI_STATUS) {
        /** Lấy data */
        // dispatch(setLoadingGlobal(true))
      }
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
      let result = []

      try {
        /** Kết quả trả về */
        result = await fetchAPI(URL_READ.toString(), 'GET')

        /**
         * Lưu kết quả trả về
         */
        const RESULT = await result
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
        /** Lưu LIST_MESSAGE vào store */
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
        console.log('Error:', error)
      } finally {
        dispatch(setLoadingGlobal(false))
      }
    } catch (error) {
    } finally {
    }
  }

  /**
   * Hàm debounce xử lý scroll
   */
  useEffect(() => {
    console.log(LIST_MESSAGE, 'LIST_MESSAGE')
    const TIMER = setTimeout(() => {
      /**
       * Set loading more về false
       */
      dispatch(setLoadingGlobal(false))
      /** nếu là ai trên */
      if (!AI_STATUS) {
        /**
         * Set loading more về false
         */
        setLoadingMore(false)
      }
    }, 200)
    /** Nếu la ai trên */
    if (AI_STATUS) {
      /** Loading more về false */
      setLoadingMore(false)
      /** Set Has more */
      // setHasMore(true)
    }
    /** Cleanup function to clear the timeout */
    return () => {
      /**
       * Clear timeout
       */
      clearTimeout(TIMER)
    }
  }, [LIST_MESSAGE, AI_STATUS])

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
    if (input.trim() === '') return

    try {
      /** Lấy ID người dùng */
      const META_DATA_ID = CURRENT_USER_ID || user_id

      /** Khởi tạo body tin nhắn */
      const MESSAGE: Message = {
        page_id: PAGE_ID,
        client_id: user_id,
        text: input,
        user_id: CURRENT_USER_ID,
        ...(META_DATA_ID && {
          metadata: AI_STATUS
            ? `__ai_agent__${META_DATA_ID}`
            : `__user_normal__${META_DATA_ID}`,
        }),
      }
      /** Gọi api gửi tin nhắn */
      await fetchAPI(SEND_MESSAGE_API, 'POST', MESSAGE)
      /**
       * Trường hợp là AI Agent thì mới set Trạng thái typing true sau khi gửi
       */
      if (AI_STATUS) {
        dispatch(setTypingStatus(true))
      }

      /** Gửi tin nhắn thành công, scroll xuống cuối trang */
      scrollToBottom()
    } catch (error) {
      console.error('Gửi tin nhắn thất bại:', error)
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
  /**
   * link avatar cua page
   */
  const PAGE_AVATAR = useSelector(selectPageAvatar)
  /**
   * Setting hiển thị avatar nhân viên
   */
  const IS_PAGE_AVATAR = useSelector(selectIsAvatar)
  /** Hàm kiểm tra nhân sự có tồn tại không
   * @string id: Nhan vao id của nhân sự
   * @returns {string} link avatar
   */
  const checkStaffExist = useCallback(
    (id: string) => {
      /** Lấy thônng tin avatar của staff */
      const STAFF_AVATAR = renderAvatarFromId(id, IS_PAGE_AVATAR, PAGE_AVATAR)
      /** Trả về link */
      return STAFF_AVATAR
    },
    [employee_list, IS_PAGE_AVATAR, PAGE_AVATAR]
  )
  /** Hàm kiểm tra nhân sự có tồn tại không
   * @string id: Nhan vao id của nhân sự
   * @returns {string} link avatar
   */
  const checkStaffExistAgent = useCallback(
    (id: string) => {
      /** Lấy thônng tin avatar của staff */
      const STAFF_AVATAR = renderAvatarFromIdAgent(id, PAGE_AVATAR)
      /** Trả về link */
      return STAFF_AVATAR
    },
    [employee_list, IS_PAGE_AVATAR, PAGE_AVATAR]
  )
  const [url, setUrl] = useState('')

  useEffect(() => {
    console.log(window.location, 'window.location.href')
    setUrl(window.location.href)
  }, [])

  return (
    <div
      className={`flex flex-col w-full h-full ${
        AI_STATUS && 'bg-ai-bg'
      }  relative `}
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
        } `}
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

        {AI_STATUS &&
          invalid_page_id === true &&
          is_loaded &&
          IS_ACTIVE_AGENT_AI === true && (
            <h4 className="flex justify-center font-semibold text-red-600">
              {t('invalid_virtual_assistant')}
            </h4>
          )}
        {AI_STATUS && NO_AI_ID && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('no_virtual_assistant')}
          </h4>
        )}
        {AI_STATUS && is_loaded && IS_ACTIVE_AGENT_AI === false && (
          <h4 className="flex justify-center font-semibold text-red-600">
            {t('inactive_virtual_assistant')}
          </h4>
        )}
        {/* Hiển thị Phần chào mừng với AI */}
        {AI_STATUS &&
          LIST_MESSAGE.length == 0 &&
          user_id &&
          !LOADING_GLOBAL &&
          check_no_message_ai && (
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
                checkAgentExist={checkStaffExistAgent}
              />
            </div>
          ))}
        <div>
          {TYPING_STATUS && (
            <div className="text-lg font-semibold flex items-center gap-x-2 py-2 px-4 rounded-full bg-slate-300 w-fit">
              <span className="text-xs text-slate-700">
                {STATUSES[status_index]}
              </span>

              <div className="flex  ">
                {/* <LoadingDots /> */}
                <LoadingJumping />
              </div>
            </div>
          )}
        </div>

        {/* Thẻ div này đóng vai trò là nơi đánh dấu để cuộn tới
         * khi có tin nhắn mới thì sẽ cuộn xuống dưới cùng
         */}

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
      {show_jump_button && user_id && (
        <button
          onClick={scrollToBottom}
          className={`absolute flex justify-center items-center h-7 w-7 shadow-md bg-white rounded-full z-[40] ${
            AI_STATUS ? 'bottom-[16%]' : 'bottom-[13%]'
          } right-[45%]`}
        >
          <ChevronDownIcon className="size-4" />
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
