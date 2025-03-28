import React from "react";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAppDispatch } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { getCurrentUser } from "../../api/auth";

type HeaderProps = {
  className?: string;
};

const Header: React.FC<HeaderProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const currentUser = getCurrentUser();
  
  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };
  
  return (
    <header className={cn("dashboard-header", className)}>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-background rounded-md border border-input pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground font-bold">
            3
          </span>
        </Button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-border/10">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{currentUser?.email || 'user@example.com'}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 