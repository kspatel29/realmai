
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserCredits } from "./types";

export const useUpdateCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const credits = queryClient.getQueryData<UserCredits>(["user-credits", user?.id]);

  return useMutation({
    mutationFn: async (newBalance: number) => {
      if (!user || !credits) throw new Error("User or credits not found");
      
      const { data, error } = await supabase
        .from("user_credits")
        .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", credits.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating credits:", error);
        toast.error("Failed to update credits");
        throw error;
      }
      
      return data;
    },
    onSuccess: (newCredits) => {
      queryClient.setQueryData(["user-credits", user?.id], newCredits);
      toast.success("Credits updated successfully");
    },
  });
};
