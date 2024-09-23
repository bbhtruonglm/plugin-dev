import React, { useEffect, useRef, useState } from 'react'

import { ReactComponent as Pause } from '@/assets/pause-circle.svg'
import { ReactComponent as Play } from '@/assets/play-btn.svg'
import { VideoPlayerProps } from './type'

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  width = '200px',
  height = '160px',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
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

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="w-full  flex flex-col space-y-4">
      <div
        className="relative"
        style={{ width, height }}
      >
        <video
          ref={videoRef}
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
          {isPlaying ? (
            <Pause className="h-12 w-12" />
          ) : (
            <Play className="w-12 h-12" />
          )}
        </button>
      </div>

      {/* Progress Bar and Time on the right */}
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <div
            className="relative w-full cursor-pointer"
            onClick={handleSeek}
          >
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full">
              <div
                className="absolute bottom-0 left-0 h-2 rounded-full bg-blue-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          {/* Time display */}
          <div className=" text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
