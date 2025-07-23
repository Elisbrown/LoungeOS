"use client"

// This file is updated to wrap the bar view in a DndProvider
import { Header } from '@/components/dashboard/header'
import { BarView } from '@/components/dashboard/bar/bar-view'
import { DndProvider } from '@/components/dnd/dnd-provider'
import { useTranslation } from '@/hooks/use-translation'

export default function BarPage() {
  const { t } = useTranslation()
  return (
    <DndProvider>
        <div className="flex min-h-screen w-full flex-col">
        <Header title={t('bar.title')} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <BarView />
        </main>
        </div>
    </DndProvider>
  )
}
