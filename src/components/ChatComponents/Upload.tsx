import React, { useRef, useState } from 'react'

import { ReactComponent as IconExtract } from '@/assets/extract.svg'

interface UploadProps {
  setPreviewUrl: (url: File) => void
}

function Upload({ setPreviewUrl }: UploadProps) {
  /** ref của ô upload */
  const FILE_INPUT_REF = useRef<HTMLInputElement>(null)
  const [fill_color, setFillColor] = useState('#94A3B8')

  /** Trigger option upload khi bấm vào icon */
  const handleIconClick = () => {
    if (FILE_INPUT_REF.current) {
      FILE_INPUT_REF.current.value = '' // Reset giá trị của input
      FILE_INPUT_REF.current.click() // Safely access the click method
    }
  }

  /** Chọn ảnh */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const SELECTED_FILE = event.target.files?.[0]

    if (SELECTED_FILE) {
      // setFile(SELECTED_FILE)
      setPreviewUrl(SELECTED_FILE)
    }
  }

  return (
    <div>
      <div
        onClick={handleIconClick}
        className="cursor-pointer transition-colors duration-300"
        onMouseEnter={() => setFillColor('#334155')}
        onMouseLeave={() => setFillColor('#94A3B8')}
      >
        <IconExtract
          className=""
          fill={fill_color}
        />
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
