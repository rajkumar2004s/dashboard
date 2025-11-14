import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole } from "@/types/domain";
import { fetchUserProfile, upsertUserProfile } from "@/services/userService";

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

interface CompleteProfilePayload {
  name: string;
  role: UserRole;
  productId?: string | null;
  departmentId?: string | null;
}

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: (payload: CompleteProfilePayload) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfileForSession(session: Session | null): Promise<UserProfile | null> {
  if (!session?.user) {
    return null;
  }
  try {
    return await fetchUserProfile(session.user.id);
  } catch (error) {
    console.error("[AuthContext] Error loading profile:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[supabase] getSession error", error);
      }
      if (!isMounted) return;
      setSession(data.session ?? null);
      const userProfile = await loadProfileForSession(data.session ?? null);
      if (!isMounted) return;
      setProfile(userProfile);
      setIsLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      const userProfile = await loadProfileForSession(newSession);
      setProfile(userProfile);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setIsLoading(false);
        throw error;
      }
      setSession(data.session ?? null);
      const newProfile = await loadProfileForSession(data.session ?? null);
      setProfile(newProfile);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signUp = useCallback(async ({ email, password, name }: SignUpPayload) => {
    setIsLoading(true);
    try {
      // Sign up - JWT token is issued immediately, no email confirmation needed
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          // Don't require email confirmation - use JWT token directly
        },
      });
      
      if (error) {
        setIsLoading(false);
        throw error;
      }

      // Set session immediately (JWT token is available)
      setSession(data.session ?? null);

      // Try to auto-create profile, but don't fail if it doesn't work
      // User can complete onboarding later
      if (data.session?.user) {
        try {
          await upsertUserProfile({
            authUserId: data.session.user.id,
            name: name.trim(),
            email: email,
            role: "employee", // Default role
          });
        } catch (profileError) {
          console.warn("[AuthContext] Profile creation failed (RLS may need fixing):", profileError);
          // Continue - user will go to onboarding to complete profile
        }
      }

      // Load profile (may be null if creation failed, that's OK)
      const newProfile = await loadProfileForSession(data.session ?? null);
      setProfile(newProfile);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const updated = await loadProfileForSession(session);
    setProfile(updated);
  }, [session]);

  const completeProfile = useCallback(
    async ({ name, role, productId, departmentId }: CompleteProfilePayload) => {
      if (!session?.user) {
        throw new Error("No active session");
      }

      const result = await upsertUserProfile({
        authUserId: session.user.id,
        name,
        email: session.user.email ?? "",
        role,
        productId,
        departmentId,
      });

      setProfile(result);
      return result;
    },
    [session]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      needsOnboarding: Boolean(session?.user) && !profile,
      signIn,
      signUp,
      signOut,
      completeProfile,
      refreshProfile,
    }),
    [session, profile, isLoading, signIn, signUp, signOut, completeProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
