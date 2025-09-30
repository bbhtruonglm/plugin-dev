import 'regexp-polyfill'

import ReactMarkdown, { Components } from 'react-markdown'

import { ReactComponent as ChatBubble } from '@/assets/chat-bubble-oval-left-ellipsis.svg'
import { MessageProps } from '../../../type'
import MessageSources from './MessageSources'
import { checkMD } from '@/utils'
import remarkGfm from 'remark-gfm'
import { t } from 'i18next'

/**
 * Khai báo kiểu dữ liệu cho MessageComponent
 */
declare global {
  /**
   * Khai báo kiểu dữ liệu cho window
   */
  interface Window {
    /**
     * Khai báo kiểu dữ liệu cho ReactNativeWebView
     */
    ReactNativeWebView?: {
      /**
       *  Hàm postMessage
       * @param message   - Tin nhắn
       * @returns       - Trả về void
       */
      postMessage: (message: string) => void
    }
  }
}
const MessageText = ({
  data,
  AI_STATUS,
}: {
  data: MessageProps['data']
  AI_STATUS?: boolean
}) => {
  /**
   *  Hàm format text với link
   * @param text - Nội dung tin nhắn
   * @returns
   */
  const formatTextWithLinks = (text: string) => {
    /** Tìm kế tìm link trong text */
    const URL_REGEX = /(https?:\/\/[^\s]+)/g
    /** Return text với link */
    return text.split(URL_REGEX).map((part, index) =>
      URL_REGEX.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {part}
        </a>
      ) : (
        part
      )
    )
  }
  if (
    !data?.message_text ||
    data?.message_type === 'system' ||
    data?.message_type === 'note' ||
    (data?.message_attachments?.length && data?.message_attachments?.[0]?.type)
  )
    return null

  /** markdown components */
  const MARKDOWN_COMPONENTS: Components = {
    a: (props) => {
      const { href, children, ...rest } = props
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
          {...rest}
        >
          {children}
        </a>
      )
    },
  }

  return (
    <div className={`flex flex-col gap-y-2`}>
      <div
        className={` p-2 rounded-lg shadow-sm ${
          AI_STATUS && data?.message_type !== 'client' ? 'bg-white' : ''
        }`}
      >
        <div className="text-sm min-h-4 break-words whitespace-pre-line overflow-hidden">
          {/* {checkMD(data?.message_text) ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MARKDOWN_COMPONENTS}
            >
              {data?.message_text}
            </ReactMarkdown>
          ) : (
          )} */}
          {formatTextWithLinks(data?.message_text)}
        </div>
        {AI_STATUS && data?.message_type !== 'client' && (
          <div className="flex flex-col gap-y-2">
            <div
              onClick={() => {
                window?.ReactNativeWebView?.postMessage(
                  JSON.stringify({ type: 'x', message: data?.message_text })
                )
                window.parent.postMessage(
                  { content: data?.message_text, _type: 'WIDGET' },
                  '*'
                )
              }}
              className="flex bg-slate-800 cursor-pointer text-yellow-200 hover:bg-slate-600 px-4 py-2 gap-1 rounded-lg justify-center items-center text-sm font-medium"
            >
              {t('add_to_chat')}
              <ChatBubble className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
      {AI_STATUS && data?.llm_sources && data?.llm_sources.length > 0 && (
        <MessageSources sources={data.llm_sources} />
      )}
    </div>
  )
}

export default MessageText
