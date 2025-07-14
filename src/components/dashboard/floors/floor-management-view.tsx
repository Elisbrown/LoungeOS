
"use client"

import * as React from "react"
import { useFloors } from "@/context/floor-context"
import { useTables, type Table } from "@/context/table-context"
import { useStaff, type StaffMember } from "@/context/staff-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ManageFloorsDialog } from "@/components/dashboard/tables/manage-floors-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"

export function FloorManagementView() {
    const { floors } = useFloors()
    const { tables, updateTable } = useTables()
    const { staff, updateStaff } = useStaff()
    const { toast } = useToast()
    const { t } = useTranslation()

    const assignableStaff = staff.filter(s => ["Waiter", "Cashier"].includes(s.role) && !s.floor)
    const unassignedTables = tables.filter(t => !t.floor)

    const handleAssignTable = (floor: string, tableId: string) => {
        const table = tables.find(t => t.id === tableId)
        if (table) {
            updateTable({ ...table, floor })
            toast({ title: t('toasts.tableAssigned'), description: t('toasts.tableAssignedDesc', { tableName: table.name, floorName: floor }) })
        }
    }

    const handleUnassignTable = (tableId: string) => {
        const table = tables.find(t => t.id === tableId)
        if (table) {
            updateTable({ ...table, floor: "" })
            toast({ title: t('toasts.tableUnassigned'), description: t('toasts.tableUnassignedDesc', { tableName: table.name })})
        }
    }

    const handleAssignStaff = (floor: string, staffEmail: string) => {
        const staffMember = staff.find(s => s.email === staffEmail)
        if (staffMember) {
            updateStaff(staffMember.email, { ...staffMember, floor })
            toast({ title: t('toasts.staffAssigned'), description: t('toasts.staffAssignedDesc', { staffName: staffMember.name, floorName: floor })})
        }
    }
    
    const handleUnassignStaff = (staffEmail: string) => {
        const staffMember = staff.find(s => s.email === staffEmail)
        if (staffMember) {
            updateStaff(staffMember.email, { ...staffMember, floor: undefined })
            toast({ title: t('toasts.staffUnassigned'), description: t('toasts.staffUnassignedDesc', { staffName: staffMember.name })})
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">{t('floors.viewTitle')}</h2>
                    <p className="text-muted-foreground">
                        {t('floors.viewDescription')}
                    </p>
                </div>
                <ManageFloorsDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {floors.map(floor => {
                    const assignedTables = tables.filter(t => t.floor === floor)
                    const assignedStaff = staff.filter(s => s.floor === floor)

                    return (
                        <Card key={floor}>
                            <CardHeader>
                                <CardTitle>{floor}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-2">{t('floors.assignedTables')}</h4>
                                    <div className="space-y-2">
                                        {assignedTables.map(t => (
                                            <div key={t.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                                <span>{t.name} (Capacity: {t.capacity})</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUnassignTable(t.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))}
                                        {assignedTables.length === 0 && <p className="text-xs text-muted-foreground text-center p-2">{t('floors.noTablesAssigned')}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Select onValueChange={(tableId) => handleAssignTable(floor, tableId)} disabled={unassignedTables.length === 0} value="">
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('floors.assignTablePlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unassignedTables.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-medium text-sm mb-2">{t('floors.assignedStaff')}</h4>
                                    <div className="space-y-2">
                                         {assignedStaff.map(s => (
                                            <div key={s.email} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                                <span>{s.name} ({s.role})</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUnassignStaff(s.email)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))}
                                        {assignedStaff.length === 0 && <p className="text-xs text-muted-foreground text-center p-2">{t('floors.noStaffAssigned')}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                         <Select onValueChange={(email) => handleAssignStaff(floor, email)} disabled={assignableStaff.length === 0} value="">
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('floors.assignStaffPlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignableStaff.map(s => <SelectItem key={s.email} value={s.email}>{s.name} ({s.role})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
