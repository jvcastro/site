import CursorGrid from '@/components/CursorGrid'
import HomeChat from '@/components/HomeChat'

export default function Home() {
  return (
    <CursorGrid className="ambient-bg text-foreground relative flex h-dvh flex-col overflow-hidden">
      <HomeChat />
    </CursorGrid>
  )
}
