import { ReactComponent as FileIcon } from '@/assets/document-text.svg'
import { MessageProps } from '../../../type'
import { extractMessageId } from '@/utils'

const MessageFile = ({ data }: { data: MessageProps['data'] }) => {
  /** Nếu không phải dạng file thì trả về null */
  if (data?.message_attachments?.[0]?.type !== 'file') return null

  const FILE = data.message_attachments[0]

  return (
    <div className="bg-white rounded-lg p-2 gap-y-1 flex flex-col">
      <div className="flex h-9 w-9 items-center justify-center p-2 rounded-full bg-slate-300">
        <FileIcon className="h-5 w-5" />
      </div>
      <a
        href={FILE?.payload?.url}
        download
        className="text-slate-700 truncate underline text-sm"
      >
        {extractMessageId(FILE?.payload?.url)}
      </a>
    </div>
  )
}

export default MessageFile
