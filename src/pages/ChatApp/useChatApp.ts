import {
  closeSocketConnect,
  onSocketFromChatboxServer,
} from '@/components/WebSocket/WebSocket'
import { fetchAPI, useAPI } from '@/api/api'
import { get, isEmpty, map, values } from 'lodash'
import {
  getCookie,
  hasAttachmentOfType,
  postMessageToParent,
  renderAvatarFromId,
  renderPosition,
  saveQuickChatCount,
  saveQuickChatLatestMessage,
} from '@/utils'
import {
  selectButtonEffect,
  selectConsultationGlobal,
  selectCurrentHeight,
  selectCurrentWidth,
  selectCustomBackground,
  selectDataFeedback,
  selectDataOrder,
  selectEmbedPosition,
  selectEmbedPositionDetail,
  selectGlobalClientId,
  selectGlobalPreviewUrl,
  selectGlobalUnreadCount,
  selectIsAvatar,
  selectIsViewScreen,
  selectLatestMessage,
  selectListUnreadMessage,
  selectOrgAllowLogo,
  selectPageAvatar,
  selectPageId,
  selectPageLogo,
  selectPageLogoBlack,
  selectPageSetting,
  selectRefreshData,
  selectShowHome,
  selectShowStaffNotAI,
  selectShowSupportStaff,
  selectStatusAI,
  selectStatusIsInit,
  selectStatusPopup,
  setDataFeedback,
  setDataOrder,
  setEmbedPosition,
  setEmbedPositionDetail,
  setGlobalPreviewUrl,
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setLoadingGlobal,
  setShowStaffNotAI,
  setStaffListStore,
  setStatusIsInit,
} from '@/stores/appSlice'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Employee } from '@/components/ChatComponents/type'
import { EmployeeList } from '../type'
import { MessageInfo } from '@/utils/type'
import { NetworkContext } from '@/components/NWProvider'
import { useTranslation } from 'react-i18next'

function useChatApp({ show }: { show: boolean }) {
  /** Dịch ngôn ngữ */
  const { t, i18n: I18N } = useTranslation()
  /** org custom logo*/
  const ORG_ALLOW_LOGO = useSelector(selectOrgAllowLogo)
  /** link logo   */
  const LOGO_PAGE_CUSTOM = useSelector(selectPageLogo)
  /** link logo   */
  const LOGO_PAGE_CUSTOM_BLACK = useSelector(selectPageLogoBlack)
  /** Các đầu api */
  const { READ_PAGE_INFO, SOCKET_API } = useAPI()

  /** HIệu ứng Button  */
  const SELECT_BUTTON_EFFECT = useSelector(selectButtonEffect)
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
  /** IS View screen */
  const IS_VIEW_SCREEN = useSelector(selectIsViewScreen)
  /** Trạng thái hiển thị màn home */
  const IS_SHOW_HOME = useSelector(selectShowHome)

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
  /**Show support staff */
  const SHOW_SUPPORT_STAFF = useSelector(selectShowSupportStaff)
  /** THông tin Refresh Data*/
  const REFRESH_DATA = useSelector(selectRefreshData)
  /** Invalid page */
  const [invalid_page_id, setInvalidPageId] = useState<boolean | undefined>(
    undefined
  )

  /** Trạng thái consultation */
  const GLOBAL_CONSULTATION = useSelector(selectConsultationGlobal)
  /** CUSTOM BACKGROUND */
  const IS_CUSTOM_BACKGROUND = useSelector(selectCustomBackground)

  /** Page setting */
  const PAGE_SETTING_GLOBAL = useSelector(selectPageSetting)

  useEffect(() => {
    /** Trạng thái refresh data thì đóng web socket */
    if (REFRESH_DATA) {
      /** Tắt web socket*/
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
    if (
      AI_STATUS ||
      GLOBAL_CONSULTATION ||
      IS_VIEW_SCREEN ||
      (IS_SHOW_HOME !== undefined && !IS_SHOW_HOME)
    ) {
      /** Set tab hiện tại là message */
      setCurrentTab('message')
      /** Set show welcome message là false */
      setShowWelcomeMessage(false)
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
      saveQuickChatCount(PAGE_ID, stored_client_id, 0)

      /** 5. Reset tin nhắn mới nhất trong localStorage */
      saveQuickChatLatestMessage(PAGE_ID, stored_client_id, null)
    }
  }, [IS_VIEW_SCREEN, AI_STATUS, GLOBAL_CONSULTATION, IS_SHOW_HOME])

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
  /** Data order */
  const GLOBAL_DATA_ORDER = useSelector(selectDataOrder)
  /** Data feedback */
  const GLOBAL_DATA_FEEDBACK = useSelector(selectDataFeedback)

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

  /** Lấy client_id từ localStorage*/
  let stored_client_id = localStorage.getItem(`client_id_${PAGE_ID}`)
  /** Lấy client_id từ cookie */
  if (!stored_client_id) {
    stored_client_id = getCookie(`client_id_${PAGE_ID}`)
  }

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
    if (PAGE_ID === null) {
      setErrorMessage('Không tìm thấy page_id')
      return
    }
    setErrorMessage('')
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
      /** Nếu không cố page id thì return */
      if (!PAGE_ID) {
        // setErrorMessage('PAGE_ID is required')
        return
      }
      /** Nếu cố page id thì lấy dữ liệu trang */
      if (PAGE_SETTING_GLOBAL) {
        /** Luôn gọi API lấy dữ liệu trang */
        fetchPageData(PAGE_ID)
      }
      /** Nếu nhận được client_id từ localStorage */
      if (stored_client_id) {
        /** Tạo WebSocket mới */
        onSocketFromChatboxServer({
          page_id: PAGE_ID,
          client_id: stored_client_id,
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
  }, [PAGE_ID, GLOBAL_CLIENT_ID, stored_client_id, PAGE_SETTING_GLOBAL])

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
    /** Nếu không có page_id thì return */
    if (page_id === null) {
      return
    }

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
    /** Lưu dữ liệu trang */
    const DATA_PAGE_SETTING = PAGE_SETTING_GLOBAL || RES?.data

    /** lưu tên page vào state */
    setPageName(DATA_PAGE_SETTING?.alias || DATA_PAGE_SETTING?.name || '')
    /** Khi call api xong thì tắt loading */
    dispatch(setLoadingGlobal(false))
    /** Nếu lỗi 403 thì hiện cờ  */
    if (RES?.code === 403) {
      setInvalidPageId(true)
      return
    }
    /** Nộp dữ liệu trang với page_id */
    setInvalidPageId(false)
    /**
     *  Tạm ẩn để deploy lên production
     */
    /**
     * Lưu thông tin vị trí chatbox
     */
    dispatch(
      /** Lưu vị trí chatbox */
      setEmbedPosition(DATA_PAGE_SETTING?.display_position.toLowerCase())
    )
    /** Lưu các giá trị vị trí từ page setting */
    /** Bottom */
    const BOTTOM =
      DATA_PAGE_SETTING?.bottom_distance != null
        ? Math.min(DATA_PAGE_SETTING.bottom_distance, 160)
        : undefined
    /** Căn Phải */
    const RIGHT =
      DATA_PAGE_SETTING?.right_distance != null
        ? Math.min(DATA_PAGE_SETTING.right_distance, 160)
        : undefined
    /** Cắn trái */
    const LEFT =
      DATA_PAGE_SETTING?.left_distance != null
        ? Math.min(DATA_PAGE_SETTING.left_distance, 160)
        : undefined
    /**
     * Lưu thông tin chi tiết vị trí của chatbox
     */
    dispatch(
      setEmbedPositionDetail({ bottom: BOTTOM, right: RIGHT, left: LEFT })
    )
    /** Hiển thị thông tin staff thay vì AI */
    dispatch(setShowStaffNotAI(!!DATA_PAGE_SETTING?.show_staff_not_ai))
    // dispatch(setShowStaffNotAI(true))

    // /**
    //  * Gửi list path sang SDK
    //  */
    // postMessageToParentHiddenPath(['child-app'])
    // postMessageToParentAllowedDomains(DATA_PAGE_SETTING?.allow_domain)

    /** nếu cài đặt ở setting page is_active = false thì k lưu  */
    if (!DATA_PAGE_SETTING?.social_platform?.is_active) {
      /**
       * Nếu không có cài đặt mạng xã hội thì trả về null
       */
      setSocialLink(null)
    } else {
      /**
       * Lưu thông tin mạng xã hội
       */
      setSocialLink(DATA_PAGE_SETTING?.social_platform?.data)
      /**
       * Lưu thông tin mô tả mạng xã hội
       */
      setSocialDescription(DATA_PAGE_SETTING?.social_platform?.description)

      // setSocialDescription(
      //   DATA_PAGE_SETTING?.social_platform?.description?.[
      //     I18N.language || DATA_PAGE_SETTING?.default_language || 'vi'
      //   ]
      // )
    }
    /** Lưu thông tin tin nhắn chào mừng custom không */
    // if (DATA_PAGE_SETTING?.welcome_message?.is_active) {
    //   /** Lưu thông tin tin nhắn chào mừng */
    //   setWelcomeMessage({
    //     message:
    //       DATA_PAGE_SETTING?.welcome_message?.source?.[I18N.language] ||
    //       t('_welcome_message'),
    //     delay: DATA_PAGE_SETTING?.welcome_message?.delay * 1000,
    //     is_active: DATA_PAGE_SETTING?.welcome_message?.is_active,
    //   })
    // } else {
    //   /** Lưu thông tin tin nhắn chào mừng mặc định*/
    //   setWelcomeMessage({
    //     message: t('_welcome_message'),
    //     delay: 5000,
    //     is_active: true,
    //   })
    // }
    /** Trạng thái active tin nhắn chào mừng */
    const IS_ACTIVE = DATA_PAGE_SETTING?.welcome_message?.is_active
    /** Trạng thái Active */
    if (IS_ACTIVE === true) {
      /** Tin nhắn chào mừng custom */
      setWelcomeMessage({
        message:
          DATA_PAGE_SETTING?.welcome_message?.source?.[I18N.language] ||
          t('_welcome_message'),
        delay: (DATA_PAGE_SETTING?.welcome_message?.delay ?? 5) * 1000,
        is_active: true,
      })
    } else if (IS_ACTIVE === false) {
      /** Tin nhắn chào mừng tắt (nhưng vẫn lưu state) */
      setWelcomeMessage({
        message:
          DATA_PAGE_SETTING?.welcome_message?.source?.[I18N.language] ||
          t('_welcome_message'),
        delay: (DATA_PAGE_SETTING?.welcome_message?.delay ?? 5) * 1000,
        is_active: false,
      })
    } else {
      /** isActive là null hoặc undefined → dùng mặc định */
      setWelcomeMessage({
        message: t('_welcome_message'),
        delay: 5000,
        is_active: true,
      })
    }

    console.log(I18N.language)
    /** Lưu thông tin biểu mẫu */
    setWebForm({
      is_active: DATA_PAGE_SETTING?.web_form?.is_active || false,
      source: DATA_PAGE_SETTING?.web_form?.source || {},
    })

    /** Lưu danh sách nhân viên */
    setStaffList(DATA_PAGE_SETTING?.staffs)
    dispatch(setStaffListStore(DATA_PAGE_SETTING?.staffs))
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
    user_id: employee.user_id,
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
  /** Theo dõi khi GLOBAL_PREVIEW_URL thay đổi và trạng thái preview đã được reset */
  useEffect(() => {
    if (isEmpty(GLOBAL_DATA_ORDER)) {
      /** Đã thoát khỏi trạng thái preview */
      setHasExitedPreview(true)
    } else {
      /** Đang trong trạng thái preview */
      setHasExitedPreview(false)
    }
  }, [GLOBAL_DATA_ORDER])
  /** Theo dõi khi GLOBAL_PREVIEW_URL thay đổi và trạng thái preview đã được reset */
  useEffect(() => {
    if (isEmpty(GLOBAL_DATA_FEEDBACK)) {
      /** Đã thoát khỏi trạng thái preview */
      setHasExitedPreview(true)
    } else {
      /** Đang trong trạng thái preview */
      setHasExitedPreview(false)
    }
  }, [GLOBAL_DATA_FEEDBACK])

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
    const IS_AI = AI_STATUS || IS_VIEW_SCREEN
    /**
     * Xác định trạng thái xem trước ảnh
     */
    const IS_PREVIEWING_IMAGE =
      !!GLOBAL_PREVIEW_URL ||
      !isEmpty(GLOBAL_DATA_FEEDBACK) ||
      !isEmpty(GLOBAL_DATA_ORDER)

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
          GLOBAL_PREVIEW_URL || 'preview',
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
          GLOBAL_PREVIEW_URL || 'preview',
          POSITION,
          POSITION_DETAIL?.bottom,
          POSITION_DETAIL?.right,
          POSITION_DETAIL?.left
        )
        /**
         * Trả về css popup
         */
        /** Nếu vị trí popup la bottom_left */
        if (POSITION === 'bottom_left') {
          return renderPosition(
            POSITION,
            POSITION_DETAIL?.bottom ?? 0,
            POSITION_DETAIL?.right ?? 0,
            POSITION_DETAIL?.left ?? 0
          )
        } else {
          /**
           * Gọi hàm postMessage
           */
          const POSITION = renderPosition(
            'bottom_right',
            POSITION_DETAIL?.bottom ?? 0,
            POSITION_DETAIL?.right ?? 0,
            POSITION_DETAIL?.left ?? 0
          )
          console.log(POSITION, 'POSITION')
          /**
           * Trả về css popup
           */
          return POSITION
        }
        // return 'flex w-screen h-screen items-end justify-end px-6 pr-5 pb-[68px]'
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
        CURRENT_HEIGHT,
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
    const BASE_CLASSES = `flex justify-between relative  ${
      !IS_CUSTOM_BACKGROUND ? ' bg-bg-gradient ' : ' bg-slate-400 '
    }  overflow-hidden shadow-md`
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
    if (AI_STATUS || IS_VIEW_SCREEN) {
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
    /** Data feedback */
    dispatch(setDataFeedback({}))
    /** Data order */
    dispatch(setDataOrder({}))

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
  /** Trả về các hàm sử dụng */
  return {
    getContainerLayout,
    GLOBAL_UNREAD_MESSAGE_COUNT,
    LATEST_MESSAGE,
    CURRENT_WIDTH,
    SHOW_QUICK_CHAT,
    getMainPopupLayout,
    current_tab,
    AI_STATUS,
    IS_VIEW_SCREEN,
    checkStaffExist,
    ORG_ALLOW_LOGO,
    LOGO_PAGE_CUSTOM_BLACK,
    SHOW_SUPPORT_STAFF,
    EMPLOYEE_LIST,
    handleCloseModal,
    IS_ONLINE,
    setCurrentTab,
    PAGE_ID,
    stored_client_id,
    setErrorMessage,
    social_link,
    web_form,
    social_description,
    invalid_page_id,
    error_message,
    page_name,
    getQuickchatLayout,
    IS_PAGE_AVATAR,
    staff_list,
    POSITION,
    POSITION_DETAIL,
    show_welcome_message,
    setShowWelcomeMessage,
    welcome_message,
    IS_SHOW_HOME,
    LOGO_PAGE_CUSTOM,
    GLOBAL_PREVIEW_URL,
    IS_CUSTOM_BACKGROUND,
    SELECT_BUTTON_EFFECT,
    GLOBAL_DATA_ORDER,
    GLOBAL_DATA_FEEDBACK,
  }
}

export default useChatApp
