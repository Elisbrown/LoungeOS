
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
import { type Category } from "@/context/category-context"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/hooks/use-translation"

const formSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  isFood: z.boolean().default(true),
})

type AddCategoryFormProps = {
  onAddCategory: (category: Omit<Category, 'id' | 'productCount'>) => void
}

export function AddCategoryForm({ onAddCategory }: AddCategoryFormProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isFood: true
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddCategory(values)
    toast({
      title: "Category Added",
      description: `The "${values.name}" category has been created.`,
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          {t('categories.addCategory')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('categories.addCategory')}</DialogTitle>
          <DialogDescription>
            {t('categories.addCategoryDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.categoryName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Cocktails" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFood"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                   <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t('categories.isFoodLabel')}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t('categories.isFoodDesc')}
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t('categories.addCategory')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
