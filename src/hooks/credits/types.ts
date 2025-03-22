
import { Database } from "@/integrations/supabase/types";

export type UserCredits = Database["public"]["Tables"]["user_credits"]["Row"];

export interface CreditTransaction {
  amount: number;
  service: string;
  description: string;
}
