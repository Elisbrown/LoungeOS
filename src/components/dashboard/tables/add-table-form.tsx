
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const formSchema = z.object({
  name: z.string().min(1, { message: "Table name is required." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  floor: z.string({ required_error: "Floor assignment is required." }).min(1, "Floor assignment is required."),
})

type AddTableFormProps = {
  onAddTable: (table: Omit<Table, 'status' | 'id'>) => void
}

export function AddTableForm({ onAddTable }: AddTableFormProps) {
  const { toast } = useToast()
  const { floors } = useFloors()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: 1,
      floor: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTable(values)
    toast({
      title: t('toasts.tableAdded'),
      description: t('toasts.tableAddedDesc', { name: values.name }),
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          {t('tables.addTable')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('tables.addTable')}</DialogTitle>
          <DialogDescription>
            {t('tables.addTableDesc')}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="submit">{t('tables.addTable')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
