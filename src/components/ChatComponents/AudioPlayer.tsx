import React, { useEffect, useRef, useState } from 'react'

import { AudioPlayerProps } from './type'
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

  const [is_playing, setIsPlaying] = useState(false)
  const [current_time, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    /** Tạo phần tử audio */
    const AUDIO = AUDIO_REF.current
    if (AUDIO) {
      AUDIO.addEventListener('loadedmetadata', () => {
        setDuration(AUDIO.duration)
      })
      AUDIO.addEventListener('timeupdate', () => {
        setCurrentTime(AUDIO.currentTime)
      })

      // Event listener for when AUDIO ends
      AUDIO.addEventListener('ended', handleAudioEnd)
    }
    return () => {
      if (AUDIO) {
        AUDIO.removeEventListener('loadedmetadata', () => {})
        AUDIO.removeEventListener('timeupdate', () => {})
        AUDIO.removeEventListener('ended', handleAudioEnd)
      }
    }
  }, [])
  /** Hàm check xem audio đã kết thúc hay chưa */
  const handleAudioEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0) // Reset progress to the beginning
  }
  /** Hàm play/pause */
  const handlePlayPause = () => {
    if (AUDIO_REF.current) {
      if (is_playing) {
        AUDIO_REF.current.pause()
      } else {
        AUDIO_REF.current.play()
      }
      setIsPlaying(!is_playing)
    }
  }
  /** Hàm di chuyển progress bar */
  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const PROGRESS_BAR = e.currentTarget
    const RECT = PROGRESS_BAR.getBoundingClientRect()
    const CLICK_X = e.clientX - RECT.left
    const NEW_TIME = (CLICK_X / RECT.width) * duration
    if (AUDIO_REF.current) {
      AUDIO_REF.current.currentTime = NEW_TIME
      setCurrentTime(NEW_TIME)
    }
  }

  /** Format time
   * @param {number} time
   * @return {string}
   */
  const formatTime = (time: number) => {
    const MINUTES = Math.floor(time / 60)
    const SECONDS = Math.floor(time % 60)
    return `${MINUTES}:${SECONDS < 10 ? '0' : ''}${SECONDS}`
  }

  return (
    <div className="relative flex items-center gap-x-2 flex-grow min-w-44 px-2">
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
          <Pause className="h-12 w-12" />
        ) : (
          <Play className="w-12 h-12" />
        )}
      </button>

      {/* Progress Bar and Time on the right */}
      <div className="flex-grow flex flex-col ">
        <div
          className="relative w-full cursor-pointer"
          onClick={handleSeek}
        >
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div
              className="absolute bottom-0 left-0 h-1 rounded-full bg-slate-500"
              style={{ width: `${(current_time / duration) * 100}%` }}
            />
          </div>
        </div>
        {/* Time display */}
        <div className=" text-left text-sm">
          {formatTime(current_time)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
