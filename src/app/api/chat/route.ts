import { NextResponse } from 'next/server'
import type {
  ChatErrorResponse,
  ChatRequestBody,
  ChatSuccessResponse,
  DifyChatResponse,
} from '@/types/chat'

const MAX_QUERY_LENGTH = 4000
const DEFAULT_DIFY_BASE_URL = 'https://api.dify.ai/v1'

function jsonError(message: string, status: number) {
  return NextResponse.json<ChatErrorResponse>({ error: message }, { status })
}

export async function POST(request: Request) {
  let body: ChatRequestBody

  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return jsonError('Invalid request body.', 400)
  }

  const query = body.query?.trim()
  const userId = body.userId?.trim()

  if (!query) {
    return jsonError('Message cannot be empty.', 400)
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return jsonError(`Message must be ${MAX_QUERY_LENGTH} characters or fewer.`, 400)
  }

  if (!userId) {
    return jsonError('User identifier is required.', 400)
  }

  const apiKey = process.env.DIFY_API_KEY
  const baseUrl = process.env.DIFY_BASE_API_URL ?? DEFAULT_DIFY_BASE_URL

  if (!apiKey) {
    return jsonError('Chat service is not configured.', 500)
  }

  try {
    const difyResponse = await fetch(`${baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'blocking',
        conversation_id: body.conversationId ?? '',
        user: userId,
      }),
    })

    if (!difyResponse.ok) {
      console.error('Dify API error:', difyResponse.status, difyResponse.statusText)
      return jsonError('Unable to get a response right now. Please try again.', 502)
    }

    const data = (await difyResponse.json()) as DifyChatResponse

    if (!data.answer) {
      return jsonError('Received an empty response. Please try again.', 502)
    }

    return NextResponse.json<ChatSuccessResponse>({
      answer: data.answer,
      conversationId: data.conversation_id,
      messageId: data.message_id,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return jsonError('Something went wrong. Please try again.', 502)
  }
}
