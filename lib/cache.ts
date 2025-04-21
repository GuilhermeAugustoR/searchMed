// Sistema de cache simples para armazenar resultados de requisições
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Cache em memória
const memoryCache: Record<string, CacheEntry<any>> = {};

// Tempo de expiração do cache em milissegundos (30 minutos)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export function getCache<T>(key: string): T | null {
  const entry = memoryCache[key];

  if (!entry) {
    return null;
  }

  // Verificar se o cache expirou
  if (Date.now() - entry.timestamp > CACHE_EXPIRATION) {
    delete memoryCache[key];
    return null;
  }

  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  memoryCache[key] = {
    data,
    timestamp: Date.now(),
  };
}

// Função para limpar o cache
export function clearCache(): void {
  Object.keys(memoryCache).forEach((key) => {
    delete memoryCache[key];
  });
}

// Função para limpar entradas expiradas do cache
export function cleanExpiredCache(): void {
  const now = Date.now();
  Object.keys(memoryCache).forEach((key) => {
    if (now - memoryCache[key].timestamp > CACHE_EXPIRATION) {
      delete memoryCache[key];
    }
  });
}
