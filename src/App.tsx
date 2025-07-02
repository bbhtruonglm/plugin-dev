import './App.css'
import './i18n'

import { Route, Routes } from 'react-router-dom'

import ActiveSDK from './pages/ActiveSDK'
import ChatApp from './pages/ChatApp'
import { useApp } from './hooks/useApp'
import { useChatHandlers } from './hooks/useChathandlers'

function App() {
  /** Lấy thông tin từ hook useApp */
  const { type_consultation } = useApp()
  /** Lấy hàm từ hook useChatHandlers */
  const { setHideForMobile, handleBtn, is_show } = useChatHandlers()
  return (
    <div
      className="flex flex-col justify-center items-center w-full h-full overflow-hidden px-5"
      id="bbh-chat-plugin"
    >
      <Routes>
        <Route
          path="/"
          element={
            <ChatApp
              handleBtn={(e) => handleBtn(e, true)}
              show={is_show}
              setHideForMobile={() => setHideForMobile(true)}
              consultation={type_consultation}
            />
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ChatApp
              handleBtn={(e) => handleBtn(e, false)}
              show={is_show}
              setHideForMobile={() => setHideForMobile(false)}
              consultation={false}
            />
          }
        />
        <Route
          path="/view-screen"
          element={
            <ChatApp
              handleBtn={(e) => handleBtn(e, false)}
              show={is_show}
              setHideForMobile={() => setHideForMobile(false)}
              consultation={false}
            />
          }
        />
        <Route
          path="/active-sdk"
          element={<ActiveSDK />}
        />
      </Routes>
    </div>
  )
}

export default App
