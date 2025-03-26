'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { PlusCircle, Trash, Pencil, Settings, Eye, ExternalLink } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
}

interface ProjectListProps {
  userId: string
}

export function ProjectList({ userId }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('ai_projects')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })

        if (error) throw error

        setProjects(data || [])
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil daftar proyek')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [userId, supabase])

  async function handleDelete(id: string) {
    try {
      // First delete related configs
      const { error: configError } = await supabase
        .from('ai_configs')
        .delete()
        .eq('project_id', id)

      if (configError) throw configError

      // Then delete the project
      const { error } = await supabase
        .from('ai_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProjects(projects.filter(project => project.id !== id))
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus proyek')
    }
  }

  if (isLoading) return <div className="py-8 text-center">Memuat proyek...</div>
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proyek</h2>
        <Link href="/projects/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Proyek Baru
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-white dark:bg-slate-900">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-medium">Belum ada proyek</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Mulai dengan membuat proyek AI baru Anda.
            </p>
            <Link href="/projects/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Buat Proyek Baru
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description || 'Tidak ada deskripsi'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Terakhir diperbarui: {formatDate(project.updated_at)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-800 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
                <div className="flex space-x-1">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/builder`}>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Builder
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/preview`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/export`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 