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

  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     console.log(event)
  //   }

  //   // Adding the event listener
  //   window.addEventListener('message', handleMessage)

  //   // Clean up the event listener on component unmount
  //   return () => {
  //     window.removeEventListener('message', handleMessage)
  //   }
  // }, [])

  return (
    <div className="flex flex-col justify-center items-center w-full h-full ">
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
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
