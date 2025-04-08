import { letterToColorCode, nameToLetter } from '@/utils'

import MessageComponent from '../MessageComponent/MessageComponent'
import React from 'react'

/**
 * Props của MessageBody
 */
interface IProps {
  /**
   * @param item: any
   * Dữ liệu tin nhắn
   */
  item: any
  /**
   * @param checkStaffExist: (e: any) => string
   * Kiểm tra xem staff có tồn tại không
   */
  checkStaffExist: (e: any) => string | undefined
  /**
   * @param client_name?: string
   * Tên của khách hàng
   */
  client_name?: string
}
const MessageBody = React.memo(
  ({ item, checkStaffExist, client_name }: IProps) => {
    return (
      <div
        className={`flex w-full py-2 gap-1 transition-all duration-300 ease-out  ${
          item?.message_type === 'system' || item?.message_type === 'note'
            ? ' hidden justify-center'
            : item?.message_type === 'page'
            ? ' justify-start items-start'
            : ' justify-end items-end'
        }`}
      >
        {item?.message_type === 'page' && (
          <div className="flex mask-rounded-oval bg-transparent w-6 h-6 items-center justify-center">
            <img
              src={
                checkStaffExist(item?.message_metadata) ||
                './images/Logo_retion_embed.png'
              }
              className="w-6 h-6 mask-rounded-oval"
              alt=""
            />
          </div>
        )}

        {/* Phần nội dung tin nhắn được hiển thị */}
        <MessageComponent data={item} />

        {item?.message_type === 'client' && (
          <div
            className="flex mask-rounded-oval text-white text-sm items-center justify-center w-6 h-6"
            style={{ background: letterToColorCode(client_name) }}
          >
            {nameToLetter(client_name)}
          </div>
        )}
      </div>
    )
  }
)

export default MessageBody
