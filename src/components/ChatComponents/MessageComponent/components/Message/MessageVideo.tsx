import { MessageProps } from '../../../type'
import VideoPlayer from '../../VideoPlayer'

const MessageVideo = ({ data }: { data: MessageProps['data'] }) => {
  /** Nếu không phải dạng video thì trả về null */
  if (data?.message_attachments?.[0]?.type !== 'video') return null

  return (
    <div className="p-2">
      <VideoPlayer src={data.message_attachments[0]?.payload?.url || ''} />
    </div>
  )
}

export default MessageVideo
