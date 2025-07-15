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
   *  Hàm click btn
   * @param e
   * @param has_consultation
   */
  const handleBtn = (e: string | any, has_consultation = false) => {
    /** Nếu e !== 'no_toggle' thì gọi hàm handleToggle*/
    if (e !== 'no_toggle') {
      handleToggle()
    }
    /** Tắt trạng thái show */
    setShow(!is_show)
    /** Nếu popup đóng */
    if (!is_show) {
      /** Khi mở chỉ reset tin nhắn mới nhất trong store */
      dispatch(setGlobalPreviewUrl(''))
      /** Lưu tin nhắn mới nhất vào store */
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

  /** Hàm đóng popup dạng mobile */
  const setHideForMobile = (has_consultation = false) => {
    /** Tắt trạng thái show */
    setShow(false)
    /** Clear url preview */
    dispatch(setGlobalPreviewUrl(''))
    /** Lưu thời gian vào localstorage Khi đóng popup */
    saveTimeClosePopup(PAGE_ID)
    /** Nếu có consultation */
    if (has_consultation) {
      /** Lưu trạng thái tư vấn là false*/
      setTypeConsultation(false)
      /** Lưu vào store */
      dispatch(setConsultationGlobal(false))
    }
    /** Gọi hàm handle off */
    handleOff()
  }

  return {
    handleBtn,
    setHideForMobile,
  }
}
