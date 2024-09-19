import React, { useEffect, useState } from 'react'
import { fetchAPI, useAPI } from '@/api/api'
import { useNavigate, useParams } from 'react-router-dom'

import ChatScreen from '@/screens/Chat'
import { ReactComponent as Close } from '@/assets/close.svg'
import { ReactComponent as Down } from '@/assets/arrow.svg'
import Home from '@/screens/Home'
import { ReactComponent as Logo } from '@/assets/logo-retion.svg'
import { ReactComponent as RetionLogo } from '@/assets/retion-logo.svg'
import { ReactComponent as activeHome } from '@/assets/home-active.svg'
import { ReactComponent as activeMessage } from '@/assets/messageA.svg'
import i18next from 'i18next'
import { ReactComponent as inactiveHome } from '@/assets/home.svg'
import { ReactComponent as inactiveMessage } from '@/assets/message.svg'
import { useTranslation } from 'react-i18next'

interface ChatProps {
  handleBtn: () => void
  show: boolean
  setHideForMobile?: () => void
}
const ChatApp: React.FC<ChatProps> = ({
  handleBtn,
  show,
  setHideForMobile,
}) => {
  const { t, i18n } = useTranslation()

  // Lấy locale hiện tại từ i18next
  const { locale } = useParams()

  const { READ_PAGE_INFO } = useAPI()
  const navigate = useNavigate()
  const [page_id, setPageId] = useState<String | null>('')
  const [error_message, setErrorMessage] = useState<String | null>('')
  const [current_width, setCurrentW] = useState<any>(0)
  const [page_name, setPageName] = useState<string>('')
  const [social_link, setSocialLink] = useState<Array<any> | null>([])

  // Tạo tab hiện tại là HOME
  const [current_tab, setCurrentTab] = useState('home')

  useEffect(() => {
    /** @type {string} Lấy url của page cha */
    const FULL_SRC = window.location.href

    /**
     * Chuyển từ chuỗi URL thành một đối tượng URL.
     * @param {string} FULL_SRC - Chuỗi chứa URL đầy đủ
     * @returns {URL} Đối tượng URL được tạo ra từ chuỗi đầu vào
     */
    const URL_PARENT = new URL(FULL_SRC)
    const URL_PARAMS = new URLSearchParams(window.location.search)
    // Lấy giá trị locale từ URL
    // Mặc định là 'vn' nếu không có locale
    const LOCALE = URL_PARAMS.get('locale') || 'en'

    // Thay đổi ngôn ngữ của SDK dựa trên locale từ URL
    i18next
      .changeLanguage(LOCALE)
      .then(() => {
        console.log('Language changed to:', LOCALE)
      })
      .catch((error) => {
        console.error('Error changing language:', error)
      })
    /** page_id từ URL page cha */
    const PAGE_ID = URL_PARENT.searchParams.get('page_id')

    /** Độ rộng của màn hình trong page cha, truyền qua URL */
    const WIDTH_PARENT = URL_PARENT.searchParams.get('parentWidth')

    if (WIDTH_PARENT) {
      // nếu có truyền width thì lưu vào state
      setCurrentW(WIDTH_PARENT)
    }
    // lưu page_id với state
    setPageId(PAGE_ID)
    // setPageId('bf425487afbe403895116dd9b585537b')
  }, [])

  /**
   * Tab menu với các mục chính gồm:
   * - Home
   * - Message
   * - Support (đã bị ẩn)
   * - News (đã bị ẩn)
   *
   * @type {Array<Object>}
   * @property {string} name - Tên của tab (hiển thị cho người dùng)
   * @property {string} src - Đường dẫn đến icon không hoạt động (inactive)
   * @property {string} value - Giá trị định danh của tab
   * @property {string} srcA - Đường dẫn đến icon hoạt động (active)
   *
   * @example
   * const MENU_LIST = [
   *   { name: 'Trang chủ', src: inactiveHome, value: 'home', srcA: activeHome },
   *   { name: 'Tin nhắn', src: inactiveMessage, value: 'message', srcA: activeMessage },
   *   // Các tab Support và News đang bị ẩn trong đoạn mã
   * ];
   */
  const MENU_LIST = [
    {
      name: t('home'),
      src: inactiveHome,
      value: 'home',
      srcA: activeHome,
    },
    {
      name: t('message'),
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

  /** Hàm đọc dữ liệu trang */
  const fetchPageData = async (page_id: String) => {
    // Tạo đối tượng URL từ string
    const URL_READ = new URL(READ_PAGE_INFO)
    // body gồm page_id
    const BODY = {
      page_id: page_id,
    }
    // Đẩy params lên URL
    URL_READ.search = new URLSearchParams(BODY as any).toString()

    /** Thông tin page từ api */
    const RES = await fetchAPI(URL_READ.toString(), 'GET')

    console.log(RES, 'RES page')
    // lưu tên page vào state
    setPageName(RES?.data?.name)
    // Lưu liên hệ với các kênh mạng xã hội
    setSocialLink(RES?.data?.config?.sosial_platform)
    // lưu ngôn ngữ hiện tại
    i18n.changeLanguage(RES?.data.config.locale)
  }
  useEffect(() => {
    // Nếu có page_id thì mới xử lý tiếp
    if (page_id) {
      setPageId(page_id)
      // console.log(page_id, 'check')
      fetchPageData(page_id)
    }
  }, [page_id])
  return (
    <div
      className={`flex relative  ${
        // Nếu không show, thì hiện icon bong bóng chat
        !show
          ? 'w-12 h-12'
          : // Nếu kích thước điện thoại thì hiện full screen
          current_width < 768 && current_width !== 0
          ? ' w-screen h-screen '
          : // Nếu màn PC thì hiện thành 1 tab nhỏ
            ' w-[400px] h-[658px] '
      }  `}
    >
      <div
        className={`relative  ${
          // Phần chính của bong bóng chat
          current_width < 768 && current_width !== 0
            ? ' w-screen h-screen rounded-none '
            : ' w-[400px] h-[600px] '
        } bg-bg-gradient rounded-[20px] overflow-hidden shadow-md ${
          // mặc định sẽ ẩn/ Khi kich hoạt sẽ mở kèm animation
          !show ? ' hidden' : ' flex flex-col animate-zoomInBottomRight '
        }  `}
      >
        {/* header */}
        {current_tab !== 'message' && (
          <div
            className={
              'flex justify-between items-center px-5 py-3 bg-slate-800 text-white'
            }
          >
            <div>
              <RetionLogo />
            </div>

            <div className="flex items-center gap-x-5">
              <div className="flex items-center h-8">
                <img
                  src={'https://avatar.iran.liara.run/public/1'}
                  className="-mr-2 h-8 w-8 rounded-lg"
                  alt=""
                />
                <img
                  src={'https://avatar.iran.liara.run/public/2'}
                  className=" -mr-1 h-8 w-8 rounded-lg"
                  alt=""
                />
                <img
                  src={'https://avatar.iran.liara.run/public/3'}
                  className="h-8 w-8 rounded-lg"
                  alt=""
                />

                {/* <img
                className="mask h-8 w-8"
                src={'./images/earth.svg'}
                alt="page_logo"
              /> */}
              </div>
              <div
                onClick={setHideForMobile}
                className={` cursor-pointer w-10 h-10 flex justify-center items-center  ${
                  current_width < 768 && current_width !== 0
                    ? ' flex'
                    : ' hidden'
                }`}
              >
                <Close />
              </div>
            </div>
          </div>
        )}
        {/* body check theo bien current tab de render data */}

        <div
          className={
            'flex flex-col resize-none outline-none scrollbar-thin scrollbar-webkit ' +
            `${
              current_tab !== 'home'
                ? ' h-[468px] overflow-y-auto'
                : ' h-[600px]'
            }`
          }
        >
          {current_tab === 'home' && (
            <Home
              page_id={page_id}
              onNavigate={() => {
                setCurrentTab('message')
              }}
              onError={() => {
                // setErrorMessage(
                //   'Hệ thống chưa được liên kết.\n Vui lòng liên hệ quản trị viên để được hỗ trợ!'
                // )
                setErrorMessage(t('errorMessage'))
                setCurrentTab('message')
              }}
              social_link={social_link}
            />
          )}
          {current_tab === 'message' && (
            <ChatScreen
              userOutChat={() => {
                // Khi back ra thì về trang Home
                setCurrentTab('home')
                navigate('/')
              }}
              error_message={error_message}
              onError={() => setErrorMessage('')}
              setHideForMobile={setHideForMobile}
              current_width={current_width}
              page_name={page_name}
            />
          )}
        </div>

        {/* Hiển thị Menu */}
        {/* Nếu tab hiện tại không phải chat thì hiển thị menu */}
        {current_tab !== 'message' && (
          <div className="absolute bottom-0 w-full flex flex-col justify-evenly p-2 px-6 h-16 z-20  bg-bg-gradient">
            <div className="flex">
              {MENU_LIST.map(
                (
                  { src: IconComponent, srcA: IconComponentA, value, name },
                  index
                ) => (
                  <div
                    key={index}
                    className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                    onClick={() => {
                      console.log(name)
                      if (value !== 'message') {
                        // tab !== 'message' thì overview để hiển thị menu
                        setCurrentTab(value)
                      } else {
                        // ẩn menu
                        // navigate('/?page_id=3861367970af4b7cadacaec5d1443473')

                        setCurrentTab(value)
                        if (page_id !== null) {
                          // có page_id thì thêm page_id vào url
                          navigate(`/?page_id=${page_id}`)
                          // navigate(
                          //   `/?page_id=${'3861367970af4b7cadacaec5d1443473'}`
                          // )
                        } else {
                          // Không có page_id thì tạo message Lỗi
                          setErrorMessage(t('errorMessage'))
                        }
                      }
                    }}
                  >
                    {/* active menu tab */}
                    {current_tab === value ? (
                      <IconComponentA />
                    ) : (
                      <IconComponent />
                    )}

                    <p className={'text-sm font-medium'}>{name}</p>
                  </div>
                )
              )}
            </div>
            {/* Thông tin đơn vị phát triển */}
            <h4 className="text-xs text-center text-slate-700">
              powered by{' '}
              <a
                href="https://beta-bbh-vn-lac.vercel.app/vn"
                className="underline"
                target="_blank"
              >
                Retion.ai
              </a>
            </h4>
          </div>
        )}
      </div>
      {/*  Nút trigger hiện thị bong bóng chat */}
      <button
        onClick={() => {
          handleBtn()
          setErrorMessage('')
        }}
        className={`absolute justify-center items-center h-12 w-12 bg-white shadow-lg rounded-full z-[999999] bottom-0 right-0  ${
          !show
            ? ' flex  '
            : current_width < 768 && current_width !== 0
            ? ' hidden '
            : ' flex '
        }`}
      >
        <div>
          {show ? (
            <Down />
          ) : (
            <Logo
              width={30}
              height={30}
            />
          )}
        </div>
      </button>
    </div>
  )
}

export default ChatApp
