import './App.css'

import React, { useEffect, useState } from 'react'

import ChatComponent from './components/Icon.chat'
import Login from './components/Login'
import logo from './logo.svg'

function App() {
  const [is_show, setShow] = useState(false)

  const handleMessage = () => {
    window.parent.postMessage(
      {
        from: 'BBH-EMBED-IFRAME',
        is_show: !is_show,
      },
      '*'
    )
  }

  return (
    <div className="flex flex-col justify-center items-center ">
      {
        <ChatComponent
          userName={''}
          handleBtn={() => {
            handleMessage()
            setShow(!is_show)
          }}
          show={is_show}
        />
      }
    </div>
  )
}

export default App
