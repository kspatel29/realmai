
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Coins, Package, Plus, History, CreditCard, Receipt } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import { CREDIT_PACKAGES } from "@/constants/pricing";

const Billing = () => {
  const { credits } = useCredits();
  const [activeTab, setActiveTab] = useState("credits");

  // Dummy billing history data (in a real app, this would come from an API)
  const billingHistory = [
    {
      id: "INV-001",
      date: "2023-05-15",
      amount: "$35.00",
      status: "Paid",
      description: "Large Credit Pack"
    },
    {
      id: "INV-002",
      date: "2023-04-10",
      amount: "$200.00",
      status: "Paid",
      description: "Creator Pro Plan (Monthly)"
    },
    {
      id: "INV-003",
      date: "2023-03-05",
      amount: "$14.00",
      status: "Paid",
      description: "Medium Credit Pack"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Billing & Credits</h1>
          <p className="text-muted-foreground">
            Manage your subscription, purchase credits, and view your billing history
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">{credits} credits available</span>
        </div>
      </div>

      <Tabs defaultValue="credits" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Buy Credits</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className="border border-muted hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{pkg.name}</CardTitle>
                    <div className="bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded text-sm">
                      ${pkg.price}
                    </div>
                  </div>
                  <CardDescription className="text-center">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 text-yellow-500 mr-1.5" />
                      <span className="text-2xl font-bold">{pkg.credits}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(pkg.price / pkg.credits * 100).toFixed(1)}¢ per credit
                    </div>
                  </div>
                  <Button className="w-full">
                    Purchase Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-8" />

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Service Cost Breakdown</h2>
            <ServiceCostDisplay showSummary={true} />
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the Creator Pro plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Creator Pro</h3>
                  <p className="text-sm text-muted-foreground">$200/month • 3100 credits/month</p>
                </div>
                <Button variant="outline">Change Plan</Button>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Plan Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded-full mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-green-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>3100 credits per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded-full mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-green-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Advanced subtitle generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded-full mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-green-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Premium dubbing with lip-sync</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded-full mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-green-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>High-quality clip generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded-full mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-green-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Visa •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-3 font-medium">Invoice</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span>{invoice.id}</span>
                          </div>
                        </td>
                        <td className="py-3">{invoice.date}</td>
                        <td className="py-3">{invoice.amount}</td>
                        <td className="py-3">
                          <div className="bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded-full inline-block">
                            {invoice.status}
                          </div>
                        </td>
                        <td className="py-3">{invoice.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;
