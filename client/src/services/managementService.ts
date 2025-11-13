import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/domain";

interface CreateManagedUserInput {
  name: string;
  email: string;
  role: Extract<UserRole, "manager" | "employee">;
  productId?: string | null;
  departmentId?: string | null;
}

export async function createManagedUser(payload: CreateManagedUserInput) {
  const { data, error } = await supabase.functions.invoke("create-managed-user", {
    body: payload,
  });

  if (error) {
    console.error("[supabase.functions] create-managed-user failed", error);
    throw new Error(error.message ?? "Unable to create user");
  }

  return data;
}

