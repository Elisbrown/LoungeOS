// New component for the notifications popover

"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, Info } from "lucide-react"
import { useNotifications } from "@/context/notification-context"
import { formatDistanceToNow } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-headline">Notifications</CardTitle>
            {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={markAllAsRead} className="p-0 h-auto">
                    Mark all as read
                </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
                {notifications.length > 0 ? (
                    <div className="p-4 space-y-4">
                        {notifications.map(notification => (
                            <div key={notification.id} className="flex items-start gap-3" onClick={() => !notification.read && markAsRead(notification.id)}>
                                {notification.type === 'alert' ? <AlertCircle className="h-5 w-5 text-destructive mt-1" /> : <Info className="h-5 w-5 text-primary mt-1" />}
                                <div className="flex-1 space-y-1">
                                    <p className={cn("text-sm font-medium", !notification.read && "font-bold")}>{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</p>
                                </div>
                                {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10">No notifications</p>
                )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
