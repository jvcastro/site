export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

export type ChatRequestBody = {
  query: string
  conversationId?: string
  userId: string
}

export type ChatSuccessResponse = {
  answer: string
  conversationId: string
  messageId: string
}

export type ChatErrorResponse = {
  error: string
}

export type DifyChatResponse = {
  answer: string
  conversation_id: string
  message_id: string
}

export type DifyStreamEvent = {
  event: string
  answer?: string
  conversation_id?: string
  message_id?: string
  message?: string
}

export type ClientStreamMeta = {
  conversationId: string
  messageId: string
}

export type ClientStreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'meta'; data: ClientStreamMeta }
  | { type: 'error'; message: string }
  | { type: 'done' }
