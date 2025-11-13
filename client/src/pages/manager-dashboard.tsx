import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { ContributionWithDetails } from '@shared/schema';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [rejectionComments, setRejectionComments] = useState<{ [key: string]: string }>({});

  const { data: contributions = [], isLoading } = useQuery<ContributionWithDetails[]>({
    queryKey: ['/api/contributions/manager', user?.id],
    enabled: !!user?.id,
  });

  const approveMutation = useMutation({
    mutationFn: (contributionId: string) =>
      apiRequest('PATCH', `/api/contributions/${contributionId}/approve`, { approver: 'manager' }),
    onSuccess: () => {
      toast.success('Contribution approved!');
      queryClient.invalidateQueries({ queryKey: ['/api/contributions/manager'] });
    },
    onError: () => {
      toast.error('Failed to approve contribution');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ contributionId, comment }: { contributionId: string; comment: string }) =>
      apiRequest('PATCH', `/api/contributions/${contributionId}/reject`, { 
        approver: 'manager',
        comment 
      }),
    onSuccess: () => {
      toast.success('Contribution rejected');
      queryClient.invalidateQueries({ queryKey: ['/api/contributions/manager'] });
      setRejectionComments({});
    },
    onError: () => {
      toast.error('Failed to reject contribution');
    },
  });

  const handleApprove = (contributionId: string) => {
    approveMutation.mutate(contributionId);
  };

  const handleReject = (contributionId: string) => {
    const comment = rejectionComments[contributionId];
    if (!comment?.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({ contributionId, comment });
  };

  const pendingContributions = contributions.filter(c => c.status === 'submitted_to_manager');
  const approvedContributions = contributions.filter(c => c.status === 'approved_by_manager' || c.status === 'approved_by_director');
  const rejectedContributions = contributions.filter(c => c.status === 'rejected_by_manager');


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Review and approve employee contributions from your department</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono" data-testid="text-pending-count">{pendingContributions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono" data-testid="text-approved-count">{approvedContributions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl font-semibold font-mono" data-testid="text-rejected-count">{rejectedContributions.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Contribution Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {contributions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No contributions to review
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-sm uppercase tracking-wide">Employee</TableHead>
                      <TableHead className="font-semibold text-sm uppercase tracking-wide">Product</TableHead>
                      <TableHead className="font-semibold text-sm uppercase tracking-wide">Department</TableHead>
                      <TableHead className="font-semibold text-sm uppercase tracking-wide">Contribution</TableHead>
                      <TableHead className="font-semibold text-sm uppercase tracking-wide">Status</TableHead>
                      <TableHead className="font-semibold text-sm uppercase tracking-wide">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contribution, index) => (
                      <TableRow key={contribution.id} className={index % 2 === 1 ? 'bg-muted/20' : ''}>
                        <TableCell className="font-medium" data-testid={`text-employee-${contribution.id}`}>
                          {contribution.employeeName || 'Unknown'}
                        </TableCell>
                        <TableCell>{contribution.productName || contribution.productId}</TableCell>
                        <TableCell>{contribution.departmentName || contribution.departmentId}</TableCell>
                        <TableCell className="font-mono font-semibold">{contribution.contributionPercent}%</TableCell>
                        <TableCell data-testid={`badge-status-${contribution.id}`}>
                          <StatusBadge status={contribution.status} />
                        </TableCell>
                        <TableCell>
                          {contribution.status === 'submitted_to_manager' ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-chart-2 hover:bg-chart-2/90 text-white border-0"
                                  onClick={() => handleApprove(contribution.id)}
                                  disabled={approveMutation.isPending}
                                  data-testid={`button-approve-${contribution.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(contribution.id)}
                                  disabled={rejectMutation.isPending}
                                  data-testid={`button-reject-${contribution.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Reason for rejection (optional)"
                                value={rejectionComments[contribution.id] || ''}
                                onChange={(e) => setRejectionComments(prev => ({
                                  ...prev,
                                  [contribution.id]: e.target.value
                                }))}
                                className="text-sm min-h-[60px]"
                                data-testid={`textarea-comment-${contribution.id}`}
                              />
                            </div>
                          ) : contribution.status === 'rejected_by_manager' && contribution.rejectionComment ? (
                            <div className="text-sm text-muted-foreground italic">
                              {contribution.rejectionComment}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
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
      </div>
    </div>
  );
}
