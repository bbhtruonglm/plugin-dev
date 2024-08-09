import IconExtract from '../../assets/extract.svg'
import IconSquare from '../../assets/square-slash.svg'
import React from 'react'
function InputChat() {
  return (
    <div className="absolute bottom-4 flex justify-center items-center h-12 bg-transparent w-full  px-4">
      <div className="bg-white w-full flex justify-between gap-2 items-center h-full p-2 px-4 rounded-full">
        <div>
          <img
            src={IconExtract}
            className="h-6 w-6 cursor-pointer"
            alt=""
          />
        </div>
        <input
          type="text"
          placeholder="gửi tin nhắn đến Bot Ban Hang"
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
    </div>
  )
}

export default InputChat
