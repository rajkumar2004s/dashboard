import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Legend 
} from 'chart.js';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';
import type { ContributionWithDetails } from '@shared/schema';

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

// Get chart colors from CSS variables
const getChartColors = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    chart1: `hsl(${style.getPropertyValue('--chart-1')})`,
    chart2: `hsl(${style.getPropertyValue('--chart-2')})`,
    chart3: `hsl(${style.getPropertyValue('--chart-3')})`,
    chart4: `hsl(${style.getPropertyValue('--chart-4')})`,
    chart5: `hsl(${style.getPropertyValue('--chart-5')})`,
  };
};

export default function CeoDashboard() {
  const { data: contributions = [], isLoading } = useQuery<ContributionWithDetails[]>({
    queryKey: ['/api/contributions/all'],
  });

  const colors = getChartColors();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const totalContributions = contributions.length;
  const pendingApprovals = contributions.filter(c => 
    c.status === 'submitted_to_manager' || c.status === 'approved_by_manager'
  ).length;
  const fullyApproved = contributions.filter(c => c.status === 'approved_by_director').length;
  const rejected = contributions.filter(c => 
    c.status === 'rejected_by_manager' || c.status === 'rejected_by_director'
  ).length;

  const productContributions = contributions.reduce((acc, c) => {
    const product = c.productName || c.productId;
    acc[product] = (acc[product] || 0) + c.contributionPercent;
    return acc;
  }, {} as Record<string, number>);

  const departmentContributions = contributions.reduce((acc, c) => {
    const dept = c.departmentName || c.departmentId;
    acc[dept] = (acc[dept] || 0) + c.contributionPercent;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = {
    'Submitted': contributions.filter(c => c.status === 'submitted_to_manager').length,
    'Manager Approved': contributions.filter(c => c.status === 'approved_by_manager').length,
    'Director Approved': contributions.filter(c => c.status === 'approved_by_director').length,
    'Rejected': rejected,
  };

  const productPieData = {
    labels: Object.keys(productContributions),
    datasets: [{
      data: Object.values(productContributions),
      backgroundColor: [colors.chart1, colors.chart2, colors.chart4],
      borderWidth: 0,
    }],
  };

  const departmentBarData = {
    labels: Object.keys(departmentContributions),
    datasets: [{
      label: 'Total Contribution %',
      data: Object.values(departmentContributions),
      backgroundColor: colors.chart3,
      borderWidth: 0,
    }],
  };

  const statusDoughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: [colors.chart1, colors.chart2, colors.chart3, colors.chart5],
      borderWidth: 0,
    }],
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Contributions Submitted',
      data: [12, 19, 15, 25, 22, 30],
      borderColor: colors.chart1,
      backgroundColor: colors.chart1,
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
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

  const employeeStats = contributions.reduce((acc, c) => {
    const employee = c.employeeName || c.employeeId;
    if (!acc[employee]) {
      acc[employee] = { name: employee, total: 0, count: 0 };
    }
    acc[employee].total += c.contributionPercent;
    acc[employee].count += 1;
    return acc;
  }, {} as Record<string, { name: string; total: number; count: number }>);

  const topContributors = Object.values(employeeStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">CEO Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of contribution tracking and approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Contributions</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono" data-testid="text-total-contributions">
                {totalContributions}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Approvals</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono text-chart-1" data-testid="text-pending-approvals">
                {pendingApprovals}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fully Approved</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono text-chart-2" data-testid="text-approved">
                {fullyApproved}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono text-destructive" data-testid="text-rejected">
                {rejected}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">Product-wise Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Pie data={productPieData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={departmentBarData} options={barOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">Approval Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut data={statusDoughnutData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={monthlyData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Contributors</CardTitle>
            <CardDescription>Employees with highest total contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-sm uppercase tracking-wide">Rank</TableHead>
                    <TableHead className="font-semibold text-sm uppercase tracking-wide">Employee</TableHead>
                    <TableHead className="font-semibold text-sm uppercase tracking-wide">Total Contribution</TableHead>
                    <TableHead className="font-semibold text-sm uppercase tracking-wide">Submissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topContributors.map((contributor, index) => (
                    <TableRow key={contributor.name} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                      <TableCell className="font-semibold">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-contributor-${index}`}>
                        {contributor.name}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">{contributor.total}%</TableCell>
                      <TableCell>{contributor.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
