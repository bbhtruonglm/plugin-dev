import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import ChatScreen from './Screens/Chat'
import { ReactComponent as Close } from '../assets/close.svg'
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
import { ReactComponent as inactiveHome } from '../assets/home.svg'
import { ReactComponent as inactiveMessage } from '../assets/message.svg'
import { ReactComponent as inactiveNews } from '../assets/notification.svg'
import { ReactComponent as inactiveSupport } from '../assets/support.svg'

interface ChatProps {
  userName: string
  handleBtn: () => void
  show: boolean
  setHide?: () => void
}
const ChatComponent: React.FC<ChatProps> = ({
  userName,
  handleBtn,
  show,
  setHide,
}) => {
  const navigate = useNavigate()
  const [page_id, setPageId] = useState<String | null>('')
  const [errorMessage, setErrorMessage] = useState<String | null>('')
  const [currentW, setCurrentW] = useState<any>(450)

  useEffect(() => {
    const fullSrc = window.location.href
    // console.log(fullSrc, 'fullsrc')
    const url = new URL(fullSrc)
    const id = url.searchParams.get('page_id')
    const widthP = url.searchParams.get('parentWidth')

    // console.log(widthP)
    if (widthP) {
      setCurrentW(widthP)
    }
    setPageId(id)
    // setPageId('11111')

    // setPageId('3861367970af4b7cadacaec5d1443473')
    // const handleMessage = (event: MessageEvent) => {
    //   // console.log(event, 'event')
    //   // Kiểm tra nguồn gốc của tin nhắn
    //   // if (event.origin !== 'http://localhost:5173') {
    //   //   // Thay đổi theo nguồn gốc của ứng dụng cha
    //   //   return
    //   // }

    //   const receivedUrl = event.data
    //   console.log(event, 'eventttt')
    //   if (receivedUrl?.width) {
    //     // const url = new URL(receivedUrl)
    //     // const id = url.searchParams.get('page_id')
    //     // setPageId(id)
    //     console.log(receivedUrl?.width, 'whhehwh')
    //     setCurrentW(receivedUrl?.width)
    //   }
    //   // Cập nhật trạng thái với dữ liệu nhận được
    //   // setParams(event.data)
    // }
    // Fix cứng page_id

    // Thêm sự kiện listener
    // window.addEventListener('message', handleMessage)

    // Xóa sự kiện listener khi component bị unmount
    // return () => {
    //   window.removeEventListener('message', handleMessage)
    // }
  }, [])

  const menuList = [
    {
      name: 'Trang chủ',
      src: inactiveHome,
      value: 'home',
      srcA: activeHome,
    },
    {
      name: 'Tin nhắn',
      src: inactiveMessage,
      value: 'message',
      srcA: activeMessage,
    },
    // {
    //   name: 'Hỗ trợ',
    //   src: inactiveSupport,
    //   srcA: activeSupport,
    //   value: 'support',
    // },
    // {
    //   name: 'Tin tức',
    //   src: inactiveNews,
    //   srcA: activeNew,
    //   value: 'news',
    // },
  ]
  const [currentTab, setCurrentTab] = useState('home')
  const [chatPosition, setChatPosition] = useState('overview')
  return (
    <div
      className={`flex ${
        currentW < 450 ? ' w-[100vw] h-[100vh] ' : ' w-[400px] h-[658px] '
      }  `}
    >
      <div
        className={`relative  ${
          currentW < 450 ? ' w-[100vw] h-[100vh] ' : ' w-[400px] h-[600px] '
        } bg-bg-gradient rounded-[20px] overflow-hidden shadow-md ${
          !show ? ' hidden' : ' flex flex-col animate-zoomInBottomRight '
        }  `}
      >
        {/* header */}
        {chatPosition === 'overview' && (
          <div
            className={
              'flex justify-between items-center px-5 py-3 bg-slate-800 text-white'
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
            <div
              onClick={setHide}
              className={` cursor-pointer ${
                currentW < 450 ? ' flex' : ' hidden'
              }`}
            >
              <Close />
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
          {currentTab === 'home' && (
            <Home
              page_id={page_id}
              onNavigate={() => {
                setCurrentTab('message')
                setChatPosition('detail')
              }}
              onError={() => {
                setErrorMessage(
                  'Hệ thống chưa được liên kết.\n Vui lòng liên hệ quản trị viên để được hỗ trợ!'
                )
                setCurrentTab('message')
                setChatPosition('detail')
              }}
              errorMessage={errorMessage}
            />
          )}
          {currentTab === 'message' && (
            <ChatScreen
              currentPosition={chatPosition}
              setPosition={(e) => setChatPosition(e)}
              userName={userName}
              userLoggedIn={(e) => {
                // settab hien tai thanh home
                setCurrentTab('home')
                navigate('/')
                // set thanh overview de hien thi tab menu
                setChatPosition('overview')
              }}
              errorMessage={errorMessage}
              onError={() => setErrorMessage('')}
              setHide={setHide}
              currentW={currentW}
            />
          )}
        </div>

        {/* menu */}
        {/* Nếu trạng thái là overview thì mới hiển thị menu */}
        {chatPosition === 'overview' && (
          <div className="absolute bottom-0 w-full flex flex-col justify-evenly p-2 px-6 h-16 z-20  bg-bg-gradient">
            <div className="flex">
              {menuList.map(
                (
                  { src: IconComponent, srcA: IconComponentA, value, name },
                  index
                ) => (
                  <div
                    key={index}
                    className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                    onClick={() => {
                      if (value !== 'message') {
                        // tab !== 'message' thì overview để hiển thị menu
                        setCurrentTab(value)
                        setChatPosition('overview')
                      } else {
                        // ẩn menu
                        // navigate('/?page_id=3861367970af4b7cadacaec5d1443473')
                        // console.log(page_id, 'page_idddd')
                        if (page_id !== null) {
                          navigate(`/?page_id=${page_id}`)
                          setChatPosition('detail')
                          setCurrentTab(value)
                        } else {
                          // console.log(
                          //   'Hệ thống chưa được liên kết. Vui lòng liên hệ quản trị viên để được hỗ trợ!'
                          // )
                          setErrorMessage(
                            'Hệ thống chưa được liên kết.\n Vui lòng liên hệ quản trị viên để được hỗ trợ!'
                          )
                          setCurrentTab(value)
                          setChatPosition('detail')
                        }
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
                          ? 'text-sm font-medium'
                          : 'text-sm font-medium'
                      }
                    >
                      {name}
                    </p>
                  </div>
                )
              )}
            </div>
            {/* <h4 className="text-[10px] text-center text-slate-700">
              power by{' '}
              <a
                href="/#"
                className="underline"
              >
                Bot Ban Hang
              </a>
            </h4> */}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          handleBtn()
          setErrorMessage('')
        }}
        className={` absolute justify-center items-center h-12 w-12 border bg-slate-800 rounded-full z-[999999] bottom-0 right-0  ${
          !show
            ? ' flex transform -scale-y-100 '
            : currentW < 450
            ? ' hidden '
            : ' flex '
        }`}
      >
        <Down />
      </button>
    </div>
  )
}

export default ChatComponent
