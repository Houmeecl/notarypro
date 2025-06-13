import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit & { responseType?: string },
): Promise<Response> {
  // Configurar cabeceras según el tipo de respuesta esperada
  let headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Si se solicita respuesta en texto plano o HTML, ajustar cabeceras
  if (options?.responseType === "text") {
    headers = {
      ...headers,
      "Accept": "text/html, text/plain"
    };
  }
  
  // Si estamos haciendo una solicitud a una API de Vecinos, incluir el token JWT
  if (url.startsWith('/api/vecinos')) {
    const vecinosToken = localStorage.getItem('vecinos_token');
    if (vecinosToken) {
      headers = {
        ...headers,
        "Authorization": `Bearer ${vecinosToken}`
      };
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    ...options,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construir la URL basada en los elementos del queryKey
    let url: string;
    if (Array.isArray(queryKey) && queryKey.length > 1) {
      // Si el queryKey es un array con múltiples elementos, construir una URL
      url = queryKey.join('/').replace(/\/+/g, '/');
    } else {
      // Si es solo un elemento o no es un array, usar el primer elemento
      url = queryKey[0] as string;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
