import {
  getQuickChatStatusKey,
  postMessageToParent,
  saveTimeClosePopup,
} from '@/utils'
import {
  setGlobalUnreadCount,
  setLatestMessageGlobal,
  setListMessage,
  setListUnreadMessage,
  setLoadingGlobal,
} from '@/stores/appSlice'

import { t } from 'i18next'

function useChatAppAction({
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
}: {
  /** Hàm set current tab */
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>
  /** Hàm dispatch */
  dispatch: any
  /** Page id */
  PAGE_ID: string
  /** ID client  */
  CLIENT_STORED: string | null
  /** Hàm set Số tin nhắn chưa đọc */
  saveQuickChatCount: any
  /** Hàm set tin nhắn mới nhất */
  saveQuickChatLatestMessage: any
  /** Hàm set Lỗi */
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>
  /** Handle btn */
  handleBtn: (value?: string) => void
  /** Position Detail */
  POSITION_DETAIL: any
  /** Position */
  POSITION: any
  /** setShowWelcomeMessage */
  setShowWelcomeMessage: React.Dispatch<React.SetStateAction<boolean>>
  /** show */
  show: boolean
  /** current_tab */
  current_tab: string
  /** IS_SHOW_HOME */
  IS_SHOW_HOME?: boolean
}) {
  /** Hàm thoát khỏi màn chat */
  const userOutChat = () => {
    /** Khi back ra thì về trang Home */
    setCurrentTab('home')
    /** Reset store khi thoát khỏi màn chat */
    /** 1. Tin nhắn mới nhất */
    dispatch(setLatestMessageGlobal(null))
    /** 2. Reset danh sách tin nhắn trong store */
    dispatch(setListMessage([]))
    /** 3. Reset Số tin nhắn chưa đọc localStorage */
    saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
    /** 4. Reset tin nhắn mới nhất trong localStorage */
    saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
    /** 5. Reset danh sách tin nhắn chưa đọc trong Store */
    dispatch(setListUnreadMessage([]))
    /** 6. Reset unread count */
    dispatch(setGlobalUnreadCount(0))
  }

  /** Hàm navigate ở màn home */
  const onHomeNavigate = () => {
    /** setCurrentTab */
    setCurrentTab('message')
    /** 1. Reset Số tin nhắn chưa đọc localStorage */
    saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
    /** 2. Reset tin nhắn mới nhất trong localStorage */
    saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
    /** 3. Set loading global */
    dispatch(setLoadingGlobal(true))
    /** 4. Reset danh sách tin nhắn chưa đọc trong Store */
    dispatch(setListUnreadMessage([]))
    /** 5. Reset unread count */
    dispatch(setGlobalUnreadCount(0))
  }

  /** Hàm click vào menu
   * @param value
   */
  const onClickMenu = (value: string) => {
    /** Nếu đang ở home thì set tab = value */
    if (value !== 'message') {
      setCurrentTab(value)
    } else {
      /** set tab = message */
      setCurrentTab('message')
      /** Khi ấn vào tab message,
       * => Vì khi vào trong tab sẽ fetch api đọc tin nhắn,
       * => không cần các state này nữa
       *  */
      dispatch(setListUnreadMessage([]))
      /**  reset tin nhắn mới nhất */
      dispatch(setLatestMessageGlobal(null))
      /** * reset mảng tin nhắn chưa đọc */
      dispatch(setGlobalUnreadCount(0))
      /** RESET LOADING */
      dispatch(setLoadingGlobal(true))
      /** 4. Reset Số tin nhắn chưa đọc localStorage */
      saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

      /** 5. Reset tin nhắn mới nhất trong localStorage */
      saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
      /** Nếu không có page_id */
      if (PAGE_ID === null) {
        /** Không có page_id thì tạo message Lỗi */
        setErrorMessage(t('errorMessage'))
      }
    }
  }

  /** Hàm click vào trả lời */
  const handleClickQuickChat = (event?: any) => {
    /**
     * ANTI-EXTENSION: Kiểm tra event isTrusted
     * Nếu không phải user thật click (isTrusted === false) thì chặn lại
     */
    if (event && event.isTrusted === false) {
      console.warn('Blocked scripted click from extension')
      return
    }

    /** Khi click trả lời sẽ  reset hết data trong store */
    dispatch(setLatestMessageGlobal(null))
    /** Reset danh sách tin nhắn chưa đọc trong Store */
    dispatch(setListUnreadMessage([]))
    /** Reset danh sách tin nhắn trong store */
    dispatch(setListMessage([]))
    /** Reset unread count */
    dispatch(setGlobalUnreadCount(0))
    /** Khi click vào trả lời, xoá unread_count */
    saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
    /* Chuyển tab thành message */
    setCurrentTab('message')
    /** trigger hàm đóng mở popup */
    handleBtn()
  }
  /** Hàm close quick chat
   * @param event
   */
  const handleClickCloseQuickChat = (event: any) => {
    /** Ngăn chặn sự kiện mặc định */
    event.stopPropagation()
    /** Reset tin nhắn mới nhất */
    dispatch(setLatestMessageGlobal(null))
    /** Reset unread count */
    dispatch(setGlobalUnreadCount(0))
    /** Lưu thời gian đóng popup */
    saveTimeClosePopup(PAGE_ID)
    /** Lưu tin nhắn mới nhất trong localStorage */
    saveQuickChatLatestMessage(PAGE_ID, CLIENT_STORED, null)
    /** Lưu trạng thái màn chat */
    localStorage.setItem(getQuickChatStatusKey(PAGE_ID), 'hide_quick_chat')
    /** Post message */
    postMessageToParent(
      false,
      false,
      undefined,
      undefined,
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
  }

  /** Hàm click vào tin nhắn chào */
  const handleClickWelcomeMessage = (e: any) => {
    /**
     * ANTI-EXTENSION: Kiểm tra event isTrusted
     * Nếu không phải user thật click (isTrusted === false) thì chặn lại
     */
    if (e && e.isTrusted === false) {
      console.warn('Blocked scripted click from extension')
      return
    }
    /** Hàm click vào trả lời */
    handleClickQuickChat(e)
    /**
     * Khi click vào ẩn tin nhắn chào mừng,
     */
    setShowWelcomeMessage(false)
  }
  /** Hàm close tin nhắn chào
   * @param event
   */
  const handleClickCloseWelcomeMessage = (event: any) => {
    /** Prevent sự kiện mặc định */
    event.stopPropagation()
    /** Post message */
    postMessageToParent(
      false,
      false,
      undefined,
      undefined,
      POSITION,
      POSITION_DETAIL?.bottom,
      POSITION_DETAIL?.right,
      POSITION_DETAIL?.left
    )
    /** Tắt trạng thái tin nhắn chào */
    setShowWelcomeMessage(false)
  }

  /**
   * Xử lý sự kiện click logo
   * @param {any} event - Event click
   */
  const handleTriggerLogo = (event?: any) => {
    console.log(event, 'event')
    /**
     * ANTI-EXTENSION: Kiểm tra event isTrusted
     * Nếu không phải user thật click (isTrusted === false) thì chặn lại
     */
    if (event && event.isTrusted === false) {
      console.warn('Blocked scripted click from extension')
      return
    }

    setTimeout(() => {
      /**
       * Khi click vào
       */
      if (!show && (current_tab === 'message' || !IS_SHOW_HOME)) {
        /**
         * Khi click vào ẩn tin nhắn chào mừng,
         */
        setShowWelcomeMessage(false)
        /** Khi click vào trả lời, xoá unread_count */
        saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)

        /** Reset hết data trong store */
        dispatch(setLatestMessageGlobal(null))
        /** Reset danh sách tin nhắn chưa đọc trong Store */
        dispatch(setListUnreadMessage([]))
        /** Reset danh sách tin nhắn trong store */
        dispatch(setListMessage([]))
        /** Reset unread count */
        dispatch(setGlobalUnreadCount(0))
        /** Post message */
        postMessageToParent(
          false,
          false,
          undefined,
          undefined,
          POSITION,
          POSITION_DETAIL?.bottom,
          POSITION_DETAIL?.right,
          POSITION_DETAIL?.left
        )
      }
      /**
       * Khi click vào nút trigger,
       * nếu đang ở tab message thì reset tin nhắn mới nhất và tin nhắn chưa đọc
       */
      handleBtn('no_toggle')
      /**
       * Reset tin nhắn mới nhất trong store
       */
      setErrorMessage('')
      /**
       * Reset tin nhắn mới nhất trong store
       */
      setShowWelcomeMessage(false)
      /** Delay 200ms */
    }, 200)
  }

  /** Trả về các hàm sử dụng */
  return {
    userOutChat,
    onHomeNavigate,
    onClickMenu,
    handleClickQuickChat,
    handleClickCloseQuickChat,
    handleClickWelcomeMessage,
    handleClickCloseWelcomeMessage,
    handleTriggerLogo,
  }
}

export default useChatAppAction
