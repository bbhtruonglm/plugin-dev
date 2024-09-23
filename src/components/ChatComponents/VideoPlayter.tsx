import React, { useEffect, useRef, useState } from 'react'

import { ReactComponent as Pause } from '@/assets/pause-circle.svg'
import { ReactComponent as Play } from '@/assets/play-btn.svg'
import { VideoPlayerProps } from './type'

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  width = '180px',
  height = '110px',
}) => {
  const VIDEO_REF = useRef<HTMLVideoElement>(null)
  const [is_playing, setIsPlaying] = useState(false)
  const [current_time, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = VIDEO_REF.current
    if (video) {
      video.addEventListener('loadedmetadata', () => {
        setDuration(video.duration)
      })
      video.addEventListener('timeupdate', () => {
        setCurrentTime(video.currentTime)
      })
      video.addEventListener('ended', handleVideoEnd)
    }
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', () => {})
        video.removeEventListener('timeupdate', () => {})
        video.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [])

  /** Hàm check xem video đã kết thúc hay chưa */
  const handleVideoEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  /** Hàm play/pause */

  const handlePlayPause = () => {
    if (VIDEO_REF.current) {
      if (is_playing) {
        VIDEO_REF.current.pause()
      } else {
        VIDEO_REF.current.play()
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
    if (VIDEO_REF.current) {
      VIDEO_REF.current.currentTime = NEW_TIME
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
    <div className="w-full flex flex-col gap-y-1  rounded-lg">
      <div
        className="relative"
        style={{ width, height }}
      >
        <video
          ref={VIDEO_REF}
          src={src}
          width={width}
          height={height}
          className="rounded-lg"
        />

        {/* Play/Pause button above the video */}
        <button
          onClick={handlePlayPause}
          //   className=" flex-shrink-0"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 text-white rounded-lg"
        >
          {is_playing ? (
            <Pause className="h-12 w-12" />
          ) : (
            <Play className="w-12 h-12" />
          )}
        </button>
      </div>

      {/* Progress Bar and Time on the right */}
      <div className="flex items-center">
        <div className="flex-grow">
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
    </div>
  )
}

export default VideoPlayer
