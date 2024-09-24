import React, { useEffect, useRef, useState } from 'react'

import { ReactComponent as Pause } from '@/assets/pause-circle.svg'
import { ReactComponent as Play } from '@/assets/play-btn.svg'
import { VideoPlayerProps } from './type'

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, width, height }) => {
  const VIDEO_REF = useRef<HTMLVideoElement>(null)
  const [is_playing, setIsPlaying] = useState(false)
  const [current_time, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [is_hovered, setIsHovered] = useState(false) // State for hover

  useEffect(() => {
    // Lấy tham chiếu đến phần tử video hiện tại
    const VIDEO = VIDEO_REF.current

    // Kiểm tra xem phần tử video có tồn tại không
    if (VIDEO) {
      // Thêm một trình lắng nghe sự kiện cho khi siêu dữ liệu của video đã được tải
      VIDEO.addEventListener('loadedmetadata', () => {
        // Đặt độ dài của video khi siêu dữ liệu được tải
        setDuration(VIDEO.duration)
      })

      // Thêm một trình lắng nghe sự kiện cho các cập nhật thời gian trong quá trình phát
      VIDEO.addEventListener('timeupdate', () => {
        // Cập nhật trạng thái thời gian hiện tại khi currentTime của video thay đổi
        setCurrentTime(VIDEO.currentTime)
      })

      // Thêm một trình lắng nghe sự kiện cho khi video kết thúc
      VIDEO.addEventListener('ended', handleVideoEnd)
    }

    // Hàm cleanup để xóa bỏ các trình lắng nghe sự kiện khi thành phần không còn tồn tại
    return () => {
      // Kiểm tra lại xem phần tử video có tồn tại không
      if (VIDEO) {
        // Xóa bỏ trình lắng nghe sự kiện 'loadedmetadata'
        VIDEO.removeEventListener('loadedmetadata', () => {})

        // Xóa bỏ trình lắng nghe sự kiện 'timeupdate'
        VIDEO.removeEventListener('timeupdate', () => {})

        // Xóa bỏ trình lắng nghe sự kiện 'ended'
        VIDEO.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, []) // Mảng phụ thuộc rỗng nghĩa là hiệu ứng này chỉ chạy khi thành phần được gắn và gỡ bỏ

  /** Hàm check video kết thúc */
  const handleVideoEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="w-full h-full flex flex-col gap-y-1 rounded-lg relative">
      <div
        className="relative"
        style={{ width, height }}
        onMouseEnter={() => setIsHovered(true)} // Show overlay on hover
        onMouseLeave={() => setIsHovered(false)} // Hide overlay when not hovered
      >
        <video
          ref={VIDEO_REF}
          src={src}
          width={width}
          height={height}
          className="rounded-lg"
          controls
          preload="metadata"
        />
      </div>
    </div>
  )
}

export default VideoPlayer
