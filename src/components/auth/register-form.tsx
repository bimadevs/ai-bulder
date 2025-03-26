'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const registerSchema = z
  .object({
    email: z.string().email({
      message: 'Masukkan alamat email yang valid',
    }),
    password: z.string().min(1, {
      message: 'Password wajib diisi',
    }),
    confirmPassword: z.string().min(1, {
      message: 'Konfirmasi password wajib diisi',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    console.log('Register form submitted', data)
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Registration error:', error)
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error('Registration exception:', err)
      setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Buat Akun</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Daftar untuk membuat AI Anda sendiri
        </p>
      </div>
      {success ? (
        <div className="p-4 bg-green-50 text-green-800 rounded-md">
          <p>
            Pendaftaran berhasil! Silakan cek email Anda untuk tautan verifikasi.
          </p>
        </div>
      ) : (
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
              autoComplete="new-password"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              placeholder="********"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
            {isLoading ? 'Loading...' : 'Daftar'}
          </Button>
        </form>
      )}
      <div className="text-center text-sm">
        <p>
          Sudah punya akun?{' '}
          <a href="/login" className="font-medium text-primary hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
} 