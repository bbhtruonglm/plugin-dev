import React, { useRef, useState } from 'react'

import IconExtract from '../../assets/extract.svg'

interface UploadProps {
  finalUrl?: string
}
function Upload({ finalUrl }: UploadProps) {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click() // Safely access the click method
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
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      console.log(selectedFile, 'selected File')
      // await uploadFile(selectedFile)
    }
  }
  const uploadFile = async (file: any) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/upload-endpoint', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('File upload failed')
      }

      const data = await response.json()
      setFileUrl(data.url) // Assuming the server returns the file URL in a JSON object
    } catch (error) {
      console.error('File upload failed:', error)
    }
  }
  return (
    <div>
      <div onClick={handleIconClick}>
        <img
          src={IconExtract}
          className="h-6 w-6 cursor-pointer"
          alt=""
        />
      </div>
      {/* <input
        type="file"
        onChange={handleFileChange}
      /> */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the file input
      />
    </div>
  )
}

export default Upload
