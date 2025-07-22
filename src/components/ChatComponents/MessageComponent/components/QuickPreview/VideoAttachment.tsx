import { MessageProps } from '@/components/ChatComponents/type'
import VideoPlayer from '../../VideoPlayer'

const VideoAttachment = ({ data }: MessageProps) => {
  /** Lấy URL video từ dữ liệu tin nhắn */
  const VIDEO_URO = data?.message_attachments?.[0]?.payload?.url

  return (
    <div className="">
      <VideoPlayer
        src={VIDEO_URO || 'https://www.w3schools.com/html/mov_bbb.mp4'}
      />
    </div>
  )
}

export default VideoAttachment
