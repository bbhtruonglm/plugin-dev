import 'regexp-polyfill'

import { checkMD, renderAvatarFromId, renderStaffName } from '@/utils'
import {
  selectGlobalUnreadCount,
  selectIsAvatar,
  selectLatestMessage,
  selectPageAvatar,
  selectPageId,
  selectStaffList,
} from '@/stores/appSlice'

import { ReactComponent as Arrow } from '@/assets/chevron-right.svg'
import { EmployeeList } from '@/pages/type'
import ReactMarkdown from 'react-markdown'
import TimeAgo from '../TimeAgo'
import remarkGfm from 'remark-gfm'
import { t } from 'i18next'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

function UnreadMessage({ onNavigate, onError }: SendMessageProps) {
  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)

  /** Số tin nhắn chưa đọc lấy trong STORE */
  const GLOBAL_UNREAD_COUNT = useSelector(selectGlobalUnreadCount)
  /**
   * Tin nhắn mới nhất
   */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  /**
   * Danh sách nhân viên
   */
  const STAFF_LIST = useSelector(selectStaffList)

  /**
   * link avatar cua page
   */
  const PAGE_AVATAR = useSelector(selectPageAvatar)
  /**
   * Setting hiển thị avatar nhân viên
   */
  const IS_PAGE_AVATAR = useSelector(selectIsAvatar)
  /** Hàm kiểm tra nhân sự có tồn tại không
   * @string id: Nhan vao id của nhân sự
   * @returns {string} link avatar
   */
  const checkStaffExist = useCallback(
    (id: string) => {
      const STAFF_AVATAR = renderAvatarFromId(id, IS_PAGE_AVATAR, PAGE_AVATAR)
      return STAFF_AVATAR
    },
    [IS_PAGE_AVATAR, PAGE_AVATAR]
  )

  return (
    <div
      onClick={() => {
        if (PAGE_ID && PAGE_ID !== null) {
          onNavigate()
        } else {
          onError()
        }
      }}
      className="bg-white py-3 rounded-xl flex justify-between px-6 items-center shadow-md cursor-pointer"
    >
      <div className="flex flex-col gap-2 w-full">
        <h4 className="text-base font-semibold flex items-center gap-x-1">
          {t('unread_message')}
          <span
            className={`text-white bg-red-500 text-xxs rounded-full h-4 w-4 ${
              !GLOBAL_UNREAD_COUNT ? 'hidden' : 'flex'
            } justify-center items-center`}
          >
            {GLOBAL_UNREAD_COUNT < 10 ? GLOBAL_UNREAD_COUNT : '9+'}
          </span>
        </h4>

        <div className="flex h-full w-full">
          {LATEST_MESSAGE?.message_type === 'page' && (
            <div className="flex items-center w-full gap-2">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={
                    checkStaffExist(LATEST_MESSAGE?.message_metadata) ||
                    './images/earth.svg'
                  }
                  className="w-8 h-8 mask-rounded-oval bg-gray-200"
                  alt=""
                />
              </div>

              {/* Nội dung tin nhắn */}
              <div
                className="flex flex-col flex-grow min-w-0 max-h-20 overflow-hidden"
                onClick={() => {}}
              >
                <span className="text-sm max-h-16 break-words whitespace-pre-line overflow-hidden line-clamp-3">
                  {/* {LATEST_MESSAGE?.message_text} */}
                  {/* {checkMD(LATEST_MESSAGE?.message_text) ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {LATEST_MESSAGE?.message_text}
                    </ReactMarkdown>
                  ) : (
                  )} */}
                  {LATEST_MESSAGE?.message_text}
                </span>

                {/* Hàng dưới: Tên + thời gian */}
                <div className="flex items-center min-w-0 w-full">
                  {/* Tên nhân viên - truncate nếu dài */}
                  <span className="text-slate-500 text-sm font-medium truncate ">
                    {!IS_PAGE_AVATAR
                      ? t('staff')
                      : renderStaffName(
                          STAFF_LIST as EmployeeList,
                          LATEST_MESSAGE?.message_metadata
                        )}
                  </span>

                  {/* Phần phải: chỉ hiện nếu có đủ không gian */}
                  <div className="flex-shrink-0 flex items-center ml-1">
                    <span className="text-slate-500 text-sm font-medium mx-1">
                      •
                    </span>
                    <span className="text-slate-500 text-sm font-medium">
                      <TimeAgo timestamp={LATEST_MESSAGE?.createdAt} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Mũi tên */}
              <div className="flex-shrink-0">
                <Arrow />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnreadMessage
