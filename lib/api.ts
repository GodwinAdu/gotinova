/**
 * API utility functions for making HTTP requests
 */

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
  json?: any
  requiresAuth?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string>
  message?: string
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

/**
 * Make API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    params,
    json,
    requiresAuth = true,
    method = json ? 'POST' : 'GET',
    headers: customHeaders = {},
    ...restOptions
  } = options

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    }

    // Add auth token if required
    if (requiresAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const url = buildUrl(endpoint, params)

    const response = await fetch(url, {
      method,
      headers,
      body: json ? JSON.stringify(json) : undefined,
      ...restOptions,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    }
  } catch (error) {
    console.error('[v0] API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

/**
 * GET request
 */
export function apiGet<T = any>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  options?: Omit<ApiRequestOptions, 'method' | 'json'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, params, method: 'GET' })
}

/**
 * POST request
 */
export function apiPost<T = any>(
  endpoint: string,
  json?: any,
  options?: Omit<ApiRequestOptions, 'method' | 'json'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, json, method: 'POST' })
}

/**
 * PUT request
 */
export function apiPut<T = any>(
  endpoint: string,
  json?: any,
  options?: Omit<ApiRequestOptions, 'method' | 'json'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, json, method: 'PUT' })
}

/**
 * PATCH request
 */
export function apiPatch<T = any>(
  endpoint: string,
  json?: any,
  options?: Omit<ApiRequestOptions, 'method' | 'json'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, json, method: 'PATCH' })
}

/**
 * DELETE request
 */
export function apiDelete<T = any>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, 'method' | 'json'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' })
}

/**
 * Upload file
 */
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<ApiResponse<any>> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const headers: Record<string, string> = {}

    // Add auth token if needed
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    console.error('[v0] File upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Retry request with exponential backoff
 */
export async function apiRequestWithRetry<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiRequest<T>(endpoint, options)
      if (result.success) {
        return result
      }
      throw new Error(result.error)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Request failed after retries',
  }
}
