'use client'

import { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Key, Trash2 } from 'lucide-react'

interface AIProcessingNodeData {
  label: string
  model?: string
  temperature?: number
  apiKey?: string
  provider?: string
  onDelete?: (id: string) => void
}

export function AIProcessingNode({ id, data, isConnectable }: NodeProps<AIProcessingNodeData>) {
  const [model, setModel] = useState(data.model || 'gpt-3.5-turbo')
  const [temperature, setTemperature] = useState(data.temperature || 0.7)
  const [apiKey, setApiKey] = useState(data.apiKey || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [provider, setProvider] = useState(data.provider || 'openai')

  // Update the node data when the values change
  const handleModelChange = (value: string) => {
    data.model = value
    setModel(value)
  }

  const handleTemperatureChange = (value: number[]) => {
    data.temperature = value[0]
    setTemperature(value[0])
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    data.apiKey = value
    setApiKey(value)
  }

  const handleProviderChange = (value: string) => {
    data.provider = value
    setProvider(value)
    
    // Set default model based on provider
    switch (value) {
      case 'openai':
        handleModelChange('gpt-3.5-turbo')
        break
      case 'anthropic':
        handleModelChange('claude-2')
        break
      case 'google':
        handleModelChange('gemini-1.5-flash')
        break
    }
  }

  return (
    <div className="p-4 rounded-md bg-white border border-purple-500 shadow-md dark:bg-slate-900 dark:border-purple-800 w-72">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Label className="font-medium">{data.label || 'Pemrosesan AI'}</Label>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-red-500" 
            onClick={() => data.onDelete && data.onDelete(id)}
            title="Hapus node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="provider" className="text-xs">Penyedia AI</Label>
          <Select
            value={provider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger id="provider" className="text-xs">
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
          <Label htmlFor="model" className="text-xs">Model</Label>
          <Select
            value={model}
            onValueChange={handleModelChange}
          >
            <SelectTrigger id="model" className="text-xs">
              <SelectValue placeholder="Pilih model AI" />
            </SelectTrigger>
            <SelectContent>
              {provider === 'openai' && (
                <>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </>
              )}
              {provider === 'anthropic' && (
                <>
                  <SelectItem value="claude-2">Claude 2</SelectItem>
                  <SelectItem value="claude-instant">Claude Instant</SelectItem>
                </>
              )}
              {provider === 'google' && (
                <>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                  <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="temperature" className="text-xs">Temperature</Label>
            <span className="text-xs">{temperature.toFixed(1)}</span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[temperature]}
            onValueChange={handleTemperatureChange}
          />
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowApiKey(!showApiKey)}
          className="mt-1 text-xs flex items-center justify-between"
        >
          <span className="flex items-center">
            <Key className="h-3 w-3 mr-1" />
            API Key
          </span>
          {showApiKey ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {showApiKey && (
          <div className="space-y-2 border-t pt-2 mt-1">
            <Label htmlFor="apiKey" className="text-xs">API Key {provider}</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder={`Masukkan ${provider} API key`}
              className="text-xs"
            />
            <p className="text-[10px] text-gray-500">
              API key disimpan secara lokal di node dan akan digunakan untuk permintaan ke API
            </p>
          </div>
        )}
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500 dark:bg-purple-400"
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500 dark:bg-purple-400"
      />
    </div>
  )
} 