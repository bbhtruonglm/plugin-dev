import './App.css'
import './i18n'

import { Route, Routes } from 'react-router-dom'

import ActiveSDK from './pages/ActiveSDK'
import ActiveSDKTestAI from './pages/ActiveSDKTestAI'
import ChatApp from './pages/ChatApp/ChatApp'
import { useApp } from './hooks/useApp'
import { useChatHandlers } from './hooks/useChathandlers'

function App() {
  /** Lấy thông tin từ hook useApp */
  const {
    type_consultation,
    setShow,
    handleToggle,
    handleOff,
    PAGE_ID,
    stored_client_id,
    setTypeConsultation,
    is_show,
  } = useApp()
  /** Lấy hàm từ hook useChatHandlers */
  const { setHideForMobile, handleBtn } = useChatHandlers({
    is_show,
    setShow,
    handleToggle,
    handleOff,
    PAGE_ID,
    CLIENT_ID: stored_client_id,
    setTypeConsultation,
  })

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
          path="/test-ai"
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
          path="/test-ai-ui"
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
        <Route
          path="/active-sdk-test-ai"
          element={<ActiveSDKTestAI />}
        />
      </Routes>
    </div>
  )
}

export default App
