
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UserCredits {
  id: string;
  user_id: string;
  credits_balance: number;
  created_at: string;
  updated_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user credits
  const { data: credits, isLoading, error } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async (): Promise<UserCredits | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching credits:', error);
        toast.error('Failed to load credits');
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Update user credits
  const updateCredits = useMutation({
    mutationFn: async (newBalance: number) => {
      if (!user || !credits) throw new Error('User or credits not found');
      
      const { data, error } = await supabase
        .from('user_credits')
        .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating credits:', error);
        toast.error('Failed to update credits');
        throw error;
      }
      
      return data;
    },
    onSuccess: (newCredits) => {
      queryClient.setQueryData(['user-credits', user?.id], newCredits);
      toast.success('Credits updated successfully');
    },
  });

  // Use credits (decrement)
  const useCredits = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !credits) throw new Error('User or credits not found');
      if (credits.credits_balance < amount) throw new Error('Not enough credits');
      
      const newBalance = credits.credits_balance - amount;
      const { data, error } = await supabase
        .from('user_credits')
        .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error using credits:', error);
        toast.error('Failed to use credits');
        throw error;
      }
      
      return data;
    },
    onSuccess: (newCredits) => {
      queryClient.setQueryData(['user-credits', user?.id], newCredits);
    },
  });

  return {
    credits: credits?.credits_balance || 0,
    isLoading,
    error,
    updateCredits,
    useCredits,
  };
};
