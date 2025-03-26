
import React from "react";
import { Coins, History } from "lucide-react";

interface Transaction {
  id: string;
  created_at: string;
  type: string;
  description: string;
  amount: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionHistory = ({ transactions, isLoading }: TransactionHistoryProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading transaction history...</div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No transaction history yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-3">{formatDate(tx.created_at)}</td>
                  <td className="py-3 capitalize">{tx.type}</td>
                  <td className="py-3">{tx.description}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className={tx.type === 'purchase' ? 'text-green-600' : ''}>
                        {tx.type === 'purchase' ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
