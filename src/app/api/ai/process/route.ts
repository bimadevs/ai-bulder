import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { input, model, temperature, provider, apiKey, promptTemplate } = await req.json()

    // Validasi input
    if (!input) {
      return NextResponse.json(
        { error: 'Input teks diperlukan' },
        { status: 400 }
      )
    }

    // Proses prompt template jika ada
    let processedInput = input
    if (promptTemplate) {
      processedInput = promptTemplate.replace(/{{input}}/g, input)
    }

    // Tentukan provider berdasarkan model jika tidak dispesifikasi
    const actualProvider = provider || getProviderFromModel(model)
    
    // Validasi API key
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key diperlukan' },
        { status: 400 }
      )
    }

    // Proses dengan provider yang sesuai
    let result
    switch (actualProvider) {
      case 'openai':
        result = await processOpenAI(apiKey, model || 'gpt-3.5-turbo', processedInput, temperature || 0.7)
        break
      case 'anthropic':
        result = await processAnthropic(apiKey, model || 'claude-2', processedInput, temperature || 0.7)
        break
      case 'google':
        result = await processGoogle(apiKey, model || 'gemini-1.5-flash', processedInput, temperature || 0.7)
        break
      default:
        return NextResponse.json(
          { error: 'Provider AI tidak didukung' },
          { status: 400 }
        )
    }

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('AI processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses permintaan AI' },
      { status: 500 }
    )
  }
}

// Helper function to determine provider from model name
function getProviderFromModel(model: string): string {
  if (!model) return 'openai'
  
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