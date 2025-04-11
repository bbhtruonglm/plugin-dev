import { ChatAppProps, EmployeeList } from './type'
import {
  closeSocketConnect,
  onSocketFromChatboxServer,
} from '@/components/WebSocket/WebSocket'
import { fetchAPI, useAPI } from '@/api/api'
import { get, isEmpty, map, values } from 'lodash'
import {
  hasAttachmentOfType,
  postMessageToParent,
  renderAvatarFromId,
  renderLocale,
  renderStaffName,
  saveQuickChatCount,
  saveQuickChatLatestMessage,
  saveTimeClosePopup,
  truncateSentences,
  truncateString,
} from '@/utils'
import {
  selectCurrentHeight,
  selectCurrentWidth,
  selectEmbedPosition,
  selectEmbedPositionDetail,
  selectGlobalClientId,
  selectGlobalPreviewUrl,
  selectGlobalUnreadCount,
  selectIsAvatar,
  selectLatestMessage,
  selectListUnreadMessage,
  selectPageAvatar,
  selectPageId,
  selectRefreshData,
  selectStatusAI,
  selectStatusIsInit,
  selectStatusPopup,
  setGlobalPreviewUrl,
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setLoadingGlobal,
  setStaffListStore,
  setStatusIsInit,
} from '@/stores/appSlice'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as ActiveHome } from '@/assets/home-active.svg'
import { ReactComponent as ActiveMessage } from '@/assets/messageA.svg'
import ChatScreen from '@/screens/ChatScreen/Chat'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as CloseSlate } from '@/assets/close-black.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import { Employee } from '@/components/ChatComponents/type'
import Home from '@/screens/ChatScreen/Home'
import { ReactComponent as InactiveHome } from '@/assets/home.svg'
import { ReactComponent as InactiveMessage } from '@/assets/message.svg'
import { MessageInfo } from '@/utils/type'
import Modal from '@/components/ChatComponents/Modal/Modal'
import { NetworkContext } from '@/components/NWProvider'
import OnlineStaff from '@/components/Container/OnlineStaff'
import TemplateMessageComponent from '@/components/ChatComponents/MessageComponent/TemplateMessageComponent'
import TimeAgo from '@/components/TimeAgo'
import { useTranslation } from 'react-i18next'

const ChatApp = ({
  handleBtn,
  show,
  setHideForMobile,
  client_name,
  consultation,
}: ChatAppProps) => {
  /** Dịch ngôn ngữ */
  const { t, i18n: I18N } = useTranslation()
  /** Các đầu api */
  const { READ_PAGE_INFO, SOCKET_API } = useAPI()
  /** Trạng thái online */
  const IS_ONLINE = useContext(NetworkContext)
  /** Tin nhắn mới nhất */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)
  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)
  /** List tin nhắn được lấy từ store */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)
  /**Status AI */
  const AI_STATUS = useSelector(selectStatusAI)
  /** Khởi tạo websocket */
  const WS = useRef<WebSocket | null>(null)
  /** State Khai báo thông tin */
  const [error_message, setErrorMessage] = useState<string | null>('')
  /** State Khai báo thông tin trang */
  const [page_name, setPageName] = useState<string>('')
  /** State Khai báo thông tin mạng xã hội */
  const [social_link, setSocialLink] = useState<Array<any> | null>([])
  /** State Khai báo thông tin mô tả mạng xã hội */
  const [social_description, setSocialDescription] = useState<string | null>('')
  /** State Khai báo thông tin nhân viên */
  const [staff_list, setStaffList] = useState<EmployeeList>({})
  /** State Khai báo thông tin tin nhắn chào mừng */
  const [is_force_close_socket, setIsForceCloseSocket] = useState(false)
  /** trigger hiện tin nhắn chào mừng */
  const [show_welcome_message, setShowWelcomeMessage] = useState(false)
  /** Tạo tab hiện tại là HOME */
  const [current_tab, setCurrentTab] = useState<string>('home')
  /** Tạo ref để giữ giá trị của current_tab */
  const TAB_REF = useRef(current_tab)
  /** Tạo ref để giữ giá trị của is_show */
  const IS_SHOW_REF = useRef(show)

  /**
   * THông tin Refresh Data
   */
  const REFRESH_DATA = useSelector(selectRefreshData)

  useEffect(() => {
    if (REFRESH_DATA) {
      /**
       * Tắt web socket
       */
      closeSocketConnect(WS, setIsForceCloseSocket)
    }
  }, [REFRESH_DATA])

  useEffect(() => {
    /** Cập nhật giá trị mới nhất của tab trong ref mỗi khi tab thay đổi */
    TAB_REF.current = current_tab
    /** Cập nhật giá trị là show trong ref một khi show thay đổi */
    IS_SHOW_REF.current = show
  }, [current_tab, show])

  /** Kiểm tra nếu is_ai = true thì  chuyển luôn vào tab message */
  useEffect(() => {
    /** Nếu trạng thái mở AI hoặc trạng thái consultation thì vào luôn tab message */
    if (AI_STATUS || consultation) {
      /** Set tab hiện tại là message */
      setCurrentTab('message')
      /** Set show welcome message là false */
      setShowWelcomeMessage(false)
    }
  }, [AI_STATUS, consultation])

  /** hàm dispatch đến store */
  const dispatch = useDispatch()

  useEffect(() => {
    /**
     * Cập nhật giá trị trong ref một khi LIST_UNREAD_MESSAGE thay đổi
     */
    if (LATEST_MESSAGE) {
      /**
       * Lưu tin nhắn mới nhất vào state
       */
      setShowWelcomeMessage(false)
    }
  }, [LATEST_MESSAGE])

  /** Số lượng tin nhắn chưa đọc
   * Lấy từ store
   */
  const GLOBAL_UNREAD_MESSAGE_COUNT = useSelector(selectGlobalUnreadCount)
  /** Tạo ref một để luu giữ giá trị GLOBAL_UNREAD_MESSAGE_COUNT */
  const REF_GLOBAL_UNREAD_MESSAGE_COUNT = useRef(GLOBAL_UNREAD_MESSAGE_COUNT)
  /** Tạo ref một để luu giữ giá trị LIST_UNREAD_MESSAGE */
  const REF_LIST_UNREAD_MESSAGE = useRef(LIST_UNREAD_MESSAGE)
  /** Giá trị của preview URL */
  const GLOBAL_PREVIEW_URL = useSelector(selectGlobalPreviewUrl)

  useEffect(() => {
    /** Cập nhật giá trị trong ref một khi LIST_UNREAD_MESSAGE thay đổi */
    REF_LIST_UNREAD_MESSAGE.current = LIST_UNREAD_MESSAGE
    /** Cập nhật giá trị trong ref một khi GLOBAL_UNREAD_MESSAGE_COUNT thay đổi */
    REF_GLOBAL_UNREAD_MESSAGE_COUNT.current = GLOBAL_UNREAD_MESSAGE_COUNT
  }, [LIST_UNREAD_MESSAGE, GLOBAL_UNREAD_MESSAGE_COUNT])

  /** Trạng thái đóng mở popup */
  const SHOW_POPUP = useSelector(selectStatusPopup)

  /** Độ rộng hiện tại của màn hình */
  const CURRENT_WIDTH = useSelector(selectCurrentWidth)

  /** Chiều cao hiện tại của màn hình */
  const CURRENT_HEIGHT = useSelector(selectCurrentHeight)

  /** Trạng thái đóng mở QUICK_CHAT
   * Mặc định mở app là true, lưu vào localStorage = show_quick_chat
   */
  const SHOW_QUICK_CHAT = localStorage.getItem(`status_quick_chat__${PAGE_ID}`)

  /** Thời gian đóng QUICK_CHAT gần nhất */
  const LAST_TIME_CLOSE_QUICK_CHAT = localStorage.getItem(
    `last_time_close__${PAGE_ID}`
  )
  /** Tạo REF cho giá trị SHOW_QUICK_CHAT */
  const REF_SHOW_QUICK_CHAT = useRef(SHOW_QUICK_CHAT)

  /** Tạo REF cho giá trị LAST_TIME_CLOSE_QUICK_CHAT */
  const REF_LAST_TIME_CLOSE_QUICK_CHAT = useRef(LAST_TIME_CLOSE_QUICK_CHAT)

  useEffect(() => {
    /** Cập nhật giá trị trong ref một khi SHOW_QUICK_CHAT thay đổi */
    REF_SHOW_QUICK_CHAT.current = SHOW_QUICK_CHAT
    /** Cập nhật giá trị trong ref một khi LAST_TIME_CLOSE_QUICK_CHAT thay đổi */
    REF_LAST_TIME_CLOSE_QUICK_CHAT.current = LAST_TIME_CLOSE_QUICK_CHAT
  }, [SHOW_QUICK_CHAT, LAST_TIME_CLOSE_QUICK_CHAT])
  /** Trạng thái khởi tạo client */
  const IS_INIT_CLIENT = useSelector(selectStatusIsInit)
  /** GLobal client_id */
  const GLOBAL_CLIENT_ID = useSelector(selectGlobalClientId)
  /**
   * Lấy client_id từ localStorage
   */
  const CLIENT_STORED = localStorage.getItem(`client_id_${PAGE_ID}`)

  /** Tin nhắn chào mừng  */
  const [welcome_message, setWelcomeMessage] = useState<any>({
    message: undefined,
    delay: undefined,
    is_active: undefined,
  })

  /** Cài đặt thông tin biểu mẫu */
  const [web_form, setWebForm] = useState<any>({
    is_active: false,
    source: {},
  })

  useEffect(() => {
    /** Chỉ khi tắt popup và không có tin nhắn mới nhất  và trạng thái show_quick_chat */

    /**
     * Điều kiện để hiển thị tin nhắn chào mừng:
     * 1. Page có set up hiển thị tin nhắn chào mừng không ????
     * 2. Nếu có hiển thị => tin nhắn có setup không, nếu có thì hiển thị nếu không hiển thị mặc định
     * 3. Thời gian delay từ page setup, nếu không có thì hiển thị mặc định là 5s
     */
    const TIMER = setTimeout(() => {
      /**
       * Nếu không có tin nhắn chào mừng, thoát ngay
       */
      if (welcome_message?.is_active === false) {
        /**
         * Nếu không có tin nhắn chào mừng, thoát ngay
         */
        setShowWelcomeMessage(false)
        return
      }
      console.log(isEmpty(LATEST_MESSAGE), 'isEmpty(LATEST_MESSAGE)')
      console.log(SHOW_QUICK_CHAT, 'SHOW_QUICK_CHAT')
      /**
       * Nếu không có tin nhắn mới nhất và trạng thái show_quick_chat
       */
      if (
        !show &&
        isEmpty(LATEST_MESSAGE) &&
        SHOW_QUICK_CHAT === 'show_quick_chat'
      ) {
        /**
         * Hiển thị tin nhắn chào mừng
         */
        setShowWelcomeMessage(true)
      }
    }, welcome_message?.delay || 5000)

    /** Clear timer khi component unmount */
    return () => clearTimeout(TIMER)
  }, [show, LATEST_MESSAGE, SHOW_QUICK_CHAT, welcome_message])

  useEffect(() => {
    if (!PAGE_ID) return

    /** Hủy WebSocket cũ trước khi tạo mới */
    if (AI_STATUS) {
      console.log('Đóng WebSocket cũ trước khi tạo mới')
      /**
       * Đóng WebSocket cũ trước khi tạo mới
       */
      closeSocketConnect(WS, setIsForceCloseSocket)
      /**
       * Nếu nhận được client_id từ AI thì lưu vào localStorage
       */
      if (GLOBAL_CLIENT_ID) {
        /** Tạo WebSocket mới */
        onSocketFromChatboxServer({
          page_id: PAGE_ID,
          client_id: GLOBAL_CLIENT_ID,
          WS,
          dispatch,
          REF_LIST_UNREAD_MESSAGE,
          REF_GLOBAL_UNREAD_MESSAGE_COUNT,
          REF_LAST_TIME_CLOSE_QUICK_CHAT,
          REF_SHOW_QUICK_CHAT,
          IS_SHOW_REF,
          TAB_REF,
          SOCKET_API,
          is_force_close_socket,
        })
      }
      /** Sau khi khởi tạo WebSocket, đặt lại cờ */
      dispatch(setStatusIsInit(false))
    }
    /**
     * Trạng thái không phải AI thì lấy client từ localStorage
     */
    if (!AI_STATUS) {
      /** Luôn gọi API lấy dữ liệu trang */
      fetchPageData(PAGE_ID)
      if (CLIENT_STORED) {
        /** Tạo WebSocket mới */
        onSocketFromChatboxServer({
          page_id: PAGE_ID,
          client_id: CLIENT_STORED,
          WS,
          dispatch,
          REF_LIST_UNREAD_MESSAGE,
          REF_GLOBAL_UNREAD_MESSAGE_COUNT,
          REF_LAST_TIME_CLOSE_QUICK_CHAT,
          REF_SHOW_QUICK_CHAT,
          IS_SHOW_REF,
          TAB_REF,
          SOCKET_API,
          is_force_close_socket,
        })
      }
      /** Sau khi khởi tạo WebSocket, đặt lại cờ */
      dispatch(setStatusIsInit(false))
    }
  }, [PAGE_ID, GLOBAL_CLIENT_ID, CLIENT_STORED])

  /**
   * Tab menu với các mục chính gồm:
   * - Home
   * - Message
   * - Support (đã bị ẩn)
   * - News (đã bị ẩn)
   *
   * @type {Array<Object>}
   * @property {string} name - Tên của tab (hiển thị cho người dùng)
   * @property {string} src - Đường dẫn đến icon không hoạt động (inactive)
   * @property {string} value - Giá trị định danh của tab
   * @property {string} srcA - Đường dẫn đến icon hoạt động (active)
   *
   * @example
   * const MENU_LIST = [
   *   { name: 'Trang chủ', src: inactiveHome, value: 'home', srcA: A },
   *   { name: 'Tin nhắn', src: inactiveMessage, value: 'message', srcA: activeMessage },
   *   // Các tab Support và News đang bị ẩn trong đoạn mã
   * ];
   */
  const MENU_LIST = [
    {
      name: t('home'),
      src: InactiveHome,
      value: 'home',
      srcA: ActiveHome,
    },
    {
      name: t('message'),
      src: InactiveMessage,
      value: 'message',
      srcA: ActiveMessage,
    },
    // {
    //   name: 'Hỗ trợ',
    //   src: inactiveSupport,
    //   srcA: activeSupport,
    //   value: 'support',
    // },
    // {
    //   name: 'Tin tức',
    //   src: inactiveNews,
    //   srcA: activeNew,
    //   value: 'news',
    // },
  ]
  /**
   * Vị trí của chatbox
   */
  const POSITION = useSelector(selectEmbedPosition)
  /**
   * Vị trí chi tiết của chatbox
   */
  const POSITION_DETAIL = useSelector(selectEmbedPositionDetail)
  /** Hàm đọc dữ liệu trang
   * @param {string} page_id - ID trang
   */
  const fetchPageData = async (page_id: string) => {
    /** Tạo đối tượng URL từ string */
    const URL_READ = new URL(READ_PAGE_INFO)
    /** body gồm page_id */
    const BODY = {
      page_id: page_id,
    }
    /** Đẩy params lên URL */
    URL_READ.search = new URLSearchParams(BODY as any).toString()

    /** Thông tin page từ api */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')
    /** lưu tên page vào state */
    setPageName(RES?.data?.name)

    /**
     *  Tạm ẩn để deploy lên production
     */
    // /**
    //  * Lưu thông tin vị trí chatbox
    //  */
    // dispatch(setEmbedPosition('bottom_right'))
    // /**
    //  * Lưu thông tin chi tiết vị trí của chatbox
    //  */
    // dispatch(setEmbedPositionDetail({ bottom: 4, right: 12, left: 12 }))

    // // dispatch(setEmbedPosition('bottom_right'))

    /**
     *  Tạm ẩn để deploy lên production
     */
    // /**
    //  * Lưu thông tin vị trí chatbox
    //  */
    // dispatch(setEmbedPosition('bottom_right'))
    // /**
    //  * Lưu thông tin chi tiết vị trí của chatbox
    //  */
    // dispatch(setEmbedPositionDetail({ bottom: 4, right: 12, left: 12 }))

    // // dispatch(setEmbedPosition('bottom_right'))

    // postMessagePosition('bottom_right')

    // /**
    //  * Gửi list path sang SDK
    //  */
    // postMessageToParentHiddenPath(['child-app'])
    // postMessageToParentAllowedDomains(RES?.data?.allow_domain)

    /** nếu cài đặt ở setting page is_active = false thì k lưu  */
    if (!RES?.data?.social_platform?.is_active) {
      /**
       * Nếu không có cài đặt mạng xã hội thì trả về null
       */
      setSocialLink(null)
    } else {
      /**
       * Lưu thông tin mạng xã hội
       */
      setSocialLink(RES?.data?.social_platform?.data)
      /**
       * Lưu thông tin mô tả mạng xã hội
       */
      setSocialDescription(RES?.data?.social_platform?.description)
      console.log(RES?.data?.social_platform?.description, 'zzz')
      // setSocialDescription(
      //   RES?.data?.social_platform?.description?.[
      //     I18N.language || RES?.data?.default_language || 'vi'
      //   ]
      // )
    }

    /** Lưu thông tin tin nhắn chào mừng */
    setWelcomeMessage({
      message:
        RES?.data?.welcome_message?.message || 'Chào mừng bạn đến với Retion',
      delay: RES?.data?.welcome_message?.delay * 1000 || 5000,
      is_active: RES?.data?.welcome_message?.is_active || false,
    })
    console.log(RES, 'ress')
    console.log(I18N.language)
    /** Lưu thông tin biểu mẫu */
    setWebForm({
      is_active: RES?.data?.web_form?.is_active || false,
      source: RES?.data?.web_form?.source || {},
      // source:
      //   RES?.data?.web_form?.source?.[
      //     renderLocale(I18N.language) || RES?.data?.default_language || 'vi'
      //   ] || {},
    })

    /** Lưu danh sách nhân viên */
    setStaffList(RES?.data?.staffs)
    dispatch(setStaffListStore(RES?.data?.staffs))
  }

  /** Ngăn kết nối mở lại */
  useEffect(() => {
    /** Nếu có kết nối socket thì đóng kết nối */
    return () => {
      /**
       * Nếu có kết nối socket thì đóng kết nối
       */
      closeSocketConnect(WS, setIsForceCloseSocket)
    }
  }, [])

  /** Chuyển từ Object thành mảng Array và lấy ra fb_staff_id và is_online
   * @param {Object} staff_list - Danh sách nhân viên
   * @returns {Array} Mảng nhân viên
   */
  const EMPLOYEE_LIST: Employee[] = map(values(staff_list), (employee) => ({
    fb_staff_id: employee.fb_staff_id,
    is_online: employee.is_online,
  }))

  /**
   * Hàm xử lý khi click vào tab
   */
  const [has_exited_preview, setHasExitedPreview] = useState(false)

  /** Theo dõi khi GLOBAL_PREVIEW_URL thay đổi và trạng thái preview đã được reset */
  useEffect(() => {
    if (GLOBAL_PREVIEW_URL === null) {
      /** Đã thoát khỏi trạng thái preview */
      setHasExitedPreview(true)
    } else {
      /** Đang trong trạng thái preview */
      setHasExitedPreview(false)
    }
  }, [GLOBAL_PREVIEW_URL])

  /** Hàm xử lý điều kiện để trả về css render giao diện SDK
   * @param {boolean} show Trạng thái đóng mở giao diện
   * @param {number} GLOBAL_UNREAD_MESSAGE_COUNT Tổng số tin nhắn chưa đọc
   * @param {MessageInfo} LATEST_MESSAGE Tin nhắn mới nhất
   * @param {number} CURRENT_WIDTH Kích thước chiều rộng page cha
   * @param {string} SHOW_QUICK_CHAT Trạng thái ẩn hiển QUICK_CHAT
   * @returns {string} CSS
   */
  const getContainerLayout = (
    show: boolean,
    GLOBAL_UNREAD_MESSAGE_COUNT: number,
    LATEST_MESSAGE: MessageInfo,
    CURRENT_WIDTH: number,
    SHOW_QUICK_CHAT: string | null
  ): string => {
    /**
     * Xác định trạng thái thiết bị là mobile
     */
    const IS_MOBILE = CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
    /**
     * Xác định trạng thái chiều cao nhỏ
     */
    const IS_SMALL_HEIGHT = CURRENT_HEIGHT && CURRENT_HEIGHT < 674
    /**
     * Xác định trạng thái AI
     */
    const IS_AI = AI_STATUS
    /**
     * Xác định trạng thái xem trước ảnh
     */
    const IS_PREVIEWING_IMAGE = !!GLOBAL_PREVIEW_URL
    /**
     * Xác định có tin nhắn chưa đọc hay không
     */
    const HAS_UNREAD_MESSAGE = GLOBAL_UNREAD_MESSAGE_COUNT > 0
    /**
     * Xác định trạng thái ẩn hiện QUICK_CHAT
     */
    const IS_QUICKCHAT_HIDDEN = SHOW_QUICK_CHAT === 'hide_quick_chat'
    /**
     * Xác định trạng thái ẩn hiện QUICK_CHAT
     */
    const IS_QUICKCHAT_VISIBLE = SHOW_QUICK_CHAT === 'show_quick_chat'

    /**
     *  Hàm gọi postMessage
     * @param popupOpen   Trạng thái popup mở
     * @param triggerWelcome  Trạng thái hiển thị tin nhắn chào mừng
     * @param height  Chiều cao popup
     * @param previewUrl  Đường dẫn xem trước ảnh
     * @param position  Vị trí popup
     * @returns
     */
    const callPostMessage = (
      popupOpen: boolean,
      triggerWelcome: boolean,
      height?: number,
      previewUrl?: string,
      position?: string,
      bottom?: string | number,
      right?: string | number,
      left?: string | number
    ) =>
      postMessageToParent(
        popupOpen,
        triggerWelcome,
        height,
        previewUrl,
        position,
        bottom,
        right,
        left
      )
    /**
     *  Hàm lấy chiều cao tin nhắn
     * @param message  Tin nhắn
     * @returns
     */
    const getMessageHeight = (
      message: MessageInfo | null
    ): number | undefined => {
      /**
       * Nếu không có tin nhắn thì trả về undefined
       */
      if (!message) return undefined
      /**
       * Nếu có tệp đính kèm kiểu ảnh hoặc video thì trả về 312
       */
      if (
        hasAttachmentOfType(message, 'image') ||
        hasAttachmentOfType(message, 'video')
      )
        return 312
      /**
       * Nếu có tệp đính kèm kiểu file thì trả về 240
       */
      if (hasAttachmentOfType(message, 'file')) return 240
      /**
       * Nếu có tệp đính kèm kiểu template button thì trả về 312
       */
      if (
        message.message_attachments &&
        hasAttachmentOfType(message, 'template') &&
        message.message_attachments[0]?.payload?.template_type === 'button'
      )
        return 312
      /**
       * Mặc định trả về 224
       */
      return 224
    }
    /**
     * Trường hợp Chiều cao màn hình nhỏ hơn và popup đang mở và chiều rộng lớn hơn 768
     */
    if (IS_SMALL_HEIGHT && show && CURRENT_WIDTH > 768) {
      /**
       * Gọi hàm postMessage
       */
      callPostMessage(
        true,
        false,
        undefined,
        undefined,
        POSITION ?? 'bottom_right',
        POSITION_DETAIL?.bottom,
        POSITION_DETAIL?.right,
        POSITION_DETAIL?.left
      )
      /**
       * Trả về css popup
       */
      return 'flex flex-col md:w-[416px] h-screen px-2 py-2 justify-between'
    }
    /**
     * Trường hợp chat AI
     */
    if (IS_AI) {
      /**
       * Gọi hàm postMessage
       */
      callPostMessage(
        true,
        false,
        undefined,
        undefined,
        POSITION,
        POSITION_DETAIL?.bottom,
        POSITION_DETAIL?.right,
        POSITION_DETAIL?.left
      )
      /**
       * Trả về css popup
       */
      return 'w-screen h-screen'
    }
    /**
     * Trường hợp xem trước ảnh
     */
    if (IS_PREVIEWING_IMAGE) {
      if (IS_MOBILE) {
        /**
         * Gọi hàm postMessage
         */
        callPostMessage(
          true,
          false,
          undefined,
          GLOBAL_PREVIEW_URL,
          POSITION,
          POSITION_DETAIL?.bottom,
          POSITION_DETAIL?.right,
          POSITION_DETAIL?.left
        )
        /**
         * Trả về css popup
         */
        return 'w-screen_dvw h-screen_dvh'
      } else {
        /**
         * Gọi hàm postMessage
         */
        callPostMessage(
          true,
          false,
          674,
          GLOBAL_PREVIEW_URL,
          POSITION,
          POSITION_DETAIL?.bottom,
          POSITION_DETAIL?.right,
          POSITION_DETAIL?.left
        )
        /**
         * Trả về css popup
         */
        // if (POSITION === 'bottom_left') {
        //   return renderPosition(
        //     POSITION,
        //     POSITION_DETAIL?.bottom ?? 0,
        //     POSITION_DETAIL?.right ?? 0,
        //     POSITION_DETAIL?.left ?? 0
        //   )
        // } else {
        //   const A = renderPosition(
        //     'bottom_right',
        //     POSITION_DETAIL?.bottom ?? 0,
        //     POSITION_DETAIL?.right ?? 0,
        //     POSITION_DETAIL?.left ?? 0
        //   )
        //   console.log(A, 'A')
        //   return A
        // }
        return 'flex w-screen h-screen items-end justify-end px-6 pr-5 pb-[68px]'
      }
    }
    /**
     * Trường hợp popup đóng, và không có tin nhắn chưa đọc
     */
    if (!show && show_welcome_message && !LATEST_MESSAGE) {
      /**
       * Gọi hàm postMessage
       */
      callPostMessage(
        false,
        true,
        142,
        undefined,
        POSITION,
        POSITION_DETAIL?.bottom,
        POSITION_DETAIL?.right,
        POSITION_DETAIL?.left
      )
      /**
       * Trả về css popup
       */
      return 'w-[302px] h-[142px] items-end justify-between pb-4 px-2'
    }
    /**
     * Trường hợp popup đóng, và không có tin nhắn chưa đọc
     */
    if (
      !show &&
      (IS_QUICKCHAT_HIDDEN ||
        !HAS_UNREAD_MESSAGE ||
        (!LATEST_MESSAGE && HAS_UNREAD_MESSAGE))
    ) {
      /**
       * Gọi hàm postMessage
       */
      callPostMessage(
        false,
        false,
        undefined,
        undefined,
        POSITION,
        POSITION_DETAIL?.bottom,
        POSITION_DETAIL?.right,
        POSITION_DETAIL?.left
      )
      /**
       * Trả về css popup
       */
      return 'w-16 h-[72px] items-center justify-center pb-4 pt-2'
    }
    /**
     * Trường hợp popup đóng, và có tin nhắn chưa đọc
     */
    if (IS_QUICKCHAT_VISIBLE && !show && HAS_UNREAD_MESSAGE) {
      /**
       * Lấy chiều cao tin nhắn
       */
      const HEIGHT = getMessageHeight(LATEST_MESSAGE)
      /**
       * Gọi hàm postMessage
       */
      if (HEIGHT) {
        /**
         * Gọi hàm postMessage
         */
        callPostMessage(
          false,
          true,
          HEIGHT,
          undefined,
          POSITION,
          POSITION_DETAIL?.bottom,
          POSITION_DETAIL?.right,
          POSITION_DETAIL?.left
        )
        /**
         * Trả về css popup
         * Vì chiều cao tin nhắn có thể thay đổi nên sử dụng biến HEIGHT
         * để xác định chiều cao popup
         * Nếu chiều cao tin nhắn là 224 thì chiều cao popup là 56
         */
        /** Xử lý trường hợp HEIGHT = 224 */
        if (HEIGHT === 224) {
          /**
           * Gọi hàm postMessage
           */
          callPostMessage(
            false,
            true,
            HEIGHT,
            undefined,
            POSITION,
            POSITION_DETAIL?.bottom,
            POSITION_DETAIL?.right,
            POSITION_DETAIL?.left
          )
          /**
           * Trả về css popup
           */
          return 'w-[302px] h-56 items-end justify-between pb-4 px-2'
        }
        /**
         * Xử lý trường hợp HEIGHT = 240 hoặc HEIGHT = 312
         */
        if (HEIGHT === 240) {
          /**
           * Gọi hàm postMessage
           */
          callPostMessage(
            false,
            true,
            HEIGHT,
            undefined,
            POSITION,
            POSITION_DETAIL?.bottom,
            POSITION_DETAIL?.right,
            POSITION_DETAIL?.left
          )
          /**
           * Trả về css popup
           */
          return 'w-[302px] h-60 items-end justify-between pb-4 px-2'
        }
        /**
         * Xử lý trường hợp HEIGHT = 312
         */
        if (HEIGHT === 312) {
          /**
           * Gọi hàm postMessage
           */
          callPostMessage(
            false,
            true,
            HEIGHT,
            undefined,
            POSITION,
            POSITION_DETAIL?.bottom,
            POSITION_DETAIL?.right,
            POSITION_DETAIL?.left
          )
          /**
           * Trả về css popup
           */
          return 'w-[302px] h-[312px] items-end justify-between pb-4 px-2'
        }
      }
    }
    /**
     * Trường hợp màn hình Mobile
     */
    if (IS_MOBILE) {
      /**
       * Gọi hàm postMessage
       */
      callPostMessage(
        true,
        false,
        undefined,
        undefined,
        POSITION,
        POSITION_DETAIL?.bottom,
        POSITION_DETAIL?.right,
        POSITION_DETAIL?.left
      )
      /**
       * Trả về css popup
       */
      return 'w-screen_dvw h-screen_dvh'
    }
    /**
     * Trường hợp mở popup Màn hình PC bình thường
     */
    callPostMessage(
      true,
      false,
      undefined,
      undefined,
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
    /**
     * Trả về css popup
     */
    return 'w-[416px] h-[674px] px-2 pb-4 justify-between items-end'
  }

  /** Hàm xử lý điều kiện để trả về css render giao diện content khi mở popup
   * @param {boolean} show Trạng thái đóng mở giao diện
   * @param {number} GLOABAL_UNREAD_MESSAGE_COUNT So luong tin chưa đọc
   * @param {number} CURRENT_WIDTH Kích thước chiều rộng page cha
   * @returns {string} CSS
   */
  const getMainPopupLayout = (
    show: boolean,
    GLOBAL_UNREAD_MESSAGE_COUNT: number,
    CURRENT_WIDTH: number
  ): string => {
    /**
     * Xác định trạng thái thiết bị là mobile
     */
    const IS_MOBILE = CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
    /**
     * Xác định trạng thái chiều cao nhỏ
     */
    const IS_SMALL_HEIGHT = CURRENT_HEIGHT < 674 && CURRENT_WIDTH > 768
    /**
     * Xác định trạng thái AI
     */
    const HAS_NO_UNREAD_MESSAGE = GLOBAL_UNREAD_MESSAGE_COUNT === 0

    /** CSS Base */
    const BASE_CLASSES =
      'flex justify-between relative bg-bg-gradient overflow-hidden shadow-md'
    /** CSS Size */
    const SIZE_CLASSES = IS_MOBILE
      ? 'w-screen h-screen rounded-none'
      : 'w-[400px] h-[600px] rounded-[20px]'
    /** CSS Visibility */
    const VISIBILITY_CLASSES =
      !show && HAS_NO_UNREAD_MESSAGE
        ? 'hidden'
        : `flex flex-col ${
            IS_MOBILE
              ? ' '
              : has_exited_preview
              ? ' '
              : POSITION === 'bottom_left'
              ? 'animate-zoomInBottomLeft'
              : 'animate-zoomInBottomRight'
          } transition-transform duration-200 ease-in-out`

    /** Điều kiện màn hình nhỏ và đang mở */
    if (IS_SMALL_HEIGHT && show) {
      return `${BASE_CLASSES} w-[400px] justify-between h-full mb-[72px] overflow-hidden rounded-[20px]`
    }

    /** Trường hợp AI */
    if (AI_STATUS) {
      return `${BASE_CLASSES} flex flex-col w-screen h-screen just-between`
    }

    /** Trường hợp đang xem trước */
    if (!IS_MOBILE && GLOBAL_PREVIEW_URL) {
      return `${BASE_CLASSES} w-[400px] h-[600px] mb-2.5 rounded-[20px] relative overflow-hidden`
    }

    /** Tổng hợp */
    return `${BASE_CLASSES} ${SIZE_CLASSES} ${VISIBILITY_CLASSES}`
  }

  /**
   * Utility function to determine the CSS classes for the popup
   * @param {boolean} show Trạng thái đóng mở giao diện
   * @param {MessageInfo} LATEST_MESSAGE Tin nhắn mới nhất
   * @param {number} GLOBAL_UNREAD_MESSAGE_COUNT Số lượng tin chưa đọc
   * @param {string | null} SHOW_QUICK_CHAT Trạng thái ẩn hiện QUICK_CHAT
   * @returns {string} CSS
   */
  const getQuickchatLayout = (
    show: boolean,
    LATEST_MESSAGE: MessageInfo,
    GLOBAL_UNREAD_MESSAGE_COUNT: number,
    SHOW_QUICK_CHAT: string | null
  ): string => {
    /** Điều kiện cơ bản:
     *  Popup đóng,
     *  message được gửi từ page,
     *  unread messages > 0 */
    const BASE_CONDITION =
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      LATEST_MESSAGE?.message_type === 'page' &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0

    /** Kiểm tra nếu có tệp đính kèm */
    const ATTACHMENT = get(LATEST_MESSAGE, 'message_attachments[0]', null)

    /** Object để ánh xạ kiểu file đính kèm với CSS tương ứng */
    const ATTACHMENT_TYPE_TO_CLASS_MAP: Record<string, string> = {
      image: 'flex flex-col w-[286px] h-[240px] justify-between',
      video: 'flex flex-col w-[286px] h-[240px] justify-between',
      file: 'flex flex-col w-[286px] h-[168px] justify-between',
      template_button: 'flex flex-col w-[286px] h-[240px] justify-between',
      template_generic: 'flex flex-col w-[286px] h-[438px] justify-between',
    }
    /**
     * Kiểm tra điều kiện cơ bản và không có tệp đính kèm
     */
    if (BASE_CONDITION && !ATTACHMENT) {
      /**
       * Trả về css chỉ hiện popup
       */
      const ATTACHMENT_CLASS =
        'flex flex-col w-[286px] h-[142px] justify-between'
      /**
       * Trả về css chỉ hiện popup
       */
      return ATTACHMENT_CLASS
    }
    /**
     * Kiểm tra điều kiện cơ bản và có tệp đính kèm
     */
    if (BASE_CONDITION && ATTACHMENT) {
      /** Kiểm tra nếu là template và xác định kiểu template */
      if (ATTACHMENT.type === 'template') {
        /**
         * Kiểm tra template_type và ánh xạ với class tương ứng
         */
        const TEMPLATE_TYPE = get(ATTACHMENT, 'payload.template_type', null)
        /**
         * Kiểm tra template_type button hoặc generic
         */
        if (TEMPLATE_TYPE === 'button')
          /**
           * Kiểm tra template_type button
           */
          return ATTACHMENT_TYPE_TO_CLASS_MAP.template_button
        /**
         * Kiểm tra template_type generic
         * */
        if (TEMPLATE_TYPE === 'generic')
          /**
           * Kiểm tra template_type generic
           */
          return ATTACHMENT_TYPE_TO_CLASS_MAP.template_generic
      }

      /** Kiểm tra attachment.type không phải là undefined */
      if (ATTACHMENT.type) {
        /**
         * Kiểm tra attachment.type không phải là undefined
         */
        const ATTACHMENT_CLASS = ATTACHMENT_TYPE_TO_CLASS_MAP[ATTACHMENT.type]
        /**
         * Trả về css chỉ hiện popup
         */
        return ATTACHMENT_CLASS
      }
    }

    /** Popup đóng thì ẩn giao diện */
    return 'hidden'
  }
  /**
   * Hàm xử lý khi click vào tab
   */
  const handleCloseModal = () => {
    /**
     * Gọi hàm đóng popup
     */
    dispatch(setGlobalPreviewUrl(null))
    /**
     * Gọi hàm đến Parent
     */
    postMessageToParent(
      SHOW_POPUP,
      false,
      674,
      '',
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }
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
      const STAFF_AVATAR = renderAvatarFromId(id, IS_PAGE_AVATAR, PAGE_AVATAR)
      return STAFF_AVATAR
    },
    [IS_PAGE_AVATAR, PAGE_AVATAR]
  )

  return (
    /** Hiển thị thông tin Layout cả SDK */
    <div
      className={`flex flex-col relative ${getContainerLayout(
        show,
        GLOBAL_UNREAD_MESSAGE_COUNT,
        LATEST_MESSAGE,
        CURRENT_WIDTH,
        SHOW_QUICK_CHAT
      )}`}
    >
      {/* Popup tin nhắn hiển thị nội dung chính */}
      {show && (
        <div
          className={`flex flex-col ${getMainPopupLayout(
            show,
            GLOBAL_UNREAD_MESSAGE_COUNT,
            CURRENT_WIDTH
          )}`}
        >
          {/* header */}
          {current_tab !== 'message' && (
            <div
              className={`flex justify-between items-center px-5 py-3 bg-slate-800 text-white ${
                AI_STATUS ? 'hidden' : 'flex'
              }`}
            >
              <div>
                {/* <RetionLogo /> */}
                <img
                  src="./images/Logo_retion_white.png"
                  alt="Logo Retion"
                  width={30}
                  height={30}
                />
              </div>

              <div className="flex items-center gap-x-5">
                <div className="flex items-center h-8">
                  <OnlineStaff data={EMPLOYEE_LIST} />
                </div>
                <div
                  onClick={setHideForMobile}
                  className={`cursor-pointer w-10 h-10 flex justify-center items-center  ${
                    CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
                      ? 'flex'
                      : 'hidden'
                  }`}
                >
                  <Close />
                </div>
              </div>
            </div>
          )}

          {/* body check theo bien current tab de render data */}
          <div
            className={`flex flex-col h-full resize-none outline-none scrollbar-thin scrollbar-webkit overflow-y-auto overflow-x-hidden md:max-h-[600px] relative`}
          >
            {!IS_ONLINE && (
              <div className="absolute top-28 left-[30%] text-xs bg-blue-300 p-2 rounded-lg text-white z-10">
                {t('no_internet_connection')}
              </div>
            )}
            {current_tab === 'home' && (
              <Home
                onNavigate={() => {
                  setCurrentTab('message')
                  /** 1. Reset Số tin nhắn chưa đọc localStorage */
                  saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
                  /** 2. Reset tin nhắn mới nhất trong localStorage */
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
                  /** 3. Set loading global */
                  dispatch(setLoadingGlobal(true))
                  /** 4. Reset danh sách tin nhắn chưa đọc trong Store */
                  dispatch(setListUnreadMessage([]))
                  /** 5. Reset unread count */
                  dispatch(setGlobalUnreadCount(0))
                }}
                onError={() => {
                  setErrorMessage(t('errorMessage'))
                  setCurrentTab('message')
                }}
                social_link={social_link}
                client_name={client_name}
                web_form={web_form}
                social_description={social_description}
              />
            )}
            {current_tab === 'message' && (
              <ChatScreen
                userOutChat={() => {
                  /** Khi back ra thì về trang Home */
                  setCurrentTab('home')
                  /** Reset store khi thoát khỏi màn chat */
                  /** 1. Tin nhắn mới nhất */
                  dispatch(setLatestMessageGlobal(null))
                  /** 2. Reset danh sách tin nhắn trong store */
                  dispatch(setListMessage([]))
                  /** 3. Reset Số tin nhắn chưa đọc localStorage */
                  saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
                  /** 4. Reset tin nhắn mới nhất trong localStorage */
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
                  /** 5. Reset danh sách tin nhắn chưa đọc trong Store */
                  dispatch(setListUnreadMessage([]))
                  /** 6. Reset unread count */
                  dispatch(setGlobalUnreadCount(0))
                }}
                error_message={error_message}
                onError={() => setErrorMessage('')}
                setHideForMobile={setHideForMobile}
                page_name={page_name}
                employee_list={EMPLOYEE_LIST}
              />
            )}
          </div>

          {/* Hiển thị Menu */}
          {/* Nếu tab hiện tại không phải chat thì hiển thị menu */}
          {current_tab !== 'message' && (
            <div className="md:w-[400px] flex flex-shrink-0 h-16 flex-col justify-evenly">
              <div className="p-2 h-16 w-full">
                <div className="flex">
                  {MENU_LIST.map(
                    (
                      { src: IconComponent, srcA: IconComponentA, value, name },
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                        onClick={() => {
                          if (value !== 'message') {
                            setCurrentTab(value)
                          } else {
                            setCurrentTab('message')
                            /** Khi ấn vào tab message,
                             * reset tin nhắn mới nhất
                             * reset mảng tin nhắn chưa đọc
                             * => Vì khi vào trong tab sẽ fetch api đọc tin nhắn,
                             * => không cần các state này nữa
                             *  */
                            dispatch(setListUnreadMessage([]))
                            dispatch(setLatestMessageGlobal(null))
                            dispatch(setGlobalUnreadCount(0))
                            dispatch(setLoadingGlobal(true))
                            /** 4. Reset Số tin nhắn chưa đọc localStorage */
                            saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

                            /** 5. Reset tin nhắn mới nhất trong localStorage */
                            saveQuickChatLatestMessage(
                              PAGE_ID,
                              CLIENT_STORED,
                              null
                            )

                            if (PAGE_ID === null) {
                              /** Không có page_id thì tạo message Lỗi */
                              setErrorMessage(t('errorMessage'))
                            }
                          }
                        }}
                      >
                        <div className="relative">
                          <div className="">
                            {value === 'message' &&
                              GLOBAL_UNREAD_MESSAGE_COUNT > 0 && (
                                <div className="flex justify-center items-center text-xxs text-white border absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full translate-x-1 -translate-y-1">
                                  {GLOBAL_UNREAD_MESSAGE_COUNT < 10
                                    ? GLOBAL_UNREAD_MESSAGE_COUNT
                                    : '9+'}
                                </div>
                              )}
                          </div>
                          {/* active menu tab */}
                          {current_tab === value ? (
                            <IconComponentA />
                          ) : (
                            <IconComponent />
                          )}
                        </div>
                        <p className={'text-sm font-medium'}>{name}</p>
                      </div>
                    )
                  )}
                </div>
                {/* Thông tin đơn vị phát triển */}
                <h4 className="text-xs text-center text-slate-700">
                  powered by{' '}
                  <a
                    href="https://retion.ai"
                    className="underline"
                    target="_blank"
                  >
                    Retion.ai
                  </a>
                </h4>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Quick chat */}
      <div
        className={getQuickchatLayout(
          show,
          LATEST_MESSAGE,
          GLOBAL_UNREAD_MESSAGE_COUNT,
          SHOW_QUICK_CHAT
        )}
      >
        <div className="flex h-full w-full">
          {LATEST_MESSAGE?.message_type === 'page' && (
            <div className="flex flex-col w-full gap-2">
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex gap-x-1 flex-grow min-h-0 justify-start items-end `}
              >
                <div className="flex flex-shrink-0 ">
                  {LATEST_MESSAGE?.message_type === 'page' && (
                    <img
                      src={
                        checkStaffExist(LATEST_MESSAGE?.message_metadata) ||
                        './images/earth.svg'
                      }
                      className="w-8 h-8  mask-rounded-oval bg-gray-200"
                      alt=""
                    />
                  )}
                </div>
                <div
                  className="flex flex-col flex-grow min-w-0 h-full bg-white rounded-xl p-3 hover:bg-slate-50 cursor-pointer shadow-md"
                  onClick={() => {
                    /** Khi click trả lời sẽ  reset hết data trong store */
                    dispatch(setLatestMessageGlobal(null))
                    dispatch(setListUnreadMessage([]))
                    dispatch(setListMessage([]))
                    dispatch(setGlobalUnreadCount(0))
                    /** Khi click vào trả lời, xoá unread_count */
                    saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
                    /* Chuyển tab thành message */
                    setCurrentTab('message')
                    /** trigger hàm đóng mở popup */
                    handleBtn()
                  }}
                >
                  <div className="flex justify-between items-center w-full gap-x-1 flex-shrink-0">
                    {/* Phần hiển thị thông tin tin nhắn */}
                    <div className="flex justify-between w-full overflow-hidden">
                      <div className="text-slate-500 text-xs font-medium flex items-center overflow-hidden flex-1">
                        {/* Hiển thị tên nhân viên */}
                        {IS_PAGE_AVATAR && (
                          <div className="flex-shrink-0">
                            <span>
                              {truncateSentences(
                                renderStaffName(
                                  staff_list,
                                  LATEST_MESSAGE?.message_metadata
                                ),
                                6
                              )}
                            </span>
                            <span className="mx-0.5">{t('from')}</span>
                          </div>
                        )}

                        {/* Hiển thị tên trang, có thể bị cắt ngắn nếu quá dài */}
                        <span className="mx-0.5 truncate whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                          {!IS_PAGE_AVATAR
                            ? page_name
                            : truncateString(page_name, 10)}
                        </span>
                      </div>

                      {/* Hiển thị thời gian tin nhắn */}
                      <span className="text-slate-500 text-xs font-medium truncate flex items-center flex-shrink-0">
                        <span className="mx-0.5">•</span>
                        <TimeAgo timestamp={LATEST_MESSAGE?.createdAt} />
                      </span>
                    </div>

                    {/* Nút đóng */}
                    <div
                      onClick={(event) => {
                        event.stopPropagation()
                        dispatch(setLatestMessageGlobal(null))
                        dispatch(setGlobalUnreadCount(0))
                        saveTimeClosePopup(PAGE_ID)
                        saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
                        localStorage.setItem(
                          `status_quick_chat__${PAGE_ID}`,
                          'hide_quick_chat'
                        )
                        postMessageToParent(
                          false,
                          false,
                          undefined,
                          undefined,
                          POSITION,
                          POSITION_DETAIL?.bottom,
                          POSITION_DETAIL?.right,
                          POSITION_DETAIL?.left
                        )
                      }}
                      className="h-5 w-5 cursor-pointer flex justify-center items-center"
                    >
                      <CloseSlate className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Phần nội dung tin nhắn được hiển thị */}
                  <div className="flex flex-grow min-h-0">
                    <TemplateMessageComponent data={LATEST_MESSAGE} />
                  </div>
                </div>
              </div>
              <div className="flex gap-x-2 h-11">
                <div className="w-8 h-8"></div>
                <div
                  onClick={() => {
                    /** Khi click trả lời sẽ  reset hết data trong store */
                    dispatch(setLatestMessageGlobal(null))
                    dispatch(setListUnreadMessage([]))
                    dispatch(setListMessage([]))
                    dispatch(setGlobalUnreadCount(0))
                    /** Khi click vào trả lời, xoá unread_count */
                    saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

                    /* Chuyển tab thành message */
                    setCurrentTab('message')
                    /** trigger hàm đóng mở popup */
                    handleBtn()
                  }}
                  className="h-11 bg-white text-slate-400 text-sm flex w-full rounded-xl shadow-md p-3  items-center truncate overflow-hidden whitespace-nowrap"
                >
                  {t('reply') +
                    ' ' +
                    (!IS_PAGE_AVATAR
                      ? page_name
                      : truncateSentences(
                          renderStaffName(
                            staff_list,
                            LATEST_MESSAGE?.message_metadata
                          ),
                          6
                        ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị tin nhắn chào mừng */}
      {show_welcome_message && (
        <div
          className="flex bg-white shadow-lg justify-between w-full gap-x-2 rounded-xl h-16 px-3 py-3 cursor-pointer hover:bg-gray-100"
          onClick={() => {
            /** Khi click trả lời sẽ  reset hết data trong store */
            dispatch(setLatestMessageGlobal(null))
            dispatch(setListUnreadMessage([]))
            dispatch(setListMessage([]))
            dispatch(setGlobalUnreadCount(0))
            /**
             * Khi click vào ẩn tin nhắn chào mừng,
             */
            setShowWelcomeMessage(false)
            /** Khi click vào trả lời, xoá unread_count */
            saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
            /* Chuyển tab thành message */
            setCurrentTab('message')
            /** trigger hàm đóng mở popup */
            handleBtn()
          }}
        >
          <h4 className="text-sm line-clamp-2">{welcome_message?.message}</h4>
          {/* Nút đóng */}
          <div
            onClick={(event) => {
              event.stopPropagation()
              postMessageToParent(
                false,
                false,
                undefined,
                undefined,
                POSITION,
                POSITION_DETAIL?.bottom,
                POSITION_DETAIL?.right,
                POSITION_DETAIL?.left
              )
              setShowWelcomeMessage(false)
            }}
            className="h-6 w-6 cursor-pointer flex justify-center items-center hover:bg-gray-300 rounded-full p-2"
          >
            <CloseSlate className="h-3 w-3" />
          </div>
        </div>
      )}
      {/*  Nút trigger hiện thị bong bóng chat */}
      <button
        onClick={() => {
          setTimeout(() => {
            /**
             * Khi click vào
             */
            if (!show && current_tab === 'message') {
              /** Reset hết data trong store */
              dispatch(setLatestMessageGlobal(null))
              dispatch(setListUnreadMessage([]))
              dispatch(setListMessage([]))
              dispatch(setGlobalUnreadCount(0))
              postMessageToParent(
                false,
                false,
                undefined,
                undefined,
                POSITION,
                POSITION_DETAIL?.bottom,
                POSITION_DETAIL?.right,
                POSITION_DETAIL?.left
              )
            }
            /**
             * Khi click vào nút trigger,
             * nếu đang ở tab message thì reset tin nhắn mới nhất và tin nhắn chưa đọc
             */
            handleBtn('no_toggle')
            /**
             * Reset tin nhắn mới nhất trong store
             */
            setErrorMessage('')
            /**
             * Reset tin nhắn mới nhất trong store
             */
            setShowWelcomeMessage(false)
            /** Delay 200ms */
          }, 200)
        }}
        className={`absolute justify-center items-center bottom-4 ${
          // POSITION === 'bottom_right'
          //   ? 'right-2'
          // :
          GLOBAL_PREVIEW_URL ? 'right-5 bottom-5' : 'right-2'
        }  h-12 w-12 bg-white shadow-lg rounded-full  hover:scale-110 ${
          AI_STATUS ? 'hidden' : ''
        }  ${
          !show
            ? ' flex z-30 '
            : CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
            ? ' hidden'
            : ' flex z-30'
        }`}
      >
        <div
          className={`absolute ${
            /** Khi không có tin nhắn, hoặc đang show, thì không hiện */
            GLOBAL_UNREAD_MESSAGE_COUNT === 0 || show
              ? 'hidden'
              : 'flex justify-center items-center'
          } text-white text-xs truncate right-0 top-0 bg-red-500 h-5 w-5 rounded-full border-2 border-white translate-x-1 -translate-y-1`}
        >
          {GLOBAL_UNREAD_MESSAGE_COUNT < 10
            ? GLOBAL_UNREAD_MESSAGE_COUNT
            : '9+'}
        </div>
        <div className="">
          {show ? (
            <Down />
          ) : (
            <img
              src="./images/Logo_retion_embed.png"
              alt="Logo Retion"
              width={30}
              height={30}
            />
          )}
        </div>
      </button>
      {/* Preview Ảnh */}
      <Modal
        is_open={!!GLOBAL_PREVIEW_URL}
        onClose={handleCloseModal}
      >
        {GLOBAL_PREVIEW_URL && (
          <img
            src={GLOBAL_PREVIEW_URL}
            className="max-w-[880px] min-w-80 w-full h-auto min-h-20 object-contain rounded-lg bg-slate-200"
            alt="Full Attachment"
          />
        )}
      </Modal>
    </div>
  )
}

export default ChatApp
