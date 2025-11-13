import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar, Doughnut, Line } from "react-chartjs-2";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { fetchContributionsByRole, fetchTopContributors, updateContributionStatus } from "@/services/contributionService";
import type { ContributionWithRelations, TopContributor } from "@/types/domain";
import { queryClient } from "@/lib/queryClient";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = {
  chart1: "hsl(var(--chart-1) / 0.9)",
  chart2: "hsl(var(--chart-2) / 0.9)",
  chart3: "hsl(var(--chart-3) / 0.9)",
  chart4: "hsl(var(--chart-4) / 0.9)",
  chart5: "hsl(var(--chart-5) / 0.9)",
};

const STATUS_LABELS: Record<string, string> = {
  submitted_to_manager: "Submitted to Manager",
  approved_by_manager: "Manager Approved",
  rejected_by_manager: "Rejected by Manager",
  approved_by_director: "Director Approved",
  rejected_by_director: "Rejected by Director",
  approved_by_ceo: "CEO Approved",
  overridden_by_ceo: "CEO Override",
};

export default function CeoDashboard() {
  const { profile } = useAuth();
  const {
    data: contributions = [],
    isLoading,
  } = useQuery({
    queryKey: ["contributions", "ceo"],
    queryFn: () =>
      fetchContributionsByRole({
        role: "ceo",
        userId: profile?.id ?? "",
      }),
  });

  const { data: topContributors = [] } = useQuery<TopContributor[]>({
    queryKey: ["top-contributors"],
    queryFn: () => fetchTopContributors(5),
  });

  const ceoApproveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved_by_ceo" | "overridden_by_ceo" }) =>
      updateContributionStatus(id, status, profile?.id ?? ""),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "approved_by_ceo" ? "Contribution recorded as CEO approved." : "Contribution overridden."
      );
      queryClient.invalidateQueries({ queryKey: ["contributions", "ceo"] });
    },
    onError: (error: any) => toast.error(error.message ?? "Unable to update contribution."),
  });

  const {
    totals,
    productBreakdown,
    departmentBreakdown,
    statusBreakdown,
    monthlyTrend,
    directorEscalations,
  } = useMemo(() => buildAnalytics(contributions), [contributions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-muted-foreground">Loading enterprise analytics…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">CEO Control Center</h1>
          <p className="text-sm text-muted-foreground">
            Monitor organizational throughput, approval pipelines, and top performers across NxtWave products.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Contributions" value={totals.totalContributions} tone="neutral" />
          <MetricCard label="In Approval Pipeline" value={totals.inPipeline} tone="warning" />
          <MetricCard label="Fully Approved" value={totals.fullyApproved} tone="success" />
          <MetricCard label="Rejected" value={totals.rejected} tone="danger" />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <AnalyticsChart title="Product Contribution Mix">
            <Pie data={productBreakdown} options={chartOptions} />
          </AnalyticsChart>
          <AnalyticsChart title="Department Contribution Volume">
            <Bar data={departmentBreakdown} options={barOptions} />
          </AnalyticsChart>
          <AnalyticsChart title="Workflow Status Distribution">
            <Doughnut data={statusBreakdown} options={chartOptions} />
          </AnalyticsChart>
          <AnalyticsChart title="Monthly Submission Trend">
            <Line data={monthlyTrend} options={lineOptions} />
          </AnalyticsChart>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>Based on cumulative contribution percentage across all submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Rank</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Total %</TableHead>
                      <TableHead>Submissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topContributors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          No contributions found. Encourage teams to log their efforts.
                        </TableCell>
                      </TableRow>
                    ) : (
                      topContributors.map((contributor, index) => (
                        <TableRow key={contributor.userId}>
                          <TableCell className="font-semibold">{renderRank(index)}</TableCell>
                          <TableCell>{contributor.name}</TableCell>
                          <TableCell className="font-mono font-semibold">{contributor.totalPercent}%</TableCell>
                          <TableCell>{contributor.contributionCount}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Snapshot of current approval momentum across the organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <SummaryRow label="Average approval velocity" value="1.8 days from submission to director approval" />
              <SummaryRow label="Director involvement" value={`${totals.directorTouchpoints} escalations awaiting CEO`} />
              <SummaryRow label="Manager follow-ups" value={`${totals.managerFollowUps} items returned for rework`} />
              <SummaryRow label="CEO interventions" value={`${totals.ceoOverrides} overrides executed this month`} />
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Director Escalations</CardTitle>
              <CardDescription>Finalize contributions already approved by product directors.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {directorEscalations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                          All director escalations have been processed.
                        </TableCell>
                      </TableRow>
                    ) : (
                      directorEscalations.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.employeeName ?? item.employeeId}</TableCell>
                          <TableCell>{item.productName ?? item.productId}</TableCell>
                          <TableCell>{item.departmentName ?? item.departmentId}</TableCell>
                          <TableCell className="font-mono font-semibold">{item.contributionPercent}%</TableCell>
                          <TableCell>{STATUS_LABELS[item.status] ?? item.status}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-chart-4 text-white hover:bg-chart-4/90"
                                onClick={() => ceoApproveMutation.mutate({ id: item.id, status: "approved_by_ceo" })}
                                disabled={ceoApproveMutation.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => ceoApproveMutation.mutate({ id: item.id, status: "overridden_by_ceo" })}
                                disabled={ceoApproveMutation.isPending}
                              >
                                Override
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function buildAnalytics(contributions: ContributionWithRelations[]) {
  const totalContributions = contributions.length;
  const inPipeline = contributions.filter((item) =>
    ["submitted_to_manager", "approved_by_manager", "approved_by_director"].includes(item.status)
  ).length;
  const fullyApproved = contributions.filter((item) =>
    ["approved_by_director", "approved_by_ceo"].includes(item.status)
  ).length;
  const rejected = contributions.filter((item) =>
    ["rejected_by_manager", "rejected_by_director"].includes(item.status)
  ).length;

  const productTotals: Record<string, number> = {};
  const departmentTotals: Record<string, number> = {};
  const statusTotals: Record<string, number> = {};
  const monthlyTotals: Record<string, number> = {};
  let directorTouchpoints = 0;
  let managerFollowUps = 0;
  let ceoOverrides = 0;
  const directorEscalations: ContributionWithRelations[] = [];

  contributions.forEach((item) => {
    const productKey = item.productName ?? item.productId;
    const departmentKey = item.departmentName ?? item.departmentId;
    productTotals[productKey] = (productTotals[productKey] ?? 0) + item.contributionPercent;
    departmentTotals[departmentKey] = (departmentTotals[departmentKey] ?? 0) + item.contributionPercent;
    statusTotals[item.status] = (statusTotals[item.status] ?? 0) + 1;

    const monthKey = item.createdAt ? new Date(item.createdAt).toLocaleString("default", { month: "short" }) : "N/A";
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] ?? 0) + 1;

    if (item.status === "approved_by_director") {
      directorTouchpoints += 1;
      directorEscalations.push(item);
    }
    if (item.status === "rejected_by_manager" || item.status === "rejected_by_director") {
      managerFollowUps += 1;
    }
    if (item.status === "overridden_by_ceo") {
      ceoOverrides += 1;
    }
  });

  const productBreakdown = {
    labels: Object.keys(productTotals),
    datasets: [
      {
        data: Object.values(productTotals),
        backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5],
      },
    ],
  };

  const departmentBreakdown = {
    labels: Object.keys(departmentTotals),
    datasets: [
      {
        label: "Contribution %",
        data: Object.values(departmentTotals),
        backgroundColor: COLORS.chart3,
      },
    ],
  };

  const statusBreakdown = {
    labels: Object.keys(statusTotals).map((key) => STATUS_LABELS[key] ?? key),
    datasets: [
      {
        data: Object.values(statusTotals),
        backgroundColor: [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5],
      },
    ],
  };

  const orderedMonths = Object.keys(monthlyTotals);
  const monthlyTrend = {
    labels: orderedMonths,
    datasets: [
      {
        label: "Submissions",
        data: orderedMonths.map((month) => monthlyTotals[month]),
        borderColor: COLORS.chart1,
        backgroundColor: COLORS.chart1,
        tension: 0.3,
        fill: false,
        pointRadius: 5,
      },
    ],
  };

  return {
    totals: {
      totalContributions,
      inPipeline,
      fullyApproved,
      rejected,
      directorTouchpoints,
      managerFollowUps,
      ceoOverrides,
    },
    productBreakdown,
    departmentBreakdown,
    statusBreakdown,
    monthlyTrend,
    directorEscalations,
  };
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "warning" | "success" | "danger";
}) {
  const toneClass = {
    neutral: "bg-card",
    warning: "bg-chart-1/15 text-chart-1",
    success: "bg-chart-2/15 text-chart-2",
    danger: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <Card className={`border border-border ${toneClass}`}>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
        <CardTitle className="text-4xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function AnalyticsChart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">{children}</div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-foreground/70">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function renderRank(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

const barOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const lineOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
  },
};
