import { InputProps, InputQuickProps } from './type'

import { ReactComponent as Arrow } from '../../assets/Icon_up_circle.svg'
import { ReactComponent as ArrowSlate } from '../../assets/Icon_up_circle_slate.svg'
import { ReactComponent as Close } from '@/assets/close.svg'
import Upload from './Upload'
import { selectPageId } from '@/stores/appSlice'
import { t } from 'i18next'
import { useAPI } from '@/api/api'
import { useSelector } from 'react-redux'
import { useState } from 'react'

function InputQuickChat({
  handleSend,
  loading,
  error_message,
  staff_name = '',
  setLoading,
}: InputQuickProps) {
  const [value, setValue] = useState('')
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const { SEND_MESSAGE_API } = useAPI()

  /** ID trang được lấy từ store */
  const PAGE_ID = useSelector(selectPageId)

  /** Cho phép ấn Enter để gửi */
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && value) {
      event.preventDefault()
      handleSend(value)
      setValue('')
    }
  }

  return (
    // <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full px-5 gap-2">
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
              // Khi không có preview ảnh thì gửi text như bình thường
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
    // </div>
  )
}

export default InputQuickChat
