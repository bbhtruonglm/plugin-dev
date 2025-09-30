import 'regexp-polyfill'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkLinkify from 'remark-linkify'

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkLinkify]}>{content}</ReactMarkdown>
  )
}
