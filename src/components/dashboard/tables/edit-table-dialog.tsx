"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Table } from "@/context/table-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFloors } from "@/context/floor-context"
import { useTranslation } from "@/hooks/use-translation"
import { useTables } from "@/context/table-context"

const formSchema = z.object({
    name: z.string().min(1, { message: "Table name is required." }),
    capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
    floor: z.string().min(1, "Floor assignment is required."),
})

type EditTableDialogProps = {
    table: Table | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTableDialog({ table, open, onOpenChange }: EditTableDialogProps) {
    const { toast } = useToast()
    const { floors } = useFloors()
    const { t } = useTranslation()
    const { updateTable } = useTables()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            capacity: 1,
            floor: "",
        },
    })

    // Update form values when table changes
    useEffect(() => {
        if (table) {
            form.reset({
                name: table.name,
                capacity: table.capacity,
                floor: table.floor,
            })
        }
    }, [table, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!table) return

        updateTable({
            ...table,
            name: values.name,
            capacity: values.capacity,
            floor: values.floor
        })
        toast({
            title: t('toasts.tableUpdated') || 'Table Updated',
            description: t('toasts.tableUpdatedDesc', { name: values.name }) || `${values.name} has been updated.`,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.editTable') || 'Edit Table'}</DialogTitle>
                    <DialogDescription>
                        {t('tables.editTableDesc') || 'Modify the table details below.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('tables.tableName')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. VIP 1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('tables.capacity')}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="4" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="floor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('tables.floor')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('tables.selectFloor')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {floors.map((floor) => (
                                                <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">{t('common.save') || 'Save Changes'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
