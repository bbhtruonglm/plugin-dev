import AudioPlayer from '../AudioPlayer'
import { MessageProps } from '../../type'

const MessageAudio = ({ data }: { data: MessageProps['data'] }) => {
  /** Nếu không phải dạng audio thì trả về null */
  if (data?.message_attachments?.[0]?.type !== 'audio') return null

  return (
    <div className="p-2">
      <AudioPlayer src={data.message_attachments[0]?.payload?.url} />
    </div>
  )
}

export default MessageAudio
