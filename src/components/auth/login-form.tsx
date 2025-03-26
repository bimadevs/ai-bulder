'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email({
    message: 'Masukkan alamat email yang valid',
  }),
  password: z.string().min(1, {
    message: 'Password wajib diisi',
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    console.log('Login form submitted', data)
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
        return
      }

      // Redirect dilakukan oleh middleware
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login exception:', err)
      setError('Terjadi kesalahan saat login. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Masukkan kredensial Anda untuk login ke akun Anda
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="nama@contoh.com"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="********"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
      </form>
      <div className="text-center text-sm">
        <p>
          Belum punya akun?{' '}
          <a
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Daftar
          </a>
        </p>
      </div>
    </div>
  )
} 