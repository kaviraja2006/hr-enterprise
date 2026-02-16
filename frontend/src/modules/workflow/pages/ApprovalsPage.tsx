import { useState } from 'react';
import { useApprovals, usePendingApprovals, useApproveStep, useRejectApproval, useApprovalStats } from '../hooks/useWorkflow';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

const entityTypeLabels: Record<string, string> = {
  leave_request: 'Leave Request',
  payroll_run: 'Payroll Run',
  employee_change: 'Employee Change',
  expense: 'Expense',
};

export default function ApprovalsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'my-requests' | 'all'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: pendingApprovals, isLoading: pendingLoading } = usePendingApprovals();
  const { data: myApprovals, isLoading: myLoading } = useApprovals(
    activeTab === 'my-requests' ? { requesterId: user?.id, status: 'pending' } : undefined
  );
  const { data: allApprovals, isLoading: allLoading } = useApprovals(
    activeTab === 'all' ? {} : undefined
  );
  const { data: stats } = useApprovalStats();

  const approveMutation = useApproveStep();
  const rejectMutation = useRejectApproval();

  const getCurrentData = () => {
    switch (activeTab) {
      case 'pending':
        return { data: pendingApprovals, isLoading: pendingLoading };
      case 'my-requests':
        return { data: myApprovals?.data, isLoading: myLoading };
      case 'all':
        return { data: allApprovals?.data, isLoading: allLoading };
      default:
        return { data: [], isLoading: false };
    }
  };

  const { data: approvals, isLoading } = getCurrentData();

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync({ id });
  };

  const handleReject = async () => {
    if (selectedApprovalId && rejectionReason) {
      await rejectMutation.mutateAsync({
        id: selectedApprovalId,
        data: { comments: rejectionReason },
      });
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedApprovalId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedApprovalId(id);
    setRejectModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and manage pending approval requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Pending My Approval</p>
          <p className="text-2xl font-bold text-orange-600">{stats?.pendingForMe || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">My Pending Requests</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.myRequestsPending || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Total Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats?.totalApproved || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Total Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats?.totalRejected || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['pending', 'my-requests', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab === 'pending' && 'Pending My Approval'}
              {tab === 'my-requests' && 'My Requests'}
              {tab === 'all' && 'All Approvals'}
            </button>
          ))}
        </nav>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : !approvals || approvals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No approval requests found
                  </td>
                </tr>
              ) : (
                approvals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entityTypeLabels[approval.entityType] || approval.entityType}
                        </p>
                        <p className="text-xs text-gray-500">ID: {approval.entityId.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs">
                            {approval.requester?.firstName?.[0]}
                            {approval.requester?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {approval.requester?.firstName} {approval.requester?.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(approval.status)}>
                        {approval.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {approval.totalSteps > 1 ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(approval.currentStep / approval.totalSteps) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              Step {approval.currentStep} of {approval.totalSteps}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Single approver</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {approval.status === 'pending' && activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(approval.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            disabled={approveMutation.isPending}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(approval.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={rejectMutation.isPending}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {approval.status !== 'pending' && (
                        <span className="text-gray-400">
                          {approval.approvedAt
                            ? `Completed ${new Date(approval.approvedAt).toLocaleDateString()}`
                            : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Approval Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedApprovalId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason || rejectMutation.isPending}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
