import type { ContributionStatus, ContributionWithRelations, UserRole } from "@/types/domain";
import {
  mockContributions,
  addMockContribution,
  updateMockContributionStatus,
  getMockTopContributors,
} from "@/data/mockData";

export async function createContributions(
  employeeId: string,
  payload: Array<{
    productId: string;
    departmentId: string;
    contributionPercent: number;
  }>
): Promise<ContributionWithRelations[]> {
  return addMockContribution(employeeId, payload);
}

export async function fetchContributionsByRole(params: {
  role: UserRole;
  userId: string;
  productId?: string | null;
  departmentId?: string | null;
}): Promise<ContributionWithRelations[]> {
  let filtered = [...mockContributions];

  if (params.role === "employee") {
    filtered = filtered.filter((c) => c.employeeId === params.userId);
  } else if (params.role === "manager") {
    filtered = filtered.filter((c) => c.departmentId === params.departmentId);
  } else if (params.role === "director") {
    filtered = filtered.filter((c) => c.productId === params.productId);
  }
  // CEO role: no filter, see all contributions

  // Sort by updated_at descending
  return filtered.sort((a, b) => {
    const dateA = new Date(a.updatedAt ?? a.createdAt ?? "").getTime();
    const dateB = new Date(b.updatedAt ?? b.createdAt ?? "").getTime();
    return dateB - dateA;
  });
}

export async function updateContributionStatus(
  contributionId: string,
  status: ContributionStatus,
  actorId: string
): Promise<ContributionWithRelations> {
  const updated = updateMockContributionStatus(contributionId, status, actorId);
  if (!updated) {
    throw new Error("Contribution not found");
  }
  return updated;
}

export async function rejectContribution(
  contributionId: string,
  rejectionComment: string,
  status: Extract<ContributionStatus, "rejected_by_manager" | "rejected_by_director">,
  actorId: string
): Promise<ContributionWithRelations> {
  const updated = updateMockContributionStatus(contributionId, status, actorId, rejectionComment);
  if (!updated) {
    throw new Error("Contribution not found");
  }
  return updated;
}

export async function fetchTopContributors(limit = 5) {
  return getMockTopContributors(limit);
}
