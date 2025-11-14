import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole } from "@/types/domain";
import type { Database } from "@/types/supabase";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
const client = supabase as any;

const mapUserRow = (row: UserRow): UserProfile => ({
  id: row.id,
  authUserId: row.auth_user_id,
  name: row.name,
  email: row.email,
  role: row.role,
  productId: row.product_id,
  departmentId: row.department_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function fetchUserProfile(authUserId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      console.error("[supabase] fetchUserProfile error", error);
      // Return null instead of throwing - allows app to continue
      return null;
    }

    if (!data) {
      return null;
    }

    return mapUserRow(data);
  } catch (error) {
    console.error("[supabase] fetchUserProfile exception", error);
    return null;
  }
}

interface UpsertProfileInput {
  authUserId: string;
  name: string;
  email: string;
  role: UserRole;
  productId?: string | null;
  departmentId?: string | null;
}

export async function upsertUserProfile(input: UpsertProfileInput): Promise<UserProfile> {
  try {
    const payload: Database["public"]["Tables"]["users"]["Insert"] = {
      auth_user_id: input.authUserId,
      name: input.name,
      email: input.email,
      role: input.role,
      product_id: input.productId ?? null,
      department_id: input.departmentId ?? null,
    };

    const { data, error } = await client
      .from("users")
      .upsert(payload, {
        onConflict: "auth_user_id",
        ignoreDuplicates: false,
      })
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[supabase] upsertUserProfile error", error);
      throw error;
    }

    if (!data) {
      throw new Error("Failed to upsert user profile.");
    }

    return mapUserRow(data as UserRow);
  } catch (error) {
    console.error("[supabase] upsertUserProfile exception", error);
    throw error;
  }
}

export async function fetchUsersByScope(
  role: UserRole,
  filters: Partial<{ productId: string; departmentId: string; role: UserRole }> = {}
) {
  try {
    let query = client.from("users").select("*");

    if (filters.productId) {
      query = query.eq("product_id", filters.productId);
    }

    if (filters.departmentId) {
      query = query.eq("department_id", filters.departmentId);
    }

    if (filters.role) {
      query = query.eq("role", filters.role);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[supabase] fetchUsersByScope error", error);
      // Return empty array instead of throwing - allows app to continue
      return [];
    }

    const rows = (data ?? []) as UserRow[];
    return rows.map(mapUserRow).filter((record) => {
      if (role === "ceo") return true;
      if (role === "director") {
        if (record.role === "ceo") return false;
        if (filters.productId) {
          return record.productId === filters.productId;
        }
        return true;
      }
      if (role === "manager") {
        return record.role === "employee" && record.departmentId === filters.departmentId;
      }
      return record.role === "employee";
    });
  } catch (error) {
    console.error("[supabase] fetchUsersByScope exception", error);
    return [];
  }
}

