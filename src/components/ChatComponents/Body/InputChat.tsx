import {
  selectAiMessageAutoSend,
  selectCurrentUserId,
  selectPageId,
  selectPageInfoAI,
  selectStatusAI,
  selectStatusPopup,
  selectSuggestMessage,
  setAiMessageAutoSend,
  setSuggestMessage,
} from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'

import { ReactComponent as Arrow } from '@/assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '@/assets/Icon_up_circle_slate.svg'
import { ReactComponent as Close } from '@/assets/close.svg'
import { InputProps } from '../type'
import Upload from './Upload'
import { t } from 'i18next'
import { useAPI } from '@/api/api'

function InputChat({
  handleSend,
  loading,
  error_message,
  page_name,
  client_id,
  setLoading,
  handleError,
  is_show_keyboard,
  setIsShowKeyboard,
  page_ref,
}: InputProps) {
  /**
   * Input Ref
   */
  // const INPUT_REF = useRef<HTMLInputElement>(null)
  const INPUT_REF = useRef<HTMLTextAreaElement>(null)

  /**
   * @param SHOW_POPUP: boolean
   * Lấy trạng thái của popup
   */
  const SHOW_POPUP = useSelector(selectStatusPopup)
  /**
   * @param value: string
   * Lưu giá trị của input
   */
  const [value, setValue] = useState('')
  /**
   * @param preview_url: string | null
   * Lưu url của ảnh preview
   */
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  /**
   * @param file: File | null
   * Lưu file ảnh
   */
  const [file, setFile] = useState<File | null>(null)
  /**
   * @param AI_STATUS: boolean
   * Lấy trạng thái của AI
   */
  const { SEND_MESSAGE_API } = useAPI()
  /**
   * @param PAGE_ID: string
   * Lấy page_id
   */
  const PAGE_ID = useSelector(selectPageId)
  /**
   * @param AI_STATUS: boolean
   * Lấy trạng thái của AI
   */
  const AI_STATUS = useSelector(selectStatusAI)
  /**
   * Data client info
   */
  const CLIENT_INFO = useSelector(selectPageInfoAI)

  /**
   * Tin nhắn suggest
   */
  const SUGGEST_MESSAGE = useSelector(selectSuggestMessage)

  /**
   * Tin nhắn tự động gửi
   */
  const AI_MESSAGE_AUTO_SEND = useSelector(selectAiMessageAutoSend)
  /**
   * CURRENT_USER_ID
   */
  const CURRENT_USER_ID = useSelector(selectCurrentUserId)

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
  /** Trạng thái composing */
  const [is_composing, setIsComposing] = useState(false)

  /**
   * Hàm xử lý khi bắt đầu gõ
   */
  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  /**
   * Hàm xử lý khi kết thúc gõ
   */
  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  /**
   * Hàm xử lý keydown
   * @param event any
   * @returns void
   */

  // const handleKeyDown = (
  //   event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   console.log(event, 'eventttt')
  //   /** Nếu key là enter */
  //   if (event.key === 'Enter') {
  //     /** Nếu đang gõ tiếng Việt, bỏ qua */
  //     if (is_composing) return
  //     /** Nếu shift key */
  //     if (event.shiftKey) {
  //       /** Cho phép xuống dòng (nếu là <textarea>) */
  //       return
  //     }
  //     /**
  //      * Nếu value tồn tại
  //      */
  //     if (value) {
  //       /**
  //        * Ngăn chặn mặc định của event
  //        */
  //       event.preventDefault()
  //       /**
  //        * Gửi tin nhắn đi
  //        */
  //       handleSend(value)
  //       /**
  //        * Reset value
  //        */
  //       setValue('')
  //     }
  //   }
  // }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      if (is_composing) return

      // Cho phép xuống dòng khi Shift + Enter
      if (event.shiftKey) return

      event.preventDefault()

      // Ưu tiên upload ảnh nếu có
      if (file) {
        uploadFile(file)
        return
      }

      // Nếu không có ảnh nhưng có text thì gửi
      if (value.trim()) {
        handleSend(value)
        setValue('')
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
  const renderPageName = (page_name?: string) => {
    /**
     * Nếu page_name tồn tại
     */
    if (page_name) {
      /**
       * Trả về page_name
       */
      return page_name
    }
    /**
     * Trả về tên trang
     */
    return ''
  }
  const dispatch = useDispatch()
  /** Trạng thái mở keyboard */
  const [is_keyboard_open, setIsKeyboardOpen] = useState(false)
  /**
   * Lắng nghe sự kiện touchmove để tắt bàn phím khi user vuốt
   */
  useEffect(() => {
    /**
     * Hàm xử lý touchmove
     */
    const handleTouchMove = () => {
      if (is_keyboard_open) {
        /** Tắt bàn phím khi user vuốt */
        INPUT_REF.current?.blur()
        setIsKeyboardOpen(false)
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

  return (
    <div
      className={`absolute flex justify-center items-center bg-transparent w-full ${
        AI_STATUS ? 'px-2 gap-1  bottom-3' : 'px-5 bottom-4 gap-2'
      } `}
      /** Thêm sự kiện click để trigger focus */
      onClick={handleClickPopup}
    >
      <div
        className={`bg-white w-full flex shadow-sm ${
          SUGGEST_MESSAGE
            ? 'flex-col rounded-xl gap-y-1'
            : 'flex-row justify-between items-center rounded-full gap-2'
        }   h-full py-2 px-4`}
      >
        {!AI_STATUS && (
          <Upload
            setPreviewUrl={(e: File) => {
              /**
               * Set file
               */
              setFile(e)
              /**
               * Tạo đối tượng FileReader
               */
              const READER = new FileReader()
              /**
               * Xử lý khi load xong file
               */
              READER.onload = () => {
                setPreviewUrl(READER.result as string)
              }
              /**
               * Đọc file
               */
              READER.readAsDataURL(e)
            }}
          />
        )}
        {SUGGEST_MESSAGE && (
          <div
            onClick={() => {
              /**
               * Gửi suggest message
               */
              handleSend(SUGGEST_MESSAGE)
              /**
               * Reset suggest message
               */
              dispatch(setSuggestMessage(''))
            }}
            className="outline outline-1 outline-slate-200 rounded-full w-fit px-2 p-1 text-xs cursor-pointer"
          >
            {SUGGEST_MESSAGE}
          </div>
        )}
        <div className="flex justify-between items-center w-full">
          <textarea
            ref={INPUT_REF}
            onChange={(e) => setValue(e.target.value)}
            // disabled={preview_url ? true : false}
            value={value}
            onKeyDown={(e) => {
              /** Nếu không có error */
              if (!error_message) {
                /** Xuất sự kiện */
                handleKeyDown(e)
              }
            }}
            rows={1}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onPaste={handlePaste} // ✨ thêm xử lý paste
            autoComplete="off"
            id="input-embed-chat"
            placeholder={
              preview_url
                ? t('selected_one_image')
                : t('send_message_to_us') +
                  (AI_STATUS ? ' ' + t('virtual_assistant') + ' ' : ' ') +
                  (renderPageName(page_name)
                    ? renderPageName(page_name)
                    : CLIENT_INFO?.page_name)
            }
            className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium py-1.5 px-1 resize-none"
          />

          {AI_STATUS && value && (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!loading && !error_message && preview_url === null) {
                  handleSend(value)
                  setValue('')
                } else {
                  uploadFile(file)
                }
              }}
            >
              <Arrow />
            </div>
          )}
        </div>
        {!loading && preview_url && (
          <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-1">
            <div
              className="flex justify-between cursor-pointer relative"
              onClick={() => {
                setPreviewUrl(null)
                setFile(null)
              }}
            >
              <Close className="absolute bg-slate-500 p-1 rounded-full" />
            </div>
            <img
              src={preview_url}
              alt="Preview"
              className="w-16 h-16 object-contain bg-gray-100 rounded-lg"
            />
          </div>
        )}
        {!AI_STATUS && (
          <div>
            {value || preview_url ? (
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  if (!loading && !error_message && preview_url === null) {
                    handleSend(value)
                    setValue('')
                    e.preventDefault()
                    INPUT_REF.current?.blur()
                    setIsKeyboardOpen(false)
                    setIsShowKeyboard && setIsShowKeyboard(false)
                    /** Tắt bàn phím khi user vuốt */
                  } else {
                    uploadFile(file)
                  }
                }}
              >
                <Arrow />
              </div>
            ) : (
              <ArrowSlate />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InputChat
