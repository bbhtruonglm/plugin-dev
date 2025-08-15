import { useRef, useState } from 'react'

import { ReactComponent as Arrow } from '@/assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '@/assets/Icon_up_circle_slate.svg'
import { InputProps } from './type'
import { t } from 'i18next'

function InputChat({
  handleSend,
  loading,
  error_message,
  page_name,
  client_id,
  setLoading,
}: InputProps) {
  /** Tạo ref cho ô input */
  const INPUT_REF = useRef<HTMLInputElement>(null)
  /** Lấy trạng thái hiển thị popup */
  const [value, setValue] = useState('')

  /** Cho phép ấn Enter để gửi
   * @param event: any
   */
  const handleKeyDown = (event: any) => {
    /**
     * Nếu ấn Enter và có giá trị
     */
    if (event.key === 'Enter' && value) {
      /** Cho phép ấn enter */
      event.preventDefault()
      /**
       * Gửi tin nhắn
       */
      handleSend(value)
      /**
       * Reset giá trị
       */
      setValue('')
    }
  }

  return (
    <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full px-5 gap-2">
      <div className="bg-white w-full flex justify-between gap-2 items-center h-full py-2 px-4 rounded-md shadow-lg">
        {/* ô input chat */}
        <input
          ref={INPUT_REF}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          value={value}
          onKeyDown={(e) => {
            if (!error_message) {
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
                /** Khi không có preview ảnh thì gửi text như bình thường */
                if (!loading) {
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
