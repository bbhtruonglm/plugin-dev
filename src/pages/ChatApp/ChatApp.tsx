import {
  ChatBubbleOvalLeftEllipsisIcon as ActiveMessage,
  HomeIcon,
} from '@heroicons/react/24/solid'
import {
  HomeIcon as HomeIconOutline,
  ChatBubbleOvalLeftEllipsisIcon as InactiveMessage,
} from '@heroicons/react/24/outline'
import { saveQuickChatCount, saveQuickChatLatestMessage } from '@/utils'
import { useDispatch } from 'react-redux'

import { ChatAppProps } from '../type'
import ChatScreen from '@/screens/ChatScreen/Chat/Chat'
import FeedbackModal from './components/FeedbackModal'
import Header from './components/Header'
import Home from '@/screens/ChatScreen/Home'
import Menu from './components/Menu'
import Modal from '@/components/ChatComponents/Modal/Modal'
import OrderConfirmationModal from './components/OrderConfirmation'
import QuickChat from './components/QuickChat'
import TriggerButton from './components/TriggerButton'
import WelcomeMessage from './components/WelcomeMessage'
import { isEmpty } from 'lodash'

import useChatApp from './useChatApp'
import useChatAppAction from './useChatAppAction'
import { useTranslation } from 'react-i18next'

/**
 * Component ChatApp chính
 * @param props Props của ChatApp
 */
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
    GLOBAL_DATA_ORDER,
    GLOBAL_DATA_FEEDBACK,
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
  ]

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
            {/** Kiểm tra kết nối mạng */}
            {!IS_ONLINE && (
              <div className="absolute top-28 left-[30%] text-xs bg-blue-300 p-2 rounded-lg text-white z-10">
                {t('no_internet_connection')}
              </div>
            )}
            {/** Render Home Screen */}
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
            {/** Render Chat Screen */}
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
            <Menu
              menuList={MENU_LIST}
              onClick={onClickMenu}
              currentTab={current_tab}
              unreadCount={GLOBAL_UNREAD_MESSAGE_COUNT}
            />
          )}
        </div>
      )}
      {/* Quick chat */}
      <QuickChat
        layoutClass={getQuickchatLayout(
          show,
          LATEST_MESSAGE,
          GLOBAL_UNREAD_MESSAGE_COUNT,
          SHOW_QUICK_CHAT
        )}
        latestMessage={LATEST_MESSAGE}
        checkStaffExist={checkStaffExist as any}
        isCustomBackground={!!IS_CUSTOM_BACKGROUND}
        onClick={handleClickQuickChat}
        isPageAvatar={!!IS_PAGE_AVATAR}
        staffList={staff_list}
        pageName={page_name}
        onClose={handleClickCloseQuickChat}
        t={t as any}
      />

      {/* Hiển thị tin nhắn chào mừng */}
      <WelcomeMessage
        showWelcomeMessage={show_welcome_message}
        isCustomBackground={!!IS_CUSTOM_BACKGROUND}
        welcomeMessage={welcome_message}
        onClick={handleClickWelcomeMessage}
        onClose={handleClickCloseWelcomeMessage}
      />
      {/*  Nút trigger hiện thị bong bóng chat */}
      <TriggerButton
        onClick={handleTriggerLogo}
        position={POSITION || 'bottom_right'}
        globalPreviewUrl={GLOBAL_PREVIEW_URL || null}
        isCustomBackground={!!IS_CUSTOM_BACKGROUND}
        aiStatus={!!AI_STATUS}
        isViewScreen={!!IS_VIEW_SCREEN}
        show={show}
        currentWidth={CURRENT_WIDTH}
        unreadCount={GLOBAL_UNREAD_MESSAGE_COUNT}
        orgAllowLogo={!!ORG_ALLOW_LOGO}
        logoPageCustom={LOGO_PAGE_CUSTOM || null}
        selectButtonEffect={!!SELECT_BUTTON_EFFECT}
      />
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

      <FeedbackModal
        is_open={!isEmpty(GLOBAL_DATA_FEEDBACK)}
        onClose={handleCloseModal}
        companyName="Thu Hà Nội 3"
        avatarUrl="/avatar.jpg"
        onSubmit={(rating, feedback) => {
          console.log('Rating:', rating, 'Feedback:', feedback)
        }}
        data={GLOBAL_DATA_FEEDBACK}
      />

      <OrderConfirmationModal
        is_open={!isEmpty(GLOBAL_DATA_ORDER)}
        onClose={handleCloseModal}
        data={GLOBAL_DATA_ORDER}
      />
    </div>
  )
}

export default ChatApp
