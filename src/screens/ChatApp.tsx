import { ChatAppProps, EmployeeList } from './type'
import { Employee, Message } from '@/components/ChatComponents/type'
import _, { size } from 'lodash'
import {
  calculateTimeAgo,
  postMessageToParent,
  renderAvatar,
  saveTimeClosePopup,
} from '@/utils'
import { fetchAPI, useAPI } from '@/api/api'
import {
  selectCurrentWidth,
  selectLatestMessage,
  selectListUnreadMessage,
  selectPageId,
  selectStatusPopup,
  setCurrentWidth,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setPageId,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

import ChatScreen from '@/screens/Chat'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as CloseSlate } from '@/assets/close-black.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import Home from '@/screens/Home'
import InputQuickChat from '@/components/ChatComponents/InputQuickChat'
import { ReactComponent as Logo } from '@/assets/logo-retion.svg'
import { MessageInfo } from '@/utils/type'
import OnlineStaff from '@/components/Container/OnlineStaff'
import { ReactComponent as RetionLogo } from '@/assets/retion-logo.svg'
import { ReactComponent as activeHome } from '@/assets/home-active.svg'
import { ReactComponent as activeMessage } from '@/assets/messageA.svg'
import i18next from 'i18next'
import { ReactComponent as inactiveHome } from '@/assets/home.svg'
import { ReactComponent as inactiveMessage } from '@/assets/message.svg'
import { useTranslation } from 'react-i18next'

const ChatApp = ({ handleBtn, show, setHideForMobile }: ChatAppProps) => {
  // Dịch ngôn ngữ
  const { t, i18n } = useTranslation()
  // Các đầu api
  const { READ_PAGE_INFO, SOCKET_API, READ_CLIENT_INFO, SEND_MESSAGE_API } =
    useAPI()

  const [error_message, setErrorMessage] = useState<String | null>('')
  const [page_name, setPageName] = useState<string>('')
  const [social_link, setSocialLink] = useState<Array<any> | null>([])
  const [staff_list, setStaffList] = useState<EmployeeList>({})
  const [is_force_close_socket, setIsForceCloseSocket] = useState(false)

  // Khởi tạo websocket
  const WS = useRef<WebSocket | null>(null)

  // Tạo tab hiện tại là HOME
  const [current_tab, setCurrentTab] = useState<string>('home')

  /** Tạo ref để giữ giá trị của current_tab */
  const TAB_REF = useRef(current_tab)
  /** Tạo ref để giữ giá trị của is_show */
  const IS_SHOW_REF = useRef(show)

  useEffect(() => {
    // Cập nhật giá trị mới nhất của tab trong ref mỗi khi tab thay đổi
    TAB_REF.current = current_tab
    // Cập nhật giá trị là show trong ref một khi show thay đổi
    IS_SHOW_REF.current = show
  }, [current_tab, show])

  // hàm dispatch đến store
  const dispatch = useDispatch()

  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)

  /** List tin nhắn được lấy từ store */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)

  /** Tin nhắn mới nhất */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  const REF_LIST_UNREAD_MESSAGE = useRef(LIST_UNREAD_MESSAGE)

  useEffect(() => {
    REF_LIST_UNREAD_MESSAGE.current = LIST_UNREAD_MESSAGE
  }, [LIST_UNREAD_MESSAGE])

  /** Trạng thái đóng mở popup */
  const SHOW_POPUP = useSelector(selectStatusPopup)

  /** Độ rộng hiện tại của màn hình */
  const CURRENT_WIDTH = useSelector(selectCurrentWidth)

  useEffect(() => {
    /** @type {string} Lấy url của page cha */
    const FULL_SRC = window.location.href

    /**
     * Chuyển từ chuỗi URL thành một đối tượng URL.
     * @param {string} FULL_SRC - Chuỗi chứa URL đầy đủ
     * @returns {URL} Đối tượng URL được tạo ra từ chuỗi đầu vào
     */
    const URL_PARENT = new URL(FULL_SRC)
    const URL_PARAMS = new URLSearchParams(window.location.search)
    // Lấy giá trị locale từ URL

    /** Mặc định là 'vn' nếu không có locale */
    const LOCALE = URL_PARAMS.get('locale') || 'vn'

    // Thay đổi ngôn ngữ của SDK dựa trên locale từ URL
    i18next
      .changeLanguage(LOCALE)
      .then(() => {
        console.log('Language changed to:', LOCALE)
      })
      .catch((error) => {
        console.error('Error changing language:', error)
      })
    /** page_id từ URL page cha */
    const PAGE_ID = URL_PARENT.searchParams.get('page_id')

    // lưu page_id vào store
    /** Example @value :bf425487afbe403895116dd9b585537b  */
    dispatch(setPageId(PAGE_ID || ''))

    /** Độ rộng của màn hình trong page cha, truyền qua URL */
    const WIDTH_PARENT = URL_PARENT.searchParams.get('parentWidth')

    if (WIDTH_PARENT) {
      // nếu có truyền width thì lưu vào store
      dispatch(setCurrentWidth(Number(WIDTH_PARENT)))
    }
  }, [])

  /** Client ID lấy từ localStorage */
  const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)

  useEffect(() => {
    // Nếu không có PAGE_ID, thoát ngay
    if (!PAGE_ID) return
    // Khi có page_id và client_id thì Khởi tạo WebSocket
    if (CLIENT_ID && CLIENT_ID !== 'undefined') {
      onSocketFromChatboxServer(PAGE_ID, CLIENT_ID)
    }
    // Gọi API để lấy dữ liệu trang
    fetchPageData(PAGE_ID)

    // Lấy client_id từ localStorage, chỉ xử lý nếu hợp lệ
  }, [PAGE_ID, CLIENT_ID])

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

  /** Hàm đọc dữ liệu trang */
  const fetchPageData = async (page_id: String) => {
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
    console.log(RES?.data?.staffs)
  }
  /** Gọi api xác định danh tính khi mở WebSocket */
  const sendIdentifyMessage = (page_id: String | null, client_id: String) => {
    // Check điều kiện khi nào websocket đang readyState === websocket.OPEN thì mới gửi tin nhắn
    if (WS.current?.readyState === WebSocket.OPEN) {
      WS.current?.send(
        JSON.stringify({
          page_id: page_id || PAGE_ID,
          client_id: client_id,
          event: 'JOIN',
        })
      )
      // Khi kết nối thành công thì mới trigger để gọi tin nhắn khởi tạo
      // setIdentitySent(true)
    } else {
      // Nếu chưa kết nối mở lại gọi lai tin nhắn
      console.log('WebSocket is not open yet. Retrying...')
      setTimeout(sendIdentifyMessage, 100) // Thử lại sau 100ms nếu chưa kết nối
    }
  }

  /**  Cấu hình websocket */
  function onSocketFromChatboxServer(
    page_id: String | null,
    client_id: String
  ) {
    // Kết nối tới WebSocket server
    WS.current = new WebSocket(SOCKET_API || '')

    //Lưu lại id vòng lặp
    let ping_interval_id: number | any

    // kết nối được mở
    WS.current.onopen = () => {
      // Thông báo connect thành công
      console.log('WebSocket Connectedddd')

      // Gửi tin nhắn khởi tạo socket
      sendIdentifyMessage(page_id, client_id)

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

      /**
       * Phải lấy data trong REF,
       * Vì khi websocket, chỉ lưu giá trị lúc mới khởi tạo
       * Dù có thay đổi cũng không bắt được sự kiện
       */

      // nếu có tin nhắn. Popup đóng hoặc đang ở tab home
      if (message && (!IS_SHOW_REF.current || TAB_REF.current !== 'message')) {
        console.log('vao day')
        // setUnreadMessage((prevMessages) => [...prevMessages, message])
        /** Cần lưu ý (với data của redux, WS đang lưu giá trị [] ban đầu)
         * còn setList message thì lấy giá trị LIST_UNREAD_MESSAGE và push thêm tin nhắn vào.
         * Lúc này LIST_UNREAD_MESSAGE mặc định là []
         * dispatch(setListUnreadMessage([...LIST_UNREAD_MESSAGE, message]))
         */
        dispatch(
          setListUnreadMessage([...REF_LIST_UNREAD_MESSAGE.current, message])
        )

        dispatch(setLatestMessageGlobal(message))
      }
      // Nếu có tin nhắn popup mở và ở tab chat
      if (message && IS_SHOW_REF.current && TAB_REF.current === 'message') {
        // setLatestMessage(message)

        dispatch(setLatestMessageGlobal(message))
        /** Cần lưu ý (với data của redux, WS đang lưu giá trị [] ban đầu)
         * Vì Latest mesage chỉ gọi hàm setListMessage
         * còn setList message thì lấy giá trị LIST_MESSAGE và push thêm tin nhắn vào.
         * Lúc này LIST_MESSAGE mặc định là []
         * dispatch(setListMessage([...LIST_MESSAGE, message]))
         */
      }
    }

    // Khi kết nối bị đóng
    WS.current.onclose = () => {
      console.log('WebSocket Disconnected')
      // Loại bỏ vòng lặp tự động ping soket cũ
      clearInterval(ping_interval_id)

      // nếu đóng hoàn toàn thì không cho kết nổi tự mở lại nữa
      if (is_force_close_socket) return
      setTimeout(() => onSocketFromChatboxServer(page_id, client_id), 100)
    }

    // Nếu xảy ra lỗi
    WS.current.onerror = () => {
      WS.current?.close()
    }
  }

  // Ngăn kết nối mở lại
  useEffect(() => {
    return () => {
      closeSocketConnect()
    }
  }, [])
  /** Đóng kết nối socket */
  function closeSocketConnect() {
    // gắn cờ ngăn chặn kết nối mở lại
    setIsForceCloseSocket(true)
    WS.current?.close()
  }

  /** Chuyển từ Object thành mảng Array và lấy ra fb_staff_id và is_online */
  const EMPLOYEE_LIST: Employee[] = _.map(_.values(staff_list), (employee) => ({
    fb_staff_id: employee.fb_staff_id,
    is_online: employee.is_online,
  }))

  const checkStaffExist = (id: string) => {
    // Xem nhân viên nhắn tin có tồn tại trong list nhân viên không
    const IS_STAFF_EXIST = EMPLOYEE_LIST?.find((item) =>
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
  /** Chỉ lấy tin nhắn chưa đọc từ page, không lấy từ client */
  const LIST_UNREAD_MESSAGE_FILTER = LIST_UNREAD_MESSAGE.filter(
    (item) => item.message_type === 'page'
  )

  /** Trả về tên nhân viên
   * @param {string} message_metadata
   * @returns {string} Tên nhân viên
   */
  const renderStaffName = (message_metadata?: string) => {
    // Lấy ID từ message_metadata
    const ID_FROM_META_DATA = message_metadata?.split('__').pop() // Lấy phần sau cùng sau dấu '__'

    if (ID_FROM_META_DATA) {
      // Kiểm tra ID có trong data không và lấy tên
      const STAFF_NAME = _.get(staff_list, ID_FROM_META_DATA, null)?.name
      return STAFF_NAME ? STAFF_NAME : 'Nhân viên'
    }
  }

  /** Hàm Xử lý gửi tin nhắn */
  const sendMessage = async (input: any) => {
    // Nhắn toàn khoảng trắng không cho gửi đi
    if (input.trim() === '') return
    // Tiến hành gửi tin nhắn
    try {
      // Khởi tạo body tin nhắn
      if (CLIENT_ID) {
        const message: Message = {
          page_id: PAGE_ID,
          client_id: CLIENT_ID,
          text: input,
        }
        // Gọi api gửi tin nhắn
        await fetchAPI(SEND_MESSAGE_API, 'POST', message)
        dispatch(setListUnreadMessage([]))
        dispatch(setLatestMessageGlobal(null))
        postMessageToParent(false, false)
      }
    } catch (error) {
    } finally {
    }
  }
  // console.log(LIST_UNREAD_MESSAGE, 'LIST_UNREAD_MESSAGE')
  // console.log(LATEST_MESSAGE, 'LATEST_MESSAGE')
  // console.log(LIST_UNREAD_MESSAGE_FILTER, 'LIST_UNREAD_MESSAGE_FILTER')
  // console.log(REF_LIST_UNREAD_MESSAGE, 'REF_LIST_UNREAD_MESSAGE')
  const LAST_TIME_CLOSE = localStorage.getItem(`last_time_close__${PAGE_ID}`)
  console.log(LAST_TIME_CLOSE, 'LAST_TIME_CLOSE')
  return (
    <div
      className={`flex flex-col  ${
        // Nếu không show, thì hiện icon bong bóng chat
        !show && LIST_UNREAD_MESSAGE_FILTER.length === 0
          ? 'w-16 h-[72px] items-center justify-center pb-4 pt-2'
          : // Nếu không show, có tin nhắn chưa đọc thì hiện tin nhắn mới nhất đó
          !show &&
            LIST_UNREAD_MESSAGE_FILTER.length > 0 &&
            LATEST_MESSAGE?.message_type === 'page'
          ? 'w-[302px] h-56 items-end justify-between pb-4 px-2'
          : // Nếu kích thước điện thoại thì hiện full screen
          CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
          ? ' w-screen h-screen '
          : // Nếu màn PC thì hiện thành 1 tab nhỏ
            ' w-[416px] h-[674px] px-2 pb-4 justify-between items-end'
      }  `}
    >
      {show && (
        <div
          className={`relative  ${
            // Phần chính của bong bóng chat
            CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
              ? ' w-screen h-screen rounded-none '
              : ' w-[400px] h-[600px] '
          } bg-bg-gradient rounded-[20px] overflow-hidden shadow-md ${
            // mặc định sẽ ẩn/ Khi kich hoạt sẽ mở kèm animation
            !show && LIST_UNREAD_MESSAGE_FILTER.length === 0
              ? ' hidden'
              : ' flex flex-col animate-zoomInBottomRight transition-transform duration-200 ease-in-out '
          }  `}
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
                  // Khi back ra thì về trang Home
                  setCurrentTab('home')

                  /** Reset store khi thoát khỏi màn chat */
                  // 1. Tin nhắn mới nhất
                  dispatch(setLatestMessageGlobal(null))
                  // 2. Reset danh sách tin nhắn trong store
                  dispatch(setListMessage([]))
                  // 3. Danh sách tin nhắn chưa đọc
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

                          if (PAGE_ID === null) {
                            // Không có page_id thì tạo message Lỗi
                            setErrorMessage(t('errorMessage'))
                          }
                        }
                      }}
                    >
                      <div className="relative">
                        <div className="">
                          {value === 'message' &&
                            LIST_UNREAD_MESSAGE_FILTER?.length > 0 && (
                              <div className="flex justify-center items-center text-xxs text-white border absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full translate-x-1 -translate-y-1">
                                {LIST_UNREAD_MESSAGE_FILTER?.length < 10
                                  ? LIST_UNREAD_MESSAGE_FILTER?.length
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
      <div
        className={`${
          !show &&
          LATEST_MESSAGE?.message_type === 'page' &&
          LIST_UNREAD_MESSAGE_FILTER?.length > 0
            ? 'flex flex-col w-[286px] h-[142px] justify-between'
            : 'hidden'
        }`}
      >
        <div className="flex h-full w-full">
          {LATEST_MESSAGE?.message_type === 'page' && (
            <div className="flex flex-col w-full gap-2">
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex gap-x-1 flex-grow min-h-0 justify-start items-end`}
              >
                <div className="flex rounded-lg flex-shrink-0">
                  {LATEST_MESSAGE?.message_type === 'page' && (
                    <img
                      src={
                        checkStaffExist(LATEST_MESSAGE?.message_metadata) ||
                        './images/earth.svg'
                      }
                      className="w-8 h-8 rounded-lg "
                      alt=""
                    />
                  )}
                </div>
                <div className="flex flex-col flex-grow min-w-0 h-full bg-white shadow-md rounded-xl p-3">
                  <div className="flex justify-between items-center w-full">
                    <h4 className="text-slate-500 text-xs font-medium flex items-center truncate">
                      {renderStaffName(LATEST_MESSAGE?.message_metadata)}
                      <span className="mx-0.5">{t('from')}</span>
                      <span className="mx-0.5">{page_name}</span>
                      <span className="mx-0.5">•</span>
                      <span className="text-slate-500 text-xs font-medium">
                        {calculateTimeAgo(LATEST_MESSAGE?.createdAt)}
                      </span>
                    </h4>
                    <div
                      onClick={() => {
                        // Reset hết data
                        dispatch(setLatestMessageGlobal(null))
                        dispatch(setListUnreadMessage([]))
                        dispatch(setListMessage([]))

                        // Lưu thời gian vào localstorage Khi đóng tin nhắn mới
                        saveTimeClosePopup(PAGE_ID)
                        // post message 1 lần nữa
                        postMessageToParent(false, false)
                      }}
                      className="h-5 w-5 cursor-pointer flex justify-center items-center"
                    >
                      <CloseSlate className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Phần nội dung tin nhắn được hiển thị */}
                  <h4 className="line-clamp-2 text-sm">
                    {LATEST_MESSAGE?.message_text}
                  </h4>
                </div>
              </div>
              <div className="flex gap-x-2">
                <div className="w-8 h-8"></div>
                <InputQuickChat
                  handleSend={(e: string) => {
                    sendMessage(e)
                  }}
                  staff_name={renderStaffName(LATEST_MESSAGE?.message_metadata)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/*  Nút trigger hiện thị bong bóng chat */}
      <button
        onClick={() => {
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
            // Khi không có tin nhắn, hoặc đang show, thì không hiện
            LIST_UNREAD_MESSAGE_FILTER?.length === 0 || show
              ? 'hidden'
              : 'flex justify-center items-center'
          } text-white text-xs truncate right-0 top-0 bg-red-500 h-5 w-5 rounded-full border-2 border-white translate-x-1 -translate-y-1`}
        >
          {LIST_UNREAD_MESSAGE_FILTER?.length < 10
            ? LIST_UNREAD_MESSAGE_FILTER?.length
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
