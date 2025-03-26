'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const projectSchema = z.object({
  name: z.string().min(1, { message: 'Nama proyek harus diisi' }),
  description: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  userId: string
  initialData?: {
    id: string
    name: string
    description: string
  }
}

export function ProjectForm({ userId, initialData }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  })

  async function onSubmit(data: ProjectFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      if (initialData) {
        // Update existing project
        const { error } = await supabase
          .from('ai_projects')
          .update({
            name: data.name,
            description: data.description || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)

        if (error) throw error

        router.refresh()
        router.push(`/projects/${initialData.id}`)
      } else {
        // Create new project
        const { data: project, error } = await supabase
          .from('ai_projects')
          .insert({
            name: data.name,
            description: data.description || '',
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        router.refresh()
        router.push(`/projects/${project.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan proyek')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-lg border">
      <h2 className="text-2xl font-bold">
        {initialData ? 'Edit Proyek' : 'Buat Proyek Baru'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Proyek</Label>
          <Input
            id="name"
            placeholder="Masukkan nama proyek"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder="Masukkan deskripsi proyek (opsional)"
            {...register('description')}
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Menyimpan...'
              : initialData
              ? 'Perbarui Proyek'
              : 'Buat Proyek'}
          </Button>
        </div>
      </form>
    </div>
  )
} 