import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'
import type { Tiers, TiersDetail, TiersStats, ListResponse } from './types'

interface ListTiersParams {
  search?: string
  type_personne?: string
  role?: string
  archived?: boolean
}

export function useTiers(params: ListTiersParams = {}) {
  return useQuery({
    queryKey: ['tiers', params],
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params.search) sp.set('search', params.search)
      if (params.type_personne) sp.set('type_personne', params.type_personne)
      if (params.role) sp.set('role', params.role)
      if (params.archived) sp.set('archived', 'true')
      const qs = sp.toString()
      return api<ListResponse<Tiers>>(`/tiers${qs ? `?${qs}` : ''}`)
    },
  })
}

export function useTiersDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['tiers-detail', id],
    queryFn: () => api<TiersDetail>(`/tiers/${id}`),
    enabled: !!id,
  })
}

export function useTiersStats() {
  return useQuery({
    queryKey: ['tiers-stats'],
    queryFn: () => api<TiersStats>('/tiers/stats/counts'),
  })
}

export function useCreateTiers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Tiers>('/tiers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] })
      queryClient.invalidateQueries({ queryKey: ['tiers-stats'] })
    },
  })
}

export function useUpdateTiers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api<Tiers>(`/tiers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] })
      queryClient.invalidateQueries({ queryKey: ['tiers-detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tiers-stats'] })
    },
  })
}
