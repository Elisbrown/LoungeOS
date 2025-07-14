
"use client"

import { Header } from '@/components/dashboard/header'
import { TablesView } from '@/components/dashboard/tables/tables-view'
import { FloorProvider } from '@/context/floor-context'
import { PageOnboarding } from '@/components/dashboard/onboarding/page-onboarding'
import { useTranslation } from '@/hooks/use-translation'

export default function TablesPage() {
  const { t } = useTranslation()
  return (
    <FloorProvider>
        <div className="flex min-h-screen w-full flex-col">
        <PageOnboarding page="tables" />
        <Header title={t('tables.title')} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <TablesView />
        </main>
        </div>
    </FloorProvider>
  )
}
