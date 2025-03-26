'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ApiKeyForm } from './api-key-form'

interface ApiKey {
  id: string
  provider: string
  api_key: string
  created_at: string
}

interface ApiKeyListProps {
  userId: string
}

export function ApiKeyList({ userId }: ApiKeyListProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchApiKeys() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        setApiKeys(data || [])
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil API keys')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKeys()
  }, [userId, supabase])

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

      if (error) throw error

      setApiKeys(apiKeys.filter(key => key.id !== id))
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus API key')
    }
  }

  function handleEdit(apiKey: ApiKey) {
    setEditingKey(apiKey)
    setIsAdding(false)
  }

  function handleAdd() {
    setEditingKey(null)
    setIsAdding(true)
  }

  function handleCancel() {
    setEditingKey(null)
    setIsAdding(false)
  }

  function renderApiKeyList() {
    if (isLoading) return <p>Memuat...</p>
    if (error) return <p className="text-red-500">{error}</p>
    if (apiKeys.length === 0) {
      return <p>Belum ada API key yang tersimpan.</p>
    }

    return (
      <div className="space-y-4">
        {apiKeys.map(key => (
          <div key={key.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border">
            <div>
              <h3 className="font-medium">{key.provider}</h3>
              <p className="text-sm text-gray-500">
                API Key: ••••••••{key.api_key.slice(-4)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(key)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(key.id)}
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Keys</h2>
        {!isAdding && !editingKey && (
          <Button onClick={handleAdd}>Tambah API Key</Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6">
          <ApiKeyForm userId={userId} />
          <div className="mt-4">
            <Button variant="outline" onClick={handleCancel}>
              Batal
            </Button>
          </div>
        </div>
      )}

      {editingKey && (
        <div className="mb-6">
          <ApiKeyForm userId={userId} initialData={editingKey} />
          <div className="mt-4">
            <Button variant="outline" onClick={handleCancel}>
              Batal
            </Button>
          </div>
        </div>
      )}

      {!isAdding && !editingKey && renderApiKeyList()}
    </div>
  )
} 