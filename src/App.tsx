import './App.css'
import './i18n' // Import cấu hình i18n

import { postMessageToParent, saveTimeClosePopup } from './utils'
import {
  selectLatestMessage,
  selectListUnreadMessage,
  selectPageId,
  setLatestMessageGlobal,
  setStatusPopup,
} from './stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import ChatApp from './screens/ChatApp'

function App() {
  const [is_show, setShow] = useState(false)
  const PAGE_ID = useSelector(selectPageId)
  const dispatch = useDispatch()

  /** Tin nhắn chưa đọc/tin nhắn mới nhất */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)

  /** Tin nhắn mới nhất */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  useEffect(() => {
    /** Lấy URL từ parent */
    const FULL_SRC = window.location.href
    /** Tạo đối tượng URL parent */
    const URL_PARENT = new URL(FULL_SRC)
    /** Lấy page_id */
    const STORED_PAGE_ID =
      URL_PARENT.searchParams.get('page_id') ||
      'bf425487afbe403895116dd9b585537b'
    /** CLIENT_ID từ localStorage thông qua PAGE_ID */
    const STORED_CLIENT_ID = localStorage.getItem(
      `client_id_<${STORED_PAGE_ID}>`
    )

    console.log('STORED_PAGE_ID', STORED_PAGE_ID)
    console.log('STORED_CLIENT_ID', STORED_CLIENT_ID)
    /** Lấy từ localStorage một tin nhắn chưa đọc */
    const STORED_MESSAGE_LATEST = localStorage.getItem(
      `latest_message__<${STORED_PAGE_ID}>__<${STORED_CLIENT_ID}>`
    )
    /** Lấy số lượng tin nhắn chưa đọc */
    const STORED_UNREAD_COUNT = localStorage.getItem(
      `count_unread__<${STORED_PAGE_ID}>__<${STORED_CLIENT_ID}>`
    )
    /** Lấy thời gian đóng QUICK_CHAT */
    const STORED_CLOSE_TIME = localStorage.getItem(
      `last_time_close__${STORED_PAGE_ID}`
    )
    console.log(
      STORED_MESSAGE_LATEST,
      '==========',
      STORED_UNREAD_COUNT,
      '==========',
      STORED_CLOSE_TIME
    )
  }, [])
  /** Function tắt bật của popup dạng PC */
  const handleToggle = () => {
    /** Lưu vào store  trạng thái đóng mở của popup*/
    dispatch(setStatusPopup(!is_show))
    // Gọi tới parent để hiện thị popup
    postMessageToParent(!is_show, false)
  }

  /** Function tắt báo popup dạng Mobile*/
  const handleOff = () => {
    /** Lưu vào store trạng thái đóng của popup*/
    dispatch(setStatusPopup(false))
    // Gọi tới parent để đóng popup
    postMessageToParent(false, false)
  }

  return (
    <div className="flex flex-col justify-center items-center h-fit w-fit overflow-hidden">
      <ChatApp
        handleBtn={() => {
          handleToggle()
          setShow(!is_show)
          if (!is_show) {
            // Khi mở chỉ reset tin nhắn mới nhất trong store
            dispatch(setLatestMessageGlobal(null))
            // dispatch(setListUnreadMessage([]))
            // dispatch(setListMessage([]))
          } else {
            // Lưu thời gian vào localstorage Khi đóng popup
            saveTimeClosePopup(PAGE_ID)
          }
        }}
        show={is_show}
        setHideForMobile={() => {
          setShow(false)

          // Lưu thời gian vào localstorage Khi đóng popup
          saveTimeClosePopup(PAGE_ID)

          handleOff()
        }}
      />
    </div>
  )
}

export default App
