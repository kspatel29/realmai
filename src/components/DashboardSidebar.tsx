
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Video, 
  MessageSquare, 
  Scissors, 
  BarChart, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useState } from "react";

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardSidebar = ({ isSidebarOpen, toggleSidebar }: DashboardSidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navigation = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Video Dubbing",
      href: "/dashboard/dubbing",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Subtitles",
      href: "/dashboard/subtitles",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Clips Generator",
      href: "/dashboard/clips",
      icon: <Scissors className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  const bottomNavigation = [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  // For mobile sidebar
  if (isMobile) {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300", 
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-youtube-red">RealmAI</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="text-sidebar-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="py-4 px-4 space-y-6">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.href} 
                  to={item.href}
                  onClick={toggleSidebar}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      location.pathname === item.href 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="border-t border-sidebar-border pt-4 space-y-1">
              {bottomNavigation.map((item) => (
                <Link 
                  key={item.href} 
                  to={item.href}
                  onClick={toggleSidebar}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      location.pathname === item.href 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                </Link>
              ))}
              
              <Link to="/dashboard/logout" onClick={toggleSidebar}>
                <div
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For desktop sidebar using shadcn sidebar
  return (
    <Sidebar>
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-youtube-red">RealmAI</span>
        </Link>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    active={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings & Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    active={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/logout">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
