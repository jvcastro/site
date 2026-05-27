'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import ChatLoadingIndicator from '@/components/ChatLoadingIndicator'

type MarkdownMessageProps = {
  content: string
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  if (!content.trim()) {
    return <ChatLoadingIndicator />
  }

  return (
    <div className="chat-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
