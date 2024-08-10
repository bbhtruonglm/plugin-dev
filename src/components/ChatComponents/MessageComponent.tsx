import IconArrow from '../../assets/arrow-up-right-square.svg'
import React from 'react'
import money from '../../assets/money.png'
import photo from '../../assets/photo.png'

interface MessageProps {
  image?: string
  videos?: string
  audio?: string
  text?: string
  note?: string
  highlight?: string
  type?: string
}
function MessageComponent({
  image,
  videos,
  audio,
  text,
  note,
  highlight,
  type,
}: MessageProps) {
  return (
    <div
      className={`flex p-2 flex-col gap-y-4 ${
        type === 'shop' ? 'bg-white' : 'bg-messBg'
      }`}
    >
      <div className="flex rounded-lg">
        <img
          src={money}
          className="w-full h-full"
          alt=""
        />
      </div>
      <div>
        <img
          src={photo}
          className="w-[50%] h-full"
          alt=""
        />
      </div>
      <div>voice</div>
      <div className="">
        <h4 className="font-semibold">Tiêu đề</h4>
      </div>
      <div>
        <p>Đây là content </p>
      </div>
      <div>
        <div className="flex bg-bgBtnBold text-textYellow cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
          Lập lịch
          <img
            src={IconArrow}
            className="h-6 w-6 cursor-pointer"
            alt=""
          />
        </div>
      </div>
      <div>
        <div className="flex bg-bgBtnLight text-white cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
          Nút số 1
        </div>
      </div>
      <div>
        <div className="flex bg-bgBtnLight text-white cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
          Nút số 2
        </div>
      </div>
    </div>
  )
}

export default MessageComponent
