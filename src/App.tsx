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
import { use } from 'i18next'

function App() {
  const [is_show, setShow] = useState(false)
  const PAGE_ID = useSelector(selectPageId)
  const dispatch = useDispatch()

  /** Tin nhắn chưa đọc/tin nhắn mới nhất */
  const LIST_UNREAD_MESSAGE = useSelector(selectListUnreadMessage)

  /** Tin nhắn mới nhất */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  useEffect(() => {
    if (
      LATEST_MESSAGE?.message_type === 'page' &&
      LIST_UNREAD_MESSAGE?.length > 0 &&
      !is_show
    ) {
      postMessageToParent(false, true)
    }
  }, [LIST_UNREAD_MESSAGE])

  /** Function tắt bật của popup dạng PC */
  const handleToggle = () => {
    /** Lưu vào store */
    dispatch(setStatusPopup(!is_show))
    postMessageToParent(!is_show, false)
  }

  /** Function tắt báo popup dạng Mobile*/
  const handleOff = () => {
    dispatch(setStatusPopup(false))

    postMessageToParent(false, false)
  }

  return (
    <div className="flex flex-col justify-center items-center h-fit w-fit">
      <ChatApp
        handleBtn={() => {
          handleToggle()
          setShow(!is_show)
          if (!is_show) {
            dispatch(setLatestMessageGlobal(null))
            dispatch(setListUnreadMessage([]))
            dispatch(setListMessage([]))
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
