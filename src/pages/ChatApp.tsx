import { ChatAppProps, EmployeeList } from './type'
import {
  calculateTimeAgo,
  hasAttachmentOfType,
  postMessageToParent,
  renderAvatar,
  saveQuickChatCount,
  saveQuickChatLatestMessage,
  saveTimeClosePopup,
  truncateSentences,
  truncateString,
} from '@/utils'
import {
  closeSocketConnect,
  onSocketFromChatboxServer,
} from '@/components/WebSocket/WebSocket'
import { fetchAPI, useAPI } from '@/api/api'
import { get, isEmpty, map, values } from 'lodash'
import {
  selectCurrentHeight,
  selectCurrentWidth,
  selectGlobalClientId,
  selectGlobalPreviewUrl,
  selectGlobalUnreadCount,
  selectLatestMessage,
  selectListUnreadMessage,
  selectPageId,
  selectStatusAI,
  selectStatusIsInit,
  selectStatusPopup,
  setGlobalPreviewUrl,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setLoadingGlobal,
  setStatusIsInit,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

import ChatScreen from '@/screens/ChatScreen/Chat'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as CloseSlate } from '@/assets/close-black.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import { Employee } from '@/components/ChatComponents/type'
import Home from '@/screens/ChatScreen/Home'
import { ReactComponent as Logo } from '@/assets/logo-retion.svg'
import { MessageInfo } from '@/utils/type'
import Modal from '@/components/ChatComponents/Modal/Modal'
import OnlineStaff from '@/components/Container/OnlineStaff'
import { ReactComponent as RetionLogo } from '@/assets/retion-logo.svg'
import TemplateMessageComponent from '@/components/ChatComponents/MessageComponent/TemplateMessageComponent'
import { ReactComponent as activeHome } from '@/assets/home-active.svg'
import { ReactComponent as activeMessage } from '@/assets/messageA.svg'
import { ReactComponent as inactiveHome } from '@/assets/home.svg'
import { ReactComponent as inactiveMessage } from '@/assets/message.svg'
import { use } from 'i18next'
import { useTranslation } from 'react-i18next'

const ChatApp = ({
  handleBtn,
  show,
  setHideForMobile,
  client_name,
  consultation,
}: ChatAppProps) => {
  /** Dịch ngôn ngữ */
  const { t, i18n } = useTranslation()
  /** Các đầu api */
  const { READ_PAGE_INFO, SOCKET_API } = useAPI()

  /**
   * State Khai báo thông tin
   */
  const [error_message, setErrorMessage] = useState<string | null>('')
  const [page_name, setPageName] = useState<string>('')
  const [social_link, setSocialLink] = useState<Array<any> | null>([])
  const [social_description, setSocialDescription] = useState<string | null>('')
  const [staff_list, setStaffList] = useState<EmployeeList>({})
  const [is_force_close_socket, setIsForceCloseSocket] = useState(false)
  /** trigger hiện tin nhắn chào mừng */
  const [show_welcome_message, setShowWelcomeMessage] = useState(false)

  /** Tin nhắn mới nhất */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  /**Status AI */
  const AI_STATUS = useSelector(selectStatusAI)

  /** Khởi tạo websocket */
  const WS = useRef<WebSocket | null>(null)

  /** Tạo tab hiện tại là HOME */
  const [current_tab, setCurrentTab] = useState<string>('home')

  /** Tạo ref để giữ giá trị của current_tab */
  const TAB_REF = useRef(current_tab)
  /** Tạo ref để giữ giá trị của is_show */
  const IS_SHOW_REF = useRef(show)

  useEffect(() => {
    /** Cập nhật giá trị mới nhất của tab trong ref mỗi khi tab thay đổi */
    TAB_REF.current = current_tab
    /** Cập nhật giá trị là show trong ref một khi show thay đổi */
    IS_SHOW_REF.current = show
  }, [current_tab, show])

  /** Kiểm tra nếu is_ai = true thì  chuyển luôn vào tab message */
  useEffect(() => {
    /**
     * Nếu trạng thái mở AI hoặc trạng thái consultation thì vào luôn tab message
     */
    if (AI_STATUS || consultation) {
      setCurrentTab('message')
    }
  }, [AI_STATUS, consultation])

  /** hàm dispatch đến store */
  const dispatch = useDispatch()

  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)

  /** List tin nhắn được lấy từ store */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)

  useEffect(() => {
    if (LATEST_MESSAGE) {
      setShowWelcomeMessage(false)
    }
  }, [LATEST_MESSAGE])

  /** Số lượng tin nhắn chưa đọc */
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
  // localStorage.setItem(`client_id_<${PAGE_ID}>`, '6131478076934694')
  const CLIENT_STORED = localStorage.getItem(`client_id_<${PAGE_ID}>`)

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
      if (welcome_message?.is_active === false) {
        setShowWelcomeMessage(false)
        return
      }
      if (
        !show &&
        isEmpty(LATEST_MESSAGE) &&
        SHOW_QUICK_CHAT === 'show_quick_chat'
      ) {
        setShowWelcomeMessage(true)
      }
    }, welcome_message?.delay || 5000)

    // Clear timer khi component unmount
    return () => clearTimeout(TIMER)
  }, [show, LATEST_MESSAGE, SHOW_QUICK_CHAT, welcome_message])

  useEffect(() => {
    /**  Nếu không có PAGE_ID, thoát ngay*/
    if (!PAGE_ID) return

    /** Lấy client_id từ localStorage, chỉ xử lý nếu hợp lệ */
    const STORED_CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)
    // const STORED_CLIENT_ID = '6131478076934694'

    if (!STORED_CLIENT_ID) {
      /** Nếu không có client_id, khởi tạo lại hoặc đặt cờ khởi tạo socket */
    } else {
      /** Nếu có client_id hợp lệ, cập nhật vào state */

      onSocketFromChatboxServer({
        page_id: PAGE_ID,
        client_id: STORED_CLIENT_ID,
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

    /** Gọi API để lấy dữ liệu trang (luôn gọi mỗi khi PAGE_ID thay đổi) */
    fetchPageData(PAGE_ID)

    /** Chỉ chạy khi PAGE_ID thay đổi */
  }, [PAGE_ID])

  useEffect(() => {
    /** Khi có clientId hợp lệ và socket chưa được khởi tạo */
    /** Check từ global TH khởi tạo USER */
    if (GLOBAL_CLIENT_ID && IS_INIT_CLIENT) {
      /** Khởi tạo WebSocket */
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
      dispatch(setStatusIsInit(false))
    }
  }, [PAGE_ID, IS_INIT_CLIENT, GLOBAL_CLIENT_ID])

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
   *   { name: 'Trang chủ', src: inactiveHome, value: 'home', srcA: activeHome },
   *   { name: 'Tin nhắn', src: inactiveMessage, value: 'message', srcA: activeMessage },
   *   // Các tab Support và News đang bị ẩn trong đoạn mã
   * ];
   */
  const MENU_LIST = [
    {
      name: t('home'),
      src: inactiveHome,
      value: 'home',
      srcA: activeHome,
    },
    {
      name: t('message'),
      src: inactiveMessage,
      value: 'message',
      srcA: activeMessage,
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

  /** Hàm đọc dữ liệu trang
   * @param {string} page_id - ID trang
   */
  const fetchPageData = async (page_id: string) => {
    // Tạo đối tượng URL từ string
    const URL_READ = new URL(READ_PAGE_INFO)
    // body gồm page_id
    const BODY = {
      page_id: page_id,
    }
    // Đẩy params lên URL
    URL_READ.search = new URLSearchParams(BODY as any).toString()

    /** Thông tin page từ api */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')

    /** lưu tên page vào state */
    setPageName(RES?.data?.name)

    /** nếu cài đặt ở setting page is_active = false thì k lưu  */
    if (!RES?.data?.social_platform?.is_active) {
      setSocialLink(null)
    } else {
      setSocialLink(RES?.data?.social_platform?.data)
      setSocialDescription(
        RES?.data?.social_platform?.description?.[
          RES?.data?.default_language || 'vi'
        ]
      )
    }

    /** Lưu thông tin tin nhắn chào mừng */
    setWelcomeMessage({
      message:
        RES?.data?.welcome_message?.message || 'Chào mừng bạn đến với Retion',
      delay: RES?.data?.welcome_message?.delay * 1000 || 5000,
      is_active: RES?.data?.welcome_message?.is_active || false,
    })

    /** Lưu thông tin biểu mẫu */
    setWebForm({
      is_active: RES?.data?.web_form?.is_active || false,
      source:
        RES?.data?.web_form?.source?.[RES?.data?.default_language || 'vi'] ||
        {},
    })

    // lưu ngôn ngữ hiện tại
    i18n.changeLanguage(RES?.data?.default_language)
    // Lưu danh sách nhân viên
    setStaffList(RES?.data?.staffs)
  }

  /** Ngăn kết nối mở lại */
  useEffect(() => {
    return () => {
      closeSocketConnect(WS, setIsForceCloseSocket)
    }
  }, [])

  /** Chuyển từ Object thành mảng Array và lấy ra fb_staff_id và is_online */
  const EMPLOYEE_LIST: Employee[] = map(values(staff_list), (employee) => ({
    fb_staff_id: employee.fb_staff_id,
    is_online: employee.is_online,
  }))

  /** Hàm kiểm tra nhân sự có tồn tại không
   * @param {string} id: Nhận vào id của nhân sự
   * @returns {string} link avatar
   */
  const checkStaffExist = (id: string) => {
    /** Nếu không có staff Id thì trả về '' */
    if (!id) return ''
    /** Xem nhân viên nhắn tin có tồn tại trong list nhân viên không */
    const IS_STAFF_EXIST = EMPLOYEE_LIST?.find((item) =>
      id.includes(item?.fb_staff_id)
    )

    /** Nếu không tồn tại thì trả về '' */
    if (!IS_STAFF_EXIST) {
      return ''
    }

    /** Lấy link avatar */
    const LINK_AVATAR = renderAvatar(IS_STAFF_EXIST?.fb_staff_id)
    return LINK_AVATAR
  }

  /** Trả về tên nhân viên
   * @param {string} message_metadata
   * @returns {string} Tên nhân viên
   */
  const renderStaffName = (message_metadata?: string) => {
    /**
     * Lấy ID từ message_metadata
     * Lấy phần sau cùng sau dấu '__'
     * */
    const ID_FROM_META_DATA = message_metadata?.split('__').pop()

    if (ID_FROM_META_DATA) {
      /**  Kiểm tra ID có trong data không và lấy tên */
      const STAFF_NAME = get(staff_list, ID_FROM_META_DATA, null)?.name
      return STAFF_NAME ? STAFF_NAME : 'Nhân viên'
    }
  }

  /** Lấy ra thời gian đóng popup gần nhất từ trong localStorage */
  // const LAST_TIME_CLOSE = localStorage.getItem(`last_time_close__${PAGE_ID}`)

  const [has_exited_preview, setHasExitedPreview] = useState(false)

  // Theo dõi khi GLOBAL_PREVIEW_URL thay đổi và trạng thái preview đã được reset
  useEffect(() => {
    if (GLOBAL_PREVIEW_URL === null) {
      setHasExitedPreview(true) // Đã thoát khỏi trạng thái preview
    } else {
      setHasExitedPreview(false) // Đang trong trạng thái preview
    }
  }, [GLOBAL_PREVIEW_URL])

  /** Hàm xử lý điều kiện để trả về css render giao diện
   * @param {boolean} show Trạng thái đóng mở giao diện
   * @param {number} GLOBAL_UNREAD_MESSAGE_COUNT Tổng số tin nhắn chưa đọc
   * @param {MessageInfo} LATEST_MESSAGE Tin nhắn mới nhất
   * @param {number} CURRENT_WIDTH Kích thước chiều rộng page cha
   * @param {string} SHOW_QUICK_CHAT Trạng thái ẩn hiển QUICK_CHAT
   * @returns {string} CSS
   */
  const getChatBoxClasses = (
    show: boolean,
    GLOBAL_UNREAD_MESSAGE_COUNT: number,
    LATEST_MESSAGE: MessageInfo,
    CURRENT_WIDTH: number,
    SHOW_QUICK_CHAT: string | null
  ) => {
    /**
     * Trường hợp màn hình có height nhỏ hơn 674px
     */
    if (
      CURRENT_HEIGHT &&
      CURRENT_HEIGHT < 674 &&
      show &&
      CURRENT_WIDTH > 768 &&
      CURRENT_WIDTH !== 0
    ) {
      postMessageToParent(true, false)

      return 'flex flex-col md:w-[416px] h-screen px-2 py-2 justify-between'
    }

    /**
     * Trường hợp chat AI
     * is_ai = true
     * Hiển thị full width-height và ẩn header
     */
    if (AI_STATUS) {
      postMessageToParent(true, false)
      return 'w-screen h-screen'
    }

    /** Giả sử trường hợp User preview ảnh,
     * gọi post message để thay kích thước SDK ở cha
     * thay đổi kích thước ở bong bóng chat
     */
    if (GLOBAL_PREVIEW_URL) {
      // postMessageToParent(true, false, 674, GLOBAL_PREVIEW_URL)
      return 'flex w-screen h-screen items-end justify-end px-2 pr-11 pb-[52px]'
    }
    /** Popup đang đóng , không có tin nhắn mới, trigger welcome message */
    if (!show && show_welcome_message && LATEST_MESSAGE === null) {
      /** Call postMessageToParent */
      postMessageToParent(false, true, 142)
      return 'w-[302px] h-[142px] items-end justify-between pb-4 px-2'
    }

    /** Base condition:
     * - Popup closed,
     * - Trạng thái Quick_chat đóng,
     * - message is from page,
     * - unread messages > 0
     * */
    if (
      (!show && SHOW_QUICK_CHAT === 'hide_quick_chat') ||
      (!show && GLOBAL_UNREAD_MESSAGE_COUNT === 0) ||
      (!show && LATEST_MESSAGE === null && GLOBAL_UNREAD_MESSAGE_COUNT > 0)
    ) {
      /** Call postMessageToParent */
      postMessageToParent(false, false)
      /** Trả về css chỉ hiện popup */
      return 'w-16 h-[72px] items-center justify-center pb-4 pt-2'
    }

    /** =============================================================================== */

    if (
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0 &&
      LATEST_MESSAGE?.message_type === 'page'
    ) {
      /** Kiểm tra với type image / video */
      if (
        hasAttachmentOfType(LATEST_MESSAGE, 'image') ||
        hasAttachmentOfType(LATEST_MESSAGE, 'video')
      ) {
        /** Call postMessageToParent */
        postMessageToParent(false, true, 312)
        return 'w-[302px] h-[312px] items-end justify-between pb-4 px-2 '
      }

      /** Kiểm tra với type template && payload = button */
      if (
        LATEST_MESSAGE?.message_attachments &&
        hasAttachmentOfType(LATEST_MESSAGE, 'template') &&
        LATEST_MESSAGE?.message_attachments[0]?.payload?.template_type ===
          'button'
      ) {
        /** Call postMessageToParent */
        postMessageToParent(false, true, 312)
        return 'w-[302px] h-[312px] items-end justify-between pb-4 px-2 '
      }

      /** Kiểm tra với type file  ví dụ audio */
      if (hasAttachmentOfType(LATEST_MESSAGE, 'file')) {
        /** Call postMessageToParent */
        postMessageToParent(false, true, 240)
        return 'w-[302px] h-[240px] items-end justify-between pb-4 px-2 '
      }
    }

    /**
     * - Popup đóng ,
     * - Trạng thái Quick_chat đóng,
     * - tin nhắn từ page,
     * - kiểu tin nhắn text */
    if (
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0 &&
      LATEST_MESSAGE?.message_type === 'page'
    ) {
      /** Call postMessageToParent */
      postMessageToParent(false, true, 224)
      /** Trả về giao diện Text thông thường */
      return 'w-[302px] h-56 items-end justify-between pb-4 px-2 '
    }

    /**
     * - Popup mở,
     * - trạng thái Mobile hiện full màn hình */
    if (CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0) {
      postMessageToParent(true, false)
      return 'w-screen_dvw h-screen_dvh'
    }

    console.log('final case!!!')
    /**
     * - Popup mở,
     * - trả về full kích thước */
    postMessageToParent(true, false)
    /**  Trả về kích thước Fixed */
    return 'w-[416px] h-[674px] px-2 pb-4 justify-between items-end'
  }

  /** Hàm xử lý điều kiện để trả về css render giao diện
   * @param {boolean} show Trạng thái đóng mở giao diện
   * @param {number} GLOABAL_UNREAD_MESSAGE_COUNT So luong tin chưa đọc
   * @param {number} CURRENT_WIDTH Kích thước chiều rộng page cha
   * @returns {string} CSS
   */
  const getBubbleClasses = (
    show: boolean,
    GLOBAL_UNREAD_MESSAGE_COUNT: number,
    CURRENT_WIDTH: number
  ) => {
    /**
     * Trường hợp màn hình nhỏ hơn
     */
    if (
      CURRENT_HEIGHT < 674 &&
      show &&
      CURRENT_WIDTH > 768 &&
      CURRENT_WIDTH !== 0
    ) {
      return 'flex flex-col w-[400px] justify-between bg-bg-gradient rounded-[20px] h-full mb-[72px] overflow-hidden'
    }

    /** Trường hợp chat AI
     * is_ai = true
     * Hiển thị full width-height và ẩn header
     */
    if (AI_STATUS) {
      return 'flex flex-col w-screen h-screen just-between bg-bg-gradient'
    }

    /** CSS base */
    if (GLOBAL_PREVIEW_URL) {
      return 'flex flex-col w-[400px] h-[600px] mb-2.5 rounded-[20px] relative bg-bg-gradient overflow-hidden shadow-md'
    }

    const BASE_CLASSES =
      'flex justify-between relative bg-bg-gradient overflow-hidden shadow-md '

    /** Màn Mobile / PC */
    const SIZE_CLASSES =
      CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
        ? 'w-screen h-screen rounded-none'
        : 'w-[400px] h-[600px] rounded-[20px]'
    /** Popup đang đóng, và không có tin nhắn chưa đọc */
    /** Popup đang đóng, và không có tin nhắn chưa đọc */
    const VISIBILITY_CLASSES =
      !show && GLOBAL_UNREAD_MESSAGE_COUNT === 0
        ? 'hidden'
        : `flex flex-col ${
            !has_exited_preview ? 'animate-zoomInBottomRight' : ''
          } transition-transform duration-200 ease-in-out`

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
  const getPopupClasses = (
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

    // Kiểm tra nếu có tệp đính kèm
    const ATTACHMENT = get(LATEST_MESSAGE, 'message_attachments[0]', null)

    // Object để ánh xạ kiểu file đính kèm với CSS tương ứng
    const ATTACHMENT_TYPE_TO_CLASS_MAP: Record<string, string> = {
      image: 'flex flex-col w-[286px] h-[240px] justify-between',
      video: 'flex flex-col w-[286px] h-[240px] justify-between',
      file: 'flex flex-col w-[286px] h-[168px] justify-between',
      template_button: 'flex flex-col w-[286px] h-[240px] justify-between',
      template_generic: 'flex flex-col w-[286px] h-[438px] justify-between',
    }

    if (BASE_CONDITION && !ATTACHMENT) {
      const ATTACHMENT_CLASS =
        'flex flex-col w-[286px] h-[142px] justify-between'
      return ATTACHMENT_CLASS
    }
    /** Return appropriate class based on conditions */
    if (BASE_CONDITION && ATTACHMENT) {
      // Kiểm tra nếu là template và xác định kiểu template
      if (ATTACHMENT.type === 'template') {
        const TEMPLATE_TYPE = get(ATTACHMENT, 'payload.template_type', null)
        if (TEMPLATE_TYPE === 'button')
          return ATTACHMENT_TYPE_TO_CLASS_MAP.template_button
        if (TEMPLATE_TYPE === 'generic')
          return ATTACHMENT_TYPE_TO_CLASS_MAP.template_generic
      }

      // Kiểm tra attachment.type không phải là undefined
      if (ATTACHMENT.type) {
        const ATTACHMENT_CLASS = ATTACHMENT_TYPE_TO_CLASS_MAP[ATTACHMENT.type]
        return ATTACHMENT_CLASS
      }
    }

    /** Popup đóng thì ẩn giao diện */
    return 'hidden'
  }

  const handleCloseModal = () => {
    dispatch(setGlobalPreviewUrl(null))
    postMessageToParent(SHOW_POPUP, false, 674, '')
  }

  return (
    // JSX component using the function
    <div
      className={`flex flex-col relative ${getChatBoxClasses(
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
          className={`flex flex-col ${getBubbleClasses(
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
                <RetionLogo />
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
            className={`flex flex-col h-full resize-none outline-none scrollbar-thin scrollbar-webkit overflow-y-auto overflow-x-hidden md:max-h-[600px]`}
          >
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
                  /** 3. Danh sách tin nhắn chưa đọc */

                  /** 4. Reset Số tin nhắn chưa đọc localStorage */
                  saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

                  /** 5. Reset tin nhắn mới nhất trong localStorage */
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
                  /** 6. Reset danh sách tin nhắn chưa đọc trong Store */
                  dispatch(setListUnreadMessage([]))
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
                    href="https://beta-bbh-vn-lac.vercel.app/vn"
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
        className={getPopupClasses(
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
                <div className="flex rounded-lg flex-shrink-0">
                  {LATEST_MESSAGE?.message_type === 'page' && (
                    <img
                      src={
                        checkStaffExist(LATEST_MESSAGE?.message_metadata) ||
                        './images/earth.svg'
                      }
                      className="w-8 h-8  mask-rounded-oval"
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
                    <div className="flex justify-between w-full ">
                      <div className="text-slate-500 text-xs font-medium flex items-center">
                        {/* Hiển thị tên nhân viên */}
                        <span className="">
                          {truncateSentences(
                            renderStaffName(LATEST_MESSAGE?.message_metadata),
                            6
                          )}
                        </span>
                        <span className="mx-0.5">{t('from')}</span>
                        {/* Hiển thị tên trang, có thể bị cắt ngắn nếu quá dài */}
                        <span className="mx-0.5 truncate">
                          {truncateString(page_name, 10)}
                        </span>
                      </div>

                      {/* Hiển thị thời gian tin nhắn */}
                      <span className="text-slate-500 text-xs font-medium truncate flex items-center flex-shrink-0">
                        <span className="mx-0.5">•</span>
                        {calculateTimeAgo(LATEST_MESSAGE?.createdAt)}
                      </span>
                    </div>

                    {/* Nút đóng */}
                    <div
                      onClick={(event) => {
                        event.stopPropagation()

                        /** Reset hết data trong store */
                        dispatch(setLatestMessageGlobal(null))
                        // dispatch(setListUnreadMessage([]))
                        // dispatch(setListMessage([]))

                        /** Lưu thời gian vào localstorage Khi đóng tin nhắn mới */
                        saveTimeClosePopup(PAGE_ID)
                        /** Reset latest message trong store thành null */
                        saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)

                        /** Thay đổi trạng thái SHOW_QUICK_CHAT= 'hide_quick_chat' */
                        localStorage.setItem(
                          `status_quick_chat__${PAGE_ID}`,
                          'hide_quick_chat'
                        )
                        /** post message 1 lần nữa */
                        postMessageToParent(false, false)
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
                {/* <InputQuickChat
                  handleSend={(e: string) => {
                    sendMessage(e)
                  }}
                  staff_name={truncateSentences(
                    renderStaffName(LATEST_MESSAGE?.message_metadata),
                    6
                  )}
                /> */}
                <div
                  onClick={() => {
                    /** Khi click trả lời sẽ  reset hết data trong store */
                    dispatch(setLatestMessageGlobal(null))
                    dispatch(setListUnreadMessage([]))
                    dispatch(setListMessage([]))
                    /** Khi click vào trả lời, xoá unread_count */
                    saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

                    /* Chuyển tab thành message */
                    setCurrentTab('message')
                    /** trigger hàm đóng mở popup */
                    handleBtn()
                  }}
                  className="h-11 bg-white text-slate-400 text-sm flex w-full rounded-xl shadow-md p-3  items-center"
                >
                  {t('reply') +
                    ' ' +
                    truncateSentences(
                      renderStaffName(LATEST_MESSAGE?.message_metadata),
                      6
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị tin nhắn chào mừng */}
      {show_welcome_message && (
        <div className="flex bg-white shadow-lg justify-between w-full gap-x-2 rounded-xl h-16 px-3 py-3">
          <h4 className="text-sm line-clamp-2">{welcome_message?.message}</h4>

          {/* Nút đóng */}
          <div
            onClick={(event) => {
              event.stopPropagation()
              postMessageToParent(false, false)
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
          if (!show && current_tab === 'message') {
            // Reset hết data trong store
            dispatch(setLatestMessageGlobal(null))
            dispatch(setListUnreadMessage([]))
            dispatch(setListMessage([]))
            postMessageToParent(false, false)
          }
          handleBtn()
          setErrorMessage('')
          setShowWelcomeMessage(false)
        }}
        className={`absolute justify-center items-center bottom-4 right-2  h-12 w-12 bg-white shadow-lg rounded-full  hover:scale-110 ${
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
            <Logo
              aria-label="Logo Retion"
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
            className="max-w-[880px] w-full h-auto object-contain rounded-lg"
            alt="Full Attachment"
          />
        )}
      </Modal>
    </div>
  )
}

export default ChatApp
