
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
import { InventoryProvider } from '@/context/inventory-context'
import { OnboardingProvider } from '@/context/onboarding-context'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { useIsMobile } from '@/hooks/use-mobile'
import { BackupSchedulerProvider } from '@/context/backup-scheduler-context'

function AudioPlayer() {
    const { notifications } = useNotifications();
    const audioRef = React.useRef<HTMLAudioElement>(null);

    React.useEffect(() => {
        const lastNotification = notifications[0];
        // Play sound for specific important notifications
        if (lastNotification && (lastNotification.type === 'alert' || lastNotification.title.includes('Ready') || lastNotification.title.includes('Prête'))) {
            console.log('Attempting to play audio for notification:', lastNotification.title);
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => console.log('Audio played successfully'))
                    .catch(e => {
                        console.error("Audio play failed:", e);
                        // Try to reload the audio and play again
                        audioRef.current!.load();
                        audioRef.current!.play().catch(e2 => console.error("Audio retry failed:", e2));
                    });
            } else {
                console.error("Audio element not found");
            }
        }
    }, [notifications]);

    const testAudio = () => {
        console.log('Testing audio manually...');
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => console.log('Manual audio test successful'))
                .catch(e => console.error("Manual audio test failed:", e));
        }
    };

    return (
        <audio 
            ref={audioRef} 
            src="/audio/notification.mp3" 
            preload="auto"
            onError={(e) => console.error("Audio element error:", e)}
            onLoadStart={() => console.log("Audio loading started")}
            onCanPlay={() => console.log("Audio can play")}
        />
    );
}


function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    }

    return (
        <>
            <Sidebar>
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
                        <InventoryProvider>
                            <FloorProvider>
                            <TableProvider>
                                <OrderProvider>
                                    <SupplierProvider>
                                    <TicketProvider>
                                    <OnboardingProvider>
                                    <BackupSchedulerProvider>
                                    <SidebarProvider defaultOpen={isMobile ? false : true} open={open} onOpenChange={setOpen}>
                                        <DashboardContent>
                                            {children}
                                        </DashboardContent>
                                    </SidebarProvider>
                                    </BackupSchedulerProvider>
                                </OnboardingProvider>
                                </TicketProvider>
                                </SupplierProvider>
                            </OrderProvider>
                        </TableProvider>
                        </FloorProvider>
                        </InventoryProvider>
                    </CategoryProvider>
                </ProductProvider>
            </NotificationProvider>
        </ActivityLogProvider>
      </StaffProvider>
  )
}
