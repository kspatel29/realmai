
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UserCredits from "./UserCredits";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDubbingJobs } from "@/hooks/dubbingJobs";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { jobs: dubbingJobs } = useDubbingJobs();
  
  // Only show completed/failed jobs in the notifications
  const notifications = dubbingJobs
    .filter(job => job.status === 'completed' || job.status === 'failed')
    .map(job => ({
      id: job.id,
      message: job.status === 'completed' 
        ? `Your dubbing job for ${job.languages.join(', ')} is ready` 
        : `Your dubbing job for ${job.languages.join(', ')} has failed`,
      time: new Date(job.updated_at).toLocaleString(),
      status: job.status
    }));
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
            <div className="flex items-center">
              <SidebarTrigger />
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-1 items-center justify-end gap-4">
              <UserCredits />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="flex flex-col space-y-2 p-4">
                    <h3 className="font-medium">Notifications</h3>
                    {notifications.length > 0 ? (
                      <div className="max-h-[300px] overflow-auto">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className="text-sm border-b pb-2 mt-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                            onClick={() => navigate('/dashboard/video-dubbing')}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${notification.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <p>{notification.message}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No notifications yet. When your jobs complete, you'll see them here.
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/billing')}>
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
