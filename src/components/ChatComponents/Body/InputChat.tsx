import {
  selectPageId,
  selectPageInfoAI,
  selectStatusAI,
  selectStatusPopup,
  selectSuggestMessage,
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
  const INPUT_REF = useRef<HTMLInputElement>(null)

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

  // useEffect(() => {
  //   /**
  //    * Nếu SHOW_POPUP = true thì focus vào input
  //    */
  //   if (SHOW_POPUP) {
  //     /**
  //      * Focus vào input khi popup mở
  //      */
  //     const TIMER = setTimeout(() => {
  //       /**
  //        * Nếu input tồn tại
  //        */
  //       if (INPUT_REF.current) {
  //         /** Focus vào input khi popup mở */
  //         INPUT_REF.current.focus()
  //         /** Cuộn tới input */
  //         INPUT_REF.current.scrollIntoView({ behavior: 'smooth' })
  //       }
  //       /**
  //        * Delay 200ms để chắc chắn input đã được render
  //        */
  //     }, 200)

  //     /** Chặn cuộn trang khi popup mở */
  //     document.body.style.overflow = 'hidden'
  //     /**
  //      * Clear timeout khi component unmount
  //      */
  //     return () => {
  //       /**
  //        * Clear timeout
  //        */
  //       clearTimeout(TIMER)
  //     }
  //   } else {
  //     /**
  //      * Hiển thị cuộn trang khi popup đóng
  //      */
  //     document.body.style.overflow = 'auto'
  //   }
  // }, [SHOW_POPUP])

  // useEffect(() => {
  //   /**
  //    * Hàm xử lý focus
  //    */
  //   const handleFocus = () => {
  //     /**
  //      *
  //      */
  //     setIsKeyboardOpen(true)
  //     setTimeout(() => {
  //       if (INPUT_REF.current) {
  //         INPUT_REF.current.scrollIntoView({
  //           behavior: 'smooth',
  //           block: 'center',
  //         })
  //       }
  //     }, 200)
  //   }
  //   /**
  //    * Hàm xử lý blur
  //    */
  //   const handleBlur = () => {
  //     setIsKeyboardOpen(false)
  //   }
  //   /**
  //    * Nếu input tồn tại
  //    */
  //   if (INPUT_REF.current) {
  //     INPUT_REF.current.addEventListener('focus', handleFocus)
  //     INPUT_REF.current.addEventListener('blur', handleBlur)
  //   }
  //   /**
  //    * Cleanup
  //    */
  //   return () => {
  //     if (INPUT_REF.current) {
  //       INPUT_REF.current.removeEventListener('focus', handleFocus)
  //       INPUT_REF.current.removeEventListener('blur', handleBlur)
  //     }
  //   }
  // }, [])
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
  const handleKeyDown = (event: any) => {
    /**
     * Nếu key là enter và value tồn tại
     */
    if (event.key === 'Enter' && value) {
      /**
       * Ngăn chặn mặc định của event
       */
      event.preventDefault()
      /**
       * Gửi tin nhắn đi
       */
      handleSend(value)
      /**
       * Reset value
       */
      setValue('')

      // INPUT_REF.current?.blur()
      // setIsKeyboardOpen(false)
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
              handleSend(SUGGEST_MESSAGE)
              dispatch(setSuggestMessage(''))
            }}
            className="outline outline-1 outline-slate-200 rounded-full w-fit px-2 p-1 text-xs cursor-pointer"
          >
            {SUGGEST_MESSAGE}
          </div>
        )}
        <div className="flex justify-between items-center w-full">
          <input
            ref={INPUT_REF}
            onChange={(e) => {
              // e.preventDefault()
              setValue(e.target.value)
            }}
            disabled={preview_url ? true : false}
            value={value}
            onKeyDown={(e) => {
              if (!error_message) {
                handleKeyDown(e)
              }
            }}
            id="input-embed-chat"
            type="text"
            placeholder={
              preview_url
                ? 'Đã chọn 1 ảnh'
                : t('send_message_to_us') +
                  (AI_STATUS ? ' ' + t('virtual_assistant') + ' ' : ' ') +
                  (renderPageName(page_name)
                    ? renderPageName(page_name)
                    : CLIENT_INFO?.page_name)
            }
            className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium py-1.5 px-1"
            onFocus={() => {
              setIsKeyboardOpen(true)
              setIsShowKeyboard && setIsShowKeyboard(true)
            }}
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
