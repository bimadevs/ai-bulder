import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <div className="flex w-full justify-between">
          <Link 
            href="/" 
            className="flex items-center justify-center font-bold"
          >
            <span className="text-lg">AI Builder</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Buat AI Anda Sendiri dengan Drag-and-Drop
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Platform no-code untuk membangun aplikasi AI Anda sendiri, tanpa perlu koding.
                  Drag-and-drop. Gunakan API key Anda sendiri. Export dalam bentuk URL atau embed.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button>Mulai Gratis</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Fitur Utama
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Semua yang Anda butuhkan untuk membuat aplikasi AI Anda sendiri.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Builder Drag-and-Drop</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Buat alur kerja AI dengan antarmuka visual drag-and-drop yang intuitif.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Gunakan API Key Anda</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Hubungkan dengan provider AI seperti OpenAI, Anthropic, dan lainnya dengan API key Anda sendiri.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-xl font-bold">Export & Embed</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Dapatkan URL atau kode embed untuk menyematkan AI Anda di website lain.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Siap Mencoba?
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Buat akun gratis dan mulai bangun aplikasi AI Anda sendiri hari ini.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg">Daftar Sekarang</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} AI Builder. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
