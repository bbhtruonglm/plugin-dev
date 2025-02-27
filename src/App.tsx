import './App.css'
import './i18n'

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
  setGlobalClientId,
  setGlobalPreviewUrl,
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setListMessage,
  setLoadingGlobal,
  setNoViewport,
  setPageId,
  setPageInfoAI,
  setRefreshData,
  setStatusIsAI,
  setStatusPopup,
  setSuggestMessage,
  setUserInfo,
} from './stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import ChatApp from './pages/ChatApp'
import WIDGET from 'bbh-chatbox-widget-js-sdk'
import i18next from './i18n'

/**
 * Hàm lấy tham số từ URL
 * @param param  - Tham số cần lấy
 * @returns
 */
function getQueryParam(param: string) {
  /**
   * Lấy tham số từ URL
   */
  const URL_PARAMS = new URLSearchParams(window.location.search)
  /**
   * Trả về tham số cần lấy
   */
  return URL_PARAMS.get(param)
}

function App() {
  useEffect(() => {
    /**
     * Load WIDGET nếu trang hiện tại là trang AI Assistant
     */
    if (window.location.pathname.includes('/ai-assistant')) {
      /**
       * Lấy token từ URL
       */
      // const TOKEN = getQueryParam('access_token')
      /**
       * Nếu có token thì load WIDGET
       */
      // if (TOKEN) {
        try {
          /**
           * Bật chế độ debug
           */
          WIDGET.debugOn()
          /**
           * Load WIDGET
           */
          WIDGET.load('00de4446885a43c5b58ef16dba0f5058')
        } catch (error) {
          console.error('Lỗi khi giải mã token:', error)
        }
      // } else {
      //   console.warn('Không tìm thấy token trong URL')
      // }
    } else {
      console.warn('Không phải trang AI Assistant, bỏ qua việc load WIDGET')
    }
    /** Chạy 1 lần khi component mount */
  }, [])

  /**
   *  Hàm giải mã dữ liệu khách hàng
   * @returns {Promise<Object>} - Dữ liệu khách hàng
   */
  const decodeClientData = async () => {
    WIDGET.onEvent(async (e: any, value: any) => {
      if (value?.type === 'CLIENT_MESSAGE') {
        // dispatch(setSuggestMessage(value?.playload?.message))
        return
      } else {
        /**
         * dispatch để reset data
         */
        dispatch(setRefreshData(true))
        /**
         * Xoá danh sách tin nhắn
         */
        dispatch(setListMessage([]))
        /**
         * Xoá tin nhắn mới nhất
         */
        dispatch(setLatestMessageGlobal(null))
        /**
         * Reset lại client_id Mỗi khi phát hiện có sự kiện mới
         */
        dispatch(setGlobalClientId(''))
        /**
         * Reset tin nhắn suggest
         */
        dispatch(setSuggestMessage(''))

        /**
         * setLoading global là true
         */
        dispatch(setLoadingGlobal(true))
        /** ghi lại thông tin khách hàng mới */
        let client = await WIDGET.getClientInfo()
        console.log('CHẠY VÀO ĐÂY USER_INFO hàm decode', client)
        /**
         * PAGE_ID mới
         */
        const N_PAGE_ID = client?.public_profile?.ai_agent_id
        /**
         * ID khách hàng mới
         */
        const N_CLIENT_ID =
          client?.public_profile?.page_id +
          '__' +
          client?.public_profile?.fb_client_id

        /**
         * Nếu client_id mới khác client_id cũ thì mới reset lại
         */
        // if (N_CLIENT_ID !== CLIENT_ID_LOCAL) {
        /**
         * Reset lại client_id
         */
        localStorage.setItem(`client_id_${N_PAGE_ID}`, '')

        console.log('CHẠY VÀO ĐÂY USER_INFO hàm refresh', client)

        /**
         * Gửi tin nhắn Cập nhật lại client_id
         */

        dispatch(
          setUserInfo({
            user_name: '',
            user_email: '',
            user_phone: '',
            client_id: N_CLIENT_ID,
          })
        )
      }
    })
  }
  /**
   * Hàm giải mã dữ liệu khách hàng
   * @returns {Promise<Object>} - Dữ liệu khách hàng
   */
  const decodeInitClientData = async () => {
    /** khai báo biến lưu trữ dữ liệu khách hàng + init dữ liệu lần đầu */
    let client = await WIDGET.getClientInfo()
    return client
  }

  /**
   * @type {Object} API - API lấy thông tin khách hàng
   * @type {string} READ_CLIENT_INFO - URL API lấy thông tin khách hàng
   */
  const { READ_CLIENT_INFO } = useAPI()

  /** Trạng thái hiển thị Popup */
  const [is_show, setShow] = useState(false)
  /**
   * Trạng thái hiển thị Popup tư vấn
   */
  const [type_consultation, setTypeConsultation] = useState(false)

  /** Page_id được lưu trong Store */
  const PAGE_ID = useSelector(selectPageId)

  /** Client_id được lưu trong localStorage theo Page_id */
  const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)

  /** Dispatch */
  const dispatch = useDispatch()

  /** Tên client */
  const [client_name, setClientName] = useState(null as any)

  /** Hàm xử lý thông điệp từ parent
   * @param {MessageEvent} event - Sự kiện tin nhắn
   */
  const handleMessage = (event: MessageEvent) => {
    /** @type {Object} PAYLOAD - Dữ liệu từ event */
    const PAYLOAD = event.data
    console.log('EVENT::', event)
    /**
     * @type {string} user_name - Tên người dùng
     * @type {string} user_email - Email người dùng
     * @type {string} user_phone - Số điện thoại người dùng
     * @type {string} client_id - ID người dùng
     * @type {string} from - Nguồn gửi tin nhắn
     * @type {string} action - Hành động từ app cha
     * @type {string} locale - Ngôn ngữ
     */
    const { user_name, user_email, user_phone, client_id, from, action, type } =
      PAYLOAD
    console.log('DATA::', PAYLOAD)
    if (from === 'CHATBOX' && type === 'CLIENT_MESSAGE') {
      dispatch(setSuggestMessage(PAYLOAD?.payload?.message))
    }

    /** Kiểm tra thông tin từ app cha */
    if (from === 'parent-app') {
      console.log(
        'Nhận tin nhắn từ app cha. Thông tin nhận được là:',
        event.data
      )
      /**
       * Nếu có action thì hiển thị popup
       */
      if (action) {
        /**
         * Lưu kiểu type_consultation là true để hiển thị popup tư vấn
         */
        setTypeConsultation(true)
        /**
         * Kiểm tra xem popup đã mở chưa
         */
        if (!is_show) {
          /**
           * Nếu mở chỉ reset tin nhắn mới nhất trong store
           */
          dispatch(setListMessage([]))
          /**
           *  Hiển thị popup
           */
          setShow(true)
        }
      }

      /** Lưu thông tin user vào store
       * Chỉ lưu thông tin nếu có giá trị
       */
      dispatch(
        setUserInfo({
          ...(user_name && { user_name }),
          ...(user_email && { user_email }),
          ...(user_phone && { user_phone }),
          ...(client_id && { client_id }),
        })
      )
    }
  }

  useEffect(() => {
    /** Thêm event listener cho thông điệp */
    window.addEventListener('message', handleMessage)
    /**
     * Hàm giải mã dữ liệu khách hàng
     */
    decodeClientData()

    /** Hàm cleanup */
    return () => {
      /** Xóa event listener */
      window.removeEventListener('message', handleMessage)
      decodeClientData()
    }
  }, [])

  useEffect(() => {
    /**
     * Hàm lấy dữ liệu
     */
    const fetchData = async () => {
      try {
        /** @type {string} Lấy url của page cha */
        const FULL_SRC = window.location.href
        /** @type {URL} URL_PARENT - URL của page cha */
        const URL_PARENT = new URL(FULL_SRC)
        /** @type {URLSearchParams} URL_PARAMS - Tham số của URL */
        const URL_PARAMS = new URLSearchParams(window.location.search)

        console.log('URL_PARENT::', URL_PARENT)
        /**
         * Kiểm tra xem có phải AI không
         */
        const IS_AI = URL_PARENT?.pathname.includes('ai-assistant')
        /**
         * Lưu trạng thái AI vào store
         */
        dispatch(setStatusIsAI(IS_AI))

        /**
         * Cập nhật trạng thái hiển thị popup
         */
        setShow(IS_AI)

        /**
         * Lấy ngôn ngữ từ URL
         */
        const LOCALE = URL_PARAMS.get('locale') || 'vn'
        /**
         * Thay đổi ngôn ngữ
         */
        await i18next.changeLanguage(LOCALE)
        console.log('Language changed to::', LOCALE)

        if (IS_AI) {
          /** Sử dụng await để lấy dữ liệu CLIENT_INFO */
          const CLIENT_INFO = await decodeInitClientData()

          console.log(CLIENT_INFO, 'CLIENT_INFO CHẠY VÀO ĐÂY')
          /**
           * New CLIENT ID
           */
          const NEW_CLIENT_ID =
            CLIENT_INFO?.public_profile?.page_id +
            '__' +
            CLIENT_INFO?.public_profile?.fb_client_id
          console.log(NEW_CLIENT_ID, 'newclientid')

          /** Dữ liệu khách hàng */
          const DATA_CLIENT = {
            ai_agent_id: CLIENT_INFO?.public_profile?.ai_agent_id || '',
            page_id: CLIENT_INFO?.public_profile?.page_id || '',
            fb_client_id: CLIENT_INFO?.public_profile?.fb_client_id || '',
            page_name: CLIENT_INFO?.public_profile?.page_name || '',
            current_staff_name:
              CLIENT_INFO?.public_profile?.current_staff_name || '',
            is_active_ai_agent:
              CLIENT_INFO?.public_profile?.is_active_ai_agent || false,
          }

          /** Lưu thông tin khách hàng vào store */
          dispatch(setPageInfoAI(DATA_CLIENT))
          dispatch(setRefreshData(true))
          /**
           * Nếu có client_id mới thì lưu vào store
           */
          if (NEW_CLIENT_ID) {
            dispatch(
              setUserInfo({
                user_name: '',
                user_email: '',
                user_phone: '',
                client_id: NEW_CLIENT_ID,
              })
            )
          }
          /** Lấy page_id */
          const STORED_PAGE_ID = CLIENT_INFO?.public_profile?.ai_agent_id || ''
          /**
           * Lưu page_id vào store
           */
          dispatch(setPageId(STORED_PAGE_ID || ''))
        } else {
          /** Lấy page_id */
          const STORED_PAGE_ID = URL_PARENT.searchParams.get('page_id') || ''
          /**
           * Lưu page_id vào store
           */
          dispatch(setPageId(STORED_PAGE_ID || ''))
          /**
           * Cập nhật thông tin kích thước của parent
           */
          /** 1. Width của parent */
          const WIDTH_PARENT = URL_PARENT.searchParams.get('parentWidth')
          /** 2. Height của parent */
          const HEIGHT_PARENT = URL_PARENT.searchParams.get('parentHeight')
          /** 3. Kiểm tra có viewport không */
          const HAS_VIEWPORT = URL_PARENT.searchParams.get('has_viewport')
          /**
           * Nếu không có viewport thì setNoViewport(true)
           */
          if (HAS_VIEWPORT === 'false') {
            dispatch(setNoViewport(true))
          }
          /**
           * Nếu có WIDTH_PARENT thì cập nhật width
           */
          if (WIDTH_PARENT) {
            dispatch(setCurrentWidth(Number(WIDTH_PARENT)))
          }
          /**
           * Nếu có HEIGHT_PARENT thì cập nhật height
           */
          if (HEIGHT_PARENT) {
            dispatch(setCurrentHeight(Number(HEIGHT_PARENT)))
          }
          /**
           * Lấy client_id từ localStorage
           */
          const STORED_CLIENT_ID = localStorage.getItem(
            `client_id_${STORED_PAGE_ID}`
          )
          /**
           * Lấy dữ liệu khách hàng
           */
          fetchClientData(STORED_CLIENT_ID, STORED_PAGE_ID)
          /**
           * Lấy tin nhắn mới nhất
           */
          const STORED_MESSAGE_LATEST = parsedString(
            localStorage.getItem(
              `latest_message__${STORED_PAGE_ID}__${STORED_CLIENT_ID}`
            ) || ''
          )
          /**
           * Lấy số tin nhắn chưa đọc
           */
          const STORED_UNREAD_COUNT = Number(
            localStorage.getItem(
              `count_unread__${STORED_PAGE_ID}__${STORED_CLIENT_ID}`
            )
          )
          /** Lưu trạng thái hiển thị popup */

          localStorage.setItem(
            `status_quick_chat__${STORED_PAGE_ID}`,
            'show_quick_chat'
          )
          /**
           * Lưu tin nhắn mới nhất vào store
           */
          dispatch(setLatestMessageGlobal(STORED_MESSAGE_LATEST))
          /**
           * Lưu số tin nhắn chưa đọc vào store
           */
          dispatch(setGlobalUnreadCount(STORED_UNREAD_COUNT || 0))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
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
    page_id: string | null
  ) => {
    /** Nếu không có client_id hoặc page_id thì setClientName(null) */
    if (!client_id || !page_id) {
      /** Set tên client là null */
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
    /** Thêm search vào URL */
    URL_READ.search = new URLSearchParams(BODY as any).toString()
    /** Lấy thông tin client */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')
    /** Lưu tên client */
    setClientName(RES?.data?.client_name)
  }

  return (
    <div
      className="flex flex-col justify-center items-center h-full w-full overflow-hidden "
      id="bbh-chat-plugin"
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
                  dispatch(setGlobalPreviewUrl(''))
                  /** Lưu tin nhắn mới nhất vào store */
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_ID, null)
                } else {
                  /** Lưu thời gian vào localstorage Khi đóng popup */
                  saveTimeClosePopup(PAGE_ID)
                  /**
                   * Lưu trạng thái tư vấn là false
                   */
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
                  dispatch(setGlobalPreviewUrl(''))
                  saveQuickChatLatestMessage(PAGE_ID, CLIENT_ID, null)
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
