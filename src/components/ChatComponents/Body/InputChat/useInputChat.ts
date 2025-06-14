import {
  selectAiMessageAutoSend,
  selectCurrentUserId,
  selectPageId,
  selectPageInfoAI,
  selectStatusAI,
  selectSuggestMessage,
  setAiMessageAutoSend,
  setSuggestMessage,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

import { useAPI } from '@/api/api'

export function useInputChat({
  client_id,
  page_name,
  setLoading,
  handleSend,
  handleError,
  setIsShowKeyboard,
}: {
  client_id: string
  page_name?: string
  setLoading: (val: boolean) => void
  handleSend: (val: string) => void
  handleError?: (msg: string) => void
  setIsShowKeyboard?: (val: boolean) => void
}) {
  /** Hàm dispatch */
  const dispatch = useDispatch()
  /** Input ref */
  const INPUT_REF = useRef<HTMLTextAreaElement>(null)
  /**
   * giá trị nhập
   */
  const [value, setValue] = useState('')
  /** Preview url */
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  /** File upload */
  const [file, setFile] = useState<File | null>(null)
  /**
   * Trang thái gõ
   */
  const [is_composing, setIsComposing] = useState(false)
  /** Trạng thái mở bàn phím */
  const [is_keyboard_open, setIsKeyboardOpen] = useState(false)
  /** ID Trang */
  const PAGE_ID = useSelector(selectPageId)
  /** Trạng thái AI Agent */
  const AI_STATUS = useSelector(selectStatusAI)
  /** Chữa thống tin người dùng */
  const CLIENT_INFO = useSelector(selectPageInfoAI)
  /** TIn nhắn suggest */
  const SUGGEST_MESSAGE = useSelector(selectSuggestMessage)
  /** AI Tự động gửi tin nhắn */
  const AI_MESSAGE_AUTO_SEND = useSelector(selectAiMessageAutoSend)
  /** User hiện tại */
  const CURRENT_USER_ID = useSelector(selectCurrentUserId)
  /** END POINT gửi tin nhắn */
  const { SEND_MESSAGE_API } = useAPI()
  /**
   * Hàm xử lý khi bắt đầu gõ
   */
  const handleCompositionStart = () => setIsComposing(true)
  /**
   * Hàm xử lý khi kết thúc gõ
   */
  const handleCompositionEnd = () => setIsComposing(false)

  /**
   *  Hàm upload file
   * @param file  File | null
   * @returns  void
   */
  const uploadFile = async (file: File | null) => {
    /**
     * Nếu file tồn tại
     */
    if (file) {
      /**
       * Set loading
       */
      setLoading(true)
      /**
       * Tạo form data
       */
      const FORM_DATA = new FormData()

      /** Lấy ID người dùng */
      const META_DATA_ID = CURRENT_USER_ID || client_id
      /** Thêm metadata vào form data  */
      if (META_DATA_ID) {
        FORM_DATA.append('metadata', `__user_normal__${META_DATA_ID}`)
      }
      /**
       * Thêm file vào form data
       */
      FORM_DATA.append('file', file)
      /**
       * Thêm page_id vào form data
       */
      FORM_DATA.append('page_id', PAGE_ID)
      /**
       * Thêm client_id vào form data
       */
      FORM_DATA.append('client_id', client_id)

      /** Kiểm tra kích thước file */
      if (file.size > 1 * 1024 * 1024) {
        /** 1MB = 1 * 1024 * 1024 bytes */
        /**
         * Xử lý error
         */
        handleError &&
          handleError('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 1MB.')
        /**
         * Reset file và preview_url
         */
        setFile(null)
        /**
         * Reset preview_url
         */
        setPreviewUrl(null)
        /**
         * Set loading
         */
        setLoading(false)
        /**
         * Return
         */
        return
      }
      try {
        /**
         * Gửi tin nhắn đi
         */
        const RES = await fetch(SEND_MESSAGE_API, {
          method: 'POST',
          body: FORM_DATA,
        })

        /**
         * set loading
         */
        setLoading(false)
        /**
         * Reset file
         */
        setFile(null)
        /**
         * Reset preview_url
         */
        setPreviewUrl(null)
      } catch (error) {
        /** Gửi tin nhắn đi, reset các file
         * Đoạn này cần check lại vì không có xử lý error
         */
        handleError && handleError('Có lỗi xảy ra, vui lòng thử lại sau.')
        /**
         * Set loading
         */
        setLoading(false)
        /**
         * Reset file
         */
        setFile(null)
        /**
         * Reset preview_url
         */
        setPreviewUrl(null)
      }
    }
  }

  /**
   * Hàm xử lý keydown
   * @param event any
   * @returns void
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || is_composing) return
    /** Cho phép xuống dòng khi Shift + Enter */
    if (event.shiftKey) return
    event.preventDefault()
    /** Nếu có file, ưu tiên upload */
    if (file) {
      /** Goi ham upload */
      uploadFile(file)
      /** Nếu không có ảnh nhưng có text thì gửi */
    } else if (value.trim()) {
      /** Goi ham send message */
      handleSend(value)
      /** Reset giá trị */
      setValue('')
    }
  }

  /** Hàm xử lý paste
   * @param event React.ClipboardEvent<HTMLTextAreaElement>
   */
  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    /** Nếu là Trạng thái AI thì không cho gửi ảnh */
    if (AI_STATUS) {
      return
    }

    /** Lấy item trong clipboard */
    const ITEMS = event.clipboardData.items
    /** Tạo vòng lắp */
    for (let i = 0; i < ITEMS.length; i++) {
      /** Lấy item */
      const ITEM = ITEMS[i]
      /**
       *  Nếu item là file
       */
      if (ITEM.kind === 'file') {
        /**
         * Lấy file
         */
        const FILE = ITEM.getAsFile()
        /**
         * Nếu file la image
         */
        if (FILE && FILE.type.startsWith('image/')) {
          /**
           * Set file
           */
          setFile(FILE)
          /**
           * Tạo đối tượng FileReader
           */
          const READER = new FileReader()
          /**
           * Xuất file
           */
          READER.onload = () => {
            setPreviewUrl(READER.result as string)
          }
          /**
           * Xử lý khi load xong file
           */
          READER.readAsDataURL(FILE)
          /**
           * Ngăn chặn mặc định của event
           */
          event.preventDefault()
          return
        }
      }
    }
  }

  /**
   * Hàm xử lý click popup
   */
  const handleClickPopup = () => {
    /** Chắc chắn focus vào input khi popup được mở và người dùng click vào popup */
    if (INPUT_REF.current) {
      /**
       * Focus vào input khi popup mở
       */
      // INPUT_REF.current.focus()
      /**
       * Cuộn tới input
       */
      INPUT_REF.current.scrollIntoView({ behavior: 'smooth' })
    }
  }
  /**
   * Render page name
   * @param page_name string
   * @returns string
   */
  const renderPageName = () => {
    return page_name || CLIENT_INFO?.page_name || ''
  }

  /**
   * Lắng nghe sự kiện touchmove để tắt bàn phím khi user vuốt
   */
  useEffect(() => {
    /**
     * Hàm xử lý touchmove
     */
    const handleTouchMove = () => {
      /** Nếu bàn phím mở */
      if (is_keyboard_open) {
        /** Tắt bàn phím khi user vuốt */
        INPUT_REF.current?.blur()
        /** Tắt bàn phím */
        setIsKeyboardOpen(false)
        /**
         * Tắt bàn phím
         */
        setIsShowKeyboard && setIsShowKeyboard(false)
      }
    }
    document.body.style.overflow = 'hidden'
    /**
     * Nếu bàn phím mở và popup đóng thì tắt bàn phím
     */
    window.addEventListener('touchmove', handleTouchMove)
    /**
     * Cleanup
     */
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [is_keyboard_open])

  /** Nếu có text auto send thì tự động gửi */
  useEffect(() => {
    /**
     * Nếu text auto send thì tự động gửi, reset text
     */
    if (AI_MESSAGE_AUTO_SEND) {
      /** Tự dộng gửi */
      handleSend(AI_MESSAGE_AUTO_SEND)
      /** reset trong store */
      dispatch(setAiMessageAutoSend(''))
    }
  }, [AI_MESSAGE_AUTO_SEND])

  return {
    INPUT_REF,
    value,
    setValue,
    preview_url,
    setPreviewUrl,
    file,
    setFile,
    handleKeyDown,
    handlePaste,
    handleCompositionStart,
    handleCompositionEnd,
    uploadFile,
    handleClickPopup,
    renderPageName,
    is_keyboard_open,
    setIsKeyboardOpen,
    SUGGEST_MESSAGE,
    dispatch,
    setSuggestMessage,
    AI_STATUS,
    CLIENT_INFO,
  }
}
