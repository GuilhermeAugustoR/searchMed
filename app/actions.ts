"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function melhorarTexto(texto: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Melhore o seguinte texto em português, tornando-o mais claro, 
      profissional e envolvente, mas mantendo a ideia original:
      
      "${texto}"
      
      Retorne apenas o texto melhorado, sem comentários adicionais.`,
    })

    return text
  } catch (error) {
    console.error("Erro ao melhorar texto:", error)
    throw new Error("Não foi possível melhorar o texto")
  }
}

export async function corrigirGramatica(texto: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Corrija a gramática, ortografia e pontuação do seguinte texto em português:
      
      "${texto}"
      
      Retorne apenas o texto corrigido, sem comentários adicionais.`,
    })

    return text
  } catch (error) {
    console.error("Erro ao corrigir gramática:", error)
    throw new Error("Não foi possível corrigir o texto")
  }
}

export async function resumirTexto(texto: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Resuma o seguinte texto em português, mantendo os pontos principais:
      
      "${texto}"
      
      Retorne apenas o resumo, sem comentários adicionais.`,
    })

    return text
  } catch (error) {
    console.error("Erro ao resumir texto:", error)
    throw new Error("Não foi possível resumir o texto")
  }
}
