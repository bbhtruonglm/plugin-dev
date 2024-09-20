import { ReactComponent as Arrow } from '../../assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '../../assets/Icon_up_circle_slate.svg'
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
}
function InputChat({
  handleSend,
  loading,
  error_message,
  page_name,
  page_id,
  client_id,
}: InputProps) {
  const [value, setValue] = useState('')
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  const [reset_trigger, setResetTrigger] = useState(false)
  const [is_sending, setIsSending] = useState(false)
  const { SEND_MESSAGE_API } = useAPI()

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
          page_id={page_id}
          client_id={client_id}
          setPreviewUrl={(e) => {
            setPreviewUrl(e)
          }}
          reset_trigger={reset_trigger}
          is_sending={is_sending}
        />
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
        {preview_url && (
          <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-2">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => {
                setPreviewUrl(null)
                setResetTrigger(!reset_trigger)
              }}
            >
              <h3 className="text-sm">Huỷ</h3>
            </div>
            <img
              src={preview_url}
              alt="Preview"
              className="w-32 h-32 object-cover  bg-gray-100 rounded-lg"
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
                  // Khi preview ảnh thì trigger gửi ảnh, Đồng thời cũng xoá preview, reset lại file
                  setIsSending(true)
                  setPreviewUrl(null)
                  setResetTrigger(false)
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
