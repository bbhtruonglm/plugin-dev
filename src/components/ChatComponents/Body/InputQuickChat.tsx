import { ReactComponent as Arrow } from '../../assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '../../assets/Icon_up_circle_slate.svg'
import { InputQuickProps } from '../type'
import { t } from 'i18next'
import { useState } from 'react'

function InputQuickChat({
  handleSend,
  loading,
  error_message,
  staff_name = '',
  setLoading,
}: InputQuickProps) {
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

  /** Cho phép ấn Enter để gửi
   * @param event: any
   */
  const handleKeyDown = (event: any) => {
    /**
     *  Nếu ấn Enter và có giá trị
     */
    if (event.key === 'Enter' && value) {
      /**
       * Ngăn chặn sự kiện mặc định của form
       */
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
    <div className="bg-white w-full flex justify-between gap-2 items-center h-11 py-2 px-4 rounded-xl shadow-md">
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
        placeholder={t('reply') + ' ' + staff_name + '...'}
        className="bg-transparent outline-none flex-grow placeholder:text-slate-400 text-sm font-medium"
      />

      <div>
        {value ? (
          <div
            className="cursor-pointer"
            onClick={() => {
              /** Khi không có preview ảnh thì gửi text như bình thường */
              if (!loading && !error_message && preview_url === null) {
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
  )
}

export default InputQuickChat
