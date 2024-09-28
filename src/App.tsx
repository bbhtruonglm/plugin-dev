import './App.css'
import './i18n' // Import cấu hình i18n

import {
  parsedString,
  postMessageToParent,
  saveQuickChatLatestMessage,
  saveTimeClosePopup,
} from './utils'
import {
  selectPageId,
  setCurrentWidth,
  setGlobalPreviewUrl,
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setPageId,
  setStatusPopup,
} from './stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import ChatApp from './screens/ChatApp'
import i18next from './i18n'

function App() {
  /** Trạng thái hiển thị Popup */
  const [is_show, setShow] = useState(false)
  /** Page_id được lưu trong Store */
  const PAGE_ID = useSelector(selectPageId)
  /** Client_id được lưu trong localStorage theo Page_id */
  const CLIENT_ID = localStorage.getItem(`client_id_<${PAGE_ID}>`)
  /** Hàm dispatch */
  const dispatch = useDispatch()

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
      URL_PARENT.searchParams.get('page_id') || '100179064765476'

    /** lưu page_id vào store */
    /** Example @value :bf425487afbe403895116dd9b585537b || 100179064765476 || 5c290e88a5304e8e84ce8a8804b764e4 */
    dispatch(setPageId(STORED_PAGE_ID || ''))

    /** Lấy Độ rộng của page cha từ URL */
    const WIDTH_PARENT = URL_PARENT.searchParams.get('parentWidth')

    if (WIDTH_PARENT) {
      /** nếu có truyền width thì lưu vào store */
      dispatch(setCurrentWidth(Number(WIDTH_PARENT)))
    }

    localStorage.setItem(`client_id_<${PAGE_ID}>`, '6131478076934694')
    /** CLIENT_ID từ localStorage thông qua PAGE_ID */
    const STORED_CLIENT_ID = localStorage.getItem(
      `client_id_<${STORED_PAGE_ID}>`
    )

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

  return (
    <div className="flex flex-col justify-center items-center h-fit w-fit overflow-hidden">
      <ChatApp
        handleBtn={() => {
          handleToggle()
          setShow(!is_show)
          if (!is_show) {
            /** Khi mở chỉ reset tin nhắn mới nhất trong store */
            dispatch(setLatestMessageGlobal(null))
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
      />
    </div>
  )
}

export default App
