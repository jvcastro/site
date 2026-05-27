import { NextResponse } from 'next/server'
import {
  encodeSseEvent,
  parseDifyStream,
} from '@/lib/parse-dify-stream'
import type { ChatErrorResponse, ChatRequestBody } from '@/types/chat'

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

  let difyResponse: Response

  try {
    difyResponse = await fetch(`${baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'streaming',
        conversation_id: body.conversationId ?? '',
        user: userId,
      }),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return jsonError('Something went wrong. Please try again.', 502)
  }

  if (!difyResponse.ok || !difyResponse.body) {
    console.error(
      'Dify API error:',
      difyResponse.status,
      difyResponse.statusText,
    )
    return jsonError('Unable to get a response right now. Please try again.', 502)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        let conversationId = body.conversationId ?? ''
        let messageId = ''
        let sentMeta = false

        for await (const event of parseDifyStream(difyResponse.body!)) {
          if (event.event === 'error') {
            controller.enqueue(
              encoder.encode(
                encodeSseEvent('error', {
                  message:
                    event.message ?? 'Unable to get a response right now.',
                }),
              ),
            )
            break
          }

          if (event.conversation_id) {
            conversationId = event.conversation_id
          }

          if (event.message_id) {
            messageId = event.message_id
          }

          if (!sentMeta && conversationId && messageId) {
            sentMeta = true
            controller.enqueue(
              encoder.encode(
                encodeSseEvent('meta', { conversationId, messageId }),
              ),
            )
          }

          if (
            (event.event === 'message' || event.event === 'agent_message') &&
            event.answer
          ) {
            controller.enqueue(
              encoder.encode(encodeSseEvent('chunk', { text: event.answer })),
            )
          }

          if (event.event === 'message_end') {
            if (!sentMeta && conversationId && messageId) {
              controller.enqueue(
                encoder.encode(
                  encodeSseEvent('meta', { conversationId, messageId }),
                ),
              )
            }
            break
          }
        }

        controller.enqueue(encoder.encode(encodeSseEvent('done', {})))
      } catch (error) {
        console.error('Stream proxy error:', error)
        controller.enqueue(
          encoder.encode(
            encodeSseEvent('error', {
              message: 'Something went wrong. Please try again.',
            }),
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
