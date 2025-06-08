
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SpendCreditsParams {
  amount: number;
  serviceType: string;
  jobId?: string;
  description?: string;
}

export const useSpendCreditsForService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, serviceType, jobId, description }: SpendCreditsParams) => {
      if (!user) throw new Error('User not authenticated');

      // First check if user has enough credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (creditsError) {
        console.error('Error fetching user credits:', creditsError);
        throw new Error('Failed to check credit balance');
      }

      if (!creditsData || creditsData.credits_balance < amount) {
        throw new Error('Insufficient credits');
      }

      // Deduct credits
      const newBalance = creditsData.credits_balance - amount;
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        throw new Error('Failed to deduct credits');
      }

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount, // Negative for spending
          type: 'usage',
          service: serviceType,
          description: description || `Used ${amount} credits for ${serviceType}`,
          status: 'completed'
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        // Don't throw here as the main operation succeeded
      }

      // Record service usage
      const { error: usageError } = await supabase
        .from('service_usage_logs')
        .insert({
          user_id: user.id,
          service_type: serviceType,
          credits_used: amount,
          job_id: jobId,
          status: 'completed',
          metadata: { description }
        });

      if (usageError) {
        console.error('Error recording service usage:', usageError);
        // Don't throw here as the main operation succeeded
      }

      return newBalance;
    },
    onSuccess: () => {
      // Invalidate credits queries to update UI
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to process credits');
    }
  });
};
