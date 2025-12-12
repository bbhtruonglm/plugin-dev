import { XMarkIcon } from '@heroicons/react/16/solid'
import React from 'react'

/**
 * Interface cho props của WelcomeMessage
 */
interface WelcomeMessageProps {
  /** Có hiển thị tin nhắn chào mừng không */
  showWelcomeMessage: boolean
  /** Có sử dụng background tùy chỉnh không */
  isCustomBackground: boolean
  /** Thông tin tin nhắn chào mừng */
  welcomeMessage: {
    message?: string
    delay?: number
    is_active?: boolean
  }
  /** Sự kiện click vào tin nhắn */
  onClick: (e: any) => void
  /** Sự kiện click đóng tin nhắn */
  onClose: (e: any) => void
}

/**
 * Component WelcomeMessage (Tin nhắn chào mừng)
 */
const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  showWelcomeMessage,
  isCustomBackground,
  welcomeMessage,
  onClick,
  onClose,
}) => {
  /** Nếu không hiển thị thì return null */
  if (!showWelcomeMessage) return null

  return (
    /** Container tin nhắn chào mừng */
    <div
      className={`flex ${
        isCustomBackground
          ? 'bg-slate-400 hover:bg-gray-500 text-white'
          : 'bg-white hover:bg-gray-100 text-slate-500'
      } shadow-lg justify-between w-full gap-x-2 rounded-xl h-16 px-3 py-3 cursor-pointer `}
      /** Sự kiện click */
      onClick={(e) => onClick(e)}
    >
      {/** Nội dung tin nhắn */}
      <h4 className="text-sm line-clamp-2">{welcomeMessage?.message}</h4>
      {/* Nút đóng */}
      <div
        /** Sự kiện click đóng */
        onClick={(event) => onClose(event)}
        className="size-6 cursor-pointer flex justify-center items-center hover:bg-slate-400 rounded-full "
      >
        <XMarkIcon className="size-4" />
      </div>
    </div>
  )
}

export default WelcomeMessage
