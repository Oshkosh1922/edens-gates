import { supabase } from './supabase'

export type ApiResult = {
  error: string | null
}

export const EDGE_FUNCTIONS_ENABLED = import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true'

const normalizeError = (error: { message: string } | null): string | null =>
  error ? error.message : null

const resolveFunctionsBaseUrl = () => {
  const explicit = import.meta.env.VITE_SUPABASE_FUNCTION_URL
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const projectUrl = import.meta.env.VITE_SUPABASE_URL
  if (!projectUrl) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable')
  }

  const { hostname } = new URL(projectUrl)
  const [projectRef, ...rest] = hostname.split('.')
  if (!projectRef || rest.length === 0) {
    throw new Error(`Unable to derive project reference from VITE_SUPABASE_URL (${projectUrl})`)
  }

  return `https://${projectRef}.functions.${rest.join('.')}`
}

const resolveAnonKey = () => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
  }
  return key
}

const callEdgeFunction = async (
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResult> => {
  const response = await fetch(`${resolveFunctionsBaseUrl()}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resolveAnonKey()}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message =
      (payload && (payload.error as string | undefined)) ||
      (payload && (payload.message as string | undefined)) ||
      response.statusText ||
      null
    return { error: message ?? 'Edge function request failed' }
  }

  return { error: null }
}

export const approveFounder = async (founderId: string): Promise<ApiResult> => {
  if (!EDGE_FUNCTIONS_ENABLED) {
    const { error } = await supabase
      .from('founders')
      .update({ status: 'approved', is_active: false })
      .eq('id', founderId)

    return { error: normalizeError(error) }
  }

  return callEdgeFunction('approve-founder', { founderId })
}

export const toggleFounderActive = async (
  founderId: string,
  isActive: boolean,
): Promise<ApiResult> => {
  if (!EDGE_FUNCTIONS_ENABLED) {
    const { error } = await supabase
      .from('founders')
      .update({ is_active: isActive })
      .eq('id', founderId)

    return { error: normalizeError(error) }
  }

  return callEdgeFunction('toggle-founder-active', {
    founderId,
    isActive,
  })
}

export const publishWinner = async (
  founderId: string,
  weekNumber: number,
): Promise<ApiResult> => {
  if (!EDGE_FUNCTIONS_ENABLED) {
    const { error: winnerError } = await supabase
      .from('winners')
      .insert({ founder_id: founderId, week_number: weekNumber })

    if (winnerError) {
      return { error: normalizeError(winnerError) }
    }

    const { error: deactivateError } = await supabase
      .from('founders')
      .update({ is_active: false })
      .eq('is_active', true)

    return { error: normalizeError(deactivateError) }
  }

  return callEdgeFunction('publish-winner', {
    founderId,
    weekNumber,
  })
}
