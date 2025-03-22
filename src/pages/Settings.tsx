import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { User, CreditCard, Bell, Lock, Languages, Monitor, Coins, Check } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from "@/constants/pricing";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { credits, isLoading: isLoadingCredits, addCredits } = useCredits();
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  useEffect(() => {
    if (tabFromUrl && ['profile', 'billing', 'notifications', 'appearance'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const [activeTab, setActiveTab] = useState(
    tabFromUrl && ['profile', 'billing', 'notifications', 'appearance'].includes(tabFromUrl) 
      ? tabFromUrl 
      : 'profile'
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/settings?tab=${value}`, { replace: true });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully."
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully."
    });
  };

  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleChangePlan = () => {
    sonnerToast.success("Your plan will be updated at the start of the next billing cycle");
  };

  const handlePurchaseCredits = (packageId: string, credits: number) => {
    setIsProcessingPurchase(true);
    
    setTimeout(() => {
      addCredits.mutate(
        { amount: credits, description: `Purchased ${credits} credits package` },
        {
          onSuccess: () => {
            sonnerToast.success(`Successfully added ${credits} credits to your account!`);
            setIsProcessingPurchase(false);
          },
          onError: (error) => {
            sonnerToast.error(`Failed to purchase credits: ${error.message}`);
            setIsProcessingPurchase(false);
          }
        }
      );
    }, 1500);
  };

  const formatCredits = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan) || SUBSCRIPTION_PLANS[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={nameInput} 
                      onChange={(e) => setNameInput(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                </div>
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" variant="outline">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Your Credits
              </CardTitle>
              <CardDescription>
                Purchase additional credits to use across all services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Current Balance</h3>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    {isLoadingCredits ? "..." : formatCredits(credits)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Credits can be used for all services: dubbing, subtitles, and video generation
                </p>
              </div>
              
              <h3 className="font-medium mb-3">Purchase Credit Packages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CREDIT_PACKAGES.map(pkg => (
                  <Card key={pkg.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/20 pb-3">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-2xl font-bold">{formatCredits(pkg.credits)}</span>
                        <span className="text-muted-foreground">credits</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>${pkg.price}</span>
                      </div>
                      <Button 
                        className="w-full bg-youtube-red hover:bg-youtube-darkred"
                        onClick={() => handlePurchaseCredits(pkg.id, pkg.credits)}
                        disabled={isProcessingPurchase}
                      >
                        {isProcessingPurchase ? "Processing..." : "Purchase"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{currentPlan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan.creditsPerMonth 
                        ? `${formatCredits(currentPlan.creditsPerMonth)} credits per month` 
                        : "Custom credit allocation"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {currentPlan.price !== null ? `$${currentPlan.price}` : "Custom"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentPlan.price !== null ? "per month" : "Contact sales"}
                    </p>
                  </div>
                </div>
                {currentPlan.creditsPerMonth && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Credits used this month</span>
                        <span className="text-sm font-medium">
                          {isLoadingCredits 
                            ? "Loading..." 
                            : `${formatCredits(currentPlan.creditsPerMonth - credits)} / ${formatCredits(currentPlan.creditsPerMonth)}`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-youtube-red" 
                          style={{ 
                            width: `${isLoadingCredits || !currentPlan.creditsPerMonth 
                              ? 0 
                              : ((currentPlan.creditsPerMonth - credits) / currentPlan.creditsPerMonth * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="grid gap-4 sm:grid-cols-4">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <Card 
                    key={plan.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      plan.id === selectedPlan ? 'border-2 border-youtube-red' : ''
                    }`}
                    onClick={() => handlePlanSelection(plan.id)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {plan.id === selectedPlan && (
                        <div className="absolute top-0 right-0 bg-youtube-red text-white text-xs px-2 py-1 rounded-bl-md">
                          Current
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {plan.price !== null 
                          ? `$${plan.price}` 
                          : <span className="text-sm">Contact Sales</span>}
                        {plan.price !== null && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                      </div>
                      {plan.creditsPerMonth ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          {formatCredits(plan.creditsPerMonth)} credits per month
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          Custom pricing
                        </p>
                      )}
                      
                      <div className="mt-4 space-y-2">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleChangePlan}
                  disabled={selectedPlan === "pro"}
                >
                  {selectedPlan === "pro" ? "Current Plan" : "Change Plan"}
                </Button>
                
                {selectedPlan === "enterprise" && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                  >
                    Contact Sales
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Update your billing information and payment method.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 04/2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-processing" className="flex-1">Video processing updates</Label>
                    <Switch id="email-processing" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-newsletter" className="flex-1">Newsletter and product updates</Label>
                    <Switch id="email-newsletter" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-billing" className="flex-1">Billing and subscription notifications</Label>
                    <Switch id="email-billing" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-processing" className="flex-1">Video processing updates</Label>
                    <Switch id="app-processing" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-comments" className="flex-1">Comments on your content</Label>
                    <Switch id="app-comments" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-youtube-red transition-colors">
                    <div className="h-20 w-full rounded-md bg-white"></div>
                    <span className="text-sm">Light</span>
                  </div>
                  <div className="border rounded-lg p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-youtube-red transition-colors">
                    <div className="h-20 w-full rounded-md bg-black"></div>
                    <span className="text-sm">Dark</span>
                  </div>
                  <div className="border-2 border-youtube-red rounded-lg p-4 flex flex-col items-center space-y-2 cursor-pointer">
                    <div className="h-20 w-full rounded-md bg-gradient-to-b from-white to-black"></div>
                    <span className="text-sm">System</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Language Settings</h3>
                <div className="flex items-center gap-4">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <div className="w-full max-w-xs">
                    <select className="w-full border rounded-md px-3 py-2">
                      <option value="en">English (United States)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
