import './App.css'

import React, { FC, useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import ChatComponent from './components/Icon.chat'

function App() {
  const [is_show, setShow] = useState(false)

  const handleToggle = () => {
    window.parent.postMessage(
      {
        from: 'BBH-EMBED-IFRAME',
        is_show: !is_show,
      },
      '*'
    )
  }
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
            <ChatComponent
              userName={''}
              handleBtn={() => {
                handleToggle()
                setShow(!is_show)
              }}
              show={is_show}
              setHide={() => {
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
