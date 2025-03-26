'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Key } from 'lucide-react'

interface AIProcessingNodeConfigProps {
  data: {
    label?: string
    model?: string
    temperature?: number
    apiKey?: string
    provider?: string
  }
  onChange: (data: any) => void
}

export function AIProcessingNodeConfig({
  data,
  onChange,
}: AIProcessingNodeConfigProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  
  const modelOptions = {
    openai: [
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-4o', label: 'GPT-4o' },
    ],
    anthropic: [
      { value: 'claude-2', label: 'Claude 2' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    ],
    google: [
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
      { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
      { value: 'gemini-1.0-pro-vision', label: 'Gemini 1.0 Pro Vision' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ]
  }
  
  const handleModelChange = (value: string) => {
    onChange({ ...data, model: value })
  }

  const handleTemperatureChange = (value: number[]) => {
    onChange({ ...data, temperature: value[0] })
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, apiKey: e.target.value })
  }

  const handleProviderChange = (value: string) => {
    // Set default model for the selected provider
    let defaultModel = ''
    switch (value) {
      case 'openai':
        defaultModel = 'gpt-3.5-turbo'
        break
      case 'anthropic':
        defaultModel = 'claude-2'
        break
      case 'google':
        defaultModel = 'gemini-1.5-flash'
        break
    }
    
    onChange({ ...data, provider: value, model: defaultModel })
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provider">Penyedia AI</Label>
        <Select
          value={data.provider || 'openai'}
          onValueChange={handleProviderChange}
        >
          <SelectTrigger id="provider">
            <SelectValue placeholder="Pilih penyedia AI" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select
          value={data.model || ''}
          onValueChange={handleModelChange}
        >
          <SelectTrigger id="model">
            <SelectValue placeholder="Pilih model AI" />
          </SelectTrigger>
          <SelectContent>
            {data.provider && modelOptions[data.provider as keyof typeof modelOptions]?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="temperature">Temperature</Label>
          <span>{(data.temperature || 0.7).toFixed(1)}</span>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.1}
          value={[data.temperature || 0.7]}
          onValueChange={handleTemperatureChange}
        />
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowApiKey(!showApiKey)}
        className="w-full text-sm flex items-center justify-between"
      >
        <span className="flex items-center">
          <Key className="h-4 w-4 mr-2" />
          API Key
        </span>
        {showApiKey ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {showApiKey && (
        <div className="space-y-2 border-t pt-3">
          <Label htmlFor="apiKey">API Key {data.provider}</Label>
          <Input
            id="apiKey"
            type="password"
            value={data.apiKey || ''}
            onChange={handleApiKeyChange}
            placeholder={`Masukkan ${data.provider} API key`}
          />
          <p className="text-xs text-gray-500">
            API key disimpan secara lokal di node dan akan digunakan untuk permintaan ke API
          </p>
        </div>
      )}
    </div>
  )
} 