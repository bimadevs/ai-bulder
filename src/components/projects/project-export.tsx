'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProjectExportProps {
  projectId: string
  userId: string
}

export function ProjectExport({ projectId, userId }: ProjectExportProps) {
  const [projectName, setProjectName] = useState('')
  const [projectURL, setProjectURL] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const baseURL = process.env.NEXT_PUBLIC_APP_URL

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true)
      try {
        // Check if the user has access to this project
        const { data: project, error: projectError } = await supabase
          .from('ai_projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', userId)
          .single()

        if (projectError) throw projectError
        if (!project) throw new Error('Proyek tidak ditemukan atau Anda tidak memiliki akses')

        setProjectName(project.name)

        // Check if configuration exists
        const { data: configData, error: configError } = await supabase
          .from('ai_configs')
          .select('id')
          .eq('project_id', projectId)
          .maybeSingle()

        if (configError) throw configError
        if (!configData) {
          throw new Error('Konfigurasi proyek belum dibuat')
        }

        // Generate URL and embed code
        const publicURL = `${baseURL}/embed/${projectId}`
        setProjectURL(publicURL)
        setEmbedCode(
          `<iframe src="${publicURL}" width="100%" height="500" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        )
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data proyek')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId, userId, supabase, baseURL])

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) return <p className="text-center py-8">Memuat data export...</p>
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-lg border">
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-xl font-bold">Export AI: {projectName}</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}`)}
        >
          Kembali
        </Button>
      </div>

      <Tabs defaultValue="url">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">URL Web</TabsTrigger>
          <TabsTrigger value="embed">Kode Embed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4 mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gunakan URL ini untuk membagikan AI Anda atau mengaksesnya melalui browser.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL Publik</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={projectURL}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(projectURL)}
              >
                Salin
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={() => window.open(projectURL, '_blank')}>
              Buka di Tab Baru
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="embed" className="space-y-4 mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gunakan kode HTML ini untuk menyematkan AI di situs web Anda.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="embed">Kode Embed</Label>
            <div className="flex flex-col gap-2">
              <Textarea
                id="embed"
                value={embedCode}
                readOnly
                rows={4}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(embedCode)}
                className="self-end"
              >
                Salin Kode
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Preview Embed</h3>
            <div
              className="border rounded bg-gray-100 dark:bg-gray-800 p-2 h-[300px] flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: `<p class="text-center">Preview embed akan muncul di sini</p>`,
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 