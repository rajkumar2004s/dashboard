import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { UserProfile } from "@/types/domain";
import { mockUsers } from "@/data/mockData";

interface AuthContextValue {
  currentUser: UserProfile | null;
  profile: UserProfile | null; // Alias for currentUser for compatibility
  allUsers: UserProfile[];
  isLoading: boolean;
  needsOnboarding: boolean;
  setCurrentUser: (user: UserProfile) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to CEO user
  const [currentUserId, setCurrentUserId] = useState<string>("user-ceo");
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    const savedUserId = localStorage.getItem("demo_user_id");
    if (savedUserId && mockUsers.find((u) => u.id === savedUserId)) {
      setCurrentUserId(savedUserId);
    }
  }, []);

  const currentUser = useMemo(() => {
    return mockUsers.find((u) => u.id === currentUserId) ?? mockUsers[0];
  }, [currentUserId]);

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserId(user.id);
    localStorage.setItem("demo_user_id", user.id);
  };

  const signOut = () => {
    // Reset to CEO
    setCurrentUserId("user-ceo");
    localStorage.setItem("demo_user_id", "user-ceo");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      profile: currentUser, // Alias for compatibility
      allUsers: mockUsers,
      isLoading,
      needsOnboarding: false, // No onboarding needed in demo mode
      setCurrentUser,
      signOut,
    }),
    [currentUser, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
