import IconArrow from '../../assets/arrow-up-right-square.svg'
import React from 'react'
import money from '../../assets/money.png'
import photo from '../../assets/photo.png'

interface MessageProps {
  data: {
    type?: string
    role?: string
    content: {
      image?: string
      video?: string
      audio?: string
      text?: string
      note?: string
      highlight?: string
      schedule?: string
      button?: string
    }
    avatar?: any
    message?: any
    timestamp?: any
    userId?: any
  }
  userId?: string
}
function MessageComponent({ data, userId }: MessageProps) {
  console.log(data, 'dtaaa', userId)

  return (
    <div
      className={`flex p-2 flex-col gap-y-4 w-[60%] rounded-lg ${
        data.userId === 'Admin'
          ? 'bg-transparent'
          : data.userId === userId
          ? 'bg-white'
          : 'bg-messBg'
      }`}
    >
      {data?.content?.image && (
        <div className="flex rounded-lg">
          <img
            src={money}
            className="w-full h-full"
            alt=""
          />
        </div>
      )}
      {data?.content?.video && (
        <div>
          <img
            src={photo}
            className="w-[50%] h-full"
            alt=""
          />
        </div>
      )}
      {data?.content?.audio && <div>audio</div>}
      {data?.content?.highlight && (
        <div className="">
          <h4 className="font-semibold">Tiêu đề</h4>
        </div>
      )}
      {data?.message && (
        <div>
          <p className="text-xs">{data.message}</p>
        </div>
      )}
      {data?.content?.schedule && (
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
      )}
      {data?.content?.button && (
        <div>
          <div className="flex bg-bgBtnLight text-white cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
            Nút số 1
          </div>
        </div>
      )}
      {data?.content?.button && (
        <div>
          <div className="flex bg-bgBtnLight text-white cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
            Nút số 2
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageComponent
