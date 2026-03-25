import { letterToColorCode, nameToLetter } from '@/utils'

import MessageComponent from '../MessageComponent/MessageComponent'
import React from 'react'
import LogoRetion from '@/assets/Logo_retion_embed.png'

/** Loại tin nhắn hệ thống */
const MESSAGE_TYPE_SYSTEM = 'system'
/** Loại tin nhắn ghi chú */
const MESSAGE_TYPE_NOTE = 'note'
/** Loại tin nhắn trang đại diện */
const MESSAGE_TYPE_PAGE = 'page'
/** Loại tin nhắn từ khách hàng */
const MESSAGE_TYPE_CLIENT = 'client'

/**
 * Thuộc tính của thành phần MessageBody.
 */
interface IProps {
  /** Dữ liệu tin nhắn */
  message_item: any
  /** Kiểm tra xem nhân viên có tồn tại không */
  checkStaffExist: (metadata: any) => string | undefined
  /** Tên của khách hàng */
  client_name?: string
  /** Kiểm tra xem đại lý có tồn tại không */
  checkAgentExist: (metadata: any) => string | undefined
}

/**
 * Thành phần hiển thị phần thân của tin nhắn trong hội thoại.
 * Tại sao: Tách biệt logic hiển thị tin nhắn dựa trên loại tin nhắn (hệ thống, trang, khách hàng) để dễ dàng quản lý layout.
 * @param {IProps} props - Các thuộc tính đầu vào
 * @returns {JSX.Element} - Giao diện thân tin nhắn
 */
function MessageBody({
  message_item,
  checkStaffExist,
  client_name,
  checkAgentExist,
}: IProps) {
  return (
    <div
      className={`flex w-full py-2 gap-1 transition-all duration-300 ease-out  ${
        message_item?.message_type === MESSAGE_TYPE_SYSTEM ||
        message_item?.message_type === MESSAGE_TYPE_NOTE
          ? ' hidden justify-center'
          : message_item?.message_type === MESSAGE_TYPE_PAGE
          ? ' justify-start items-start'
          : ' justify-end items-end'
      }`}
    >
      {message_item?.message_type === MESSAGE_TYPE_PAGE && (
        <div className="flex mask-rounded-oval bg-transparent w-6 h-6 items-center justify-center">
          <img
            src={checkStaffExist(message_item?.message_metadata) || LogoRetion}
            className="w-6 h-6 mask-rounded-oval"
            alt=""
          />
        </div>
      )}

      {/* Phần nội dung tin nhắn được hiển thị */}
      <MessageComponent data={message_item} />

      {message_item?.message_type === MESSAGE_TYPE_CLIENT && (
        <div>
          {message_item?.message_metadata ? (
            <img
              src={checkAgentExist(message_item?.message_metadata)}
              className="w-6 h-6 mask-rounded-oval"
              alt=""
            />
          ) : (
            <div
              className="flex mask-rounded-oval text-white text-sm items-center justify-center w-6 h-6"
              style={{ background: letterToColorCode(client_name) }}
            >
              {nameToLetter(client_name)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MessageBody
