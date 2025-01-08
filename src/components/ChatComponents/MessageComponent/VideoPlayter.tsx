import React from 'react'
import { VideoPlayerProps } from '../type'

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, width, height }) => {
  return (
    <div className="w-full h-full flex flex-col gap-y-1 rounded-lg relative">
      <div
        className="relative"
        style={{ width, height }}
      >
        <video
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
