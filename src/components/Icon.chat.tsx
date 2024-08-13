import React, { useState } from 'react'

import ChatScreen from './Screens/Chat'
import Home from './Screens/Home'
import IconApp from '../assets/logo.svg'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import home from '../assets/home.svg'
import homeActive from '../assets/home-active.svg'
import message from '../assets/message.svg'
import messageA from '../assets/messageA.svg'
import news from '../assets/notification.svg'
import newsA from '../assets/notificationA.svg'
import support from '../assets/support.svg'
import supportA from '../assets/supportA.svg'

interface ChatProps {
  userName: string
  handleBtn: () => void
  show: boolean
}
function ChatComponent({ userName, handleBtn, show }: ChatProps) {
  const menuList = [
    {
      name: 'Trang chủ',
      src: home,
      value: 'home',
      srcA: homeActive,
    },
    {
      name: 'Tin nhắn',
      src: message,
      value: 'message',
      srcA: messageA,
    },
    {
      name: 'Hỗ trợ',
      src: support,
      srcA: supportA,
      value: 'support',
    },
    {
      name: 'Tin tức',
      src: news,
      srcA: newsA,
      value: 'news',
    },
  ]
  const [currentTab, setCurrentTab] = useState('home')
  const [chatPosition, setChatPosition] = useState('overview')
  return (
    <div
      className={` ${
        show ? ' w-[400px] h-[658px]' : 'w-12 h-12'
      } flex relative `}
    >
      <div
        className={` ${
          show ? 'flex' : 'hidden'
        }  flex-col relative w-[400px] h-[600px] bg-gradient-to-r from-[#EEEDF3] to-[#DCDFFC] rounded-[20px] overflow-hidden shadow-md`}
      >
        {/* header */}
        {chatPosition === 'overview' && (
          <div className={'flex justify-between p-3 bg-[#1E293B] text-white'}>
            <div>
              <img
                src={IconApp}
                alt="src"
                width={36}
                height={44}
              />
            </div>
            <div className="flex items-center">
              <img
                src={avatar1}
                className="mask is-squircle -mr-2 h-8 w-8"
                alt=""
              />
              <img
                src={avatar2}
                className="mask -mr-1 h-8 w-8"
                alt=""
              />
              <img
                src={avatar3}
                className="mask is-squircle h-8 w-8"
                alt=""
              />
            </div>
          </div>
        )}
        {/* body check theo bien current tab de render data */}

        <div
          className={
            'flex flex-col resize-none outline-none scrollbar-thin scrollbar-webkit ' +
            `${
              chatPosition === 'overview'
                ? ' h-[468px] overflow-y-auto'
                : ' h-[600px]'
            }`
          }
        >
          {currentTab === 'home' && <Home userName={userName} />}
          {currentTab === 'message' && (
            <ChatScreen
              currentPosition={chatPosition}
              setPosition={(e) => setChatPosition(e)}
              userName={userName}
            />
          )}
        </div>

        {/* menu */}

        {chatPosition === 'overview' && (
          <div className="absolute bottom-0 w-full flex justify-evenly p-2 px-6 h-[64px] z-20 bg-gradient-to-r from-[#EEEDF3] to-[#DCDFFC]">
            {menuList.map((item, index) => (
              <div
                key={index}
                className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                onClick={() => {
                  setCurrentTab(item.value)
                  setChatPosition('overview')
                }}
              >
                {currentTab === item.value ? (
                  <img
                    src={item.srcA}
                    alt="src"
                    width={24}
                    height={24}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt="src"
                    width={24}
                    height={24}
                  />
                )}

                <p
                  className={
                    currentTab === item.value
                      ? 'font-bold'
                      : 'text-md font-medium'
                  }
                >
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleBtn}
        className="absolute flex h-12 w-12 border bg-red-100 rounded-full z-[999999] bottom-0 right-0"
      ></button>
    </div>
  )
}

export default ChatComponent
