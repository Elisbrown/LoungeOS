
"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users2,
  Boxes,
  Folder,
  Laptop,
  ChefHat,
  Table,
  BarChart3,
  Settings,
  LifeBuoy,
  GlassWater,
  Truck,
  Building2,
  GraduationCap,
  BookOpen,
  Utensils,
  ShoppingCart,
  ShieldCheck,
  Wrench,
  History,
  Banknote,
  ChevronDown,
  ChevronRight,
  Package,
  TrendingUp,
  ClipboardList,
  Calendar
} from 'lucide-react'
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useTranslation } from '@/hooks/use-translation'
import { useSettings } from '@/context/settings-context'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'


const allMenuItems = [
  { href: '/dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard, roles: ["Manager", "Super Admin", "Accountant"] },
  { href: '/dashboard/pos', labelKey: 'sidebar.pos', icon: Laptop, roles: ["Waiter", "Cashier", "Manager", "Super Admin", "Bartender"] },
  { href: '/dashboard/orders', labelKey: 'sidebar.orders', icon: ShoppingCart, roles: ["Cashier", "Manager", "Super Admin", "Accountant"] },
  { href: '/dashboard/kitchen', labelKey: 'sidebar.kitchen', icon: ChefHat, roles: ["Chef", "Manager", "Super Admin"] },
  { href: '/dashboard/bar', labelKey: 'sidebar.bar', icon: GlassWater, roles: ["Cashier", "Manager", "Super Admin", "Bartender"] },
  { href: '/dashboard/tables', labelKey: 'sidebar.tables', icon: Table, roles: ["Waiter", "Cashier", "Manager", "Super Admin"] },
  { href: '/dashboard/floors', labelKey: 'sidebar.floorPlan', icon: Building2, roles: ["Manager", "Super Admin"] },
  {
    labelKey: 'sidebar.accounting', icon: Banknote, roles: ["Manager", "Super Admin", "Accountant"],
    subItems: [
      { href: '/dashboard/accounting', labelKey: 'sidebar.accountingDashboard', icon: LayoutDashboard },
      { href: '/dashboard/accounting/journals', labelKey: 'sidebar.journals', icon: BookOpen },
      { href: '/dashboard/accounting/reports', labelKey: 'sidebar.financialReports', icon: BarChart3 },
    ]
  },
  { href: '/dashboard/meals', labelKey: 'sidebar.meals', icon: Utensils, roles: ["Manager", "Super Admin", "Chef", "Stock Manager", "Accountant"] },
  {
    labelKey: 'sidebar.inventory', icon: Boxes, roles: ["Stock Manager", "Manager", "Super Admin", "Accountant"],
    subItems: [
      { href: '/dashboard/inventory', labelKey: 'sidebar.inventoryDashboard', icon: LayoutDashboard },
      { href: '/dashboard/inventory/items', labelKey: 'sidebar.inventoryItems', icon: Package },
      { href: '/dashboard/inventory/movements', labelKey: 'sidebar.inventoryMovements', icon: TrendingUp },
      { href: '/dashboard/inventory/suppliers', labelKey: 'sidebar.inventorySuppliers', icon: Truck },
      { href: '/dashboard/inventory/stocktake', labelKey: 'sidebar.inventoryStocktake', icon: ClipboardList },
      { href: '/dashboard/inventory/reports', labelKey: 'sidebar.inventoryReports', icon: BarChart3 },
      { href: '/dashboard/inventory/recipes', labelKey: 'sidebar.inventoryRecipes', icon: BookOpen },
    ]
  },
  { href: '/dashboard/suppliers', labelKey: 'sidebar.suppliers', icon: Truck, roles: ["Stock Manager", "Manager", "Super Admin"] },
  { href: '/dashboard/categories', labelKey: 'sidebar.categories', icon: Folder, roles: ["Manager", "Super Admin"] },
  { href: '/dashboard/staff', labelKey: 'sidebar.staff', icon: Users2, roles: ["Manager", "Super Admin"] },
  { href: '/dashboard/reports', labelKey: 'sidebar.reports', icon: BarChart3, roles: ["Manager", "Super Admin", "Accountant"] },
  { href: '/dashboard/events', labelKey: 'sidebar.events', icon: Calendar, roles: ["Manager", "Super Admin"] },
  { href: '/dashboard/activity', labelKey: 'sidebar.activity', icon: History, roles: ["Manager", "Super Admin"] },
  { href: '/dashboard/backup', labelKey: 'sidebar.backup', icon: ShieldCheck, roles: ["Manager", "Super Admin"] },
  { href: '/dashboard/configuration', labelKey: 'sidebar.configuration', icon: Wrench, roles: ["Manager", "Super Admin"] },
]

type AppSidebarProps = {
    onLinkClick: () => void;
}

export function AppSidebar({ onLinkClick }: AppSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { state: sidebarState } = useSidebar() // Use the sidebar state
  const [isClient, setIsClient] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'sidebar.accounting': pathname.startsWith('/dashboard/accounting'),
    'sidebar.inventory': pathname.startsWith('/dashboard/inventory')
  });

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    setOpenMenus(prev => ({
        ...prev,
        'sidebar.accounting': pathname.startsWith('/dashboard/accounting'),
        'sidebar.inventory': pathname.startsWith('/dashboard/inventory')
    }))
  }, [pathname]);

  const toggleMenu = (labelKey: string) => {
    setOpenMenus(prev => ({ ...prev, [labelKey]: !prev[labelKey] }))
  }


  const menuItems = allMenuItems.filter(item => {
    if (!user) return false
    if (item.roles.includes(user.role)) return true
    return false
  });

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            {isClient ? (
                <>
                    <Image src={settings.platformLogo || '/logo.png'} alt="logo" width={24} height={24} className="h-6 w-6" />
                    {sidebarState === 'expanded' && (
                      <span className="font-bold text-lg text-primary-foreground font-headline">{settings.platformName}</span>
                    )}
                </>
            ) : (
                <>
                    <Skeleton className="h-6 w-6" />
                    {sidebarState === 'expanded' && <Skeleton className="h-6 w-24" />}
                </>
            )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            item.subItems ? (
              <Collapsible key={item.labelKey} open={openMenus[item.labelKey]} onOpenChange={() => toggleMenu(item.labelKey)}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                        isActive={pathname.startsWith('/dashboard/accounting') || pathname.startsWith('/dashboard/inventory')}
                        tooltip={t(item.labelKey)}
                        className="w-full justify-between"
                        >
                        <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{t(item.labelKey)}</span>
                        </div>
                        {openMenus[item.labelKey] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent className="space-y-1 ml-6 border-l-2 border-muted-foreground/20 pl-2 mt-1">
                    {item.subItems.map(subItem => (
                        <SidebarMenuItem key={subItem.href} onClick={onLinkClick}>
                            <Link href={subItem.href} className="w-full">
                                <SidebarMenuButton
                                isActive={pathname === subItem.href}
                                tooltip={t(subItem.labelKey)}
                                >
                                <subItem.icon />
                                <span>{t(subItem.labelKey)}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
                <SidebarMenuItem key={item.href} onClick={onLinkClick}>
                <Link href={item.href!} className="w-full">
                    <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href!))}
                    tooltip={t(item.labelKey)}
                    >
                    <item.icon />
                    <span>{t(item.labelKey)}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem onClick={onLinkClick}>
            <Link href="/dashboard/knowledge-base" className="w-full">
              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/knowledge-base')} tooltip={t('sidebar.knowledgeBase')}>
                <BookOpen />
                <span>{t('sidebar.knowledgeBase')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem onClick={onLinkClick}>
             <Link href="/dashboard/support" className="w-full">
              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/support')} tooltip={t('sidebar.support')}>
                <LifeBuoy />
                <span>{t('sidebar.support')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem onClick={onLinkClick}>
            <Link href="/dashboard/settings" className="w-full">
              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/settings')} tooltip={t('sidebar.settings')}>
                <Settings />
                <span>{t('sidebar.settings')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem onClick={onLinkClick}>
            <Link href="/dashboard/credits" className="w-full">
              <SidebarMenuButton isActive={pathname.startsWith('/dashboard/credits')} tooltip={t('sidebar.credits')}>
                <GraduationCap />
                <span>{t('sidebar.credits')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
