import React, { useState } from 'react'

import ChatScreen from './Screens/Chat'
import { ReactComponent as Down } from '../assets/arrow.svg'
import Home from './Screens/Home'
import { ReactComponent as IconApp } from '../assets/logo.svg'
import { ReactComponent as Up } from '../assets/arrow-up-right-square.svg'
import { ReactComponent as activeHome } from '../assets/home-active.svg'
import { ReactComponent as activeMessage } from '../assets/messageA.svg'
import { ReactComponent as activeNew } from '../assets/Subtract.svg'
import { ReactComponent as activeSupport } from '../assets/supportA.svg'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import { ReactComponent as intiveHome } from '../assets/home.svg'
import { ReactComponent as intiveMessage } from '../assets/message.svg'
import { ReactComponent as intiveNews } from '../assets/notification.svg'
import { ReactComponent as intiveSupport } from '../assets/support.svg'

interface ChatProps {
  userName: string
  handleBtn: () => void
  show: boolean
}
const ChatComponent: React.FC<ChatProps> = ({ userName, handleBtn, show }) => {
  const menuList = [
    {
      name: 'Trang chủ',
      src: intiveHome,
      value: 'home',
      srcA: activeHome,
    },
    {
      name: 'Tin nhắn',
      src: intiveMessage,
      value: 'message',
      srcA: activeMessage,
    },
    {
      name: 'Hỗ trợ',
      src: intiveSupport,
      srcA: activeSupport,
      value: 'support',
    },
    {
      name: 'Tin tức',
      src: intiveNews,
      srcA: activeNew,
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
        }  flex-col relative w-[400px] h-[600px] bg-bg-gradient rounded-[20px] overflow-hidden shadow-md`}
      >
        {/* header */}
        {chatPosition === 'overview' && (
          <div
            className={
              'flex justify-between items-center px-5 py-3 bg-bgBtnBold text-white'
            }
          >
            <div>
              <IconApp
                width={36}
                height={44}
              />
            </div>
            <div className="flex items-center h-8">
              <img
                src={avatar1}
                className="mask  -mr-2 h-8 w-8"
                alt=""
              />
              <img
                src={avatar2}
                className="mask -mr-1 h-8 w-8"
                alt=""
              />
              <img
                src={avatar3}
                className="mask  h-8 w-8"
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
              userLoggedIn={(e) => {
                // settab hien tai thanh home
                setCurrentTab('home')
                // set thanh overview de hien thi tab menu
                setChatPosition('overview')
              }}
            />
          )}
        </div>

        {/* menu */}
        {/* Nếu trạng thái là overview thì mới hiển thị menu */}
        {chatPosition === 'overview' && (
          <div className="absolute bottom-0 w-full flex justify-evenly p-2 px-6 h-[64px] z-20 bg-bg-gradient">
            {menuList.map(
              (
                { src: IconComponent, srcA: IconComponentA, value, name },
                index
              ) => (
                <div
                  key={index}
                  className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                  onClick={() => {
                    setCurrentTab(value)
                    if (value !== 'message') {
                      // tab !== 'message' thì overview để hiển thị menu
                      setChatPosition('overview')
                    } else {
                      // ẩn menu
                      setChatPosition('detail')
                    }
                  }}
                >
                  {/* active menu tab */}
                  {currentTab === value ? (
                    <IconComponentA />
                  ) : (
                    <IconComponent />
                  )}

                  <p
                    className={
                      currentTab === value
                        ? 'text-md font-medium'
                        : 'text-md font-medium'
                    }
                  >
                    {name}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
      <button
        onClick={handleBtn}
        className={`absolute flex justify-center items-center h-12 w-12 border bg-bgBtnBold rounded-full z-[999999] bottom-0 right-0 transform ${
          show ? '' : '-scale-y-100'
        }`}
      >
        <Down />
      </button>
    </div>
  )
}

export default ChatComponent
