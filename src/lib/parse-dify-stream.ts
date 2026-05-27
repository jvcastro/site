import type { DifyStreamEvent } from '@/types/chat'

export function encodeSseEvent(
  event: string,
  data: Record<string, unknown>,
): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function parseDifySseLine(line: string): DifyStreamEvent | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return null

  const payload = trimmed.slice(5).trim()
  if (!payload || payload === '[DONE]') return null

  try {
    return JSON.parse(payload) as DifyStreamEvent
  } catch {
    return null
  }
}

export async function* parseDifyStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<DifyStreamEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      for (const line of part.split('\n')) {
        const event = parseDifySseLine(line)
        if (event) yield event
      }
    }
  }

  if (buffer.trim()) {
    for (const line of buffer.split('\n')) {
      const event = parseDifySseLine(line)
      if (event) yield event
    }
  }
}

export async function* parseClientSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<{ event: string; data: Record<string, unknown> }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      if (!part.trim()) continue

      let event = 'message'
      let dataStr = ''

      for (const line of part.split('\n')) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataStr = line.slice(5).trim()
        }
      }

      if (!dataStr) continue

      try {
        yield { event, data: JSON.parse(dataStr) as Record<string, unknown> }
      } catch {
        // skip malformed frames
      }
    }
  }
}
