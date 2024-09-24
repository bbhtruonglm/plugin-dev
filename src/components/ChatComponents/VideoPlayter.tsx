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
    const VIDEO = VIDEO_REF.current
    if (VIDEO) {
      VIDEO.addEventListener('loadedmetadata', () => {
        setDuration(VIDEO.duration)
      })
      VIDEO.addEventListener('timeupdate', () => {
        setCurrentTime(VIDEO.currentTime)
      })
      VIDEO.addEventListener('ended', handleVideoEnd)
    }
    return () => {
      if (VIDEO) {
        VIDEO.removeEventListener('loadedmetadata', () => {})
        VIDEO.removeEventListener('timeupdate', () => {})
        VIDEO.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [])

  /** Hàm check video kết thúc */
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

        {/* {is_hovered && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col rounded-lg justify-end p-2">
            <div className="flex justify-between w-full">
              <button
                onClick={handlePlayPause}
                className="p-1 rounded-lg"
              >
                {is_playing ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </button>
            </div>

            <div
              className="w-full mt-2 cursor-pointer"
              onClick={handleSeek}
            >
              <div className="text-left text-white text-xs mt-1">
                {formatTime(current_time)} / {formatTime(duration)}
              </div>
              <div className="relative w-full h-1 bg-gray-400 rounded-full">
                <div
                  className="absolute h-full bg-white rounded-full"
                  style={{ width: `${(current_time / duration) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default VideoPlayer
