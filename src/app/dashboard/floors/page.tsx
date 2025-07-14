
"use client"

import { Header } from '@/components/dashboard/header'
import { FloorManagementView } from '@/components/dashboard/floors/floor-management-view'
import { FloorProvider } from '@/context/floor-context'
import { TableProvider } from '@/context/table-context'
import { StaffProvider } from '@/context/staff-context'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

function FloorManagementPage() {
    const { user } = useAuth()
    const { t } = useTranslation()

    const canViewPage = () => {
        if (!user) return false
        const allowedRoles = ["Manager", "Super Admin"];
        return allowedRoles.includes(user.role)
    }

    if (!canViewPage()) {
        return (
          <div className="flex min-h-screen w-full flex-col">
            <Header title={t('floors.title')} />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
               <Card className="flex flex-col items-center justify-center p-10 text-center">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-4">
                        <Lock className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">{t('dialogs.accessDenied')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t('dialogs.permissionDenied')}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t('dialogs.contactAdmin')}</p>
                </CardContent>
               </Card>
            </main>
          </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title={t('floors.title')} />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <FloorManagementView />
            </main>
        </div>
    )
}


export default function FloorsPage() {
  return (
    <FloorProvider>
      <TableProvider>
        <StaffProvider>
            <FloorManagementPage />
        </StaffProvider>
      </TableProvider>
    </FloorProvider>
  )
}
