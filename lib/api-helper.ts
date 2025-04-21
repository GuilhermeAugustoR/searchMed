// Função para implementar retry com exponential backoff
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  initialDelay = 1000
): Promise<Response> {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      const response = await fetch(url, options);

      // Se a resposta for 429 (Too Many Requests) e ainda temos retries disponíveis
      if (response.status === 429 && retries < maxRetries) {
        retries++;
        console.log(
          `Recebido 429, aguardando ${delay}ms antes de tentar novamente (tentativa ${retries}/${maxRetries})`
        );

        // Aguardar o tempo de delay antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Aumentar o delay para a próxima tentativa (exponential backoff)
        delay *= 2;

        continue;
      }

      return response;
    } catch (error) {
      if (retries < maxRetries) {
        retries++;
        console.log(
          `Erro na requisição, aguardando ${delay}ms antes de tentar novamente (tentativa ${retries}/${maxRetries})`
        );

        // Aguardar o tempo de delay antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Aumentar o delay para a próxima tentativa (exponential backoff)
        delay *= 2;

        continue;
      }

      throw error;
    }
  }
}

// Semáforo para limitar o número de requisições simultâneas
export class RequestLimiter {
  private queue: (() => void)[] = [];
  private activeRequests = 0;

  constructor(private maxConcurrent = 2) {}

  async acquire(): Promise<void> {
    if (this.activeRequests < this.maxConcurrent) {
      this.activeRequests++;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    } else {
      this.activeRequests--;
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Instância global do limitador de requisições
export const requestLimiter = new RequestLimiter(2);
