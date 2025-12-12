import { ChevronDownIcon } from '@heroicons/react/16/solid'
import React from 'react'
import { renderLogo } from '@/utils'
import { useSelector } from 'react-redux'
import { selectIsLoadingFirstTime } from '@/stores/appSlice'

/**
 * Interface cho props của TriggerButton
 */
interface ITriggerButtonProps {
  /** Hàm xử lý sự kiện click */
  onClick: (e: any) => void
  /** Vị trí hiển thị */
  position: string
  /** URL xem trước ảnh (nếu có) */
  globalPreviewUrl: string | null
  /** Có sử dụng background tùy chỉnh không */
  isCustomBackground: boolean
  /** Trạng thái AI */
  aiStatus: boolean
  /** Trạng thái xem màn hình */
  isViewScreen: boolean
  /** Trạng thái hiển thị popup */
  show: boolean
  /** Chiều rộng hiện tại của màn hình */
  currentWidth: number
  /** Số tin nhắn chưa đọc */
  unreadCount: number
  /** Cho phép hiển thị logo tổ chức */
  orgAllowLogo: boolean
  /** Logo tùy chỉnh của trang */
  logoPageCustom: string | null
  /** Hiệu ứng button */
  selectButtonEffect: boolean
}

/**
 * Component TriggerButton (Nút bong bóng chat)
 */
const TriggerButton: React.FC<ITriggerButtonProps> = ({
  onClick,
  position,
  globalPreviewUrl,
  isCustomBackground,
  aiStatus,
  isViewScreen,
  show,
  currentWidth,
  unreadCount,
  orgAllowLogo,
  logoPageCustom,
  selectButtonEffect,
}) => {
  /** Trạng thái loading */
  const IS_LOADING = useSelector(selectIsLoadingFirstTime)

  return (
    /** Button trigger hiện thị bong bóng chat */
    <button
      /** Sự kiện click */
      onClick={onClick}
      /** Class name */
      className={`absolute justify-center items-center bottom-4 ${
        position === 'bottom_left' ? 'left-2' : 'right-2'
      }  h-12 w-12 ${
        isCustomBackground ? 'bg-slate-400 text-white' : 'bg-white'
      } shadow-lg rounded-full  hover:scale-110 ${
        aiStatus || isViewScreen || globalPreviewUrl ? 'hidden' : ''
      }  ${
        !show
          ? ' flex z-30 '
          : currentWidth < 768 && currentWidth !== 0
          ? ' hidden'
          : ' flex z-30'
      }`}
    >
      {/** Số lượng tin nhắn chưa đọc */}
      <div
        className={`absolute ${
          /** Khi không có tin nhắn, hoặc đang show, thì không hiện */
          unreadCount === 0 || show
            ? 'hidden'
            : 'flex justify-center items-center'
        } text-white text-xs truncate right-0 top-0 bg-red-500 h-5 w-5 rounded-full border-2 border-white translate-x-1 -translate-y-1`}
      >
        {/** Hiển thị số lượng tin nhắn, nếu > 9 thì hiện 9+ */}
        {unreadCount < 10 ? unreadCount : '9+'}
      </div>
      {/** Icon hoặc Logo */}
      <div className="">
        {/** Nếu đang show popup thì hiện icon đóng (ChevronDown) */}
        {show ? (
          <ChevronDownIcon className="size-8" />
        ) : (
          <>
            {/** Nếu đang loading thì hiện skeleton */}
            {IS_LOADING ? (
              <div className="size-8 bg-gray-200 rounded-full animate-pulse" />
            ) : (
              /** Hiển thị logo */
              <img
                src={renderLogo(
                  orgAllowLogo,
                  logoPageCustom || undefined,
                  './images/Logo_retion_embed.png'
                )}
                alt="Logo Retion"
                width={30}
                height={30}
                className={` ${
                  orgAllowLogo && logoPageCustom
                    ? 'size-8 object-cover rounded-full'
                    : `size-7.5 ${selectButtonEffect ? 'animate-zoom' : ''}`
                }`}
              />
            )}
          </>
        )}
      </div>
    </button>
  )
}

export default TriggerButton
