
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CreditTransaction, UserCredits } from "./types";

export const useSpendCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const credits = queryClient.getQueryData<UserCredits>(["user-credits", user?.id]);

  return useMutation({
    mutationFn: async ({ amount, service, description }: CreditTransaction) => {
      if (!user || !credits) throw new Error("User or credits not found");
      if (credits.credits_balance < amount) {
        toast.error(`Not enough credits for this operation. Need ${amount} credits, but you have ${credits.credits_balance}.`);
        throw new Error(`Not enough credits: ${credits.credits_balance} < ${amount}`);
      }
      
      const newBalance = credits.credits_balance - amount;
      const { data, error } = await supabase
        .from("user_credits")
        .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", credits.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error using credits:", error);
        toast.error("Failed to use credits");
        throw error;
      }
      
      return { transaction: { amount, service, description }, updatedCredits: data };
    },
    onSuccess: ({ transaction, updatedCredits }) => {
      queryClient.setQueryData(["user-credits", user?.id], updatedCredits);
      toast.success(`${transaction.amount} credits used for ${transaction.service}`);
    },
    onError: (error) => {
      console.error("Credit transaction failed:", error);
    }
  });
};
