import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { currentUser, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  if (!currentUser) return null;

  const badgeTone = (() => {
    switch (currentUser.role) {
      case "employee":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30";
      case "manager":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "director":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "ceo":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  })();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-foreground">NxtWave</h1>
          <Badge className={`${badgeTone} text-sm font-medium border`} data-testid="badge-role">
            {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground" data-testid="text-username">
            {currentUser.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
            aria-label="Reset to CEO"
            title="Reset to CEO"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
