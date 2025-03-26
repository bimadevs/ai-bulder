import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'

export default async function RegisterPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          href="/" 
          className="text-center flex flex-col items-center justify-center"
        >
          <h1 className="text-2xl font-bold">AI Builder</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Buat akun baru
          </p>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
} 