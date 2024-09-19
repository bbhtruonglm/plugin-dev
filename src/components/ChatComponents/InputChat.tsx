import { ReactComponent as Arrow } from '../../assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '../../assets/Icon_up_circle_slate.svg'
import Upload from './Upload'
import { t } from 'i18next'
import { useState } from 'react'

interface InputProps {
  handleSend: (e: any) => void
  loading: boolean
  errorMessage: String | null
  page_name?: string
}
function InputChat({
  handleSend,
  loading,
  errorMessage,
  page_name,
}: InputProps) {
  const [value, setValue] = useState('')

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
        <Upload />
        <input
          onChange={(e) => {
            setValue(e.target.value)
            // onChangeText(e.target.value)
          }}
          value={value}
          onKeyDown={(e) => {
            if (!errorMessage) {
              handleKeyDown(e)
            }
          }}
          type="text"
          placeholder={t('send_message_to_us') + ' ' + page_name}
          className="bg-transparent outline-none flex-grow placeholder:text-slate-500 text-sm font-medium"
        />
        <div>
          {value ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!loading && !errorMessage) {
                  handleSend(value)
                  setValue('')
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
