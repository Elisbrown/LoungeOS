// New page for financial reports
"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, FileText } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { Button } from '@/components/ui/button'

function ReportsContent() {
    const { t } = useTranslation()
    
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <CardTitle>{t('accounting.reports.pnl')}</CardTitle>
                    <CardDescription>{t('accounting.reports.pnlDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">{t('accounting.reports.generate')}</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <CardTitle>{t('accounting.reports.balanceSheet')}</CardTitle>
                    <CardDescription>{t('accounting.reports.balanceSheetDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">{t('accounting.reports.generate')}</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <CardTitle>{t('accounting.reports.cashFlow')}</CardTitle>
                    <CardDescription>{t('accounting.reports.cashFlowDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">{t('accounting.reports.generate')}</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function FinancialReportsPage() {
    const { user } = useAuth()
    const { t } = useTranslation()

    const canViewPage = () => {
        if (!user) return false
        const allowedRoles = ["Manager", "Super Admin", "Accountant"]
        return allowedRoles.includes(user.role)
    }

    if (!canViewPage()) {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <Header title={t('accounting.reports.title')} />
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
                    </CardContent>
                   </Card>
                </main>
            </div>
        )
    }

    return (
         <div className="flex min-h-screen w-full flex-col">
            <Header title={t('accounting.reports.title')} />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <ReportsContent />
            </main>
        </div>
    )
}
