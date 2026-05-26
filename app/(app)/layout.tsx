import type { ReactNode } from 'react'
import PostHogProvider from '@/components/providers/posthog-provider'

export default function AppLayout({ children }: { children: ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>
}
