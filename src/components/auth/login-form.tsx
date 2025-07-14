
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useStaff, StaffProvider } from '@/context/staff-context'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { LanguageSwitcher } from '../language-switcher'
import { useAuth } from '@/context/auth-context'
import { useTranslation } from '@/hooks/use-translation'
import { useActivityLog } from '@/hooks/use-activity-log'
import { ActivityLogProvider } from '@/context/activity-log-context'


const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

function LoginFormContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation()
  const { logActivity } = useActivityLog()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const user = await response.json();

      if (!response.ok) {
        throw new Error(user.message || 'Login failed');
      }
      
      login(user);
      logActivity('User Login', `User ${user.name} logged in.`);
      toast({
          title: t('login.loginSuccess'),
          description: t('login.welcomeBack', { name: user.name }),
      })
      // AuthProvider handles redirect
    } catch (error: any) {
      toast({
          variant: "destructive",
          title: t('login.loginFailed'),
          description: t('login.invalidCredentials'),
      })
    }
  }

  return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{t('login.emailLabel')}</FormLabel>
                <FormControl>
                    <Input placeholder="manager@lounge.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <div className="flex items-center">
                    <FormLabel>{t('login.passwordLabel')}</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      {t('login.forgotPassword')}
                    </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="password" 
                      {...field} 
                      className="pr-10"
                    />
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? t('login.hidePassword') : t('login.showPassword')}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" className="w-full">
            {t('login.button')}
            </Button>
        </form>
        <div className="mt-4 text-center text-sm">
            <LanguageSwitcher />
        </div>
        <div className="mt-4 p-2 border rounded-md text-xs text-muted-foreground">
            <p className="font-bold">{t('login.demoLoginsTitle')}</p>
            <ul className="list-disc list-inside">
                <li>superadmin@lounge.com (pw: password)</li>
                <li>manager@lounge.com (pw: password)</li>
                <li>stock@lounge.com (pw: password)</li>
                <li>chef@lounge.com (pw: password)</li>
                <li>waiter-main@lounge.com (pw: password)</li>
                <li>waiter-vip@lounge.com (pw: password)</li>
                <li>cashier@lounge.com (pw: password)</li>
                <li>bartender@lounge.com (pw: password)</li>
            </ul>
        </div>
        </Form>
  )
}

export function LoginForm() {
  return (
    <StaffProvider>
      <ActivityLogProvider>
        <LoginFormContent />
      </ActivityLogProvider>
    </StaffProvider>
  )
}
