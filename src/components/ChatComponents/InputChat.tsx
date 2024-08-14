import IconSquare from '../../assets/square-slash.svg'
import { ReactComponent as SendingIcon } from '../../assets/send.svg'
import Upload from './Upload'
import { useState } from 'react'

interface InputProps {
  handleSend: (e: any) => void
  loading: boolean
  onChangeText: (e: any) => void
}
function InputChat({ handleSend, loading, onChangeText }: InputProps) {
  const [value, setValue] = useState('')

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend(value)
      setValue('')
    }
  }
  return (
    <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full px-4 gap-2">
      <div className="bg-white w-full flex justify-between gap-2 items-center h-full p-2 px-4 rounded-full">
        <Upload />
        <input
          onChange={(e) => {
            setValue(e.target.value)
            onChangeText(e.target.value)
          }}
          value={value}
          onKeyDown={(e) => {
            handleKeyDown(e)
          }}
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
          <SendingIcon />
        </div>
      )}
    </div>
  )
}

export default InputChat
