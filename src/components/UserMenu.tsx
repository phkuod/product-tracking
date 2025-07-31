import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
        </div>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-20">
            <div className="p-3 border-b border-border">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.username}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {user.role} • {user.department}
              </div>
            </div>
            
            <div className="py-1">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center space-x-2 text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};