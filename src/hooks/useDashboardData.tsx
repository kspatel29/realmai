
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalVideos: number;
  lastActive: string;
  creditsUsed: number;
  creditsRemaining: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('User not authenticated');

      // Get total videos count using raw query since types aren't updated yet
      const { count: videosCount } = await supabase
        .from('videos' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get user's last sign in time
      const lastActive = user.last_sign_in_at 
        ? new Date(user.last_sign_in_at).toLocaleDateString()
        : 'Never';

      // Get current credits
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Get total credits used from transactions
      const { data: transactionsData } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'usage');

      const creditsUsed = transactionsData?.reduce((sum, transaction) => 
        sum + Math.abs(transaction.amount), 0) || 0;

      return {
        totalVideos: videosCount || 0,
        lastActive,
        creditsUsed,
        creditsRemaining: creditsData?.credits_balance || 0
      };
    },
    enabled: !!user,
  });

  return {
    stats,
    isLoading,
    error
  };
};
