import AudioPlayer from './AudioPlayer'
import { ReactComponent as IconArrow } from '@/assets/arrow-up-right-square.svg'
import { MessageProps } from './type'
import VideoPlayer from './VideoPlayter'
import { formatDate } from '@/utils'
import photo from '@/assets/photo.png'

function MessageComponent({ data }: MessageProps) {
  return (
    <div
      className={`flex p-2 flex-col gap-y-4 rounded-lg group relative ${
        data?.message_type === 'system'
          ? 'hidden bg-transparent max-w-[90%] font-medium'
          : data?.message_type === 'page'
          ? 'bg-white max-w-[60%]'
          : 'bg-messBg max-w-[60%]'
      }`}
    >
      {/* Tooltip */}
      <div
        className={`absolute w-36 bottom-full ${
          data?.message_type === 'page' ? 'left-0' : 'right-0'
        }  text-xs font-semibold text-slate-700 bg-transparent rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        {formatDate(data?.time)}
      </div>
      {/* Hiển thị data dạng ảnh */}
      {data?.message_attachments?.[0]?.type === 'image' && (
        <div className="flex rounded-lg">
          <img
            src={data?.message_attachments?.[0]?.payload?.url}
            className="w-32 h-32 object-contain bg-slate-200 rounded-lg"
            alt=""
          />
        </div>
      )}
      {/* Hiển thị data dạng video */}
      {data?.message_attachments?.[0]?.type === 'video' && (
        <VideoPlayer src={'https://www.w3schools.com/html/mov_bbb.mp4'} />
      )}
      {/* Hiển thị data dạng audio */}
      {data?.message_attachments?.[0]?.type === 'audio' && (
        <AudioPlayer src={data?.message_attachments?.[0]?.payload?.url} />
      )}
      {/* Hiển thị data dạng Highlight */}
      {data?.message_attachments?.[0]?.type === 'highlight' && (
        <div className="">
          <h4 className="font-semibold">Tiêu đề</h4>
        </div>
      )}
      {/* Hiện thị data dạng text */}
      {data?.message_text && data?.message_type !== 'system' && (
        <p className="text-sm min-h-4 break-words whitespace-pre-line">
          {data?.message_text}
        </p>
      )}
      {/* Hiện thị data dạng lịch */}
      {data?.message_attachments?.[0]?.type === 'schedule' && (
        <div>
          <div className="flex bg-bgBtnBold text-textYellow cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
            Lập lịch
            <IconArrow />
          </div>
        </div>
      )}
      {/* Hiện thị data dạng button */}
      {data?.message_attachments?.[0]?.type === 'button' && (
        <div>
          <div className="flex bg-bgBtnLight text-white cursor-pointer py-2 gap-1 rounded-lg justify-center items-center">
            Nút số 1
          </div>
        </div>
      )}
      {data?.message_attachments?.[0]?.type === 'button' && (
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
