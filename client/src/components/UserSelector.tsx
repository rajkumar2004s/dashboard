import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function UserSelector() {
  const { currentUser, setCurrentUser, allUsers } = useAuth();

  if (!currentUser) return null;

  return (
    <Card className="mb-4 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Switch User Role</CardTitle>
        <CardDescription className="text-xs">
          Select a different user to view their dashboard (Demo Mode)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={currentUser.id}
          onValueChange={(userId) => {
            const user = allUsers.find((u) => u.id === userId);
            if (user) setCurrentUser(user);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select user..." />
          </SelectTrigger>
          <SelectContent>
            {allUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      user.role === "ceo"
                        ? "bg-chart-4/20 text-chart-4"
                        : user.role === "director"
                        ? "bg-chart-3/20 text-chart-3"
                        : user.role === "manager"
                        ? "bg-chart-2/20 text-chart-2"
                        : "bg-chart-1/20 text-chart-1"
                    }`}
                  >
                    {user.role}
                  </Badge>
                  <span>{user.name}</span>
                  <span className="text-xs text-muted-foreground">({user.email})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

