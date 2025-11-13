export type UserRole = "ceo" | "director" | "manager" | "employee";

export type ContributionStatus =
  | "submitted_to_manager"
  | "approved_by_manager"
  | "rejected_by_manager"
  | "approved_by_director"
  | "rejected_by_director"
  | "approved_by_ceo"
  | "overridden_by_ceo";

export interface Product {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  productId: string;
}

export interface RoleRecord {
  id: string;
  name: UserRole;
  description?: string;
}

export interface UserProfile {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  role: UserRole;
  productId?: string | null;
  departmentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContributionWithRelations {
  id: string;
  employeeId: string;
  productId: string;
  departmentId: string;
  contributionPercent: number;
  status: ContributionStatus;
  rejectionComment?: string | null;
  managerId?: string | null;
  directorId?: string | null;
  ceoId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employeeName?: string | null;
  employeeEmail?: string | null;
  productName?: string | null;
  departmentName?: string | null;
}

export interface TopContributor {
  userId: string;
  name: string;
  totalPercent: number;
  contributionCount: number;
}

