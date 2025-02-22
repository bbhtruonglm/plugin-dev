import {
  checkStaffExist,
  renderStaffName,
  saveQuickChatCount,
  truncateSentences,
  truncateString,
} from '@/utils'
import {
  selectGlobalUnreadCount,
  selectLatestMessage,
  selectPageId,
} from '@/stores/appSlice'

import { ReactComponent as Arrow } from '@/assets/chevron-right.svg'
import { EmployeeList } from '@/pages/type'
import TimeAgo from '../TimeAgo'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { useState } from 'react'

function UnreadMessage({ onNavigate, onError }: SendMessageProps) {
  /** danh sách id page */
  const PAGE_ID = useSelector(selectPageId)

  /** Số tin nhắn chưa đọc lấy trong STORE */
  const GLOBAL_UNREAD_COUNT = useSelector(selectGlobalUnreadCount)
  /**
   * Tin nhắn mới nhất
   */
  const LATEST_MESSAGE = useSelector(selectLatestMessage)

  /** State Khai báo thông tin nhân viên */
  const [staff_list, setStaffList] = useState<EmployeeList>({})

  /**
   * Lấy client_id từ localStorage
   */
  const CLIENT_STORED = localStorage.getItem(`client_id_${PAGE_ID}`)

  return (
    <div
      onClick={() => {
        /**
         * Kiểm tra xem có page_id không
         */
        if (PAGE_ID && PAGE_ID !== null) {
          /** Có page_id thì thêm page_id và url, sau đó chuyển trang */
          onNavigate()
        } else {
          /** Không có page_id thì báo lỗi */
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
              !GLOBAL_UNREAD_COUNT ? 'hidden' : 'block'
            } flex justify-center items-center`}
          >
            {GLOBAL_UNREAD_COUNT < 10 ? GLOBAL_UNREAD_COUNT : '9+'}
          </span>
        </h4>
        {/* <h5 className="flex gap-2 items-center text-sm text-onlineColor">
          <div className="w-3 h-3 rounded-full bg-onlineColor"></div>
          {t('we_are_online')}
        </h5> */}
        <div className="flex h-full w-full">
          {LATEST_MESSAGE?.message_type === 'page' && (
            <div className="flex flex-row items-center w-full gap-2">
              {/* Hiển thị avatar theo role user / shop */}
              <div
                className={`flex gap-x-2 flex-grow min-h-0 justify-start items-end `}
              >
                <div className="flex flex-shrink-0 ">
                  {LATEST_MESSAGE?.message_type === 'page' && (
                    <img
                      src={
                        checkStaffExist(LATEST_MESSAGE?.message_metadata) ||
                        './images/earth.svg'
                      }
                      className="w-8 h-8  mask-rounded-oval bg-gray-200"
                      alt=""
                    />
                  )}
                </div>
                <div
                  className="flex flex-col flex-grow min-w-0 h-full cursor-pointer"
                  onClick={() => {
                    /** Khi click trả lời sẽ  reset hết data trong store */
                    // dispatch(setLatestMessageGlobal(null))
                    // dispatch(setListUnreadMessage([]))
                    // dispatch(setListMessage([]))
                    // dispatch(setGlobalUnreadCount(0))
                    /** Khi click vào trả lời, xoá unread_count */
                    // saveQuickChatCount(PAGE_ID, CLIENT_STORED, 0)
                    /* Chuyển tab thành message */
                    // setCurrentTab('message')
                    /** trigger hàm đóng mở popup */
                    // handleBtn()
                  }}
                >
                  <div className="flex flex-col justify-start items-center w-full gap-x-1 flex-shrink-0">
                    <span className="flex text-sm w-full">
                      {LATEST_MESSAGE?.message_text}
                    </span>

                    {/* Phần hiển thị thông tin tin nhắn */}
                    <div className="flex w-full">
                      <div className="text-slate-500 text-sm font-medium flex items-center ">
                        {/* Hiển thị tên nhân viên */}
                        <span className="">
                          {renderStaffName(
                            staff_list,
                            LATEST_MESSAGE?.message_metadata
                          )}
                        </span>
                      </div>

                      {/* Hiển thị thời gian tin nhắn */}
                      <span className="text-slate-500 text-sm font-medium truncate flex items-center flex-shrink-0">
                        <span className="mx-0.5">•</span>
                        {/* {calculateTimeAgo(LATEST_MESSAGE?.createdAt)} */}
                        <TimeAgo timestamp={LATEST_MESSAGE?.createdAt} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Arrow />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnreadMessage
