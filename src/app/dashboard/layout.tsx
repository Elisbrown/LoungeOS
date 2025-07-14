
"use client"

import React from 'react'
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { OrderProvider } from '@/context/order-context'
import { ProductProvider } from '@/context/product-context'
import { FloorProvider } from '@/context/floor-context'
import { TableProvider } from '@/context/table-context'
import { SupplierProvider } from '@/context/supplier-context'
import { StaffProvider } from '@/context/staff-context'
import { TicketProvider } from '@/context/ticket-context'
import { NotificationProvider, useNotifications } from '@/context/notification-context'
import { ActivityLogProvider } from '@/context/activity-log-context'
import { CategoryProvider } from '@/context/category-context'
import { OnboardingProvider } from '@/context/onboarding-context'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { useIsMobile } from '@/hooks/use-mobile'

function AudioPlayer() {
    const { notifications } = useNotifications();
    const audioRef = React.useRef<HTMLAudioElement>(null);

    React.useEffect(() => {
        const lastNotification = notifications[0];
        // Play sound for specific important notifications
        if (lastNotification && (lastNotification.type === 'alert' || lastNotification.title.includes('Ready') || lastNotification.title.includes('Prête'))) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }
    }, [notifications]);

    return <audio ref={audioRef} src="/audio/notification.mp3" preload="auto" />;
}


function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isMobile, setOpen, setOpenMobile } = useSidebar();
    const sidebarRef = React.useRef<HTMLDivElement>(null);

    useOutsideClick(sidebarRef, () => {
        if (isMobile) {
            setOpenMobile(false);
        } else {
            setOpen(false);
        }
    });

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    }

    return (
        <>
            <Sidebar ref={sidebarRef}>
                <AppSidebar onLinkClick={handleLinkClick} />
            </Sidebar>
            <SidebarInset>
                {children}
            </SidebarInset>
            <AudioPlayer />
        </>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile();

  return (
      <StaffProvider>
        <ActivityLogProvider>
            <NotificationProvider>
                <ProductProvider>
                    <CategoryProvider>
                    <OrderProvider>
                        <FloorProvider>
                        <TableProvider>
                            <SupplierProvider>
                            <TicketProvider>
                            <OnboardingProvider>
                                <SidebarProvider defaultOpen={isMobile ? false : true} open={open} onOpenChange={setOpen}>
                                    <DashboardContent>
                                        {children}
                                    </DashboardContent>
                                </SidebarProvider>
                            </OnboardingProvider>
                            </TicketProvider>
                            </SupplierProvider>
                        </TableProvider>
                        </FloorProvider>
                    </OrderProvider>
                    </CategoryProvider>
                </ProductProvider>
            </NotificationProvider>
        </ActivityLogProvider>
      </StaffProvider>
  )
}
