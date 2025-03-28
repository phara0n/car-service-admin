import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  BarChart3,
  Car,
  Users,
  Wrench,
  Calendar,
  FileText,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

type SidebarProps = {
  className?: string;
};

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { path: "/cars", label: "Cars", icon: <Car size={20} /> },
    { path: "/customers", label: "Customers", icon: <Users size={20} /> },
    { path: "/services", label: "Services", icon: <Wrench size={20} /> },
    { path: "/appointments", label: "Appointments", icon: <Calendar size={20} /> },
    { path: "/reports", label: "Reports", icon: <FileText size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];
  
  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div
      className={cn(
        "dashboard-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[240px]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">AutoSys</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(true)}
          >
            <X size={18} />
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-4 h-8 w-8 rounded-full bg-background border shadow-sm"
            onClick={() => setCollapsed(false)}
          >
            <Menu size={16} />
          </Button>
        )}
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "dashboard-link",
              isActive(item.path) ? "active" : "",
              collapsed && "justify-center px-2"
            )}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-border/10 space-y-1">
        {!collapsed && <ThemeToggle />}
        <Link 
          to="/logout" 
          className={cn(
            "dashboard-link text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <span><LogOut size={20} /></span>
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 