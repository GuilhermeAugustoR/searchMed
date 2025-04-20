import { NextResponse } from "next/server";

export async function GET() {
  // Verificar se a API key do Elsevier está configurada
  const apiKeyConfigured = !!process.env.ELSEVIER_API_KEY;

  return NextResponse.json({
    apiKeyConfigured,
    message: apiKeyConfigured
      ? "API key do Elsevier está configurada"
      : "API key do Elsevier não está configurada",
  });
}
