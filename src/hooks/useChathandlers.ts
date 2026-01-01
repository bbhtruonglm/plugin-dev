import { saveQuickChatLatestMessage, saveTimeClosePopup } from '@/utils'
import { setConsultationGlobal, setGlobalPreviewUrl } from '@/stores/appSlice'

import { useDispatch } from 'react-redux'

export const useChatHandlers = ({
  is_show,
  setShow,
  handleToggle,
  handleOff,
  PAGE_ID,
  CLIENT_ID,
  setTypeConsultation,
}: {
  is_show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  handleToggle: () => void
  handleOff: () => void
  PAGE_ID: string
  CLIENT_ID: string | null
  setTypeConsultation: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  /** Hàm dispatch */
  const dispatch = useDispatch()

  /**
   * Hàm xử lý click button
   * @param e - Event hoặc string 'no_toggle'
   * @param has_consultation - Có đang trong trạng thái tư vấn hay không
   */
  const handleBtn = (e: string | any, has_consultation = false) => {
    // Nếu e !== 'no_toggle' thì gọi hàm handleToggle
    if (e !== 'no_toggle') handleToggle()
    /** Đảo trạng thái show */
    setShow(!is_show)
    /** Nếu popup đang đóng (sắp mở) */
    if (!is_show) {
      // Reset tin nhắn mới nhất trong store khi mở popup
      dispatch(setGlobalPreviewUrl(''))
      // Lưu tin nhắn mới nhất vào store
      saveQuickChatLatestMessage(PAGE_ID, CLIENT_ID, null)
    } else {
      /** Lưu thời gian vào localstorage Khi đóng popup */
      saveTimeClosePopup(PAGE_ID)
      /** Nếu có consultation */
      if (has_consultation) {
        /** Lưu trạng thái tư vấn là false*/
        setTypeConsultation(false)
        /** Lưu vào store */
        dispatch(setConsultationGlobal(false))
      }
    }
  }

  /**
   * Hàm đóng popup trên mobile
   * @param has_consultation - Có đang trong trạng thái tư vấn hay không
   */
  const setHideForMobile = (has_consultation = false) => {
    // Tắt trạng thái show
    setShow(false)

    // Clear url preview
    dispatch(setGlobalPreviewUrl(''))

    // Lưu thời gian đóng popup vào localstorage
    saveTimeClosePopup(PAGE_ID)
    /** Nếu có consultation */
    if (has_consultation) {
      /** Lưu trạng thái tư vấn là false*/
      setTypeConsultation(false)
      /** Lưu vào store */
      dispatch(setConsultationGlobal(false))
    }
    // Gọi hàm handle off để tắt hoàn toàn
    handleOff()
  }

  return {
    handleBtn,
    setHideForMobile,
  }
}
