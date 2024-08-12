import './App.css'

import React, { useState } from 'react'

import ChatComponent from './components/Icon.chat'
import Login from './components/Login'
import logo from './logo.svg'

function App() {
  const [userName, setUserName] = useState('')
  return (
    <div className="flex justify-center items-center h-[100vh] w-full">
      {!userName && <Login setUserName={setUserName} />}
      {userName && <ChatComponent userName={userName} />}
    </div>
  )
}

export default App
