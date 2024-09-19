import React, { useRef, useState } from 'react'

import { ReactComponent as IconExtract } from '@/assets/extract.svg'

interface UploadProps {
  source_url?: string
}
function Upload({ source_url }: UploadProps) {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [stroke, setStroke] = useState('')
  const FILE_INPUT_REF = useRef<HTMLInputElement>(null)
  const handleIconClick = () => {
    if (FILE_INPUT_REF.current) {
      FILE_INPUT_REF.current.click() // Safely access the click method
    }
    // Trigger the hidden file input when the icon is clicked
  }
  //   const handleFileChange = async (event: any) => {
  //     const selectedFile = event.target.files[0]
  //     if (selectedFile) {
  //       setFile(selectedFile)
  //       await uploadFile(selectedFile)
  //     }
  //   }
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const SELECTED_FILE = event.target.files?.[0]
    if (SELECTED_FILE) {
      console.log(SELECTED_FILE, 'selected File')
      // await uploadFile(selectedFile)
    }
  }
  const uploadFile = async (file: any) => {
    const FORM_DATA = new FormData()
    FORM_DATA.append('file', file)

    try {
      const RES = await fetch('/upload-endpoint', {
        method: 'POST',
        body: FORM_DATA,
      })

      if (!RES.ok) {
        throw new Error('File upload failed')
      }

      const DATA = await RES.json()
      setFileUrl(DATA.url) // Assuming the server returns the file URL in a JSON object
    } catch (error) {
      console.error('File upload failed:', error)
    }
  }
  return (
    <div>
      <div
        onClick={handleIconClick}
        className="cursor-pointer z-10 text-blue-400"
      >
        <IconExtract
        // onMouseEnter={() => setStroke('#334155')}
        // fill={stroke ? stroke : ''}
        // onMouseLeave={() => setStroke('')}
        />
      </div>
      {/* <input
        type="file"
        onChange={handleFileChange}
      /> */}
      <input
        type="file"
        ref={FILE_INPUT_REF}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the file input
      />
    </div>
  )
}

export default Upload
