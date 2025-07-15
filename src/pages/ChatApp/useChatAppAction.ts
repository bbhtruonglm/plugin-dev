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
       * reset tin nhắn mới nhất
       * reset mảng tin nhắn chưa đọc
       * => Vì khi vào trong tab sẽ fetch api đọc tin nhắn,
       * => không cần các state này nữa
       *  */
      dispatch(setListUnreadMessage([]))
      dispatch(setLatestMessageGlobal(null))
      dispatch(setGlobalUnreadCount(0))
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
  /** Trả về các hàm sử dụng */
  return {
    userOutChat,
    onHomeNavigate,
    onClickMenu,
  }
}

export default useChatAppAction
