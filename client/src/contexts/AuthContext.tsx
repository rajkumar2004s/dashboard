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
  return await fetchUserProfile(session.user.id);
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
  }, []);

  const signUp = useCallback(async ({ email, password, name }: SignUpPayload) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    setSession(data.session ?? null);
    setProfile(null);
    setIsLoading(false);
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
