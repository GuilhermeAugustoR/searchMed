"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function translateArticle(content: string, fromLanguage: string): Promise<string> {
  try {
    const targetLanguage = fromLanguage === "Inglês" ? "português" : "inglês"

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Traduza o seguinte texto de ${fromLanguage.toLowerCase()} para ${targetLanguage}, 
      mantendo a formatação HTML e a terminologia médica/científica apropriada:
      
      ${content}
      
      Retorne apenas o texto traduzido com as tags HTML preservadas.`,
    })

    return text
  } catch (error) {
    console.error("Erro ao traduzir artigo:", error)
    return `<p>Ocorreu um erro ao traduzir o artigo. Por favor, tente novamente mais tarde.</p>`
  }
}

export async function summarizeArticle(content: string, language: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Crie um resumo conciso e informativo do seguinte artigo científico em ${language.toLowerCase()}, 
      destacando os principais pontos, metodologia, resultados e conclusões. 
      O resumo deve ter aproximadamente 30% do tamanho do texto original:
      
      ${content}
      
      Retorne o resumo formatado em HTML com tags <p>, <h2>, etc. conforme apropriado.`,
    })

    return text
  } catch (error) {
    console.error("Erro ao resumir artigo:", error)
    return `<p>Ocorreu um erro ao gerar o resumo do artigo. Por favor, tente novamente mais tarde.</p>`
  }
}

export async function extractReferences(content: string): Promise<string[]> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Extraia e formate todas as referências bibliográficas encontradas no seguinte texto:
      
      ${content}
      
      Retorne apenas as referências, uma por linha, no formato Vancouver.`,
    })

    return text.split("\n").filter((line) => line.trim() !== "")
  } catch (error) {
    console.error("Erro ao extrair referências:", error)
    return []
  }
}
