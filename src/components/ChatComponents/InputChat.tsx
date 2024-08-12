import React, { useState } from 'react'

import IconExtract from '../../assets/extract.svg'
import IconSend from '../../assets/send.svg'
import IconSquare from '../../assets/square-slash.svg'

interface InputProps {
  handleSend: (e: any) => void
  loading: boolean
}
function InputChat({ handleSend, loading }: InputProps) {
  const [value, setValue] = useState('')
  return (
    <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full px-4 gap-2">
      <div className="bg-white w-full flex justify-between gap-2 items-center h-full p-2 px-4 rounded-full">
        <div>
          <img
            src={IconExtract}
            className="h-6 w-6 cursor-pointer"
            alt=""
          />
        </div>
        <input
          onChange={(e) => {
            setValue(e.target.value)
          }}
          value={value}
          type="text"
          placeholder="Gửi tin nhắn đến Bot Ban Hang"
          className="bg-transparent outline-none flex-grow placeholder:text-colorOpacity text-sm font-medium"
        />
        <div>
          <img
            src={IconSquare}
            className="h-6 w-6 cursor-pointer"
            alt=""
          />
        </div>
      </div>
      {value && (
        <div
          onClick={() => {
            if (!loading) {
              handleSend(value)
              setValue('')
            }
          }}
        >
          <img
            src={IconSend}
            className="h-6 w-6 cursor-pointer"
            alt=""
          />
        </div>
      )}
    </div>
  )
}

export default InputChat
