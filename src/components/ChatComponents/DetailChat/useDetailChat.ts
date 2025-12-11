import { Employee, Message } from '../type'
import { debounce, isEmpty, keys, set } from 'lodash'
import { fetchAPI, useAPI } from '@/api/api'
import { getCookie, renderAvatarFromId, renderAvatarFromIdAgent } from '@/utils'
import {
  selectActiveAiAgent,
  selectAiId,
  selectConsultationGlobal,
  selectCurrentUserId,
  selectDataQuickChat,
  selectFixedDataClient,
  selectGlobalClientId,
  selectGlobalUnreadCount,
  selectIsActiveCTAMessage,
  selectIsAvatar,
  selectIsViewScreen,
  selectLatestMessage,
  selectListAiRenderText,
  selectListCTAMessage,
  selectListMessage,
  selectLoadingGlobal,
  selectOnClickCTA,
  selectPageAvatar,
  selectPageId,
  selectPageInfoAI,
  selectRefreshData,
  selectShowForm,
  selectShowStaffNotAI,
  selectStatusAI,
  selectStatusPopup,
  selectStatusViewport,
  selectTypingStatus,
  setDataQuickChat,
  setGlobalUnreadCount,
  setListMessage,
  setLoadingGlobal,
  setOnClickCTA,
  setRefreshData,
  setTypingStatus,
} from '@/stores/appSlice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_MAP } from '@/utils/constants'

const useDetailChat = ({
  user_id,
  onInitClient,
  employee_list,
  is_init,
  setIsInit,
}: {
  user_id: string
  onInitClient: (e: any) => void
  employee_list?: Employee[]
  is_init: boolean
  setIsInit: () => void
}) => {
  /** Ngôn ngữ */
  const { i18n: I18N } = useTranslation()
  /** Lấy ngôn ngữ */
  const LANGUAGE = LANGUAGE_MAP[I18N.language] || I18N.language
  /** Bắt vị trí end scroll ở bottom */
  const MESSAGE_END_REF = useRef<HTMLDivElement | null>(null)
  /** Bắt vị trí ref ở đầu tin nhắn */
  const MESSAGE_CONTAINER_REF = useRef<HTMLDivElement | null>(null)
  /** lấy Api từ hooks api */
  const { READ_MESSAGE_API, SEND_MESSAGE_API } = useAPI()
  /** List CTA */
  const LIST_CTA = [
    'Tư vấn',
    'Gọi lại cho tôi',
    'Bảng giá',
    'Thông tin Khuyến mãi',
  ]
  /** Global client ID */
  const CLIENT_ID_GLOBAL = useSelector(selectGlobalClientId)

  /** Lấy client id */
  const USER_ID = useSelector(selectGlobalClientId)

  /** Trạng thái consultation */
  const GLOBAL_CONSULTATION = useSelector(selectConsultationGlobal)
  /** CURRENT_USER_ID */
  const CURRENT_USER_ID = useSelector(selectCurrentUserId)

  /** is onClick CTA */
  const ON_CLICK_CTA = useSelector(selectOnClickCTA)

  /** Lấy Api từ hooks api */
  const { DOMAIN_TRIGGER_BTN } = useAPI()

  /** hàm dispatch đến store */
  const dispatch = useDispatch()
  /** Trạng thái có ID Trợ lý ảo */
  const NO_AI_ID = useSelector(selectAiId)

  /** IS View screen */
  const IS_VIEW_SCREEN = useSelector(selectIsViewScreen)
  /** Trạng thái có ID Trợ lý ảo */
  const IS_ACTIVE_AGENT_AI = useSelector(selectActiveAiAgent)
  /** Trạng thái loaded */
  const [is_loaded, setIsLoaded] = useState(false)
  /** Set loaded */
  useEffect(() => {
    /** Neu IS_ACTIVE_AGENT_AI la boolean */
    if (typeof IS_ACTIVE_AGENT_AI === 'boolean') {
      setIsLoaded(true)
    }
  }, [IS_ACTIVE_AGENT_AI])
  /** Biến check no message */
  const [check_no_message_ai, setCheckNoMessageAi] = useState(false)

  /** Loading first tiem */
  const [loading_first_time, setLoadingFirstTime] = useState(true)
  /** Xử lý bật trạng thái */
  useEffect(() => {
    /** Tạo hàm timeout */
    const TIMER = setTimeout(() => {
      setLoadingFirstTime(false)
    }, 1000) // 0.2 giây

    /** Cleanup nếu component unmount trước khi timeout xong */
    return () => clearTimeout(TIMER)
  }, [])
  /** Delay time */
  let delay = 800
  /** Set timeout 0.4s thì bật cờ */
  useEffect(() => {
    /** Kiểm tra nếu check_no_message_ai la false */
    if (!check_no_message_ai) {
      /** Tạo hàm timeout */
      const TIMER = setTimeout(() => {
        /** Bật cờ */
        setCheckNoMessageAi(true)
      }, delay)
      /** Cleanup */
      return () => clearTimeout(TIMER)
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
  let client_id = localStorage.getItem(`client_id_${PAGE_ID}`)
  /** 2. Nếu localStorage không có → thử lấy từ cookie */
  if (!client_id) {
    client_id = getCookie(`client_id_${PAGE_ID}`)
  }

  /**
   * State loading khi gửi tin nhắn
   */
  const [skip, setSkip] = useState(0)
  /** Dùng ref để giữ giá trị của skip */
  const SKIP_REF = useRef(0)
  /**
   * Mock data trạng thái AI
   */
  const STATUSES = useMemo(
    () => [t('ai_thinking'), t('ai_still_thinking'), t('ai_already_thinking')],
    [LANGUAGE]
  )

  /** list trạng thái ai message */
  const [status_list, setStatusList] = useState(STATUSES)

  // /** Cập nhật lại status_list mỗi khi STATUSES thay đổi */
  // useEffect(() => {
  //   /** Set list trạng thái */
  //   setStatusList(STATUSES)
  // }, [STATUSES])

  /** List CTA message */
  const [list_cta_message, setListCTAMessage] = useState(LIST_CTA)
  /** Data Quick chat */
  const [socket_quick_chat, setSocketQuickChat] = useState([])
  /** Socket quick chat */
  const SOCKET_QUICK_CHAT = useSelector(selectDataQuickChat)
  /** Lấy socket quick chat  */
  useEffect(() => {
    /** Nếu socket quick chat thay đổi */
    if (SOCKET_QUICK_CHAT) {
      /** Set socket quick chat */
      setSocketQuickChat(SOCKET_QUICK_CHAT)
    }
  }, [SOCKET_QUICK_CHAT])

  /** list text render từ setting */
  const LIST_AI_RENDER_TEXT = useSelector(selectListAiRenderText)
  /** List CTA render message */
  const LIST_CTA_MESSAGE = useSelector(selectListCTAMessage)

  /** is active cta */
  const IS_ACTIVE_CTA = useSelector(selectIsActiveCTAMessage)
  /** is show staff not AI */
  const IS_SHOW_STAFF_NOT_AI = useSelector(selectShowStaffNotAI)

  useEffect(() => {
    /** Nếu show staff thì k hiển thị trạng thái */
    if (IS_SHOW_STAFF_NOT_AI) {
      setStatusList([])
    } else {
      /** Nếu list trạng thái thay đổi */
      if (LIST_AI_RENDER_TEXT) {
        /** Nếu list trạng thái hóa được kích hoạt */
        if (LIST_AI_RENDER_TEXT?.is_active) {
          /** Lấy dữ liệu phản hồi của AI */
          const DATA_AI_RESPONDING = LIST_AI_RENDER_TEXT.data?.map((item) => {
            /** Trả về dữ liệu theo ngôn ngữ */
            return item?.source?.[LANGUAGE]
          })

          /** Set list trạng thái */
          setStatusList(DATA_AI_RESPONDING)
        } else {
          /** Cập nhật data mặc định */
          setStatusList(STATUSES)
        }
      }
    }
  }, [LIST_AI_RENDER_TEXT, LANGUAGE])

  useEffect(() => {
    /** Nếu list trạng thái thay đổi */
    if (LIST_CTA_MESSAGE) {
      /** Set list trạng thái */

      if (IS_ACTIVE_CTA) {
        /** file lấy giá trị theo locale */
        const DATA_CTA = LIST_CTA_MESSAGE.data?.map((item) => {
          /** Trả về dữ liệu theo ngôn ngữ */
          return item?.source?.[LANGUAGE]
        })

        setListCTAMessage(DATA_CTA)
      }
    }
  }, [LIST_CTA_MESSAGE, LANGUAGE, IS_ACTIVE_CTA])
  /**
   * Trạng thái loading khi gửi tin nhắn
   */
  const [status_index, setStatusIndex] = useState(0)

  /** Cập nhật trạng thái loading khi gửi tin nhắn*/
  useEffect(() => {
    /** Nếu trạng thái typing thay đổi*/
    if (TYPING_STATUS) {
      /** Reset trạng thái khi bắt đầu typing */
      setStatusIndex(0)
      /** Set interval để thay đổi trạng thái */
      const INTERVAL = setInterval(() => {
        /** Tăng giá trị index trạng thái */
        setStatusIndex((prev) => (prev + 1) % status_list.length)
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

  /**
   * State lưu user_id trong localStorage
   */
  const [local_user_id, setLocalUserId] = useState<string | null | undefined>(
    undefined
  )

  /** Bước 1: Lấy user_id từ localStorage */
  useEffect(() => {
    /** Khi user_id khóng null*/
    if (PAGE_ID === undefined) return
    /** Lấy user_id trong localStorage */
    let stored_client_id = localStorage.getItem(`client_id_${PAGE_ID}`)

    /** Nếu k có lcient id thì lấy trong cookie */
    if (!stored_client_id) {
      stored_client_id = getCookie(`client_id_${PAGE_ID}`)
    }

    /** Lưu user_id */
    setLocalUserId(stored_client_id)
  }, [PAGE_ID, user_id])

  /** Bước 2: Chỉ chạy logic anonymous khi đã biết chắc chắn user_id là null */
  useEffect(() => {
    /** Đnag load thông tin */
    if (
      local_user_id === undefined ||
      AI_STATUS ||
      !PAGE_ID ||
      FIXED_CLIENT_INFO
    )
      /** Đang load từ localStorage, chưa xong */
      return

    /** Khi user_id khóng null*/
    if (!isEmpty(FORM_BEFORE_CHAT)) {
      /** Khi chưa tạo tài khoản ẩn danh*/
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
  const fetchMessage = async (client_id?: string) => {
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
        client_id: client_id,
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

        /** Lưu kết quả trả về */
        const RESULT = await result
        /** Nếu data trả về = LIMIT thì còn tin nhắn cũ */
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
        /** Nếu không trùng id client thì ghép, không thì gán lại = list data fetch */
        if (FILTER_RES?.[0]?.fb_client_id === LIST_MESSAGE?.[0]?.fb_client_id) {
          /** Lưu LIST_MESSAGE vào store */
          dispatch(setListMessage([...FILTER_RES.reverse(), ...LIST_MESSAGE]))
        } else {
          dispatch(setListMessage([...FILTER_RES.reverse()]))
        }

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
        /** Tắt loading */
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
    /** Dùng request animation frame hoặc settimeout ( độ trễ 0ms) */
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
    /** Khai báo timeout */
    let timeout_id: NodeJS.Timeout
    /** Nếu là AI thì bỏ qua */
    if (AI_STATUS) return
    /** Nếu Mới khởi tạo client, call api fetch tin nhắn nhưng cần settimeout */
    if (is_init) {
      /** Đặt timeout để call API sau 0.1 giây */
      timeout_id = setTimeout(() => {
        /**  Gọi API sau khi đợi 1 giây */
        fetchMessage(client_id as string)
        /** Khi khởi tạo và call API sau 0.1 giây . set lại trạng thái Không là tin nhắn khởi tạo nữa */
        setIsInit()
        console.log('API called after 1 second because is_init is true')
      }, 100)
    }

    /** Khi user_id thay đổi, Trạng thái đã Khởi tạo thì gọi fetchMessage ngay lập tức */
    if (client_id && !is_init) {
      fetchMessage(client_id)
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
  }, [client_id, is_init])

  useEffect(() => {
    /** Check value */
    if (ON_CLICK_CTA && PAGE_ID && user_id) {
      /** Gửi tin nhắn */
      sendMessage(ON_CLICK_CTA)
      /** Reset trong store */
      dispatch(setOnClickCTA(''))
      /** Scroll xuống bottom */
      scrollToBottom()
    }
  }, [ON_CLICK_CTA, scrollToBottom, PAGE_ID, user_id])

  /** Hàm Xử lý gửi tin nhắn
   * @param {string} input - Nội dung tin nhắn text
   */

  const sendMessage = async (input: any) => {
    if (input.trim() === '') return

    /** Lấy ID người dùng */
    const META_DATA_ID = CURRENT_USER_ID || user_id

    /** Tạo ID tạm thời */
    const TEMP_ID = `temp_${Date.now()}`

    /** Tạo tin nhắn tạm thời (Optimistic UI) */
    const TEMP_MESSAGE: any = {
      _id: TEMP_ID,
      fb_page_id: PAGE_ID,
      fb_client_id: user_id || CURRENT_USER_ID || '',
      platform_type: 'WEBSITE',
      message_type: 'client',
      message_text: input,
      sender_id: CURRENT_USER_ID || user_id,
      recipient_id: PAGE_ID,
      time: new Date().toISOString(),
      message_mid: TEMP_ID,
      message_attachments: [],
      message_metadata: META_DATA_ID
        ? AI_STATUS
          ? `__ai_agent__${META_DATA_ID}`
          : `__user_normal__${META_DATA_ID}`
        : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      status: 'sending',
    }

    /** Hiển thị ngay tin nhắn tạm thời */
    dispatch(setListMessage([...LIST_MESSAGE, TEMP_MESSAGE]))
    scrollToBottom()

    try {
      /** Khởi tạo body tin nhắn */
      const MESSAGE: Message = {
        page_id: PAGE_ID,
        client_id: user_id || CURRENT_USER_ID || '',
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
      /** Cập nhật trạng thái lỗi cho tin nhắn tạm nếu cần (tùy chọn) */
    } finally {
      setLoading(false)
    }
  }

  /** Hàm gửi tin nhắn ảnh */
  const sendImageMessage = async (file: File) => {
    if (!file) return

    /** Lấy ID người dùng */
    const META_DATA_ID = CURRENT_USER_ID || user_id

    /** Tạo ID tạm thời */
    const TEMP_ID = `temp_${Date.now()}`

    /** Tạo URL preview */
    const PREVIEW_URL = URL.createObjectURL(file)

    /** Tạo tin nhắn tạm thời (Optimistic UI) */
    const TEMP_MESSAGE: any = {
      _id: TEMP_ID,
      fb_page_id: PAGE_ID,
      fb_client_id: user_id || CURRENT_USER_ID || '',
      platform_type: 'WEBSITE',
      message_type: 'client',
      message_text: '',
      sender_id: CURRENT_USER_ID || user_id,
      recipient_id: PAGE_ID,
      time: new Date().toISOString(),
      message_mid: TEMP_ID,
      message_attachments: [
        {
          type: 'image',
          payload: { url: PREVIEW_URL },
        },
      ],
      message_metadata: META_DATA_ID
        ? AI_STATUS
          ? `__ai_agent__${META_DATA_ID}`
          : `__user_normal__${META_DATA_ID}`
        : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      status: 'sending',
    }

    /** Hiển thị ngay tin nhắn tạm thời */
    dispatch(setListMessage([...LIST_MESSAGE, TEMP_MESSAGE]))
    scrollToBottom()

    try {
      const FORM_DATA = new FormData()
      if (META_DATA_ID) {
        FORM_DATA.append('metadata', `__user_normal__${META_DATA_ID}`)
      }
      FORM_DATA.append('file', file)
      FORM_DATA.append('page_id', PAGE_ID || '')
      FORM_DATA.append('client_id', client_id || '')

      await fetch(SEND_MESSAGE_API, {
        method: 'POST',
        body: FORM_DATA,
      })

      scrollToBottom()
    } catch (error) {
      console.error('Upload failed', error)
    }
  }

  useEffect(() => {
    /**
     * Trường hợp đang mở tab chat
     * - Người dùng gửi tin nhắn đi
     * - Page nhắn tin trả lời
     * Thì sẽ thêm vào store
     */

    /**
     * Trường hợp đang mở tab chat
     * - Người dùng gửi tin nhắn đi
     * - Page nhắn tin trả lời
     * Thì sẽ thêm vào store
     */

    if (keys(LATEST_MESSAGE).length !== 0 && !is_init) {
      /** Copy danh sách hiện tại */
      let NEW_LIST = [...LIST_MESSAGE]

      /** Kiểm tra xem có tin nhắn tạm (đang gửi) nào trùng khớp không */
      const tempIndex = NEW_LIST.findIndex(
        (msg: any) =>
          msg.status === 'sending' &&
          msg.sender_id === LATEST_MESSAGE.sender_id &&
          // Match text
          ((msg.message_text &&
            msg.message_text === LATEST_MESSAGE.message_text) ||
            // OR Match image (if both have attachments)
            (msg.message_attachments?.length > 0 &&
              LATEST_MESSAGE.message_attachments?.length > 0 &&
              !msg.message_text))
      )

      if (tempIndex !== -1) {
        /** Nếu tìm thấy, thay thế tin nhắn tạm bằng tin nhắn thật từ socket */
        NEW_LIST[tempIndex] = LATEST_MESSAGE
      } else {
        /** Nếu không, kiểm tra trùng lặp ID trước khi thêm */
        const exists = NEW_LIST.some(
          (msg: any) => msg._id === LATEST_MESSAGE._id
        )
        if (!exists) {
          NEW_LIST.push(LATEST_MESSAGE)
        }
      }

      /** Lưu tin nhắn mới từ socket vào store */
      dispatch(setListMessage(NEW_LIST))
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

    if (GLOBAL_UNREAD_COUNT && GLOBAL_UNREAD_COUNT > 0 && SHOW_POPUP) {
      console.log('chatbox opened and has unread message')
      /** Khi mở vào tin nhắn, Reset lại số lượng tin nhắn chưa đọc */
      dispatch(setGlobalUnreadCount(0))
      /** Thêm timeout */
      setTimeout(() => {
        /** Sau khi xử lý xong thì scroll xuống bottom */
        // scrollToBottom()
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

  /** Hàm gửi tin nhắn
   * @param item: Tin nhan
   */
  const handleSendMessage = (item: any, payload: any) => {
    /** Gửi tin nhắn */
    sendMessage(item)

    /** Handle Postback */
    handlePostback(
      payload?.message_mid,
      payload?.button_index,
      payload?.flow_id
    )
    /** Reset state */
    setSocketQuickChat([])
    console.log(`data_quick_chat__${PAGE_ID}__${user_id}`)
    /** reset storage */
    localStorage.setItem(
      `data_quick_chat__${PAGE_ID}__${user_id}`,
      JSON.stringify([])
    )
    /** reset store */
    dispatch(setDataQuickChat([]))
  }

  /** Hàm postback */
  const handlePostback = async (
    message_id: string | undefined,
    button_idx: number,
    flow_id?: string
  ) => {
    /**Payload */
    const PAYLOAD = {
      message_id: message_id,
      client_id: USER_ID,
      page_id: PAGE_ID,
      button_index: button_idx,
      flow_id: flow_id,
    }

    /** call api */
    try {
      await fetch(DOMAIN_TRIGGER_BTN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(PAYLOAD),
      })
    } catch (error) {}
  }

  return {
    AI_STATUS,
    client_id,
    loading_more,
    MESSAGE_CONTAINER_REF,
    PAGE_ID,
    IS_ACTIVE_AGENT_AI,
    is_loaded,
    NO_AI_ID,
    LIST_MESSAGE,
    LATEST_MESSAGE,
    checkStaffExist,
    checkStaffExistAgent,
    LOADING_GLOBAL,
    check_no_message_ai,
    CLIENT_INFO,
    TYPING_STATUS,
    STATUSES,
    MESSAGE_END_REF,
    loading,
    show_jump_button,
    scrollToBottom,
    error_upload,
    setErrorUpload,
    status_index,
    sendMessage,
    setLoading,
    loading_first_time,
    LIST_CTA,
    status_list,
    list_cta_message,
    LIST_CTA_MESSAGE,
    socket_quick_chat,
    setSocketQuickChat,
    handleSendMessage,
    handlePostback,
    sendImageMessage,
  }
}

export default useDetailChat
