"use client"

import { Header } from '@/components/dashboard/header'
import { EventsView } from '@/components/dashboard/events/events-view'
import { useTranslation } from '@/hooks/use-translation'

export default function EventsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Events" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <EventsView />
        </div>
      </main>
    </div>
  )
} 