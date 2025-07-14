
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
import { type Category } from "@/context/category-context"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/hooks/use-translation"

const formSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  isFood: z.boolean().default(true),
})

type EditCategoryFormProps = {
  category: Category
  onUpdateCategory: (category: Category) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCategoryForm({ category, onUpdateCategory, open, onOpenChange }: EditCategoryFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      isFood: category.isFood
    },
  })

  useEffect(() => {
    form.reset({ name: category.name, isFood: category.isFood });
  }, [category, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdateCategory({ ...category, ...values });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('categories.editCategory')}</DialogTitle>
          <DialogDescription>
            {t('categories.editCategoryDesc')}
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
