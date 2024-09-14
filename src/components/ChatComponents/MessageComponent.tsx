import { ReactComponent as IconArrow } from '@/assets/arrow-up-right-square.svg'
import money from '@/assets/money.png'
import photo from '@/assets/photo.png'

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
    message_text?: string
    message_type?: string
    time?: string
  }
  userId?: string
}
function MessageComponent({ data }: MessageProps) {
  return (
    <div
      className={`flex p-2 flex-col gap-y-4 max-w-[60%] rounded-lg ${
        data.message_type === 'page' ? 'bg-white' : 'bg-messBg'
      }`}
    >
      {/* Hiển thị data dạng ảnh */}
      {data?.content?.image && (
        <div className="flex rounded-lg">
          <img
            src={money}
            className="w-full h-full"
            alt=""
          />
        </div>
      )}

      {/* Hiển thị data dạng video */}
      {data?.content?.video && (
        <div>
          <img
            src={photo}
            className="w-[50%] h-full"
            alt=""
          />
        </div>
      )}

      {/* Hiển thị data dạng audio */}
      {data?.content?.audio && <div>audio</div>}

      {/* Hiển thị data dạng Highlight */}
      {data?.content?.highlight && (
        <div className="">
          <h4 className="font-semibold">Tiêu đề</h4>
        </div>
      )}

      {/* Hiện thị data dạng text */}
      {data?.message_text && (
        <div>
          <p className="text-sm min-h-4 break-words whitespace-pre-line">
            {data.message_text}
          </p>
        </div>
      )}

      {/* Hiện thị data dạng lịch */}
      {data?.content?.schedule && (
        <div>
          <div className="flex bg-bgBtnBold text-textYellow cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
            Lập lịch
            <IconArrow />
          </div>
        </div>
      )}

      {/* Hiện thị data dạng button */}
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
