import {
  selectAiMessageAutoSend,
  selectClientName,
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
import { t } from 'i18next'

export function useInputChat({
  client_id,
  page_name,
  setLoading,
  handleSend,
  handleUpload,
  handleError,
  setIsShowKeyboard,
}: {
  client_id: string
  page_name?: string
  setLoading: (val: boolean) => void
  handleSend: (val: string) => void
  handleUpload?: (file: File) => void
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
  /** Lấy tên khách hàng từ store */
  const CLIENT_NAME = useSelector(selectClientName)
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
  /** Giới hạn dung lượng file tối đa (1MB) */
  const MAX_FILE_SIZE = 1 * 1024 * 1024

  /**
   * Thực hiện tải tệp tin lên máy chủ.
   * Tại sao: Cần gửi tệp tin từ khách hàng lên hệ thống để hiển thị trong hội thoại và lưu trữ.
   * @param {File | null} file - Đối tượng tệp tin cần tải lên
   */
  const uploadFile = async (file: File | null) => {
    // Kiểm tra sự tồn tại của tệp tin trước khi xử lý
    if (file) {
      // Hiển thị trạng thái đang tải lên
      setLoading(true)

      // Kiểm tra dung lượng file để đảm bảo hiệu suất hệ thống
      if (file.size > MAX_FILE_SIZE) {
        // Gửi thông báo lỗi cho người dùng nếu file vượt quá giới hạn
        handleError &&
          handleError(t('file_too_large') || 'Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 1MB.')
        // Dọn dẹp trạng thái tệp tin và dừng xử lý
        setFile(null)
        setPreviewUrl(null)
        setLoading(false)
        return
      }

      // Xử lý tải lên theo phương thức Optimistic nếu có hàm handleUpload được cung cấp
      if (handleUpload) {
        handleUpload(file)
        setFile(null)
        setPreviewUrl(null)
        setLoading(false)
        return
      }

      /** Chuẩn bị dữ liệu FormData để gửi yêu cầu lên API */
      const FORM_DATA = new FormData()
      /** Xác định ID định danh để gắn vào metadata của tin nhắn */
      const META_DATA_ID = CURRENT_USER_ID || client_id

      // Đính kèm thông tin metadata nếu có đầy đủ định danh
      if (META_DATA_ID) {
        FORM_DATA.append(
          'metadata',
          `__${CLIENT_NAME || t('anonymous')}__${META_DATA_ID}`,
        )
      }
      // Bổ sung các thông tin tệp tin và ID cần thiết vào FormData
      FORM_DATA.append('file', file)
      FORM_DATA.append('page_id', PAGE_ID)
      FORM_DATA.append('client_id', client_id)

      try {
        // Thực hiện gửi yêu cầu POST đến máy chủ thông qua fetch
        await fetch(SEND_MESSAGE_API, {
          method: 'POST',
          body: FORM_DATA,
        })
        // Cập nhật trạng thái sau khi tải lên thành công
        setLoading(false)
        setFile(null)
        setPreviewUrl(null)
      } catch (e) {
        // Xử lý ngoại lệ trong trường hợp quá trình tải lên gặp lỗi
        handleError && handleError(t('upload_failed') || 'Có lỗi xảy ra, vui lòng thử lại sau.')
        // Đảm bảo tắt loading và dọn dẹp trạng thái tệp tin
        setLoading(false)
        setFile(null)
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

      /** Nếu không phải AI thì không scroll */
      if (!AI_STATUS) {
        /**
         * Cuộn tới input
         */
        // INPUT_REF.current.scrollIntoView({ behavior: 'smooth' })
      }
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
