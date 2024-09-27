import { ChatAppProps, EmployeeList } from './type'
import {
  calculateTimeAgo,
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
import {
  selectCurrentWidth,
  selectGlobalClientId,
  selectGlobalUnreadCount,
  selectLatestMessage,
  selectListUnreadMessage,
  selectPageId,
  selectStatusIsInit,
  selectStatusPopup,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setStatusIsInit,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

import ChatScreen from '@/screens/Chat'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as CloseSlate } from '@/assets/close-black.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import { Employee } from '@/components/ChatComponents/type'
import Home from '@/screens/Home'
import { ReactComponent as Logo } from '@/assets/logo-retion.svg'
import { MessageInfo } from '@/utils/type'
import OnlineStaff from '@/components/Container/OnlineStaff'
import { ReactComponent as RetionLogo } from '@/assets/retion-logo.svg'
import TemplateMessageComponent from '@/components/ChatComponents/TemplateMessageComponent'
import _ from 'lodash'
import { ReactComponent as activeHome } from '@/assets/home-active.svg'
import { ReactComponent as activeMessage } from '@/assets/messageA.svg'
import { ReactComponent as inactiveHome } from '@/assets/home.svg'
import { ReactComponent as inactiveMessage } from '@/assets/message.svg'
import { useTranslation } from 'react-i18next'

const ChatApp = ({ handleBtn, show, setHideForMobile }: ChatAppProps) => {
  /** Dịch ngôn ngữ */
  const { t, i18n } = useTranslation()
  /** Các đầu api */
  const { READ_PAGE_INFO, SOCKET_API } = useAPI()

  const [error_message, setErrorMessage] = useState<string | null>('')
  const [page_name, setPageName] = useState<string>('')
  const [social_link, setSocialLink] = useState<Array<any> | null>([])
  const [staff_list, setStaffList] = useState<EmployeeList>({})
  const [is_force_close_socket, setIsForceCloseSocket] = useState(false)

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

  /** hàm dispatch đến store */
  const dispatch = useDispatch()

  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)

  /** List tin nhắn được lấy từ store */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)

  /** Tin nhắn mới nhất */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  /** Số lượng tin nhắn chưa đọc */
  const GLOBAL_UNREAD_MESSAGE_COUNT = useSelector(selectGlobalUnreadCount)

  /** Tạo ref một để luu giữ giá trị GLOBAL_UNREAD_MESSAGE_COUNT */
  const REF_GLOBAL_UNREAD_MESSAGE_COUNT = useRef(GLOBAL_UNREAD_MESSAGE_COUNT)

  /** Tạo ref một để luu giữ giá trị LIST_UNREAD_MESSAGE */
  const REF_LIST_UNREAD_MESSAGE = useRef(LIST_UNREAD_MESSAGE)

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

    console.log(RES, 'RES page')
    // lưu tên page vào state
    setPageName(RES?.data?.name)
    // Lưu liên hệ với các kênh mạng xã hội
    setSocialLink(RES?.data?.config?.sosial_platform)
    // lưu ngôn ngữ hiện tại
    i18n.changeLanguage(RES?.data.config.locale)
    // Lưu danh sách nhân viên
    setStaffList(RES?.data?.staffs)
  }

  console.log(SHOW_QUICK_CHAT, 'SHOW_QUICK_CHAT')

  /** Ngăn kết nối mở lại */
  useEffect(() => {
    return () => {
      closeSocketConnect(WS, setIsForceCloseSocket)
    }
  }, [])

  /** Chuyển từ Object thành mảng Array và lấy ra fb_staff_id và is_online */
  const EMPLOYEE_LIST: Employee[] = _.map(_.values(staff_list), (employee) => ({
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

  /** Chỉ lấy tin nhắn chưa đọc từ page, không lấy từ client */
  // const LIST_UNREAD_MESSAGE_FILTER = [
  //   {
  //     _id: '66f387d9271db2db8a88f4f4',
  //     fb_page_id: '100179064765476',
  //     fb_client_id: '6131478076934694',
  //     platform_type: 'FB_MESS',
  //     message_type: 'page',
  //     sender_id: '100179064765476',
  //     recipient_id: '6131478076934694',
  //     time: '2024-09-25T03:47:37.059Z',
  //     message_mid:
  //       'm_hukRF2b55fWYOr0BCDLSEsw7jQrJjGjlxnapic_pyarVSe1_gWj4yEjcXoUL_kz7vMHzD9nzKjguLyqXmz9uug',
  //     message_attachments: [
  //       {
  //         type: 'template',
  //         title: 'tiêu đề của silder',
  //         payload: {
  //           template_type: 'generic',
  //           sharable: false,
  //           elements: [
  //             {
  //               title: 'tiêu đề của silder',
  //               image_url:
  //                 'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //               default_action: {
  //                 type: 'web_url',
  //                 url: 'https://google.com/',
  //               },
  //               buttons: [
  //                 {
  //                   type: 'postback',
  //                   title: 'nút kịch bản',
  //                   payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //                 },
  //                 {
  //                   type: 'web_url',
  //                   title: 'nút web',
  //                   url: 'https://google.com/',
  //                 },
  //                 {
  //                   type: 'phone_number',
  //                   title: 'nút dtk',
  //                   url: 'tel:+84839383938',
  //                   payload: '+84839383938',
  //                 },
  //               ],
  //               subtitle: 'phụ đề ở đây',
  //             },
  //             {
  //               title: 'tiêu đề của silder',
  //               image_url:
  //                 'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //               default_action: {
  //                 type: 'web_url',
  //                 url: 'https://google.com/',
  //               },
  //               buttons: [
  //                 {
  //                   type: 'postback',
  //                   title: 'nút kịch bản',
  //                   payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //                 },
  //                 {
  //                   type: 'web_url',
  //                   title: 'nút web',
  //                   url: 'https://google.com/',
  //                 },
  //                 {
  //                   type: 'phone_number',
  //                   title: 'nút dtk',
  //                   url: 'tel:+84839383938',
  //                   payload: '+84839383938',
  //                 },
  //               ],
  //               subtitle: 'phụ đề ở đây',
  //             },
  //             {
  //               title: 'tiêu đề của silder',
  //               image_url:
  //                 'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //               default_action: {
  //                 type: 'web_url',
  //                 url: 'https://google.com/',
  //               },
  //               buttons: [
  //                 {
  //                   type: 'postback',
  //                   title: 'nút kịch bản',
  //                   payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //                 },
  //                 {
  //                   type: 'web_url',
  //                   title: 'nút web',
  //                   url: 'https://google.com/',
  //                 },
  //                 {
  //                   type: 'phone_number',
  //                   title: 'nút dtk',
  //                   url: 'tel:+84839383938',
  //                   payload: '+84839383938',
  //                 },
  //               ],
  //               subtitle: 'phụ đề ở đây',
  //             },
  //             {
  //               title: 'tiêu đề của silder',
  //               image_url:
  //                 'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //               default_action: {
  //                 type: 'web_url',
  //                 url: 'https://google.com/',
  //               },
  //               buttons: [
  //                 {
  //                   type: 'postback',
  //                   title: 'nút kịch bản',
  //                   payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //                 },
  //                 {
  //                   type: 'web_url',
  //                   title: 'nút web',
  //                   url: 'https://google.com/',
  //                 },
  //                 {
  //                   type: 'phone_number',
  //                   title: 'nút dtk',
  //                   url: 'tel:+84839383938',
  //                   payload: '+84839383938',
  //                 },
  //               ],
  //               subtitle: 'phụ đề ở đây',
  //             },
  //             {
  //               title: 'tiêu đề của silder',
  //               image_url:
  //                 'https://static.botbanhang.vn/chatbot/100179064765476/slider/236168d4-e036-4038-aed7-9034fdfe94b5-1727235884975.jpg',
  //               default_action: {
  //                 type: 'web_url',
  //                 url: 'https://google.com/',
  //               },
  //               buttons: [
  //                 {
  //                   type: 'postback',
  //                   title: 'nút kịch bản',
  //                   payload: '<FLOW>_db7867d2e25d46b8aac018d8adffa099',
  //                 },
  //                 {
  //                   type: 'web_url',
  //                   title: 'nút web',
  //                   url: 'https://google.com/',
  //                 },
  //                 {
  //                   type: 'phone_number',
  //                   title: 'nút dtk',
  //                   url: 'tel:+84839383938',
  //                   payload: '+84839383938',
  //                 },
  //               ],
  //               subtitle: 'phụ đề ở đây',
  //             },
  //           ],
  //         },
  //         _id: '66f387d9271db2db8a88f4f5',
  //       },
  //     ],
  //     ai: [],
  //     createdAt: '2024-09-25T03:47:37.677Z',
  //     updatedAt: '2024-09-25T03:47:37.677Z',
  //     __v: 0,
  //     attachment_size: [],
  //   },
  // ]

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
      const STAFF_NAME = _.get(staff_list, ID_FROM_META_DATA, null)?.name
      return STAFF_NAME ? STAFF_NAME : 'Nhân viên'
    }
  }

  /** Lấy ra thời gian đóng popup gần nhất từ trong localStorage */
  // const LAST_TIME_CLOSE = localStorage.getItem(`last_time_close__${PAGE_ID}`)

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
    /**
     * - Popup đóng ,
     * - Trạng thái Quick_chat đóng,
     * - tin nhắn từ page,
     * - có file attach,
     * Kiểu tin nhắn = image hoặc video || type = template && payload = button */
    if (
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0 &&
      LATEST_MESSAGE?.message_type === 'page' &&
      LATEST_MESSAGE?.message_attachments &&
      (LATEST_MESSAGE?.message_attachments[0]?.type === 'image' ||
        LATEST_MESSAGE?.message_attachments[0]?.type === 'video' ||
        (LATEST_MESSAGE?.message_attachments[0]?.type === 'template' &&
          LATEST_MESSAGE?.message_attachments[0]?.payload?.template_type ===
            'button'))
    ) {
      /** Call postMessageToParent */
      postMessageToParent(false, true, 312)
      /** Trả về giao diện video */
      return 'w-[302px] h-[312px] items-end justify-between pb-4 px-2'
    }
    /**
     * - Popup đóng ,
     * - Trạng thái Quick_chat đóng,
     * - tin nhắn từ page,
     * - type = template && payload = generic */
    if (
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0 &&
      LATEST_MESSAGE?.message_type === 'page' &&
      LATEST_MESSAGE?.message_attachments &&
      LATEST_MESSAGE?.message_attachments[0]?.type === 'template' &&
      LATEST_MESSAGE?.message_attachments[0]?.payload?.template_type ===
        'generic'
    ) {
      /** Call postMessageToParent */
      postMessageToParent(false, true, 540)
      /** Trả về giao diện video */
      return 'w-[302px] h-[540px] items-end justify-between pb-4 px-2'
    }
    /**
     * - Popup đóng,
     * - Trạng thái Quick_chat đóng,
     * - tin nhắn từ page,
     * - có file attach,
     * - Kiểu tin nhắn = file */
    if (
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0 &&
      LATEST_MESSAGE?.message_type === 'page' &&
      LATEST_MESSAGE?.message_attachments &&
      LATEST_MESSAGE?.message_attachments[0]?.type === 'file'
    ) {
      /** Call postMessageToParent */
      postMessageToParent(false, true, 240)
      /** Trả về giao diện file */
      return 'w-[302px] h-[240px] items-end justify-between pb-4 px-2'
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
      return 'w-[302px] h-56 items-end justify-between pb-4 px-2'
    }

    /**
     * - Popup mở,
     * - trạng thái Mobile hiện full màn hình */
    if (CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0) {
      return 'w-screen h-screen'
    }
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
    /** CSS base */
    const BASE_CLASSES = 'relative bg-bg-gradient overflow-hidden shadow-md'

    /** Màn Mobile / PC */
    const SIZE_CLASSES =
      CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
        ? 'w-screen h-screen rounded-none'
        : 'w-[400px] h-[600px] rounded-[20px]'
    /** Popup đang đóng, và không có tin nhắn chưa đọc */
    const VISIBILITY_CLASSES =
      !show && GLOBAL_UNREAD_MESSAGE_COUNT === 0
        ? 'hidden'
        : 'flex flex-col animate-zoomInBottomRight transition-transform duration-200 ease-in-out'

    return `${BASE_CLASSES} ${SIZE_CLASSES} ${VISIBILITY_CLASSES}`
  }

  /**  Utility function to determine the CSS classes for the popup
   * @param {boolean} show Trạng thái đóng mở giao diện
   * @param {MessageInfo} LATEST_MESSAGE Tin nhắn là nhất
   * @param {number} GLOBAL_UNREAD_MESSAGE_COUNT So luong tin chưa đọc
   * @param {string | null} SHOW_QUICK_CHAT Trạng thái ẩn hiện QUICK_CHAT
   * @returns {string} CSS
   */
  const getPopupClasses = (
    show: boolean,
    LATEST_MESSAGE: MessageInfo,
    GLOBAL_UNREAD_MESSAGE_COUNT: number,
    SHOW_QUICK_CHAT: string | null
  ) => {
    // Base condition: Popup closed, message is from page, unread messages > 0
    const baseCondition =
      SHOW_QUICK_CHAT === 'show_quick_chat' &&
      !show &&
      LATEST_MESSAGE?.message_type === 'page' &&
      GLOBAL_UNREAD_MESSAGE_COUNT > 0

    // Additional condition: If the latest message has attachments and the first one is an image
    const hasImageAttachment =
      LATEST_MESSAGE?.message_attachments &&
      (LATEST_MESSAGE?.message_attachments[0]?.type === 'image' ||
        LATEST_MESSAGE?.message_attachments[0]?.type === 'video')
    // Có file attachment
    const hasFileAttachment =
      LATEST_MESSAGE?.message_attachments &&
      LATEST_MESSAGE?.message_attachments[0]?.type === 'file'
    // Có button attachment
    const hasButtonAttachment =
      LATEST_MESSAGE?.message_attachments &&
      LATEST_MESSAGE?.message_attachments[0]?.type === 'template' &&
      LATEST_MESSAGE?.message_attachments[0]?.payload?.template_type ===
        'button'
    // Có slide attachment
    const hasSlideAttachment =
      LATEST_MESSAGE?.message_attachments &&
      LATEST_MESSAGE?.message_attachments[0]?.type === 'template' &&
      LATEST_MESSAGE?.message_attachments[0]?.payload?.template_type ===
        'generic'
    // Return appropriate class based on conditions
    if (baseCondition) {
      if (hasImageAttachment) {
        // Adjust height for image case
        return 'flex flex-col w-[286px] h-[240px] justify-between'
      }
      if (hasFileAttachment) {
        // Adjust height for File case
        return 'flex flex-col w-[286px] h-[168px] justify-between'
      }
      if (hasButtonAttachment) {
        // Adjust height for Button case
        return 'flex flex-col w-[286px] h-[240px] justify-between'
      }
      if (hasSlideAttachment) {
        // Adjust height for Button case
        return 'flex flex-col w-[286px] h-[468px] justify-between'
      }

      // Adjust height for text case
      return 'flex flex-col w-[286px] h-[142px] justify-between'
    }
    // Popup đóng thì ẩn màn chat
    return 'hidden'
  }

  return (
    // JSX component using the function
    <div
      className={`flex flex-col ${getChatBoxClasses(
        show,
        GLOBAL_UNREAD_MESSAGE_COUNT,
        LATEST_MESSAGE,
        CURRENT_WIDTH,
        SHOW_QUICK_CHAT
      )}`}
    >
      {/* Popup tin nhắn */}
      {show && (
        <div
          className={getBubbleClasses(
            show,
            GLOBAL_UNREAD_MESSAGE_COUNT,
            CURRENT_WIDTH
          )}
        >
          {/* header */}
          {current_tab !== 'message' && (
            <div
              className={
                'flex justify-between items-center px-5 py-3 bg-slate-800 text-white'
              }
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
                  className={` cursor-pointer w-10 h-10 flex justify-center items-center  ${
                    CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
                      ? ' flex'
                      : ' hidden'
                  }`}
                >
                  <Close />
                </div>
              </div>
            </div>
          )}
          {/* body check theo bien current tab de render data */}

          <div
            className={
              'flex flex-col resize-none outline-none scrollbar-thin scrollbar-webkit ' +
              `${
                current_tab !== 'home'
                  ? ' h-[468px] overflow-y-auto'
                  : ' h-[600px]'
              }`
            }
          >
            {current_tab === 'home' && (
              <Home
                onNavigate={() => {
                  setCurrentTab('message')
                  // 1. Reset Số tin nhắn chưa đọc localStorage
                  saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

                  // 2. Reset tin nhắn mới nhất trong localStorage
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
                }}
                onError={() => {
                  setErrorMessage(t('errorMessage'))
                  setCurrentTab('message')
                }}
                social_link={social_link}
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
            <div className="absolute bottom-0 w-full flex flex-col justify-evenly p-2 px-6 h-16 z-20  bg-bg-gradient">
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
                  className="flex flex-col flex-grow min-w-0 h-full bg-white rounded-xl p-3 hover:bg-slate-50 cursor-pointer"
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
        }}
        className={`relative justify-center items-center  h-12 w-12 bg-white shadow-lg rounded-full  hover:scale-110  ${
          !show
            ? ' flex  '
            : CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
            ? ' hidden '
            : ' flex '
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
              width={30}
              height={30}
            />
          )}
        </div>
      </button>
    </div>
  )
}

export default ChatApp
