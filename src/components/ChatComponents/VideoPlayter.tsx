import React, { useEffect, useRef, useState } from 'react'

import { ReactComponent as Pause } from '@/assets/pause-circle.svg'
import { ReactComponent as Play } from '@/assets/play-btn.svg'
import { VideoPlayerProps } from './type'

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, width, height }) => {
  const VIDEO_REF = useRef<HTMLVideoElement>(null)

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
