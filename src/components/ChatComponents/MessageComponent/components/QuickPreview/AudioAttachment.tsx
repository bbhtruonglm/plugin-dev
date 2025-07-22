import AudioPlayer from '../../AudioPlayer'
import { MessageProps } from '@/components/ChatComponents/type'

const AudioAttachment = ({ data }: MessageProps) => {
  /** Lấy audio url */
  const AUDIO_URL = data?.message_attachments?.[0]?.payload?.url

  return (
    <div className="w-full">
      <AudioPlayer
        src={
          AUDIO_URL ||
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
      />
    </div>
  )
}

export default AudioAttachment
