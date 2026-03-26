const API_BASE = '/api'

interface ApiError {
  error: string
  code: string
  details?: unknown
}

class ApiClientError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Try silent refresh
    const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshResponse.ok) {
      // Retry original request — caller must handle this
      throw new ApiClientError('Token refreshed, retry', 'TOKEN_REFRESHED', 401)
    }

    // Refresh failed — redirect to login
    window.location.href = '/login'
    throw new ApiClientError('Session expired', 'SESSION_EXPIRED', 401)
  }

  if (!response.ok) {
    const body: ApiError = await response.json().catch(() => ({
      error: response.statusText,
      code: 'UNKNOWN_ERROR',
    }))
    throw new ApiClientError(body.error, body.code, response.status, body.details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export async function api<T>(
  path: string,
  options?: RequestInit & { retry?: boolean }
): Promise<T> {
  const { retry = true, ...fetchOptions } = options ?? {}

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
    })

    return await handleResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'TOKEN_REFRESHED' && retry) {
      // Retry once after refresh
      const response = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
      })
      return await handleResponse<T>(response)
    }
    throw error
  }
}

export { ApiClientError }
