import './App.css'
import './i18n' // Import cấu hình i18n

import { postMessageToParent, saveTimeClosePopup } from './utils'
import {
  selectLatestMessage,
  selectListUnreadMessage,
  selectPageId,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
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
    // Tin nhắn mới nhất từ Page && danh sách tin nhắn chưa đọc > 0 && popup đang đóng
    // if (
    //   !is_show &&
    //   LIST_UNREAD_MESSAGE.length > 0 &&
    //   LATEST_MESSAGE?.message_type === 'page' &&
    //   LATEST_MESSAGE?.message_attachments &&
    //   (LATEST_MESSAGE?.message_attachments[0]?.type === 'image' ||
    //     LATEST_MESSAGE?.message_attachments[0]?.type === 'video')
    // ) {
    //   // Gọi tới parent để hiển thị popup
    //   return postMessageToParent(false, true, 312)
    // }
    // Tin nhắn mới nhất từ Page && danh sách tin nhắn chưa đọc > 0 && popup đang đóng
    // if (
    //   LATEST_MESSAGE?.message_type === 'page' &&
    //   LIST_UNREAD_MESSAGE?.length > 0 &&
    //   !is_show
    // ) {
    //   // Gọi tới parent để hiển thị popup
    //   return postMessageToParent(false, true)
    // }
  }, [LIST_UNREAD_MESSAGE])
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
