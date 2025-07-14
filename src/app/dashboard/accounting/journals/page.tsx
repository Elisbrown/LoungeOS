// New page for financial journals
"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, DollarSign, ShoppingCart, Book } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

function JournalsContent() {
    const { t } = useTranslation()
    
    return (
        <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sales"><DollarSign className="mr-2 h-4 w-4" />{t('accounting.journals.sales')}</TabsTrigger>
                <TabsTrigger value="expenses"><ShoppingCart className="mr-2 h-4 w-4" />{t('accounting.journals.expenses')}</TabsTrigger>
                <TabsTrigger value="general"><Book className="mr-2 h-4 w-4" />{t('accounting.journals.generalLedger')}</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('accounting.journals.sales')}</CardTitle>
                        <CardDescription>{t('accounting.journals.salesDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Sales Journal Table would go here */}
                        <p className="text-center text-muted-foreground p-8">Sales Journal Table coming soon.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="expenses">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('accounting.journals.expenses')}</CardTitle>
                        <CardDescription>{t('accounting.journals.expensesDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Expenses Journal Table would go here */}
                         <p className="text-center text-muted-foreground p-8">Expenses Journal Table coming soon.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="general">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('accounting.journals.generalLedger')}</CardTitle>
                        <CardDescription>{t('accounting.journals.generalLedgerDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* General Ledger Table would go here */}
                         <p className="text-center text-muted-foreground p-8">General Ledger coming soon.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function JournalsPage() {
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
                <Header title={t('accounting.journals.title')} />
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
            <Header title={t('accounting.journals.title')} />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <JournalsContent />
            </main>
        </div>
    )
}
