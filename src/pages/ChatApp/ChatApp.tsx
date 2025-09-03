import {
  ChatBubbleOvalLeftEllipsisIcon as ActiveMessage,
  HomeIcon,
} from '@heroicons/react/24/solid'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/16/solid'
import {
  HomeIcon as HomeIconOutline,
  ChatBubbleOvalLeftEllipsisIcon as InactiveMessage,
} from '@heroicons/react/24/outline'
import {
  renderLogo,
  renderStaffName,
  saveQuickChatCount,
  saveQuickChatLatestMessage,
  truncateSentences,
  truncateString,
} from '@/utils'
import { useDispatch, useSelector } from 'react-redux'

import { ChatAppProps } from '../type'
import ChatScreen from '@/screens/ChatScreen/Chat/Chat'
import Header from './components/Header'
import Home from '@/screens/ChatScreen/Home'
import Modal from '@/components/ChatComponents/Modal/Modal'
// import { ReactComponent as InactiveMessage } from '@/assets/message.svg'
import TemplateMessageComponent from '@/components/ChatComponents/MessageComponent/TemplateMessageComponent'
import TimeAgo from '@/components/TimeAgo'
import { selectIsLoadingFirstTime } from '@/stores/appSlice'
import useChatApp from './useChatApp'
import useChatAppAction from './useChatAppAction'
import { useTranslation } from 'react-i18next'

const ChatApp = ({
  handleBtn,
  show,
  setHideForMobile,
  consultation,
}: ChatAppProps) => {
  /** Dịch ngôn ngữ */
  const { t } = useTranslation()
  /** hàm dispatch đến store */
  const dispatch = useDispatch()
  /** Lấy các thông tin trong hooks */
  const {
    getContainerLayout,
    GLOBAL_UNREAD_MESSAGE_COUNT,
    LATEST_MESSAGE,
    CURRENT_WIDTH,
    SHOW_QUICK_CHAT,
    getMainPopupLayout,
    current_tab,
    AI_STATUS,
    IS_VIEW_SCREEN,
    checkStaffExist,
    ORG_ALLOW_LOGO,
    LOGO_PAGE_CUSTOM_BLACK,
    SHOW_SUPPORT_STAFF,
    EMPLOYEE_LIST,
    handleCloseModal,
    IS_ONLINE,
    setCurrentTab,
    PAGE_ID,
    stored_client_id: CLIENT_STORED,
    setErrorMessage,
    social_link,
    web_form,
    social_description,
    invalid_page_id,
    error_message,
    page_name,
    getQuickchatLayout,
    IS_PAGE_AVATAR,
    staff_list,
    POSITION,
    POSITION_DETAIL,
    show_welcome_message,
    setShowWelcomeMessage,
    welcome_message,
    IS_SHOW_HOME,
    LOGO_PAGE_CUSTOM,
    GLOBAL_PREVIEW_URL,
    IS_CUSTOM_BACKGROUND,
    SELECT_BUTTON_EFFECT,
  } = useChatApp({ show })
  /** Các hàm action trong hooks */
  const {
    userOutChat,
    onHomeNavigate,
    onClickMenu,
    handleClickQuickChat,
    handleClickCloseQuickChat,
    handleClickWelcomeMessage,
    handleClickCloseWelcomeMessage,
    handleTriggerLogo,
  } = useChatAppAction({
    setCurrentTab,
    dispatch,
    PAGE_ID,
    CLIENT_STORED,
    saveQuickChatCount,
    saveQuickChatLatestMessage,
    setErrorMessage,
    handleBtn,
    POSITION_DETAIL,
    POSITION,
    setShowWelcomeMessage,
    show,
    current_tab,
    IS_SHOW_HOME,
  })

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
   */
  const MENU_LIST = [
    {
      name: t('home'),
      src: HomeIconOutline,
      value: 'home',
      srcA: HomeIcon,
    },
    {
      name: t('message'),
      src: InactiveMessage,
      value: 'message',
      srcA: ActiveMessage,
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
  /** Trạng thái loading */
  const IS_LOADING = useSelector(selectIsLoadingFirstTime)

  return (
    /** Hiển thị thông tin Layout cả SDK */
    <div
      className={`flex flex-col relative ${getContainerLayout(
        show,
        GLOBAL_UNREAD_MESSAGE_COUNT,
        LATEST_MESSAGE,
        CURRENT_WIDTH,
        SHOW_QUICK_CHAT
      )}`}
    >
      {/* Popup tin nhắn hiển thị nội dung chính */}
      {show && (
        <div
          className={`flex flex-col ${getMainPopupLayout(
            show,
            GLOBAL_UNREAD_MESSAGE_COUNT,
            CURRENT_WIDTH
          )}`}
        >
          {/* header */}
          <Header
            current_tab={current_tab}
            IS_VIEW_SCREEN={IS_VIEW_SCREEN}
            AI_STATUS={AI_STATUS}
            ORG_ALLOW_LOGO={ORG_ALLOW_LOGO}
            LOGO_PAGE_CUSTOM_BLACK={LOGO_PAGE_CUSTOM_BLACK}
            SHOW_SUPPORT_STAFF={SHOW_SUPPORT_STAFF}
            EMPLOYEE_LIST={EMPLOYEE_LIST}
            setHideForMobile={setHideForMobile}
          />
          {/* body check theo bien current tab de render data */}
          <div
            className={`relative flex flex-col h-full resize-none outline-none scrollbar-thin scrollbar-webkit overflow-hidden overflow-y-auto ${
              IS_VIEW_SCREEN ? 'h-screen' : 'md:max-h-[600px]'
            }`}
          >
            {!IS_ONLINE && (
              <div className="absolute top-28 left-[30%] text-xs bg-blue-300 p-2 rounded-lg text-white z-10">
                {t('no_internet_connection')}
              </div>
            )}
            {current_tab === 'home' && (
              <Home
                onNavigate={onHomeNavigate}
                onError={() => {
                  setErrorMessage(t('errorMessage'))
                  setCurrentTab('message')
                }}
                social_link={social_link}
                web_form={web_form}
                social_description={social_description}
              />
            )}
            {current_tab === 'message' && (
              <ChatScreen
                userOutChat={userOutChat}
                invalid_page_id_parent={invalid_page_id}
                error_message={error_message}
                onError={() => setErrorMessage('')}
                setHideForMobile={setHideForMobile}
                page_name={page_name}
                employee_list={EMPLOYEE_LIST}
                consultation={consultation}
              />
            )}
          </div>

          {/* Hiển thị Menu */}
          {/* Nếu tab hiện tại không phải chat thì hiển thị menu */}
          {current_tab !== 'message' && (
            <div className="md:w-[400px] flex flex-shrink-0 h-16 flex-col justify-evenly">
              <div className="p-2 h-16 w-full">
                <div className="flex">
                  {MENU_LIST.map(
                    ({ src: Icon, srcA: IconActive, value, name }, index) => (
                      <div
                        key={index}
                        className="flex flex-col w-full h-full justify-center items-center cursor-pointer"
                        onClick={() => onClickMenu(value)}
                      >
                        <div className="relative">
                          <div className="">
                            {value === 'message' &&
                              GLOBAL_UNREAD_MESSAGE_COUNT > 0 && (
                                <div className="flex justify-center items-center text-xxs text-white border absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full translate-x-1 -translate-y-1">
                                  {GLOBAL_UNREAD_MESSAGE_COUNT < 10
                                    ? GLOBAL_UNREAD_MESSAGE_COUNT
                                    : '9+'}
                                </div>
                              )}
                          </div>
                          {/* active menu tab */}
                          {current_tab === value ? (
                            <IconActive className="size-5" />
                          ) : (
                            <Icon className="size-5" />
                          )}
                        </div>
                        <p className={'text-sm font-medium'}>{name}</p>
                      </div>
                    )
                  )}
                </div>
                {/* Thông tin đơn vị phát triển */}
                <h4 className="text-xs text-center text-slate-700">
                  powered by{' '}
                  <a
                    href="https://retion.ai"
                    className="underline"
                    target="_blank"
                  >
                    Retion.ai
                  </a>
                </h4>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Quick chat */}
      <div
        className={getQuickchatLayout(
          show,
          LATEST_MESSAGE,
          GLOBAL_UNREAD_MESSAGE_COUNT,
          SHOW_QUICK_CHAT
        )}
      >
        <div className="flex h-full w-full">
          {LATEST_MESSAGE?.message_type === 'page' && (
            <div className="flex flex-col w-full gap-2">
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex gap-x-1 flex-grow min-h-0 justify-start items-end `}
              >
                <div className="flex flex-shrink-0 ">
                  {LATEST_MESSAGE?.message_type === 'page' && (
                    <img
                      src={
                        checkStaffExist(LATEST_MESSAGE?.message_metadata) ||
                        './images/earth.svg'
                      }
                      className="w-8 h-8  mask-rounded-oval bg-gray-200"
                      alt=""
                    />
                  )}
                </div>
                <div
                  className={`flex flex-col flex-grow min-w-0 h-full ${
                    IS_CUSTOM_BACKGROUND
                      ? 'bg-slate-400 hover:bg-slate-500 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-500'
                  } rounded-xl p-3  cursor-pointer shadow-md`}
                  onClick={() => handleClickQuickChat()}
                >
                  <div className="flex justify-between items-center w-full gap-x-1 flex-shrink-0">
                    {/* Phần hiển thị thông tin tin nhắn */}
                    <div className="flex justify-between w-full overflow-hidden">
                      <div className=" text-xs font-medium flex items-center overflow-hidden flex-1">
                        {/* Hiển thị tên nhân viên */}
                        {IS_PAGE_AVATAR && (
                          <div className="flex-shrink-0">
                            <span>
                              {truncateSentences(
                                renderStaffName(
                                  staff_list,
                                  LATEST_MESSAGE?.message_metadata
                                ),
                                6
                              )}
                            </span>
                            <span className="mx-0.5">{t('from')}</span>
                          </div>
                        )}

                        {/* Hiển thị tên trang, có thể bị cắt ngắn nếu quá dài */}
                        <span className="mx-0.5 truncate whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                          {!IS_PAGE_AVATAR
                            ? page_name
                            : truncateString(page_name, 10)}
                        </span>
                      </div>

                      {/* Hiển thị thời gian tin nhắn */}
                      <span className=" text-xs font-medium truncate flex items-center flex-shrink-0">
                        <span className="mx-0.5">•</span>
                        <TimeAgo timestamp={LATEST_MESSAGE?.createdAt} />
                      </span>
                    </div>

                    {/* Nút đóng */}
                    <div
                      onClick={(event) => handleClickCloseQuickChat(event)}
                      className="h-5 w-5 cursor-pointer flex justify-center items-center"
                    >
                      <XMarkIcon className="size-5" />
                    </div>
                  </div>

                  {/* Phần nội dung tin nhắn được hiển thị */}
                  <div className="flex flex-grow min-h-0 ">
                    <TemplateMessageComponent data={LATEST_MESSAGE} />
                  </div>
                </div>
              </div>
              <div className="flex gap-x-2 h-11">
                <div className="w-8 h-8"></div>
                <div
                  onClick={() => handleClickQuickChat()}
                  className={`h-11 ${
                    IS_CUSTOM_BACKGROUND
                      ? 'bg-slate-400 text-white'
                      : 'bg-white text-slate-400'
                  }  text-sm flex w-full rounded-xl shadow-md p-3  items-center truncate overflow-hidden whitespace-nowrap`}
                >
                  {t('reply') +
                    ' ' +
                    (!IS_PAGE_AVATAR
                      ? page_name
                      : truncateSentences(
                          renderStaffName(
                            staff_list,
                            LATEST_MESSAGE?.message_metadata
                          ),
                          6
                        ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị tin nhắn chào mừng */}
      {show_welcome_message && (
        <div
          className={`flex ${
            IS_CUSTOM_BACKGROUND
              ? 'bg-slate-400 hover:bg-gray-500 text-white'
              : 'bg-white hover:bg-gray-100 text-slate-500'
          } shadow-lg justify-between w-full gap-x-2 rounded-xl h-16 px-3 py-3 cursor-pointer `}
          onClick={() => handleClickWelcomeMessage()}
        >
          <h4 className="text-sm line-clamp-2">{welcome_message?.message}</h4>
          {/* Nút đóng */}
          <div
            onClick={(event) => handleClickCloseWelcomeMessage(event)}
            className="size-6 cursor-pointer flex justify-center items-center hover:bg-slate-400 rounded-full "
          >
            <XMarkIcon className="size-4" />
          </div>
        </div>
      )}
      {/*  Nút trigger hiện thị bong bóng chat */}
      <button
        onClick={() => handleTriggerLogo()}
        className={`absolute justify-center items-center bottom-4 ${
          POSITION === 'bottom_left'
            ? 'left-2'
            : GLOBAL_PREVIEW_URL
            ? 'right-5 bottom-5'
            : 'right-2'
        }  h-12 w-12 ${
          IS_CUSTOM_BACKGROUND ? 'bg-slate-400 text-white' : 'bg-white'
        } shadow-lg rounded-full  hover:scale-110 ${
          AI_STATUS || IS_VIEW_SCREEN ? 'hidden' : ''
        }  ${
          !show
            ? ' flex z-30 '
            : CURRENT_WIDTH < 768 && CURRENT_WIDTH !== 0
            ? ' hidden'
            : ' flex z-30'
        }`}
      >
        <div
          className={`absolute ${
            /** Khi không có tin nhắn, hoặc đang show, thì không hiện */
            GLOBAL_UNREAD_MESSAGE_COUNT === 0 || show
              ? 'hidden'
              : 'flex justify-center items-center'
          } text-white text-xs truncate right-0 top-0 bg-red-500 h-5 w-5 rounded-full border-2 border-white translate-x-1 -translate-y-1`}
        >
          {GLOBAL_UNREAD_MESSAGE_COUNT < 10
            ? GLOBAL_UNREAD_MESSAGE_COUNT
            : '9+'}
        </div>
        <div className="">
          {show ? (
            <ChevronDownIcon className="size-8" />
          ) : (
            <>
              {IS_LOADING ? (
                <div className="size-8 bg-gray-200 rounded-full animate-pulse" />
              ) : (
                <img
                  src={renderLogo(
                    ORG_ALLOW_LOGO,
                    LOGO_PAGE_CUSTOM,
                    './images/Logo_retion_embed.png'
                  )}
                  alt="Logo Retion"
                  width={30}
                  height={30}
                  className={` ${
                    ORG_ALLOW_LOGO && LOGO_PAGE_CUSTOM
                      ? 'size-8 object-cover rounded-full'
                      : `size-7.5 ${SELECT_BUTTON_EFFECT ? 'animate-zoom' : ''}`
                  }`}
                />
              )}
            </>
          )}
        </div>
      </button>
      {/* Preview Ảnh */}
      <Modal
        is_open={!!GLOBAL_PREVIEW_URL}
        onClose={handleCloseModal}
      >
        {GLOBAL_PREVIEW_URL && (
          <img
            src={GLOBAL_PREVIEW_URL}
            className="max-w-[880px] min-w-96 w-full max-h-screen  h-auto min-h-32 object-contain rounded-lg bg-slate-200"
            alt="Full Attachment"
          />
        )}
      </Modal>
    </div>
  )
}

export default ChatApp
function selectLoadingFirstTime(arg0: boolean): (state: unknown) => unknown {
  throw new Error('Function not implemented.')
}
