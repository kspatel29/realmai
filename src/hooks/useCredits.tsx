
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

export interface CreditTransaction {
  amount: number;
  service: string;
  description: string;
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
    mutationFn: async ({ amount, service, description }: CreditTransaction) => {
      if (!user || !credits) throw new Error('User or credits not found');
      if (credits.credits_balance < amount) {
        toast.error(`Not enough credits for this operation. Need ${amount} credits, but you have ${credits.credits_balance}.`);
        throw new Error(`Not enough credits: ${credits.credits_balance} < ${amount}`);
      }
      
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
      
      return { transaction: { amount, service, description }, updatedCredits: data };
    },
    onSuccess: ({ transaction, updatedCredits }) => {
      queryClient.setQueryData(['user-credits', user?.id], updatedCredits);
      toast.success(`${transaction.amount} credits used for ${transaction.service}`);
    },
    onError: (error) => {
      console.error('Credit transaction failed:', error);
    }
  });

  // Add credits (increment)
  const addCredits = useMutation({
    mutationFn: async ({ amount, description }: Omit<CreditTransaction, 'service'>) => {
      if (!user || !credits) throw new Error('User or credits not found');
      
      const newBalance = credits.credits_balance + amount;
      const { data, error } = await supabase
        .from('user_credits')
        .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding credits:', error);
        toast.error('Failed to add credits');
        throw error;
      }
      
      return { amount, description, updatedCredits: data };
    },
    onSuccess: ({ amount, description, updatedCredits }) => {
      queryClient.setQueryData(['user-credits', user?.id], updatedCredits);
      toast.success(`${amount} credits added: ${description}`);
    },
  });

  // For development: Add credits to a specific user
  const addCreditsToUser = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      // First check if the user has a credits record
      const { data: existingCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching user credits:', fetchError);
        throw fetchError;
      }
      
      if (existingCredits) {
        // Update existing record
        const newBalance = existingCredits.credits_balance + amount;
        const { data, error } = await supabase
          .from('user_credits')
          .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating user credits:', error);
          throw error;
        }
        
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            credits_balance: amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating user credits:', error);
          throw error;
        }
        
        return data;
      }
    },
    onSuccess: (result) => {
      toast.success(`Added ${result.credits_balance} credits to user ${result.user_id}`);
      // If this is the current user, update the cache
      if (user && result.user_id === user.id) {
        queryClient.setQueryData(['user-credits', user.id], result);
      }
    },
    onError: (error) => {
      toast.error(`Failed to add credits: ${error}`);
    }
  });

  // Check if user has enough credits
  const hasEnoughCredits = (amount: number): boolean => {
    return !!credits && credits.credits_balance >= amount;
  };

  return {
    credits: credits?.credits_balance || 0,
    isLoading,
    error,
    updateCredits,
    useCredits,
    addCredits,
    hasEnoughCredits,
    addCreditsToUser, // New function for development
  };
};
