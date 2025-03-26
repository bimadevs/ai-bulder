'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const apiKeySchema = z.object({
  provider: z.string().min(1, { message: 'Penyedia harus dipilih' }),
  apiKey: z.string().min(1, { message: 'API key harus diisi' }),
})

type ApiKeyFormValues = z.infer<typeof apiKeySchema>

interface ApiKeyFormProps {
  userId: string
  initialData?: {
    id: string
    provider: string
    api_key: string
  }
}

export function ApiKeyForm({ userId, initialData }: ApiKeyFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      provider: initialData?.provider || '',
      apiKey: initialData?.api_key || '',
    },
  })

  useEffect(() => {
    if (initialData) {
      setValue('provider', initialData.provider)
      setValue('apiKey', initialData.api_key)
    }
  }, [initialData, setValue])

  async function onSubmit(data: ApiKeyFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (initialData) {
        // Update existing API key
        const { error } = await supabase
          .from('api_keys')
          .update({
            provider: data.provider,
            api_key: data.apiKey,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)

        if (error) throw error

        setSuccess('API key berhasil diperbarui')
      } else {
        // Insert new API key
        const { error } = await supabase
          .from('api_keys')
          .insert({
            user_id: userId,
            provider: data.provider,
            api_key: data.apiKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error

        setSuccess('API key berhasil ditambahkan')
        reset() // Clear form on success for new entries
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan API key')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-slate-900 rounded-lg border">
      <h2 className="text-xl font-semibold">
        {initialData ? 'Edit API Key' : 'Tambah API Key Baru'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Penyedia API</Label>
          <Select
            value={initialData?.provider}
            onValueChange={(value) => setValue('provider', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih penyedia API" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
          {errors.provider && (
            <p className="text-sm text-red-500">{errors.provider.message}</p>
          )}
          <Input 
            type="hidden" 
            {...register('provider')} 
            id="provider" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            placeholder="sk-..."
            type="password"
            autoComplete="off"
            {...register('apiKey')}
          />
          {errors.apiKey && (
            <p className="text-sm text-red-500">{errors.apiKey.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
} 