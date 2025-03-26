import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Definisi tipe untuk node
interface FlowNode {
  id: string
  type: string
  data?: {
    model?: string
    temperature?: number
    provider?: string
    apiKey?: string
    promptTemplate?: string
    [key: string]: any
  }
  position: { x: number; y: number }
}

// Definisi tipe untuk edge
interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { input } = await request.json()
    const { id } = params

    // Validasi input
    if (!input) {
      return NextResponse.json(
        { error: 'Input teks diperlukan' },
        { status: 400 }
      )
    }

    // Ambil data proyek dan konfigurasi
    const supabase = createClient()
    
    // Ambil data proyek
    const { data: project, error: projectError } = await supabase
      .from('ai_projects')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 }
      )
    }

    // Ambil konfigurasi AI
    const { data: configData, error: configError } = await supabase
      .from('ai_configs')
      .select('config')
      .eq('project_id', id)
      .single()

    if (configError || !configData || !configData.config) {
      return NextResponse.json(
        { error: 'Konfigurasi AI tidak ditemukan' },
        { status: 404 }
      )
    }

    // Extract nodes and edges from config
    const { nodes, edges } = configData.config
    
    // Find the AI processing node
    const processingNode = nodes.find((node: FlowNode) => node.type === 'aiProcessing')
    
    if (!processingNode) {
      return NextResponse.json(
        { error: 'Konfigurasi AI tidak valid' },
        { status: 400 }
      )
    }

    // Get AI configuration from processing node
    const model = processingNode.data?.model || 'gpt-3.5-turbo'
    const temperature = processingNode.data?.temperature || 0.7
    const provider = processingNode.data?.provider || getProviderFromModel(model)
    
    // Try to use API key from node first
    let apiKey = processingNode.data?.apiKey
    
    // If no API key in node, try to get from user's stored keys
    if (!apiKey) {
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', project.user_id)
        .eq('provider', provider)
        .single()

      if (keyError || !keyData) {
        return NextResponse.json(
          { error: 'API key tidak ditemukan untuk penyedia ini' },
          { status: 400 }
        )
      }

      apiKey = keyData.api_key
    }

    // Periksa apakah ada custom prompt node yang terhubung ke processing node
    const customPromptNode = getConnectedCustomPromptNode(
      nodes, 
      edges, 
      processingNode.id
    )
    
    // Proses prompt template jika ada
    let processedInput = input
    if (customPromptNode && customPromptNode.data?.promptTemplate) {
      processedInput = customPromptNode.data.promptTemplate.replace(/{{input}}/g, input)
    }

    // Process based on provider
    let result
    switch (provider) {
      case 'openai':
        result = await processOpenAI(apiKey, model, processedInput, temperature)
        break
      case 'anthropic':
        result = await processAnthropic(apiKey, model, processedInput, temperature)
        break
      case 'google':
        result = await processGoogle(apiKey, model, processedInput, temperature)
        break
      default:
        return NextResponse.json(
          { error: 'Penyedia AI tidak didukung' },
          { status: 400 }
        )
    }

    return NextResponse.json({ output: result })
  } catch (error: any) {
    console.error('Embedded AI processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses permintaan AI' },
      { status: 500 }
    )
  }
}

// Helper function to determine provider from model name
function getProviderFromModel(model: string): string {
  if (model.includes('gpt')) {
    return 'openai'
  } else if (model.includes('claude')) {
    return 'anthropic'
  } else if (model.includes('gemini')) {
    return 'google'
  }
  return 'openai' // Default
}

// Process request with OpenAI
async function processOpenAI(apiKey: string, model: string, input: string, temperature: number) {
  const openai = new OpenAI({ apiKey })
  
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: input }],
    temperature,
  })

  return response.choices[0]?.message?.content || ''
}

// Process request with Anthropic
async function processAnthropic(apiKey: string, model: string, input: string, temperature: number) {
  const anthropic = new Anthropic({ apiKey })
  
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1000,
    messages: [{ role: 'user', content: input }],
    temperature,
  })

  return response.content[0]?.text || ''
}

// Process request with Google AI
async function processGoogle(apiKey: string, model: string, input: string, temperature: number) {
  const genAI = new GoogleGenerativeAI(apiKey)
  
  // Gunakan nama model yang benar sesuai versi terbaru API Google
  let googleModel = 'gemini-1.5-flash'
  
  // Jika model spesifik diminta, gunakan yang sesuai
  if (model === 'gemini-1.5-pro') {
    googleModel = 'gemini-1.5-pro'
  } else if (model === 'gemini-1.0-pro') {
    googleModel = 'gemini-1.0-pro'
  } else if (model === 'gemini-1.0-pro-vision') {
    googleModel = 'gemini-1.0-pro-vision'
  } else if (model === 'gemini-1.5-flash-8b') {
    googleModel = 'gemini-1.5-flash-8b'
  } else if (model === 'gemini-2.0-flash') {
    googleModel = 'gemini-2.0-flash'
  } else if (model.includes('gemini')) {
    // Default ke gemini-1.5-flash jika model tidak spesifik
    googleModel = 'gemini-1.5-flash'
  }
  
  try {
    console.log(`Menggunakan model Google: ${googleModel}`)
    const generationModel = genAI.getGenerativeModel({ model: googleModel })
    
    const response = await generationModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: input }] }],
      generationConfig: {
        temperature,
      },
    })
    
    return response.response.text()
  } catch (error: any) {
    console.error('Google AI error:', error)
    
    // Jika model tidak ditemukan, gunakan gemini-1.5-flash sebagai fallback
    if (error.message?.includes('is not found') || error.message?.includes('Not Found')) {
      console.log('Mencoba fallback ke model default gemini-1.5-flash')
      try {
        const defaultModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const response = await defaultModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: input }] }],
          generationConfig: {
            temperature,
          },
        })
        
        return response.response.text()
      } catch (fallbackError: any) {
        console.error('Fallback error:', fallbackError)
        throw new Error('Gagal mengakses model Google AI. Pastikan API key valid dan model tersedia di region Anda.')
      }
    }
    
    throw new Error('Gagal mengakses model Google AI: ' + (error.message || 'Error tidak diketahui'))
  }
}

// Find node by type function
function getNodeByType(nodes: FlowNode[], type: string): FlowNode | null {
  return nodes.find(node => node.type === type) || null
}

// Find connected custom prompt node
function getConnectedCustomPromptNode(nodes: FlowNode[], edges: FlowEdge[], targetNodeId: string): FlowNode | null {
  // Find the edge where the target is the processing node
  const edge = edges.find(e => e.target === targetNodeId)
  if (!edge) return null
  
  // Find the source node of this edge
  const sourceNode = nodes.find(n => n.id === edge.source)
  
  // Check if it's a custom prompt node
  if (sourceNode && sourceNode.type === 'customPrompt') {
    return sourceNode
  }
  
  return null
} 