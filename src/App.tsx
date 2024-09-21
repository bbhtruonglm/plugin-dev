import './App.css'
import './i18n' // Import cấu hình i18n

import { useRef, useState } from 'react'

import ChatApp from './screens/ChatApp'

function App() {
  const [is_show, setShow] = useState(false)

  /** Function tắt bật của popup dạng PC */
  const handleToggle = () => {
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
          // Lưu trạng thái đóng mở vào session storage
          sessionStorage.setItem('plugin_status', JSON.stringify(!is_show))
        }}
        show={is_show}
        setHideForMobile={() => {
          setShow(false)
          handleOff()
          // Lưu trạng thái đóng vào session storage
          sessionStorage.setItem('plugin_status', JSON.stringify(false))
        }}
      />
    </div>
  )
}

export default App
