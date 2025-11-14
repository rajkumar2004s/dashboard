import type { UserProfile, UserRole } from "@/types/domain";
import { mockUsers } from "@/data/mockData";

export async function fetchUserProfile(authUserId: string): Promise<UserProfile | null> {
  const user = mockUsers.find((u) => u.authUserId === authUserId);
  return user ?? null;
}

export async function fetchUsersByScope(
  role: UserRole,
  filters: Partial<{ productId: string; departmentId: string; role: UserRole }> = {}
): Promise<UserProfile[]> {
  let filtered = [...mockUsers];

  if (filters.productId) {
    filtered = filtered.filter((u) => u.productId === filters.productId);
  }

  if (filters.departmentId) {
    filtered = filtered.filter((u) => u.departmentId === filters.departmentId);
  }

  if (filters.role) {
    filtered = filtered.filter((u) => u.role === filters.role);
  }

  // Apply role-based filtering
  if (role === "ceo") {
    return filtered; // CEO sees all
  } else if (role === "director") {
    return filtered.filter((u) => u.role !== "ceo");
  } else if (role === "manager") {
    return filtered.filter((u) => u.role === "employee" && u.departmentId === filters.departmentId);
  }

  return filtered.filter((u) => u.role === "employee");
}
