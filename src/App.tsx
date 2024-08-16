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
  useEffect(() => {
    // const handleMessage = (event: any) => {
    //   console.log(event, 'event')
    //   // if (event.origin !== 'http://localhost:5173/') {
    //   //   return
    //   // }

    //   const { from, page_id } = event.data
    //   console.log(from, page_id, 'page_id')
    //   if (from === 'BBH-EMBED-IFRAME' && page_id) {
    //     console.log('Received page_id:', page_id)
    //     // Bạn có thể sử dụng page_id này trong logic của ứng dụng con
    //   }
    // }

    window.addEventListener('message', (e) => {
      console.log(e, 'childdddd')
    })

    // return () => {
    //   window.removeEventListener('message', handleMessage)
    // }
  }, [])

  return (
    <div className="flex flex-col justify-center items-center ">
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
