import type { UserRole } from "@/types/domain";
import { mockUsers } from "@/data/mockData";

interface CreateManagedUserInput {
  name: string;
  email: string;
  role: Extract<UserRole, "manager" | "employee">;
  productId?: string | null;
  departmentId?: string | null;
}

export async function createManagedUser(payload: CreateManagedUserInput) {
  // In mock mode, just return success
  // In a real app, this would create a user via Supabase Edge Function
  console.log("[mock] createManagedUser called with:", payload);
  
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: "User created successfully (mock mode)",
    user: {
      id: `mock-${Date.now()}`,
      ...payload,
    },
  };
}
