import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });
}

export function useProject(id: string, initialData?: any) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
    enabled: !!id,
    initialData,
  });
}

export function useProjectStats(id: string) {
  return useQuery({
    queryKey: ['projects', id, 'stats'],
    queryFn: () => api.get(`/projects/${id}/stats`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/projects', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useInviteMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post(`/projects/${projectId}/members`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', projectId] }),
  });
}

// ── Sprints Hooks ────────────────────────────────────────────────────────────
export function useCreateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; goal?: string; startDate: string; endDate: string; color?: string }) =>
      api.post(`/projects/${projectId}/sprints`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useUpdateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, action }: { sprintId: string; action: 'start' | 'complete' }) =>
      api.patch(`/projects/${projectId}/sprints/${sprintId}/${action}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useEditSprintDetails(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: any }) =>
      api.patch(`/projects/${projectId}/sprints/${sprintId}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useDeleteSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) =>
      api.delete(`/projects/${projectId}/sprints/${sprintId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

// ── Tasks Hooks ──────────────────────────────────────────────────────────────
export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; priority?: string; status?: string; storyPoints?: number; sprintId?: string | null; assigneeId?: string | null }) =>
      api.post(`/projects/${projectId}/tasks`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: any }) =>
      api.patch(`/projects/${projectId}/tasks/${taskId}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useMoveTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, sprintId, position }: { taskId: string; status?: string; sprintId?: string | null; position?: number }) =>
      api.patch(`/projects/${projectId}/tasks/${taskId}/move`, { status, sprintId, position }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      api.delete(`/projects/${projectId}/tasks/${taskId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
