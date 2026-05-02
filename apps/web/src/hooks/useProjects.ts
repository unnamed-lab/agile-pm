import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
    enabled: !!id,
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
