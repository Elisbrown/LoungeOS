
"use client"

import React, { useState, useMemo } from "react"
import { MoreHorizontal, Edit, Trash2, File, Upload, Download, KeyRound, UserCheck, UserX } from "lucide-react"
import { useStaff, type StaffMember } from "@/context/staff-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { useActivityLog } from "@/hooks/use-activity-log"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { AddStaffForm } from "./add-staff-form"
import { EditStaffForm } from "./edit-staff-form"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"


const roleOptions = ["All", "Manager", "Waiter", "Chef", "Stock Manager", "Cashier", "Bartender", "Super Admin"];
const statusOptions = ["All", "Active", "Away"];

export function StaffTable() {
  const { staff, addStaff, updateStaff, deleteStaff } = useStaff()
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { logActivity } = useActivityLog()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const canManage = user?.role === "Manager" || user?.role === "Super Admin"

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = searchTerm === "" || 
                            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || member.role === roleFilter;
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
  }, [staff, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  const handleUpdate = (updated: StaffMember) => {
    updateStaff(updated.email, updated);
    logActivity('Update Staff', `Updated details for ${updated.name}.`)
    toast({
        title: t('toasts.staffUpdated'),
        description: t('toasts.staffUpdatedDesc', { name: updated.name }),
    })
    setEditingStaff(null);
  }
  
  const handleToggleStatus = (member: StaffMember) => {
    const newStatus = member.status === "Active" ? "Away" : "Active";
    updateStaff(member.email, { ...member, status: newStatus });
    logActivity(`${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Staff`, `Set status of ${member.name} to ${newStatus}.`)
    toast({
      title: "Staff Status Updated",
      description: `${member.name}'s status has been set to ${newStatus}.`,
    });
  }


  const handleDelete = (member: StaffMember) => {
    if (member.role === 'Super Admin') {
        toast({
            variant: "destructive",
            title: t('toasts.staffDeleteForbidden'),
            description: t('toasts.staffDeleteForbiddenDesc'),
        })
        setDeletingStaff(null)
        return
    }
    deleteStaff(member.email);
    logActivity('Delete Staff', `Deleted user ${member.name}.`)
    toast({
        title: t('toasts.staffDeleted'),
        description: t('toasts.staffDeletedDesc', { name: member.name }),
    })
    setDeletingStaff(null);
  }
  
  const handleResetPassword = (member: StaffMember) => {
    // In a real app, this would trigger a secure password reset flow.
    // Here, we just set the force_password_change flag.
    updateStaff(member.email, { ...member, force_password_change: 1 });
    logActivity('Reset Password', `Reset password for user ${member.name}.`)
    toast({
      title: t('toasts.passwordResetSuccess'),
      description: t('toasts.passwordResetSuccessDesc', { name: member.name }),
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,role,phone,hireDate\n"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "staff_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const lines = text.split('\n').filter(line => line.trim() !== '')
        if (lines.length <= 1) {
            toast({ variant: "destructive", title: t('toasts.csvError'), description: t('toasts.csvEmpty') })
            return
        }
        const headers = lines[0].split(',').map(h => h.trim())
        const requiredHeaders = ['name', 'email', 'role']
        if (!requiredHeaders.every(h => headers.includes(h))) {
            toast({ variant: "destructive", title: t('toasts.csvError'), description: t('toasts.csvHeaders') })
            return
        }

        const newStaffMembers = lines.slice(1).map(line => {
            const values = line.split(',')
            const staffData: any = {}
            headers.forEach((header, index) => {
                staffData[header] = values[index].trim()
            })
            
            return {
                name: staffData.name,
                email: staffData.email,
                role: staffData.role,
                phone: staffData.phone,
                hireDate: staffData.hireDate ? new Date(staffData.hireDate) : undefined,
                force_password_change: 1, // Always force password change on import
            }
        });
        
        newStaffMembers.forEach(addStaff);
        logActivity('Import Staff', `Imported ${newStaffMembers.length} staff members from CSV.`)
        toast({ title: t('toasts.importSuccess'), description: t('toasts.importSuccessDesc', { count: newStaffMembers.length }) })
      } catch (error) {
        toast({ variant: "destructive", title: t('toasts.importFailed'), description: t('toasts.importFailedDesc') })
        console.error("CSV Parsing Error:", error)
      } finally {
        if(event.target) {
          event.target.value = ''
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">{t('staff.title')}</CardTitle>
            <CardDescription>{t('staff.description')}</CardDescription>
          </div>
           <div className="flex items-center gap-2">
                {canManage && <AddStaffForm onAddStaff={addStaff} />}
                 {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <File className="h-4 w-4" />
                                {t('inventory.fileActions')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('inventory.csvActions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={handleImportClick}>
                                <Upload className="mr-2 h-4 w-4" />
                                {t('inventory.importCSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('inventory.downloadTemplate')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                 <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileImport}
                />
            </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
            <Input 
                placeholder={t('staff.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
             <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('staff.allRoles')} />
                </SelectTrigger>
                <SelectContent>
                    {roleOptions.map(role => (
                        <SelectItem key={role} value={role}>{role === 'All' ? t('staff.allRoles') : role}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('staff.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status === 'All' ? t('staff.allStatuses') : status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('staff.name')}</TableHead>
                <TableHead>{t('staff.role')}</TableHead>
                <TableHead>{t('staff.phone')}</TableHead>
                <TableHead>{t('staff.hireDate')}</TableHead>
                <TableHead>{t('staff.assignedFloor')}</TableHead>
                <TableHead>{t('staff.status')}</TableHead>
                {canManage && (
                    <TableHead>
                        <span className="sr-only">{t('inventory.actions')}</span>
                    </TableHead>
                )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedStaff.map((member) => (
                <TableRow key={member.email}>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {member.email}
                        </div>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.phone || "N/A"}</TableCell>
                    <TableCell>{member.hireDate ? format(new Date(member.hireDate), "MMM d, yyyy") : "N/A"}</TableCell>
                    <TableCell>{member.floor || 'All'}</TableCell>
                    <TableCell>
                    <Badge
                        variant={member.status === "Active" ? "success" : "secondary"}
                    >
                        {member.status}
                    </Badge>
                    </TableCell>
                    {canManage && (
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('inventory.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => setEditingStaff(member)}>
                                <Edit className="mr-2 h-4 w-4"/>
                                {t('dialogs.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleToggleStatus(member)}>
                                {member.status === "Active" ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                {member.status === "Active" ? t('staff.deactivate') : t('staff.activate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onSelect={() => handleResetPassword(member)}
                                disabled={member.role === 'Super Admin'}
                            >
                                <KeyRound className="mr-2 h-4 w-4"/>
                                {t('staff.resetPassword')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onSelect={() => setDeletingStaff(member)} 
                                className="text-destructive"
                                disabled={member.role === 'Super Admin'}
                            >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                {t('dialogs.delete')}
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    )}
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
         <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('pagination.rowsPerPage')}</span>
                <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    {t('pagination.previous')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    {t('pagination.next')}
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>

    {editingStaff && (
        <EditStaffForm
            staffMember={editingStaff}
            onUpdateStaff={handleUpdate}
            open={!!editingStaff}
            onOpenChange={(isOpen) => !isOpen && setEditingStaff(null)}
        />
    )}

    {deletingStaff && (
        <DeleteConfirmationDialog
            open={!!deletingStaff}
            onOpenChange={(isOpen) => !isOpen && setDeletingStaff(null)}
            onConfirm={() => handleDelete(deletingStaff)}
            title={t('dialogs.deleteStaffTitle')}
            description={t('dialogs.deleteStaffDesc', { name: deletingStaff.name })}
        />
    )}
    </>
  )
}
