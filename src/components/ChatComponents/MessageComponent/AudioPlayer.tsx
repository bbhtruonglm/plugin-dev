import React, { useEffect, useRef, useState } from 'react'

import { AudioPlayerProps } from '../type'
import { ReactComponent as Pause } from '@/assets/pause-circle.svg'
import { ReactComponent as Play } from '@/assets/play-btn.svg'

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  /**
   * useRef giúp bạn giữ một tham chiếu đến phần tử audio
   * để có thể tương tác với nó (chơi, dừng)
   * mà không cần tạo lại phần tử đó trong DOM
   * mỗi khi component render lại.
   *  */
  const AUDIO_REF = useRef<HTMLAudioElement>(null)
  /**
   * @param is_playing: boolean
   */
  const [is_playing, setIsPlaying] = useState(false)
  /**
   * @param current_time: number
   */
  const [current_time, setCurrentTime] = useState(0)
  /**
   * @param duration: number
   */
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    /** Tạo phần tử audio */

    /** Lấy tham chiếu đến phần tử audio hiện tại */
    const AUDIO = AUDIO_REF.current
    /**
     * Nếu phần tử audio tồn tại
     */
    if (AUDIO) {
      /** Thêm một trình lắng nghe sự kiện khi siêu dữ liệu của audio được tải */
      AUDIO.addEventListener('loadedmetadata', () => {
        /** Cập nhật trạng thái với độ dài của file audio sau khi siêu dữ liệu được tải */
        setDuration(AUDIO.duration)
      })

      /** Thêm một trình lắng nghe sự kiện cập nhật thời gian khi audio đang phát */
      AUDIO.addEventListener('timeupdate', () => {
        /** Cập nhật trạng thái thời gian hiện tại của audio */
        setCurrentTime(AUDIO.currentTime)
      })

      /** Thêm một trình lắng nghe sự kiện khi audio kết thúc phát */
      AUDIO.addEventListener('ended', handleAudioEnd)
    }

    /** Cleanup function, loại bỏ các trình lắng nghe khi component bị unmount */
    return () => {
      if (AUDIO) {
        /** Xóa bỏ trình lắng nghe sự kiện khi siêu dữ liệu được tải */
        AUDIO.removeEventListener('loadedmetadata', () => {})

        /** Xóa bỏ trình lắng nghe sự kiện cập nhật thời gian phát */
        AUDIO.removeEventListener('timeupdate', () => {})

        /** Xóa bỏ trình lắng nghe sự kiện khi audio kết thúc */
        AUDIO.removeEventListener('ended', handleAudioEnd)
      }
    }
    /** Mảng phụ thuộc rỗng để đảm bảo useEffect chỉ chạy một lần khi component được mount */
  }, [])

  /** Hàm check xem audio đã kết thúc hay chưa */
  const handleAudioEnd = () => {
    /** Khi audio kết thúc thì set is_playing về false */
    setIsPlaying(false)
    /** hàm kết thúc thì reset thời gian về 0 */
    setCurrentTime(0)
  }

  /** Hàm play/pause */
  const handlePlayPause = () => {
    /**
     * Nếu audio đang phát thì dừng lại
     */
    if (AUDIO_REF.current) {
      /**
       * Nếu đang phát thì dừng lại
       */
      if (is_playing) {
        /**
         * Dừng audio
         */
        AUDIO_REF.current.pause()
      } else {
        /**
         * Nếu không phát thì chơi
         */
        AUDIO_REF.current.play()
      }
      /**
       * Toggle trạng thái phát
       */
      setIsPlaying(!is_playing)
    }
  }

  /** Hàm di chuyển progress bar
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} e - sự kiện click chuột
   */
  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    /**
     * Lấy phần tử progress bar
     */
    const PROGRESS_BAR = e.currentTarget
    /**
     * Lấy kích thước của progress bar
     */
    const RECT = PROGRESS_BAR.getBoundingClientRect()
    /**
     * Tính toán thời gian mới
     */
    const CLICK_X = e.clientX - RECT.left
    /**
     * Tính toán thời gian mới
     */
    const NEW_TIME = (CLICK_X / RECT.width) * duration
    /**
     * Nếu audio tồn tại
     */
    if (AUDIO_REF.current) {
      /**
       * Set thời gian mới cho audio
       */
      AUDIO_REF.current.currentTime = NEW_TIME
      /**
       * Set thời gian mới cho state
       */
      setCurrentTime(NEW_TIME)
    }
  }

  /** Format time
   * @param {number} time
   * @return {string} time
   */
  const formatTime = (time: number) => {
    /**
     * Tính toán phút
     */
    const MINUTES = Math.floor(time / 60)
    /**
     * Tính toán giây
     */
    const SECONDS = Math.floor(time % 60)
    /**
     * Trả về chuỗi thời gian
     */
    return `${MINUTES}:${SECONDS < 10 ? '0' : ''}${SECONDS}`
  }

  return (
    <div className="relative flex items-center gap-x-2 flex-grow min-w-44">
      <audio
        ref={AUDIO_REF}
        src={src}
      />

      {/* Play/Pause button on the left */}
      <button
        onClick={handlePlayPause}
        className=" flex-shrink-0"
      >
        {is_playing ? (
          <Pause className="h-11 w-11" />
        ) : (
          <Play className="w-11 h-11" />
        )}
      </button>
      <div className="flex flex-col w-full justify-center">
        <div className="bg-slate-300 h-1 w-full cursor-pointer rounded-full mt-2">
          <div
            className="relative w-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="progress bg-black h-1 rounded-full w-0"
              style={{ width: `${(current_time / duration) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="text-left text-sm">
          {formatTime(current_time)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
