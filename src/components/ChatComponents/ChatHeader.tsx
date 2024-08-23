import { ReactComponent as BackArrow } from '../../assets/white-arrow.svg'
import { ReactComponent as Close } from '../../assets/close.svg'
import React from 'react'
import avatar1 from '../../assets/avatar1.png'
import avatar2 from '../../assets/avatar2.png'
import avatar3 from '../../assets/avatar3.png'

interface ChatScreenProps {
  onCancel: () => void
  userId: string
  setHide?: () => void
  currentW: Number | null | any
}
function ChatHeader({
  onCancel,
  userId = '12212',
  setHide,
  currentW,
}: ChatScreenProps) {
  return (
    <div
      className={`flex bg-slate-800  w-full py-3 px-5 gap-2 absolute top-0 ${
        userId ? 'h-16 items-center' : 'h-[174px]'
      }`}
    >
      {userId ? (
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <BackArrow
              className="w-7 h-7 cursor-pointer"
              onClick={() => onCancel()}
            />
            <img
              src={avatar1}
              className="mask h-8 w-8"
              alt=""
            />
            <div>
              <h2 className="text-white text-sm font-medium">Hoàng Lan</h2>
              <h5 className="flex gap-1 items-center font-normal text-xs text-onlineColor">
                <div className="w-3 h-3 rounded-full bg-onlineColor"></div> Đang
                online
              </h5>
            </div>
          </div>

          <div
            onClick={setHide}
            className={`${
              currentW < 450
                ? ' flex w-9 h-9 items-center justify-center'
                : ' hidden'
            }`}
          >
            <Close />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full gap-y-1">
          <div className="flex w-full justify-between items-center h-[30px] ">
            <BackArrow
              className="w-7 h-7 cursor-pointer"
              onClick={() => onCancel()}
            />
            <h2 className="text-lg font-medium text-white">Bót Bán Hàng</h2>
            {currentW < 450 ? (
              <div
                onClick={setHide}
                className="w-8 h-8  flex justify-center items-center cursor-pointer"
              >
                <Close className="flex cursor-pointer " />
              </div>
            ) : (
              <div className=" flex justify-center items-center w-7 h-7"></div>
            )}
          </div>
          <div className="flex items-center py-3 justify-center h-[72px] w-full">
            <div className="flex h-12 justify-center">
              <img
                src={avatar1}
                className="mask -mr-2 h-12 w-12"
                alt=""
              />
              <img
                src={avatar2}
                className="mask -mr-1 h-12 w-12"
                alt=""
              />
              <img
                src={avatar3}
                className="mask  h-12 w-12"
                alt=""
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-10 gap-1">
            <h4 className="flex gap-2 items-center font-normal text-sm h-5 text-onlineColor">
              <div className="w-3 h-3 rounded-full bg-onlineColor"></div> Chúng
              tôi đang Online
            </h4>
            <h5 className="flex items-center font-normal text-xs h-4  text-slate-300">
              Bạn có thể đặt câu hỏi hoặc phản ánh chất lượng dịch vụ.
            </h5>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatHeader
