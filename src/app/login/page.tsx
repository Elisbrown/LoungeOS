
"use client"

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { useTranslation } from '@/hooks/use-translation'
import { useSettings } from '@/context/settings-context'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"


function LoungeChairIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 17a2 2 0 1 0-4 0" />
            <path d="M6 10h12" />
            <path d="M16 4h-8" />
            <path d="M6 4v13" />
            <path d="M18 4v13" />
            <path d="M5 17h14" />
        </svg>
    )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <Carousel 
            className="h-full w-full"
            plugins={[ Autoplay({ delay: 5000, stopOnInteraction: false }) ]}
            opts={{ loop: true }}
        >
            <CarouselContent>
                {(settings.loginCarouselImages || ['https://placehold.co/1280x800.png']).map((img, index) => (
                    <CarouselItem key={index}>
                        <Image
                            src={img}
                            alt={`Login background ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="brightness-50"
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
             <div className="relative z-10 text-primary-foreground">
                <div className="flex justify-center items-center mb-4">
                    {isClient ? (
                        settings.platformLogo ? (
                            <Image src={settings.platformLogo} alt="Platform Logo" width={80} height={80} className="rounded-md" />
                        ) : (
                            <LoungeChairIcon className="h-20 w-20 text-white" />
                        )
                    ) : (
                        <Skeleton className="h-20 w-20 rounded-md" />
                    )}
                </div>
                {isClient ? (
                    <h1 className="font-headline text-5xl font-bold tracking-tighter text-white">
                        {settings.platformName}
                    </h1>
                ) : (
                    <Skeleton className="h-12 w-72" />
                )}
                <p className="mt-4 text-xl text-white/80">
                    {t('appDescription')}
                </p>
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[420px] gap-6 p-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">{t('login.title')}</h1>
            <p className="text-balance text-muted-foreground">
              {t('login.description')}
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
