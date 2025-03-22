
import { useFetchCredits } from "./useFetchCredits";
import { useUpdateCredits } from "./useUpdateCredits";
import { useAddCredits } from "./useAddCredits";
import { useSpendCredits } from "./useSpendCredits";
import { useAddCreditsToUser } from "./useAddCreditsToUser";

export const useCredits = () => {
  const { data: credits, isLoading, error } = useFetchCredits();
  const updateCredits = useUpdateCredits();
  const addCredits = useAddCredits();
  const useCredits = useSpendCredits();
  const addCreditsToUser = useAddCreditsToUser();

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

export * from "./types";
