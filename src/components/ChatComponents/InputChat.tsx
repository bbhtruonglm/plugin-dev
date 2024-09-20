import { ReactComponent as Arrow } from '../../assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '../../assets/Icon_up_circle_slate.svg'
import { ReactComponent as Close } from '@/assets/close.svg'
import Upload from './Upload'
import { t } from 'i18next'
import { useAPI } from '@/api/api'
import { useState } from 'react'

interface InputProps {
  handleSend: (e: any) => void
  loading: boolean
  error_message: String | null
  page_name?: string
  page_id: string
  client_id: string
  setLoading: (e: boolean) => void
}
function InputChat({
  handleSend,
  loading,
  error_message,
  page_name,
  page_id,
  client_id,
  setLoading,
}: InputProps) {
  const [value, setValue] = useState('')
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const { SEND_MESSAGE_API } = useAPI()

  /** Upload file */
  const uploadFile = async (file: File | null) => {
    if (file) {
      // Set loading
      setLoading(true)
      /** Khởi tạo form data */
      const FORM_DATA = new FormData()
      // Thêm file ảnh vào form
      FORM_DATA.append('file', file)
      // Thêm các trường còn lại vào form
      FORM_DATA.append('page_id', page_id)
      FORM_DATA.append('client_id', client_id)

      // gửi tin nhắn đi
      try {
        await fetch(SEND_MESSAGE_API, {
          method: 'POST',
          body: FORM_DATA,
        })
        setLoading(false)
        setFile(null)
        setPreviewUrl(null)
      } catch (error) {
      } finally {
      }
    }
  }

  /** Cho phép ấn Enter để gửi */
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault()
      handleSend(value)
      setValue('')
    }
  }

  return (
    <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full px-5 gap-2">
      <div className="bg-white w-full flex justify-between gap-2 items-center h-full py-2 px-4 rounded-full">
        <Upload
          setPreviewUrl={(e) => {
            // Lưu file
            setFile(e)
            // Tạo đối tượng READER
            const READER = new FileReader()
            READER.onload = () => {
              // Lưu base64 preview
              setPreviewUrl(READER.result as string)
            }
            // Đọc file dưới dạng URL data
            READER.readAsDataURL(e)
          }}
        />
        {/* ô input chat */}
        <input
          onChange={(e) => {
            setValue(e.target.value)
          }}
          disabled={preview_url ? true : false}
          value={value}
          onKeyDown={(e) => {
            if (!error_message) {
              handleKeyDown(e)
            }
          }}
          type="text"
          placeholder={
            preview_url
              ? 'Đã chọn 1 ảnh'
              : t('send_message_to_us') + ' ' + page_name
          }
          className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium"
        />
        {/* Preview ảnh */}
        {!loading && preview_url && (
          <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-1">
            <div
              className="flex justify-between cursor-pointer relative"
              onClick={() => {
                // Xoá Preview url
                setPreviewUrl(null)
                setFile(null)
              }}
            >
              <Close className="absolute bg-slate-500 p-1 rounded-full" />
            </div>
            <img
              src={preview_url}
              alt="Preview"
              className="w-16 h-16 object-contain  bg-gray-100 rounded-lg"
            />
          </div>
        )}

        <div>
          {value || preview_url ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                // Khi không có preview ảnh thì gửi text như bình thường
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
          ) : (
            <ArrowSlate />
          )}
        </div>
      </div>
    </div>
  )
}

export default InputChat
