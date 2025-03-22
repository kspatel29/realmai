
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
      
      // Fix: Get all records and take the one with the latest update
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching credits:', error);
        toast.error('Failed to load credits');
        throw error;
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // Sort by updated_at in descending order and take the first record
      const sortedData = [...data].sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      return sortedData[0];
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
        .eq('id', credits.id)
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
        .eq('id', credits.id)
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
        .eq('id', credits.id)
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

  // Add credits to a specific user
  const addCreditsToUser = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      try {
        // First check if the user has a credits record
        const { data: existingCredits, error: fetchError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (fetchError) {
          console.error('Error fetching user credits:', fetchError);
          throw fetchError;
        }
        
        if (existingCredits && existingCredits.length > 0) {
          // Update existing record (use the most recent one)
          const latestCredit = existingCredits[0];
          const newBalance = latestCredit.credits_balance + amount;
          const { data, error } = await supabase
            .from('user_credits')
            .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', latestCredit.id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating user credits:', error);
            throw error;
          }
          
          return data;
        } else {
          // Create new record with RLS bypass
          const { data, error } = await supabase.rpc('create_user_credits', {
            user_id_param: userId,
            credits_balance_param: amount
          }) as { data: UserCredits | null; error: Error | null };
          
          if (error) {
            console.error('Error creating user credits:', error);
            throw error;
          }
          
          return data as UserCredits;
        }
      } catch (error) {
        console.error('Error in addCreditsToUser:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      toast.success(`Added credits to user ${result.user_id}`);
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
    addCreditsToUser,
  };
};
