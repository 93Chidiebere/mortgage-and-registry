import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch all active products
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    }
  });
};

// Fetch all active lenders
export const useLenders = () => {
  return useQuery({
    queryKey: ['lenders'],
    queryFn: async () => {
      const { data } = await api.get('/lenders');
      return data;
    }
  });
};

// Fetch user's applications
export const useMyApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/me');
      return data;
    }
  });
};

// Create application
export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationData: any) => {
      const { data } = await api.post('/applications', applicationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
};

// Fetch leads for a lender
export const useLenderLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data } = await api.get('/leads');
      return data;
    }
  });
};

// Update lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data } = await api.patch(`/leads/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

// Fetch Revenue for Admin
export const useRevenue = () => {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const { data } = await api.get('/revenue');
      return data;
    }
  });
};

// Onboard Lender
export const useOnboardLender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lenderData: any) => {
      const { data } = await api.post('/lenders', lenderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lenders'] });
    }
  });
};
