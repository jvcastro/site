export default function ChatLoadingIndicator() {
  return (
    <div className="flex items-center gap-2.5" aria-label="Thinking">
      <span className="text-muted text-sm">Thinking</span>
      <span className="chat-loading-dots flex items-center gap-1" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}
