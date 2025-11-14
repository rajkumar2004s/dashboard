import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle, PlusCircle, ShieldCheck, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchContributionsByRole,
  rejectContribution,
  updateContributionStatus,
} from "@/services/contributionService";
import { fetchUsersByScope } from "@/services/userService";
import { fetchDepartments } from "@/services/catalogService";
import { createManagedUser } from "@/services/managementService";
import { queryClient } from "@/lib/queryClient";
import type { ContributionWithRelations, Department, UserProfile } from "@/types/domain";

export default function DirectorDashboard() {
  const { profile } = useAuth();
  const isDirector = profile?.role === "director";
  const [rejectionComments, setRejectionComments] = useState<Record<string, string>>({});
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [assignedDepartment, setAssignedDepartment] = useState("");

  const {
    data: contributions = [],
    isLoading: contributionsLoading,
  } = useQuery({
    queryKey: ["contributions", "director", profile?.productId ?? undefined],
    queryFn: () =>
      fetchContributionsByRole({
        role: "director",
        userId: profile!.id,
        productId: profile!.productId ?? undefined,
      }),
    enabled: Boolean(profile?.id && profile?.productId && isDirector),
  });

  const {
    data: managers = [],
    isLoading: managersLoading,
  } = useQuery({
    queryKey: ["managers", profile?.productId ?? undefined],
    queryFn: () =>
      fetchUsersByScope("director", {
        productId: profile!.productId ?? undefined,
        role: "manager",
      }),
    enabled: Boolean(profile?.productId && isDirector),
  });

  const {
    data: departmentOptions = [],
    isLoading: departmentsLoading,
  } = useQuery({
    queryKey: ["departments", profile?.productId ?? undefined],
    queryFn: () => fetchDepartments(profile?.productId ?? undefined),
    enabled: Boolean(profile?.productId),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => updateContributionStatus(id, "approved_by_director", profile!.id),
    onSuccess: () => {
      toast.success("Contribution forwarded to CEO");
      queryClient.invalidateQueries({ queryKey: ["contributions", "director", profile?.productId] });
    },
    onError: (error: any) => toast.error(error.message ?? "Approval failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      rejectContribution(id, comment, "rejected_by_director", profile!.id),
    onSuccess: () => {
      toast.success("Contribution rejected and sent back to manager");
      queryClient.invalidateQueries({ queryKey: ["contributions", "director", profile?.productId] });
      setRejectionComments({});
    },
    onError: (error: any) => toast.error(error.message ?? "Rejection failed"),
  });

  const createManagerMutation = useMutation({
    mutationFn: async ({ name, email, departmentId }: { name: string; email: string; departmentId: string }) => {
      return createManagedUser({
        name,
        email,
        role: "manager",
        productId: profile?.productId ?? null,
        departmentId,
      });
    },
    onSuccess: () => {
      toast.success("Manager invitation sent.");
      setManagerName("");
      setManagerEmail("");
      setAssignedDepartment("");
      queryClient.invalidateQueries({ queryKey: ["managers", profile?.productId] });
    },
    onError: (error: any) => toast.error(error.message ?? "Unable to invite manager."),
  });

  const pending = useMemo(
    () => contributions.filter((item) => item.status === "approved_by_manager"),
    [contributions]
  );
  const approved = useMemo(
    () => contributions.filter((item) => item.status === "approved_by_director" || item.status === "approved_by_ceo"),
    [contributions]
  );
  const rejected = useMemo(
    () => contributions.filter((item) => item.status === "rejected_by_director"),
    [contributions]
  );

  const handleApprove = (id: string) => approveMutation.mutate(id);

  const handleReject = (id: string) => {
    const message = rejectionComments[id];
    if (!message?.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    rejectMutation.mutate({ id, comment: message.trim() });
  };

  const handleCreateManager = (event: React.FormEvent) => {
    event.preventDefault();
    if (!managerName || !managerEmail || !assignedDepartment) {
      toast.error("Name, email, and department are required.");
      return;
    }
    createManagerMutation.mutate({
      name: managerName.trim(),
      email: managerEmail.trim().toLowerCase(),
      departmentId: assignedDepartment,
    });
  };

  if (!isDirector) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center px-6">
          <Card className="max-w-xl border border-border">
            <CardHeader>
              <CardTitle>Director Access Required</CardTitle>
              <CardDescription>
                You need director-level permissions to view this console. Reach out to the CEO for escalation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (contributionsLoading || managersLoading || departmentsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-muted-foreground">Preparing director analytics…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Director Console</h1>
          <p className="text-sm text-muted-foreground">
            Approve departmental contributions escalated by managers and curate leadership for your product line.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DirectorOverviewCard title="Awaiting Review" value={pending.length} tone="warning" />
          <DirectorOverviewCard title="Forwarded to CEO" value={approved.length} tone="success" />
          <DirectorOverviewCard title="Sent Back" value={rejected.length} tone="danger" />
        </section>

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Manager Escalations</CardTitle>
              <CardDescription>Approve contributions or return them to the originating manager.</CardDescription>
            </CardHeader>
            <CardContent>
              {contributions.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No submissions pending your review. Great job staying ahead!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Employee</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Contribution</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[220px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.employeeName ?? "Unknown"}</TableCell>
                          <TableCell>{item.productName ?? item.productId}</TableCell>
                          <TableCell>{item.departmentName ?? item.departmentId}</TableCell>
                          <TableCell className="font-mono font-semibold">{item.contributionPercent}%</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>
                            {item.status === "approved_by_manager" ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-chart-3 text-white hover:bg-chart-3/90"
                                    onClick={() => handleApprove(item.id)}
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(item.id)}
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Reason for rejection"
                                  value={rejectionComments[item.id] ?? ""}
                                  onChange={(event) =>
                                    setRejectionComments((prev) => ({
                                      ...prev,
                                      [item.id]: event.target.value,
                                    }))
                                  }
                                  className="min-h-[70px] text-sm"
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {item.rejectionComment ? `Manager notified: ${item.rejectionComment}` : "Processed"}
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Managers in Product
                </CardTitle>
                <CardDescription>Overview of department leads reporting to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {managers.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    No managers are currently assigned. Use the invitation tool below to onboard department leaders.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {managers.map((manager: UserProfile) => (
                      <li key={manager.id} className="rounded-md border border-border/60 px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{manager.name}</p>
                        <p className="text-xs text-muted-foreground">{manager.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Department:{" "}
                          {departmentOptions.find((dept: Department) => dept.id === manager.departmentId)?.name ?? "Unassigned"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Invite Department Manager
                </CardTitle>
                <CardDescription>Assign a department lead within your product line.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateManager}>
                  <div className="space-y-2">
                    <Label htmlFor="manager-name">Full Name</Label>
                    <Input
                      id="manager-name"
                      placeholder="Manager name"
                      value={managerName}
                      onChange={(event) => setManagerName(event.target.value)}
                      disabled={createManagerMutation.isPending}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager-email">Email</Label>
                    <Input
                      id="manager-email"
                      type="email"
                      placeholder="manager@nxtwave.com"
                      value={managerEmail}
                      onChange={(event) => setManagerEmail(event.target.value)}
                      disabled={createManagerMutation.isPending}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={assignedDepartment} onValueChange={setAssignedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((dept: Department) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={createManagerMutation.isPending}>
                    {createManagerMutation.isPending ? "Sending invite..." : "Invite Manager"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectorOverviewCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "warning" | "success" | "danger";
}) {
  const toneClasses = {
    warning: "bg-chart-1/15 text-chart-1",
    success: "bg-chart-3/15 text-chart-3",
    danger: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <Card className={`border border-border ${toneClasses[tone]}`}>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">{title}</CardDescription>
        <CardTitle className="text-4xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
