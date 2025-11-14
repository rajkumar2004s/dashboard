import type {
  UserProfile,
  Product,
  Department,
  ContributionWithRelations,
  ContributionStatus,
  TopContributor,
} from "@/types/domain";

// Sample Products
export const mockProducts: Product[] = [
  { id: "product-1", name: "Cloud Platform" },
  { id: "product-2", name: "Mobile App" },
  { id: "product-3", name: "Web Dashboard" },
];

// Sample Departments
export const mockDepartments: Department[] = [
  { id: "dept-1", name: "Engineering", productId: "product-1" },
  { id: "dept-2", name: "Design", productId: "product-1" },
  { id: "dept-3", name: "QA", productId: "product-1" },
  { id: "dept-4", name: "iOS Development", productId: "product-2" },
  { id: "dept-5", name: "Android Development", productId: "product-2" },
  { id: "dept-6", name: "Frontend", productId: "product-3" },
  { id: "dept-7", name: "Backend", productId: "product-3" },
];

// Sample Users
export const mockUsers: UserProfile[] = [
  // CEO
  {
    id: "user-ceo",
    authUserId: "auth-ceo",
    name: "Sarah Johnson",
    email: "sarah.johnson@nxtwave.com",
    role: "ceo",
    productId: null,
    departmentId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  // Directors
  {
    id: "user-director-1",
    authUserId: "auth-director-1",
    name: "Michael Chen",
    email: "michael.chen@nxtwave.com",
    role: "director",
    productId: "product-1",
    departmentId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-director-2",
    authUserId: "auth-director-2",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@nxtwave.com",
    role: "director",
    productId: "product-2",
    departmentId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-director-3",
    authUserId: "auth-director-3",
    name: "David Kim",
    email: "david.kim@nxtwave.com",
    role: "director",
    productId: "product-3",
    departmentId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  // Managers
  {
    id: "user-manager-1",
    authUserId: "auth-manager-1",
    name: "James Wilson",
    email: "james.wilson@nxtwave.com",
    role: "manager",
    productId: "product-1",
    departmentId: "dept-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-manager-2",
    authUserId: "auth-manager-2",
    name: "Lisa Anderson",
    email: "lisa.anderson@nxtwave.com",
    role: "manager",
    productId: "product-1",
    departmentId: "dept-2",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-manager-3",
    authUserId: "auth-manager-3",
    name: "Robert Taylor",
    email: "robert.taylor@nxtwave.com",
    role: "manager",
    productId: "product-2",
    departmentId: "dept-4",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-manager-4",
    authUserId: "auth-manager-4",
    name: "Jennifer Martinez",
    email: "jennifer.martinez@nxtwave.com",
    role: "manager",
    productId: "product-3",
    departmentId: "dept-6",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  // Employees
  {
    id: "user-emp-1",
    authUserId: "auth-emp-1",
    name: "Alex Thompson",
    email: "alex.thompson@nxtwave.com",
    role: "employee",
    productId: "product-1",
    departmentId: "dept-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-emp-2",
    authUserId: "auth-emp-2",
    name: "Maria Garcia",
    email: "maria.garcia@nxtwave.com",
    role: "employee",
    productId: "product-1",
    departmentId: "dept-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-emp-3",
    authUserId: "auth-emp-3",
    name: "John Smith",
    email: "john.smith@nxtwave.com",
    role: "employee",
    productId: "product-1",
    departmentId: "dept-2",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-emp-4",
    authUserId: "auth-emp-4",
    name: "Sophie Brown",
    email: "sophie.brown@nxtwave.com",
    role: "employee",
    productId: "product-2",
    departmentId: "dept-4",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-emp-5",
    authUserId: "auth-emp-5",
    name: "Daniel Lee",
    email: "daniel.lee@nxtwave.com",
    role: "employee",
    productId: "product-2",
    departmentId: "dept-5",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-emp-6",
    authUserId: "auth-emp-6",
    name: "Emma Davis",
    email: "emma.davis@nxtwave.com",
    role: "employee",
    productId: "product-3",
    departmentId: "dept-6",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-emp-7",
    authUserId: "auth-emp-7",
    name: "Chris Miller",
    email: "chris.miller@nxtwave.com",
    role: "employee",
    productId: "product-3",
    departmentId: "dept-7",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Helper function to get user name by ID
const getUserName = (userId: string): string => {
  const user = mockUsers.find((u) => u.id === userId);
  return user?.name ?? "Unknown User";
};

const getProductName = (productId: string): string => {
  const product = mockProducts.find((p) => p.id === productId);
  return product?.name ?? "Unknown Product";
};

const getDepartmentName = (departmentId: string): string => {
  const dept = mockDepartments.find((d) => d.id === departmentId);
  return dept?.name ?? "Unknown Department";
};

// Sample Contributions
export let mockContributions: ContributionWithRelations[] = [
  // Submitted to Manager
  {
    id: "contrib-1",
    employeeId: "user-emp-1",
    productId: "product-1",
    departmentId: "dept-1",
    contributionPercent: 40,
    status: "submitted_to_manager",
    managerId: null,
    directorId: null,
    ceoId: null,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    employeeName: "Alex Thompson",
    employeeEmail: "alex.thompson@nxtwave.com",
    productName: "Cloud Platform",
    departmentName: "Engineering",
  },
  {
    id: "contrib-2",
    employeeId: "user-emp-2",
    productId: "product-1",
    departmentId: "dept-1",
    contributionPercent: 60,
    status: "submitted_to_manager",
    managerId: null,
    directorId: null,
    ceoId: null,
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z",
    employeeName: "Maria Garcia",
    employeeEmail: "maria.garcia@nxtwave.com",
    productName: "Cloud Platform",
    departmentName: "Engineering",
  },
  // Approved by Manager
  {
    id: "contrib-3",
    employeeId: "user-emp-3",
    productId: "product-1",
    departmentId: "dept-2",
    contributionPercent: 50,
    status: "approved_by_manager",
    managerId: "user-manager-2",
    directorId: null,
    ceoId: null,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-12T14:00:00Z",
    employeeName: "John Smith",
    employeeEmail: "john.smith@nxtwave.com",
    productName: "Cloud Platform",
    departmentName: "Design",
  },
  // Approved by Director
  {
    id: "contrib-4",
    employeeId: "user-emp-4",
    productId: "product-2",
    departmentId: "dept-4",
    contributionPercent: 35,
    status: "approved_by_director",
    managerId: "user-manager-3",
    directorId: "user-director-2",
    ceoId: null,
    createdAt: "2024-01-08T08:00:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
    employeeName: "Sophie Brown",
    employeeEmail: "sophie.brown@nxtwave.com",
    productName: "Mobile App",
    departmentName: "iOS Development",
  },
  {
    id: "contrib-5",
    employeeId: "user-emp-5",
    productId: "product-2",
    departmentId: "dept-5",
    contributionPercent: 65,
    status: "approved_by_director",
    managerId: "user-manager-3",
    directorId: "user-director-2",
    ceoId: null,
    createdAt: "2024-01-09T10:00:00Z",
    updatedAt: "2024-01-13T15:00:00Z",
    employeeName: "Daniel Lee",
    employeeEmail: "daniel.lee@nxtwave.com",
    productName: "Mobile App",
    departmentName: "Android Development",
  },
  // Approved by CEO
  {
    id: "contrib-6",
    employeeId: "user-emp-6",
    productId: "product-3",
    departmentId: "dept-6",
    contributionPercent: 45,
    status: "approved_by_ceo",
    managerId: "user-manager-4",
    directorId: "user-director-3",
    ceoId: "user-ceo",
    createdAt: "2024-01-05T07:00:00Z",
    updatedAt: "2024-01-17T17:00:00Z",
    employeeName: "Emma Davis",
    employeeEmail: "emma.davis@nxtwave.com",
    productName: "Web Dashboard",
    departmentName: "Frontend",
  },
  // Rejected by Manager
  {
    id: "contrib-7",
    employeeId: "user-emp-7",
    productId: "product-3",
    departmentId: "dept-7",
    contributionPercent: 30,
    status: "rejected_by_manager",
    managerId: "user-manager-4",
    directorId: null,
    ceoId: null,
    rejectionComment: "Percentages don't add up to 100%",
    createdAt: "2024-01-11T12:00:00Z",
    updatedAt: "2024-01-12T13:00:00Z",
    employeeName: "Chris Miller",
    employeeEmail: "chris.miller@nxtwave.com",
    productName: "Web Dashboard",
    departmentName: "Backend",
  },
];

// Helper to add contribution with proper relations
export function addMockContribution(
  employeeId: string,
  payload: Array<{
    productId: string;
    departmentId: string;
    contributionPercent: number;
  }>
): ContributionWithRelations[] {
  const newContributions: ContributionWithRelations[] = payload.map((entry, index) => {
    const employee = mockUsers.find((u) => u.id === employeeId);
    return {
      id: `contrib-${Date.now()}-${index}`,
      employeeId,
      productId: entry.productId,
      departmentId: entry.departmentId,
      contributionPercent: entry.contributionPercent,
      status: "submitted_to_manager",
      managerId: null,
      directorId: null,
      ceoId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      employeeName: employee?.name ?? null,
      employeeEmail: employee?.email ?? null,
      productName: getProductName(entry.productId),
      departmentName: getDepartmentName(entry.departmentId),
    };
  });
  mockContributions = [...mockContributions, ...newContributions];
  return newContributions;
}

// Helper to update contribution status
export function updateMockContributionStatus(
  contributionId: string,
  status: ContributionStatus,
  approverId: string,
  rejectionComment?: string
): ContributionWithRelations | null {
  const index = mockContributions.findIndex((c) => c.id === contributionId);
  if (index === -1) return null;

  const contribution = mockContributions[index];
  const updated: ContributionWithRelations = {
    ...contribution,
    status,
    updatedAt: new Date().toISOString(),
    rejectionComment: rejectionComment ?? contribution.rejectionComment,
  };

  // Set approver IDs based on status
  if (status === "approved_by_manager" || status === "rejected_by_manager") {
    updated.managerId = approverId;
  } else if (status === "approved_by_director" || status === "rejected_by_director") {
    updated.directorId = approverId;
  } else if (status === "approved_by_ceo" || status === "overridden_by_ceo") {
    updated.ceoId = approverId;
  }

  mockContributions[index] = updated;
  return updated;
}

// Helper to get top contributors
export function getMockTopContributors(limit: number = 10): TopContributor[] {
  const employeeTotals = new Map<string, { name: string; total: number; count: number }>();

  mockContributions
    .filter((c) => c.status === "approved_by_ceo" || c.status === "overridden_by_ceo")
    .forEach((contrib) => {
      const existing = employeeTotals.get(contrib.employeeId);
      if (existing) {
        existing.total += contrib.contributionPercent;
        existing.count += 1;
      } else {
        employeeTotals.set(contrib.employeeId, {
          name: contrib.employeeName ?? "Unknown",
          total: contrib.contributionPercent,
          count: 1,
        });
      }
    });

  return Array.from(employeeTotals.entries())
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      totalPercent: data.total,
      contributionCount: data.count,
    }))
    .sort((a, b) => b.totalPercent - a.totalPercent)
    .slice(0, limit);
}

