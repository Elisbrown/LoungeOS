"use client"

// This file is updated to wrap the kitchen view in a DndProvider
import { Header } from '@/components/dashboard/header'
import { KitchenView } from '@/components/dashboard/kitchen/kitchen-view'
import { DndProvider } from '@/components/dnd/dnd-provider'
import { useTranslation } from '@/hooks/use-translation'

export default function KitchenPage() {
  const { t } = useTranslation()
  return (
    <DndProvider>
        <div className="flex min-h-screen w-full flex-col">
        <Header title={t('kitchen.title')} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <KitchenView />
        </main>
        </div>
    </DndProvider>
  )
}
