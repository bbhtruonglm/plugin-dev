import { ArrowUpCircleIcon } from '@heroicons/react/16/solid'
import { InputProps } from '../../type'
import Upload from '../Upload'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { setSuggestMessage } from '@/stores/appSlice'
import { t } from 'i18next'
import { useDispatch } from 'react-redux'
import { useInputChat } from './useInputChat'

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
  /** Hàm dispatch */
  const dispatch = useDispatch()
  /** Lấy dữ liệu từ hooks */
  const {
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
    AI_STATUS,
  } = useInputChat({
    client_id,
    page_name,
    setLoading,
    handleSend,
    handleError,
    setIsShowKeyboard,
  })

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
                  renderPageName()
            }
            className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium py-1.5 px-1 resize-none truncate"
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
              <ArrowUpCircleIcon className="size-8" />
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
              <XMarkIcon className="absolute bg-slate-500 p-0.5 rounded-full size-4 text-white" />
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
                <ArrowUpCircleIcon className="size-8" />
              </div>
            ) : (
              <ArrowUpCircleIcon className="size-8 text-slate-400" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InputChat
