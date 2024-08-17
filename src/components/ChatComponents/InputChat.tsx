import { ReactComponent as Arrow } from '../../assets/Icon_up_circle.svg'
import { ReactComponent as IconSquare } from '../../assets/square-slash.svg'
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
    if (event.key === 'Enter' && value) {
      event.preventDefault()
      handleSend(value)
      setValue('')
    }
  }
  return (
    <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full px-5 gap-2">
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
          {value ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!loading) {
                  handleSend(value)
                  setValue('')
                }
              }}
            >
              <Arrow />
            </div>
          ) : (
            <IconSquare />
          )}
        </div>
      </div>
    </div>
  )
}

export default InputChat
