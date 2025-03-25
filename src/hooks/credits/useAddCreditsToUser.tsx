
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserCredits } from "./types";

export const useAddCreditsToUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount, silent = false }: { userId: string; amount: number; silent?: boolean }) => {
      try {
        // First check if the user has a credits record
        const { data: existingCredits, error: fetchError } = await supabase
          .from("user_credits")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1);
        
        if (fetchError) {
          console.error("Error fetching user credits:", fetchError);
          throw fetchError;
        }
        
        if (existingCredits && existingCredits.length > 0) {
          // Update existing record (use the most recent one)
          const latestCredit = existingCredits[0];
          const newBalance = latestCredit.credits_balance + amount;
          const { data, error } = await supabase
            .from("user_credits")
            .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
            .eq("id", latestCredit.id)
            .select()
            .single();
          
          if (error) {
            console.error("Error updating user credits:", error);
            throw error;
          }
          
          return data;
        } else {
          // Create new record with RLS bypass
          const { data, error } = await supabase.rpc("create_user_credits", {
            user_id_param: userId,
            credits_balance_param: amount
          }) as { data: UserCredits | null; error: Error | null };
          
          if (error) {
            console.error("Error creating user credits:", error);
            throw error;
          }
          
          return data as UserCredits;
        }
      } catch (error) {
        console.error("Error in addCreditsToUser:", error);
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      // Only show toast notification if silent is false
      if (!variables.silent) {
        toast.success(`Added credits to user ${result.user_id}`);
      }
      
      // If this is the current user, update the cache
      if (user && result.user_id === user.id) {
        queryClient.setQueryData(["user-credits", user.id], result);
      }
    },
    onError: (error) => {
      toast.error(`Failed to add credits: ${error}`);
    }
  });
};
