
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserCredits } from "./types";

export const useAddCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const credits = queryClient.getQueryData<UserCredits>(["user-credits", user?.id]);

  return useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      if (!user || !credits) throw new Error("User or credits not found");
      
      const newBalance = credits.credits_balance + amount;
      const { data, error } = await supabase
        .from("user_credits")
        .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", credits.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error adding credits:", error);
        toast.error("Failed to add credits");
        throw error;
      }
      
      return { amount, description, updatedCredits: data };
    },
    onSuccess: ({ amount, description, updatedCredits }) => {
      queryClient.setQueryData(["user-credits", user?.id], updatedCredits);
      toast.success(`${amount} credits added: ${description}`);
    },
  });
};
