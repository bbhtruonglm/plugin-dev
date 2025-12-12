import React from 'react'
import { XMarkIcon } from '@heroicons/react/16/solid'
import TemplateMessageComponent from '@/components/ChatComponents/MessageComponent/TemplateMessageComponent'
import TimeAgo from '@/components/TimeAgo'
import { renderStaffName, truncateSentences, truncateString } from '@/utils'
import { MessageInfo } from '@/utils/type'

/**
 * Interface cho props của QuickChat
 */
interface QuickChatProps {
  /** Class layout */
  layoutClass: string
  /** Tin nhắn mới nhất */
  latestMessage: MessageInfo | null
  /** Hàm kiểm tra staff có tồn tại và trả về avatar */
  checkStaffExist: (id: any) => string
  /** Có sử dụng background tùy chỉnh không */
  isCustomBackground: boolean
  /** Sự kiện click vào quick chat */
  onClick: () => void
  /** Có sử dụng avatar page không */
  isPageAvatar: boolean
  /** Danh sách staff */
  staffList: any
  /** Tên page */
  pageName: string
  /** Sự kiện click đóng quick chat */
  onClose: (e: any) => void
  /** Hàm dịch ngôn ngữ */
  t: (key: string) => string
}

/**
 * Component QuickChat (Bong bóng chat nhanh)
 */
const QuickChat: React.FC<QuickChatProps> = ({
  layoutClass,
  latestMessage,
  checkStaffExist,
  isCustomBackground,
  onClick,
  isPageAvatar,
  staffList,
  pageName,
  onClose,
  t,
}) => {
  return (
    /** Container chính với layout class được tính toán từ hook */
    <div className={layoutClass}>
      <div className="flex h-full w-full">
        {
          /** Chỉ hiển thị khi tin nhắn là từ page */
          latestMessage?.message_type === 'page' && (
            <div className="flex flex-col w-full gap-2">
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex gap-x-1 flex-grow min-h-0 justify-start items-end `}
              >
                <div className="flex flex-shrink-0 ">
                  {
                    /** Hiển thị avatar staff hoặc default */
                    latestMessage?.message_type === 'page' && (
                      <img
                        src={
                          checkStaffExist(latestMessage?.message_metadata) ||
                          './images/earth.svg'
                        }
                        className="w-8 h-8  mask-rounded-oval bg-gray-200"
                        alt=""
                      />
                    )
                  }
                </div>
                <div
                  className={`flex flex-col flex-grow min-w-0 h-full ${
                    isCustomBackground
                      ? 'bg-slate-400 hover:bg-slate-500 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-500'
                  } rounded-xl p-3  cursor-pointer shadow-md`}
                  /** Sự kiện click mở chat */
                  onClick={() => onClick()}
                >
                  <div className="flex justify-between items-center w-full gap-x-1 flex-shrink-0">
                    {/* Phần hiển thị thông tin tin nhắn */}
                    <div className="flex justify-between w-full overflow-hidden">
                      <div className=" text-xs font-medium flex items-center overflow-hidden flex-1">
                        {/* Hiển thị tên nhân viên */}
                        {isPageAvatar && (
                          <div className="flex-shrink-0">
                            <span>
                              {truncateSentences(
                                renderStaffName(
                                  staffList,
                                  latestMessage?.message_metadata
                                ),
                                6
                              )}
                            </span>
                            <span className="mx-0.5">{t('from')}</span>
                          </div>
                        )}

                        {/* Hiển thị tên trang, có thể bị cắt ngắn nếu quá dài */}
                        <span className="mx-0.5 truncate whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                          {!isPageAvatar
                            ? pageName
                            : truncateString(pageName, 10)}
                        </span>
                      </div>

                      {/* Hiển thị thời gian tin nhắn */}
                      <span className=" text-xs font-medium truncate flex items-center flex-shrink-0">
                        <span className="mx-0.5">•</span>
                        <TimeAgo timestamp={latestMessage?.createdAt} />
                      </span>
                    </div>

                    {/* Nút đóng */}
                    <div
                      onClick={(event) => onClose(event)}
                      className="h-5 w-5 cursor-pointer flex justify-center items-center"
                    >
                      <XMarkIcon className="size-5" />
                    </div>
                  </div>

                  {/* Phần nội dung tin nhắn được hiển thị */}
                  <div className="flex flex-grow min-h-0 ">
                    <TemplateMessageComponent data={latestMessage as any} />
                  </div>
                </div>
              </div>
              {/** Phần reply bar bên dưới */}
              <div className="flex gap-x-2 h-11">
                <div className="w-8 h-8"></div>
                <div
                  onClick={() => onClick()}
                  className={`h-11 ${
                    isCustomBackground
                      ? 'bg-slate-400 text-white'
                      : 'bg-white text-slate-400'
                  }  text-sm flex w-full rounded-xl shadow-md p-3  items-center truncate overflow-hidden whitespace-nowrap`}
                >
                  {t('reply') +
                    ' ' +
                    (!isPageAvatar
                      ? pageName
                      : truncateSentences(
                          renderStaffName(
                            staffList,
                            latestMessage?.message_metadata
                          ),
                          6
                        ))}
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default QuickChat
