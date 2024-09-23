import './App.css'
import './i18n' // Import cấu hình i18n

import {
  selectPageId,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setStatusPopup,
} from './stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'

import ChatApp from './screens/ChatApp'
import { use } from 'i18next'
import { useState } from 'react'

function App() {
  const [is_show, setShow] = useState(false)
  const PAGE_ID = useSelector(selectPageId)
  const dispatch = useDispatch()
  /** Function tắt bật của popup dạng PC */
  const handleToggle = () => {
    /** Lưu vào store */
    dispatch(setStatusPopup(!is_show))

    window.parent.postMessage(
      {
        from: 'BBH-EMBED-IFRAME',
        is_show: !is_show,
      },
      '*'
    )
  }

  /** Function tắt báo popup dạng Mobile*/
  const handleOff = () => {
    dispatch(setStatusPopup(false))
    window.parent.postMessage(
      {
        from: 'BBH-EMBED-IFRAME',
        is_show: false,
      },
      '*'
    )
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
            localStorage.setItem(
              `last_time_close__${PAGE_ID}`,
              Date.now().toString()
            )
          }
        }}
        show={is_show}
        setHideForMobile={() => {
          setShow(false)

          // Lưu thời gian vào localstorage Khi đóng popup
          localStorage.setItem(
            `last_time_close__${PAGE_ID}`,
            Date.now().toString()
          )
          handleOff()
        }}
      />
    </div>
  )
}

export default App
