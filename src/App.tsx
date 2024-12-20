import './App.css'
import './i18n' // Import cấu hình i18n

import { Route, Routes } from 'react-router-dom'
import { fetchAPI, useAPI } from './api/api'
import {
  parsedString,
  postMessageToParent,
  saveQuickChatLatestMessage,
  saveTimeClosePopup,
} from './utils'
import {
  selectPageId,
  setCurrentHeight,
  setCurrentWidth,
  setGlobalPreviewUrl,
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setListMessage,
  setNoViewport,
  setPageId,
  setStatusIsAI,
  setStatusPopup,
  setUserInfo,
} from './stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import ChatApp from './pages/ChatApp'
import i18next from './i18n'

function App() {
  const { READ_CLIENT_INFO } = useAPI()
  /** Trạng thái hiển thị Popup */
  const [is_show, setShow] = useState(false)
  const [type_consultation, setTypeConsultation] = useState(false)

  /** Page_id được lưu trong Store */
  const PAGE_ID = useSelector(selectPageId)

  /** Client_id được lưu trong localStorage theo Page_id */
  const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)

  /**
   * is_ai - Trạng thái hiển thị AI
   */
  const [is_ai, setIsAi] = useState(false)

  /** Dispatch */
  const dispatch = useDispatch()

  /** Tên client */
  const [client_name, setClientName] = useState(null as any)

  useEffect(() => {
    /** Hàm xử lý thông điệp từ parent */
    const handleMessage = (event: MessageEvent) => {
      /** @type {Object} PAYLOAD - Dữ liệu từ event */
      const PAYLOAD = event.data

      /**
       * @type {string} user_name - Tên người dùng
       * @type {string} user_email - Email người dùng
       * @type {string} user_phone - Số điện thoại người dùng
       * @type {string} from - Nguồn gửi tin nhắn
       */
      const { user_name, user_email, user_phone, from, action } = PAYLOAD
      // console.log(event, 'event')
      /** Kiểm tra thông tin từ app cha */
      if (from === 'parent-app') {
        console.log(
          'Nhận tin nhắn từ app cha. Thông tin nhận được là:',
          event.data
        )
        console.log(action, 'action consultation')
        if (action) {
          setTypeConsultation(true)
          if (!is_show) {
            dispatch(setListMessage([]))
            setShow(true)
          }
        }
        /** Lấy thông tin user từ event */
        /** Lưu thông tin user vào store */
        dispatch(
          setUserInfo({
            user_name,
            user_email,
            user_phone,
          })
        )
      }
    }

    // Thêm event listener cho thông điệp
    window.addEventListener('message', handleMessage)

    // Cleanup event listener khi component bị unmount
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

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
    // setIsAi(URL_PARAMS.get('is_ai') === 'true')

    // const IS_AI = URL_PARAMS.get('is_ai') === 'true'
    const IS_AI = URL_PARENT?.pathname.includes('ai-assistant')

    dispatch(setStatusIsAI(IS_AI))

    setShow(IS_AI)
    /**
     * Lấy giá trị locale từ URL
     * Mặc định là 'vn' nếu không có locale */
    const LOCALE = URL_PARAMS.get('locale') || 'vn'

    /** Thay đổi ngôn ngữ của SDK dựa trên locale từ URL */
    i18next
      .changeLanguage(LOCALE)
      .then(() => {
        console.log('Language changed to:', LOCALE)
      })
      .catch((error) => {
        console.error('Error changing language:', error)
      })

    /** Lấy page_id */
    const STORED_PAGE_ID =
      URL_PARENT.searchParams.get('page_id') || '388339911461476'

    /** lưu page_id vào store */
    /** Example @value :bf425487afbe403895116dd9b585537b || 2204445623215564 || 100179064765476 || 388339911461476 || 5c290e88a5304e8e84ce8a8804b764e4 */
    dispatch(setPageId(STORED_PAGE_ID || ''))

    /** Lấy Độ rộng của page cha từ URL */
    const WIDTH_PARENT = URL_PARENT.searchParams.get('parentWidth')
    const HEIGHT_PARENT = URL_PARENT.searchParams.get('parentHeight')
    /**
     * @type {string} HAS_VIEWPORT - Trạng thái có viewport hay không
     */
    const HAS_VIEWPORT = URL_PARENT.searchParams.get('has_viewport')

    console.log(HAS_VIEWPORT, 'HAS_VIEWPORT')

    if (HAS_VIEWPORT === 'false') {
      /** Nếu không có viewport thì set lại viewport */

      dispatch(setNoViewport(true))
    }

    if (WIDTH_PARENT) {
      /** nếu có truyền width thì lưu vào store */
      dispatch(setCurrentWidth(Number(WIDTH_PARENT)))
    }

    if (HEIGHT_PARENT) {
      /** nếu có truyền height thì lưu vào store */
      dispatch(setCurrentHeight(Number(HEIGHT_PARENT)))
    }

    // localStorage.setItem(`client_id_<${PAGE_ID}>`, '6131478076934694')
    /** CLIENT_ID từ localStorage thông qua PAGE_ID */
    const STORED_CLIENT_ID = localStorage.getItem(
      `client_id_<${STORED_PAGE_ID}>`
    )

    fetchClientData(STORED_CLIENT_ID, STORED_PAGE_ID)

    /** Lấy từ localStorage một tin nhắn chưa đọc */
    const STORED_MESSAGE_LATEST = parsedString(
      localStorage.getItem(
        `latest_message__<${STORED_PAGE_ID}>__<${STORED_CLIENT_ID}>`
      ) || ''
    )

    /** Lấy số lượng tin nhắn chưa đọc */
    const STORED_UNREAD_COUNT = Number(
      localStorage.getItem(
        `count_unread__<${STORED_PAGE_ID}>__<${STORED_CLIENT_ID}>`
      )
    )

    /** Bật show QUICK_CHAT lên */
    localStorage.setItem(
      `status_quick_chat__${STORED_PAGE_ID}`,
      'show_quick_chat'
    )

    /** Lưu tin nhắn mới nhất từ localStorage vào Store */
    dispatch(setLatestMessageGlobal(STORED_MESSAGE_LATEST))
    /** Lưu số tin nhắn chưa đọc từ localStorage vào Store */
    dispatch(setGlobalUnreadCount(STORED_UNREAD_COUNT || 0))
  }, [])

  /** Function tắt bật của popup dạng PC */
  const handleToggle = () => {
    /** Lưu vào store  trạng thái đóng mở của popup*/
    dispatch(setStatusPopup(!is_show))
    /** Gọi tới parent để hiện thị popup */
    postMessageToParent(!is_show, false)
  }

  /** Function tắt báo popup dạng Mobile*/
  const handleOff = () => {
    /** Lưu vào store trạng thái đóng của popup*/
    dispatch(setStatusPopup(false))
    /** Gọi tới parent để đóng popup */
    postMessageToParent(false, false)
  }

  /** Hàm đọc data khách hàng
   * @param {string} client_id - ID khách hàng
   * @param {string} page_id - ID trang
   *
   */
  const fetchClientData = async (
    client_id: string | null,
    page_id: String | null
  ) => {
    if (!client_id || !page_id) {
      setClientName(null)
      return
    }

    /** Body lấy thông tin Client */
    const BODY = {
      client_id: client_id,
      page_id: page_id,
    }
    /** Lấy URL */
    const URL_READ = new URL(READ_CLIENT_INFO)

    URL_READ.search = new URLSearchParams(BODY as any).toString()

    /** Lấy thông tin client */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')

    /** Lưu tên client */
    setClientName(RES?.data?.client_name)
  }

  return (
    <div
      className="flex flex-col justify-center items-center h-full w-full overflow-hidden"
      id="bbh-chart-plugin"
    >
      <Routes>
        <Route
          path="/"
          element={
            <ChatApp
              handleBtn={(e) => {
                /**
                 * Nếu e !== 'no_toggle' thì gọi hàm handleToggle
                 */
                if (e !== 'no_toggle') {
                  handleToggle()
                }
                setShow(!is_show)
                if (!is_show) {
                  /** Khi mở chỉ reset tin nhắn mới nhất trong store */
                  // dispatch(setLatestMessageGlobal(null))
                  dispatch(setGlobalPreviewUrl(''))
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_ID, null)

                  // dispatch(setListUnreadMessage([]))
                  // dispatch(setListMessage([]))
                } else {
                  /** Lưu thời gian vào localstorage Khi đóng popup */
                  saveTimeClosePopup(PAGE_ID)
                  setTypeConsultation(false)
                }
              }}
              show={is_show}
              setHideForMobile={() => {
                setShow(false)
                dispatch(setGlobalPreviewUrl(''))
                /** Lưu thời gian vào localstorage Khi đóng popup */
                saveTimeClosePopup(PAGE_ID)
                handleOff()
              }}
              client_name={client_name}
              consultation={type_consultation}
            />
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ChatApp
              handleBtn={(e) => {
                /**
                 * Nếu e !== 'no_toggle' thì gọi hàm handleToggle
                 */
                if (e !== 'no_toggle') {
                  handleToggle()
                }

                setShow(!is_show)
                if (!is_show) {
                  /** Khi mở chỉ reset tin nhắn mới nhất trong store */
                  // dispatch(setLatestMessageGlobal(null))
                  dispatch(setGlobalPreviewUrl(''))
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_ID, null)
                  // dispatch(setListUnreadMessage([]))
                  // dispatch(setListMessage([]))
                } else {
                  /** Lưu thời gian vào localstorage Khi đóng popup */
                  saveTimeClosePopup(PAGE_ID)
                }
              }}
              show={is_show}
              setHideForMobile={() => {
                setShow(false)
                dispatch(setGlobalPreviewUrl(''))
                /** Lưu thời gian vào localstorage Khi đóng popup */
                saveTimeClosePopup(PAGE_ID)
                handleOff()
              }}
              client_name={client_name}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
