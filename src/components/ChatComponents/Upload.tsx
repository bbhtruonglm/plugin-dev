import React, { useEffect, useRef, useState } from 'react'
import { fetchAPI, useAPI } from '@/api/api'

import { ReactComponent as IconExtract } from '@/assets/extract.svg'
import { use } from 'i18next'

interface UploadProps {
  page_id: string
  client_id: string
  setPreviewUrl: (url: string) => void
  reset_trigger: boolean | undefined | null // Reset input file khi bấm với reset_trigger
  is_sending?: boolean
}

function Upload({
  page_id,
  client_id,
  setPreviewUrl,
  reset_trigger,
  is_sending,
}: UploadProps) {
  const [file, setFile] = useState<File | null>(null)
  /** ref của ô upload */
  const FILE_INPUT_REF = useRef<HTMLInputElement>(null)

  const { SEND_MESSAGE_API } = useAPI()
  useEffect(() => {
    /** Upload file khi click nút send */
    if (is_sending) {
      uploadFile(file)
    }
  }, [is_sending])
  useEffect(() => {
    // Khi huỷ preview thì reset lại file
    if (reset_trigger && FILE_INPUT_REF.current) {
      FILE_INPUT_REF.current.value = '' // Reset input file để có thể chọn lại file cũ
    }
  }, [reset_trigger])
  /** Trigger option upload khi bấm vào icon */
  const handleIconClick = () => {
    if (FILE_INPUT_REF.current) {
      FILE_INPUT_REF.current.click() // Safely access the click method
    }
  }

  /** Chọn ảnh */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const SELECTED_FILE = event.target.files?.[0]

    if (SELECTED_FILE) {
      setFile(SELECTED_FILE)
      // Sử dụng FileReader để đọc file và tạo URL preview
      const READER = new FileReader()
      READER.onload = () => {
        // Lưu URL preview
        setPreviewUrl(READER.result as string)
      }
      // Đọc file dưới dạng URL data
      READER.readAsDataURL(SELECTED_FILE)
    }
  }
  /** Upload file */
  const uploadFile = async (file: any) => {
    console.log(file, 'file')
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
    } catch (error) {
    } finally {
    }
  }
  return (
    <div>
      <div
        onClick={handleIconClick}
        className="cursor-pointer z-10 text-blue-400"
      >
        <IconExtract />
      </div>

      <input
        type="file"
        ref={FILE_INPUT_REF}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the file input
        accept="image/*" // Only accept image files
      />
    </div>
  )
}

export default Upload
