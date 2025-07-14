
"use client"

import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Phone, Code } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export default function CreditsPage() {
    const { t } = useTranslation()

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title={t('credits.title')} />
            <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <Avatar className="mx-auto h-24 w-24 mb-4 border-2 border-primary">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="Sunyin Elisbrown Sigala" data-ai-hint="person portrait" />
                            <AvatarFallback>SES</AvatarFallback>
                        </Avatar>
                        <CardTitle className="font-headline text-3xl">Sunyin Elisbrown Sigala</CardTitle>
                        <CardDescription className="text-lg">{t('credits.qualification')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                <span>{t('credits.developedBy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:selisbrown@ahfoh.org" className="hover:underline">selisbrown@ahfoh.org</a>
                            </div>
                             <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>+237 679 690 703</span>
                            </div>
                       </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
