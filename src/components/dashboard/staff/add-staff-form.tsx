
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react"
import type { StaffMember, StaffRole } from "@/context/staff-context"
import { useFloors } from "@/context/floor-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "@/hooks/use-translation"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  hireDate: z.date().optional(),
  role: z.enum(["Manager", "Accountant", "Waiter", "Chef", "Stock Manager", "Cashier", "Bartender"], {
    required_error: "Role is required.",
  }),
  floor: z.string().optional(),
}).refine(data => {
    if (["Waiter", "Cashier"].includes(data.role)) {
        return !!data.floor && data.floor.length > 0;
    }
    return true;
}, {
    message: "Floor assignment is required for this role.",
    path: ["floor"],
});

type AddStaffFormProps = {
  onAddStaff: (staff: Omit<StaffMember, 'id' | 'status' | 'avatar'>) => void
}

export function AddStaffForm({ onAddStaff }: AddStaffFormProps) {
  const { toast } = useToast()
  const { floors } = useFloors()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })
  
  const selectedRole = form.watch("role");

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddStaff({ ...values, role: values.role as StaffRole })
    toast({
      title: t('toasts.staffAdded'),
      description: t('toasts.staffAddedDesc', { name: values.name }),
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          {t('staff.addStaff')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('staff.addStaff')}</DialogTitle>
          <DialogDescription>
            {t('staff.addStaffDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder="+237 600 000 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('staff.hireDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t('reports.pickDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.role')}</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('staff.selectRole')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Waiter">Waiter</SelectItem>
                      <SelectItem value="Chef">Chef</SelectItem>
                      <SelectItem value="Stock Manager">Stock Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Bartender">Bartender</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             {(["Waiter", "Cashier"].includes(selectedRole || '')) && (
                <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('staff.assignedFloor')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={floors.length === 0}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={floors.length === 0 ? t('staff.noFloors') : t('staff.selectFloor')} />
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
            )}
            <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>{t('dialogs.cancel')}</Button>
              <Button type="submit">{t('staff.addStaff')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
