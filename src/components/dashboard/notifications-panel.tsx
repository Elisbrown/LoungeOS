import React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, Info } from "lucide-react"
import { useNotifications } from "@/context/notification-context"
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/context/language-context"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const dateLocale = language === 'fr' ? fr : enUS;

    const [showAll, setShowAll] = React.useState(false);

    const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

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
          <span className="sr-only">{t('header.openNotifications') || 'Open notifications'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-headline">{t('header.notifications') || 'Notifications'}</CardTitle>
            {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={markAllAsRead} className="p-0 h-auto text-xs">
                    {t('header.markAllAsRead') || 'Mark all as read'}
                </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={cn("transition-all duration-300", showAll ? "h-96" : "h-auto max-h-[30rem]")}>
                {displayedNotifications.length > 0 ? (
                    <div className="p-4 space-y-4">
                        {displayedNotifications.map(notification => (
                            <div key={notification.id} className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors" onClick={() => !notification.read && markAsRead(notification.id)}>
                                {notification.type === 'alert' ? <AlertCircle className="h-5 w-5 text-destructive mt-1 shrink-0" /> : <Info className="h-5 w-5 text-primary mt-1 shrink-0" />}
                                <div className="flex-1 space-y-1">
                                    <p className={cn("text-sm font-medium leading-none", !notification.read && "font-bold")}>{notification.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: dateLocale })}
                                    </p>
                                </div>
                                {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10 text-sm">{t('header.noNotifications') || 'No notifications'}</p>
                )}
            </ScrollArea>
          </CardContent>
          {notifications.length > 5 && (
              <CardFooter className="p-2 border-t flex justify-center">
                  <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="w-full text-xs">
                      {showAll ? (t('common.showLess') || 'Show Less') : (t('common.showMore') || 'Show All')}
                  </Button>
              </CardFooter>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  )
}
