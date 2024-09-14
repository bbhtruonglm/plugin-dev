import './App.css'
import './i18n' // Import cấu hình i18n

import { Route, Routes } from 'react-router-dom'

import ChatApp from './screens/ChatApp'
import { useState } from 'react'

function App() {
  const [is_show, setShow] = useState(true)

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
    <div className="flex flex-col justify-center items-center">
      <Routes>
        <Route
          path="/"
          element={
            <ChatApp
              handleBtn={() => {
                handleToggle()
                setShow(!is_show)
              }}
              show={is_show}
              setHideForMobile={() => {
                setShow(false)
                handleOff()
              }}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
