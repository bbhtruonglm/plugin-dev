import { BtnType, ElementType, MessageProps } from './type'
import {
  extractMessageId,
  formatDate,
  isValidUrl,
  postMessageToParent,
} from '@/utils'
import { selectStatusPopup, setGlobalPreviewUrl } from '@/stores/appSlice'
import { useDispatch, useSelector } from 'react-redux'

import AudioPlayer from './AudioPlayer'
import { ReactComponent as FileIcon } from '@/assets/document-text.svg'
import VideoPlayer from './VideoPlayter'

/** Hàm render css khi check type tin nhắn */
const getMessageClasses = (messageType: string) => {
  /** Kiểm tra nếu messageType là 'page' */
  if (messageType === 'page') {
    /** Trả về các lớp CSS tương ứng nếu messageType là 'page' */
    return 'bg-white max-w-[60%]'
  } else if (messageType === 'note') {
    return 'max-w-[60%] bg-[#D8F6CB]'
  } else {
    /** Nếu messageType không phải là 'system' hay 'page' */
    /** Trả về các lớp CSS mặc định cho các loại message khác */
    return 'bg-messBg max-w-[60%]'
  }
}

function MessageComponent({ data }: MessageProps) {
  const dispatch = useDispatch()
  /** Trạng thái Đóng/ Mở Popup */
  const SHOW_POPUP = useSelector(selectStatusPopup)
  return (
    <div
      className={`flex flex-col gap-y-4 rounded-lg group relative ${getMessageClasses(
        data?.message_type
      )}`}
    >
      {/* Tooltip */}
      <div
        className={`absolute w-36 bottom-full ${
          data?.message_type === 'page' ? 'left-0' : 'right-0'
        }  text-xs font-semibold text-slate-700 bg-transparent rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        {formatDate(data?.time || data?.createdAt)}
      </div>
      {/* Hiển thị data dạng 1 ảnh */}
      {data?.message_attachments?.length === 1 &&
        data?.message_attachments?.[0]?.type === 'image' && (
          <div className="flex rounded-lg">
            <img
              src={data?.message_attachments?.[0]?.payload?.url}
              className="w-32 h-32 object-contain bg-slate-200 rounded-lg hover:cursor-pointer"
              alt=""
              onClick={() => {
                /** Lưu vào STORE */
                dispatch(
                  setGlobalPreviewUrl(
                    data?.message_attachments?.[0]?.payload?.url
                  )
                )
                /** Click vào ảnh thì gửi thông tin cho sdk
                 * Có thể lưu data và STORE
                 */
                postMessageToParent(
                  SHOW_POPUP,
                  false,
                  674,
                  data?.message_attachments?.[0]?.payload?.url
                )
              }}
            />
          </div>
        )}

      {/* Hiển thị data dạng nhiều ảnh */}
      {data?.message_attachments?.length > 1 &&
        data?.message_attachments?.[0]?.type === 'image' && (
          <div className=" overflow-x-auto p-2 bg-transparent rounded-lg max-h-[216px]">
            <div className="grid grid-cols-3 grid-rows-2 gap-2 w-[304px]">
              {data?.message_attachments
                ?.slice(0, 6) // Giới hạn chỉ hiển thị tối đa 6 ảnh
                ?.map((attachment, index) => (
                  <div
                    key={attachment?.payload?.url}
                    className="relative w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-100"
                  >
                    <img
                      src={attachment?.payload?.url}
                      className="object-cover w-full h-full"
                      alt={`attachment ${index + 1}`}
                      onClick={() => {
                        /** Lưu vào STORE */
                        dispatch(setGlobalPreviewUrl(attachment?.payload?.url))
                        /** Click vào ảnh thì gửi thông tin cho sdk
                         * Có thể lưu data và STORE
                         */
                        postMessageToParent(
                          SHOW_POPUP,
                          false,
                          674,
                          attachment?.payload?.url
                        )
                      }}
                    />

                    {index === 5 && data?.message_attachments?.length > 6 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold">
                        +{data?.message_attachments?.length - 6}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Hiển thị data dạng video */}
      {data?.message_attachments?.[0]?.type === 'video' && (
        <div className="">
          <VideoPlayer src={'https://www.w3schools.com/html/mov_bbb.mp4'} />
        </div>
      )}

      {/* Hiển thị data dạng audio */}
      {data?.message_attachments?.[0]?.type === 'audio' && (
        <div className="p-2">
          <AudioPlayer src={data?.message_attachments?.[0]?.payload?.url} />
        </div>
      )}

      {/* Hiển thị data dạng file */}
      {data?.message_attachments?.[0]?.type === 'file' && (
        <div className="bg-white rounded-lg p-2 gap-y-1 flex flex-col">
          <div className="flex h-9 w-9 items-center justify-center p-2 rounded-full bg-slate-300">
            <FileIcon className="h-5 w-5" />
          </div>

          {/* Thẻ <a> để xử lý chức năng tải file */}
          <a
            href={data?.message_attachments?.[0]?.payload?.url} // URL của tệp
            download // Thuộc tính download giúp tải tệp
            className="text-slate-700 truncate underline text-sm"
          >
            {extractMessageId(data?.message_attachments?.[0]?.payload?.url)}
          </a>
        </div>
      )}

      {/* Hiện thị data dạng text */}
      {data?.message_text &&
        data?.message_type !== 'system' &&
        (!data?.message_attachments?.length ||
          !data?.message_attachments?.[0]?.type) && (
          <div className="flex p-2">
            <p className="text-sm min-h-4 break-words whitespace-pre-line">
              {data?.message_text}
            </p>
          </div>
        )}
      {/* Hiện thị data dạng URL fallback */}
      {data?.message_text &&
        data?.message_type !== 'system' &&
        data?.message_attachments?.[0]?.type === 'fallback' && (
          <div className="flex p-2">
            <a
              className="text-sm min-h-4 break-words whitespace-pre-line underline hover:text-blue-500"
              href={
                data?.message_text && isValidUrl(data.message_text)
                  ? data.message_text
                  : 'about:blank'
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {data?.message_text || 'No link available'}
            </a>
          </div>
        )}
      {/* Hiện thị data dạng buttom */}
      {data?.message_attachments?.[0]?.type === 'template' &&
        data?.message_attachments?.[0]?.payload?.template_type === 'button' && (
          <div className="flex flex-col p-2 gap-y-1">
            <h4 className="text-sm font-medium enter-line min-h-4 truncate">
              {data?.message_attachments?.[0]?.title}
            </h4>
            <div className="flex flex-col gap-y-2">
              {data?.message_attachments?.[0]?.payload?.buttons?.map(
                (button: BtnType, index: number) => (
                  <div
                    onClick={() => {
                      if (button?.type === 'web_url') {
                        window.open(button?.url, '_blank')
                      }
                    }}
                    key={index}
                    className={`flex ${
                      button?.type === 'web_url'
                        ? 'bg-slate-800 cursor-pointer text-yellow-200'
                        : 'bg-slate-200 text-black cursor-not-allowed'
                    }  px-4 py-2 gap-1 rounded-lg justify-center items-center text-sm font-medium`}
                  >
                    {button?.title}
                    {button?.type === 'web_url' && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333M10 2H14M14 2V6M14 2L6.66667 9.33333"
                          stroke="currentColor"
                          strokeWidth="1.33"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      {/* Hiển thị dạng generic */}
      {data?.message_attachments?.[0]?.type === 'template' &&
        data?.message_attachments?.[0]?.payload?.template_type ===
          'generic' && (
          <div className="flex gap-x-1 overflow-x-auto">
            {data?.message_attachments?.[0]?.payload?.elements?.map(
              (element: ElementType, index) => (
                <div
                  key={index}
                  className="rounded-lg p-2 flex flex-col gap-x-2 flex-shrink-0 w-40"
                >
                  {/* Hình ảnh */}
                  <div className="cursor-pointer hover:brightness-90 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 rounded-lg w-[160px] h-[160px]">
                      <img
                        src={element?.image_url}
                        alt={element?.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Tiêu đề và phụ đề */}
                  <div className="text-sm">
                    <div className="font-medium text-black truncate">
                      {element?.title}
                    </div>
                    <div className="text-slate-500 truncate">
                      {element?.subtitle}
                    </div>
                  </div>

                  {/* Các nút */}
                  <div className="flex flex-col gap-2">
                    {element?.buttons?.map((button, buttonIndex) => (
                      <button
                        key={buttonIndex}
                        onClick={() => {
                          if (button?.type === 'web_url') {
                            window.open(button?.url, '_blank')
                          }
                        }}
                        className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                          button.type === 'web_url'
                            ? 'bg-slate-800 text-yellow-200'
                            : button.type === 'phone_number'
                            ? 'bg-slate-200 text-black'
                            : 'bg-slate-200 text-black cursor-not-allowed'
                        }`}
                      >
                        {button?.title}
                        {button?.type === 'web_url' && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333M10 2H14M14 2V6M14 2L6.66667 9.33333"
                              stroke="currentColor"
                              strokeWidth="1.33"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
    </div>
  )
}

export default MessageComponent
