import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (!user) return null;

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'employee':
        return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'manager':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'director':
        return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'ceo':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-foreground">NxtWave</h1>
            <Badge className={`${getRoleBadgeColor()} text-sm font-medium border`} data-testid="badge-role">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground" data-testid="text-username">{user.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
