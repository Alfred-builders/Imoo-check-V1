import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'
import type { Batiment, BatimentDetail, Lot, LotDetail, ListResponse } from './types'

// ── List batiments ──
interface ListBatimentsParams {
  search?: string
  type?: string
  archived?: boolean
  cursor?: string
  limit?: number
}

async function fetchBatiments(params: ListBatimentsParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.type) searchParams.set('type', params.type)
  if (params.archived) searchParams.set('archived', 'true')
  if (params.cursor) searchParams.set('cursor', params.cursor)
  if (params.limit) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString()
  return api<ListResponse<Batiment>>(`/batiments${qs ? `?${qs}` : ''}`)
}

export function useBatiments(params: ListBatimentsParams = {}) {
  return useQuery({
    queryKey: ['batiments', params],
    queryFn: () => fetchBatiments(params),
  })
}

// ── Batiment detail ──
export function useBatimentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['batiment', id],
    queryFn: () => api<BatimentDetail>(`/batiments/${id}`),
    enabled: !!id,
  })
}

// ── Lots for a building (drill-down) ──
export function useBatimentLots(batimentId: string | undefined) {
  return useQuery({
    queryKey: ['batiment-lots', batimentId],
    queryFn: () => api<Lot[]>(`/batiments/${batimentId}/lots`),
    enabled: !!batimentId,
  })
}

// ── Lot detail ──
export function useLotDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['lot', id],
    queryFn: () => api<LotDetail>(`/lots/${id}`),
    enabled: !!id,
  })
}

// ── Create batiment ──
export function useCreateBatiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Batiment>('/batiments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
    },
  })
}

// ── Update batiment ──
export function useUpdateBatiment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api<Batiment>(`/batiments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
      queryClient.invalidateQueries({ queryKey: ['batiment', variables.id] })
    },
  })
}

// ── Create lot ──
export function useCreateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Lot>('/lots', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
      queryClient.invalidateQueries({ queryKey: ['batiment-lots'] })
    },
  })
}

// ── Update lot ──
export function useUpdateLot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api<Lot>(`/lots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batiments'] })
      queryClient.invalidateQueries({ queryKey: ['batiment-lots'] })
      queryClient.invalidateQueries({ queryKey: ['lot', variables.id] })
    },
  })
}
