import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api-client'

// ── Types ──

export interface WorkspaceUser {
  id: string
  email: string
  nom: string
  prenom: string
  role: 'admin' | 'gestionnaire' | 'technicien'
}

export interface Invitation {
  id: string
  email: string
  role: 'admin' | 'gestionnaire' | 'technicien'
  status: 'pending' | 'accepted'
  created_at: string
}

// ── Workspace Users ──

export function useWorkspaceUsers() {
  return useQuery({
    queryKey: ['workspace-users'],
    queryFn: () => api<WorkspaceUser[]>('/invitations/users'),
  })
}

// ── Invitations ──

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => api<Invitation[]>('/invitations'),
  })
}

// ── Send Invitation ──

interface SendInvitationInput {
  email: string
  role: 'admin' | 'gestionnaire' | 'technicien'
}

export function useSendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendInvitationInput) =>
      api<Invitation>('/invitations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

// ── Change Role ──

interface ChangeRoleInput {
  userId: string
  role: 'admin' | 'gestionnaire' | 'technicien'
}

export function useChangeRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: ChangeRoleInput) =>
      api<void>(`/invitations/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
    },
  })
}
