import { supabase } from "@/lib/supabase";
import type { ContributionStatus, ContributionWithRelations, UserRole } from "@/types/domain";
import type { Database } from "@/types/supabase";

const client = supabase as any;
type ContributionInsert = Database["public"]["Tables"]["employee_contributions"]["Insert"];
type ContributionUpdate = Database["public"]["Tables"]["employee_contributions"]["Update"];
type ContributionRpcRow = Database["public"]["Functions"]["get_top_contributors"]["Returns"][number];

type ContributionJoinRow = Database["public"]["Tables"]["employee_contributions"]["Row"] & {
  employee?: { id: string; name?: string | null; email?: string | null; department_id?: string | null };
  product?: { id: string; name?: string | null };
  department?: { id: string; name?: string | null };
  employee_name?: string | null;
  employee_email?: string | null;
  product_name?: string | null;
  department_name?: string | null;
};

const mapContributionRow = (row: ContributionJoinRow): ContributionWithRelations => ({
  id: row.id,
  employeeId: row.employee_id,
  productId: row.product_id,
  departmentId: row.department_id,
  contributionPercent: row.contribution_percent,
  status: row.status,
  rejectionComment: row.rejection_comment,
  managerId: row.manager_id,
  directorId: row.director_id,
  ceoId: row.ceo_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  employeeName: row.employee?.name ?? row.employee_name ?? null,
  employeeEmail: row.employee?.email ?? row.employee_email ?? null,
  productName: row.product?.name ?? row.product_name ?? null,
  departmentName: row.department?.name ?? row.department_name ?? null,
});

export async function createContributions(
  employeeId: string,
  payload: Array<{
    productId: string;
    departmentId: string;
    contributionPercent: number;
  }>
) {
  try {
    const rows: ContributionInsert[] = payload.map((entry) => ({
      employee_id: employeeId,
      product_id: entry.productId,
      department_id: entry.departmentId,
      contribution_percent: entry.contributionPercent,
      status: "submitted_to_manager",
    }));

    const { data, error } = await client
      .from("employee_contributions")
      .insert(rows as ContributionInsert[])
      .select(
        `
          *,
          employee:users!employee_contributions_employee_id_fkey ( id, name, email ),
          product:products ( id, name ),
          department:departments ( id, name )
        `
      );

    if (error) {
      console.error("[supabase] createContributions error", error);
      throw error;
    }

    const typedData = (data ?? []) as ContributionJoinRow[];
    return typedData.map(mapContributionRow);
  } catch (error) {
    console.error("[supabase] createContributions exception", error);
    throw error;
  }
}

export async function fetchContributionsByRole(params: {
  role: UserRole;
  userId: string;
  productId?: string | null;
  departmentId?: string | null;
}) {
  try {
    const baseSelect = `
      *,
      employee:users!employee_contributions_employee_id_fkey ( id, name, email, department_id ),
      product:products ( id, name ),
      department:departments ( id, name )
    `;

    let query = client.from("employee_contributions").select(baseSelect);

    if (params.role === "employee") {
      query = query.eq("employee_id", params.userId);
    } else if (params.role === "manager") {
      query = query.eq("department_id", params.departmentId ?? "");
    } else if (params.role === "director") {
      query = query.eq("product_id", params.productId ?? "");
    }
    // CEO role: no filter, see all contributions

    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) {
      console.error("[supabase] fetchContributionsByRole error", error);
      // Return empty array instead of throwing - allows app to continue
      return [];
    }

    const typedData = (data ?? []) as ContributionJoinRow[];
    return typedData.map(mapContributionRow);
  } catch (error) {
    console.error("[supabase] fetchContributionsByRole exception", error);
    return [];
  }
}

export async function updateContributionStatus(contributionId: string, status: ContributionStatus, actorId: string) {
  try {
    const payload: ContributionUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "approved_by_manager" || status === "rejected_by_manager") {
      payload.manager_id = actorId;
    }
    if (status === "approved_by_director" || status === "rejected_by_director") {
      payload.director_id = actorId;
    }
    if (status === "approved_by_ceo" || status === "overridden_by_ceo") {
      payload.ceo_id = actorId;
    }

    const { data, error } = await client
      .from("employee_contributions")
      .update(payload as ContributionUpdate)
      .eq("id", contributionId)
      .select(
        `
          *,
          employee:users!employee_contributions_employee_id_fkey ( id, name, email ),
          product:products ( id, name ),
          department:departments ( id, name )
        `
      )
      .maybeSingle();

    if (error) {
      console.error("[supabase] updateContributionStatus error", error);
      throw error;
    }

    if (!data) {
      throw new Error("Contribution not found");
    }

    return mapContributionRow(data as ContributionJoinRow);
  } catch (error) {
    console.error("[supabase] updateContributionStatus exception", error);
    throw error;
  }
}

export async function rejectContribution(
  contributionId: string,
  rejectionComment: string,
  status: Extract<ContributionStatus, "rejected_by_manager" | "rejected_by_director">,
  actorId: string
) {
  try {
    const payload: ContributionUpdate = {
      status,
      rejection_comment: rejectionComment,
      updated_at: new Date().toISOString(),
    };

    if (status === "rejected_by_manager") {
      payload.manager_id = actorId;
    } else if (status === "rejected_by_director") {
      payload.director_id = actorId;
    }

    const { data, error } = await client
      .from("employee_contributions")
      .update(payload as ContributionUpdate)
      .eq("id", contributionId)
      .select(
        `
          *,
          employee:users!employee_contributions_employee_id_fkey ( id, name, email ),
          product:products ( id, name ),
          department:departments ( id, name )
        `
      )
      .maybeSingle();

    if (error) {
      console.error("[supabase] rejectContribution error", error);
      throw error;
    }

    if (!data) {
      throw new Error("Contribution not found");
    }

    return mapContributionRow(data as ContributionJoinRow);
  } catch (error) {
    console.error("[supabase] rejectContribution exception", error);
    throw error;
  }
}

export async function fetchTopContributors(limit = 5) {
  try {
    const { data, error } = await client.rpc("get_top_contributors", { limit_count: limit });

    if (error) {
      console.error("[supabase] get_top_contributors error", error);
      // Return empty array instead of throwing - allows app to continue
      return [];
    }

    const rows = (data ?? []) as ContributionRpcRow[];
    return rows.map((row) => ({
      userId: row.user_id,
      name: row.contributor_name,
      totalPercent: row.contribution_total,
      contributionCount: row.contribution_count,
    }));
  } catch (error) {
    console.error("[supabase] get_top_contributors exception", error);
    return [];
  }
}

