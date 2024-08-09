import React, { useState } from 'react'

import ChatOption from './HomeComponents/ChatOption'
import Help from './HomeComponents/Help'
import Home from './ChatScreen/Home'
import IconApp from '../assets/logo.svg'
import IntroAI from './HomeComponents/IntroAI'
import SendMessage from './HomeComponents/SendMessage'
import home from '../assets/home.svg'
import homeActive from '../assets/home-active.svg'
import message from '../assets/message.svg'
import news from '../assets/notification.svg'
import support from '../assets/support.svg'

function ChatComponent() {
  const menuList = [
    {
      name: 'Trang chủ',
      src: homeActive,
      value: 'home',
    },
    {
      name: 'Tin nhắn',
      src: message,
      value: 'message',
    },
    {
      name: 'Hỗ trợ',
      src: support,
      value: 'support',
    },
    {
      name: 'Tin tức',
      src: news,
      value: 'news',
    },
  ]
  const [currentTab, setCurrentTab] = useState('home')
  return (
    <div className="flex flex-col relative w-[400px] h-[600px] bg-gradient-to-r from-[#EEEDF3] to-[#DCDFFC] rounded-[20px] overflow-hidden shadow-md">
      {/* header */}
      <div className="flex justify-between p-5 bg-[#1E293B] text-white">
        <div>
          <img
            src={IconApp}
            alt="src"
            width={36}
            height={44}
          />
        </div>
        <div>Avatar</div>
      </div>
      {/* body check theo bien current tab de render data */}

      <div className="flex flex-col h-[468px] resize-none outline-none scrollbar-thin scrollbar-webkit overflow-y-auto">
        {currentTab === 'home' && <Home />}
      </div>

      {/* menu */}
      <div className="absolute bottom-0 w-full flex justify-evenly p-2 px-6 h-[64px] z-20 bg-gradient-to-r from-[#EEEDF3] to-[#DCDFFC]">
        {menuList.map((item, index) => (
          <div
            className="flex flex-col w-full h-full justify-center items-center"
            onClick={() => setCurrentTab(item.value)}
          >
            <img
              src={item.src}
              alt="src"
              width={24}
              height={24}
            />
            <p
              className={
                currentTab === item.value ? 'font-bold' : 'text-md font-medium'
              }
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatComponent
