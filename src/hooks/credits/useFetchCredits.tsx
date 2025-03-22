
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserCredits } from "./types";
import { toast } from "sonner";

export const useFetchCredits = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-credits", user?.id],
    queryFn: async (): Promise<UserCredits | null> => {
      if (!user) return null;
      
      // Get all records and take the one with the latest update
      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching credits:", error);
        toast.error("Failed to load credits");
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
};
