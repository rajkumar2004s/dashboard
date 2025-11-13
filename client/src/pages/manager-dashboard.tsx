import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle, PlusCircle, Users, XCircle } from "lucide-react";
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
  fetchContributionsByRole,
  rejectContribution,
  updateContributionStatus,
} from "@/services/contributionService";
import { fetchUsersByScope } from "@/services/userService";
import { createManagedUser } from "@/services/managementService";
import { queryClient } from "@/lib/queryClient";
import type { ContributionWithRelations, UserProfile } from "@/types/domain";

interface RejectionState {
  [contributionId: string]: string;
}

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const [rejectionComments, setRejectionComments] = useState<RejectionState>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  const isManager = profile?.role === "manager";

  const {
    data: contributions = [],
    isLoading: contributionsLoading,
  } = useQuery({
    queryKey: ["contributions", "manager", profile?.departmentId ?? undefined],
    queryFn: () =>
      fetchContributionsByRole({
        role: "manager",
        userId: profile!.id,
        departmentId: profile!.departmentId ?? undefined,
      }),
    enabled: Boolean(profile?.id && profile?.departmentId && isManager),
  });

  const {
    data: teamMembers = [],
    isLoading: teamLoading,
  } = useQuery({
    queryKey: ["team-members", profile?.departmentId ?? undefined],
    queryFn: () =>
      fetchUsersByScope("manager", {
        departmentId: profile!.departmentId ?? undefined,
        role: "employee",
      }),
    enabled: Boolean(profile?.departmentId && isManager),
  });

  const approveMutation = useMutation({
    mutationFn: (contributionId: string) =>
      updateContributionStatus(contributionId, "approved_by_manager", profile!.id),
    onSuccess: () => {
      toast.success("Contribution approved");
      queryClient.invalidateQueries({ queryKey: ["contributions", "manager", profile?.departmentId] });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to approve contribution");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ contributionId, comment }: { contributionId: string; comment: string }) =>
      rejectContribution(contributionId, comment, "rejected_by_manager", profile!.id),
    onSuccess: () => {
      toast.success("Contribution rejected");
      queryClient.invalidateQueries({ queryKey: ["contributions", "manager", profile?.departmentId] });
      setRejectionComments({});
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to reject contribution");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      return createManagedUser({
        name,
        email,
        role: "employee",
        productId: profile?.productId ?? null,
        departmentId: profile?.departmentId ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Employee invitation sent.");
      setInviteEmail("");
      setInviteName("");
      queryClient.invalidateQueries({ queryKey: ["team-members", profile?.departmentId] });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Unable to invite employee.");
    },
  });

  const pending = useMemo(
    () => contributions.filter((item) => item.status === "submitted_to_manager"),
    [contributions]
  );
  const approved = useMemo(
    () =>
      contributions.filter((item) =>
        ["approved_by_manager", "approved_by_director", "approved_by_ceo", "overridden_by_ceo"].includes(item.status)
      ),
    [contributions]
  );
  const rejected = useMemo(
    () => contributions.filter((item) => item.status === "rejected_by_manager"),
    [contributions]
  );

  const handleApprove = (contributionId: string) => {
    approveMutation.mutate(contributionId);
  };

  const handleReject = (contributionId: string) => {
    const message = rejectionComments[contributionId];
    if (!message?.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    rejectMutation.mutate({ contributionId, comment: message.trim() });
  };

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteEmail || !inviteName) {
      toast.error("Name and email are required.");
      return;
    }
    inviteMutation.mutate({ name: inviteName.trim(), email: inviteEmail.trim().toLowerCase() });
  };

  if (!isManager) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center px-6">
          <Card className="max-w-xl border border-border">
            <CardHeader>
              <CardTitle>Restricted Access</CardTitle>
              <CardDescription>
                Manager permissions are required to view this dashboard. Contact your administrator if you believe this is an error.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (contributionsLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-muted-foreground">Loading manager workspace…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Manager Console</h1>
          <p className="text-sm text-muted-foreground">
            Oversee your department&apos;s contributions, manage team members, and advance submissions to the product director.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <OverviewCard title="Pending Review" value={pending.length} tone="warning" />
          <OverviewCard title="Approved" value={approved.length} tone="success" />
          <OverviewCard title="Rejected" value={rejected.length} tone="danger" />
        </section>

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Contribution Inbox</CardTitle>
              <CardDescription>Review submissions awaiting your approval.</CardDescription>
            </CardHeader>
            <CardContent>
              {contributions.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No contributions are waiting for review. Encourage your team to log their efforts.
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
                            {item.status === "submitted_to_manager" ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-chart-2 text-white hover:bg-chart-2/90"
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
                                  placeholder="Provide rejection reason"
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
                                {item.rejectionComment ?? "Awaiting next reviewer"}
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
                  <Users className="h-4 w-4" />
                  Team Directory
                </CardTitle>
                <CardDescription>Employees currently assigned to your department.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    No employees found. Invite team members to populate your roster.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {teamMembers.map((member: UserProfile) => (
                      <li key={member.id} className="rounded-md border border-border/60 px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
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
                  Invite Employee
                </CardTitle>
                <CardDescription>Send an invite to add a new employee to your department.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleInvite}>
                  <div className="space-y-2">
                    <Label htmlFor="invite-name">Full Name</Label>
                    <Input
                      id="invite-name"
                      placeholder="Employee name"
                      value={inviteName}
                      onChange={(event) => setInviteName(event.target.value)}
                      disabled={inviteMutation.isPending}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="employee@nxtwave.com"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      disabled={inviteMutation.isPending}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? "Sending invite..." : "Send Invitation"}
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

function OverviewCard({
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
    success: "bg-chart-2/15 text-chart-2",
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
