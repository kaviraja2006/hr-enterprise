import { useState } from 'react';
import { useApprovals, usePendingApprovals, useApproveStep, useRejectApproval, useApprovalStats } from '../hooks/useWorkflow';
import type { Approval } from '../types';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { StatCard, Card } from '../../../shared/components/ui/Card';

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
        return { data: myApprovals, isLoading: myLoading };
      case 'all':
        return { data: allApprovals, isLoading: allLoading };
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
        comments: rejectionReason,
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
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Approvals</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Review and manage pending approval requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard
           title="Pending My Approval"
           value={stats?.pendingForMe || 0}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           trend={stats?.pendingTrend ? {
             value: stats.pendingTrend.value,
             isPositive: stats.pendingTrend.isPositive,
             label: "vs last week"
           } : undefined}
           square
           className="bg-gradient-to-br from-orange-50/50 to-amber-50/50"
        />
        <StatCard
           title="My Pending Requests"
           value={stats?.myRequestsPending || 0}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
           trend={stats?.requestsTrend ? {
             value: stats.requestsTrend.value,
             isPositive: stats.requestsTrend.isPositive,
             label: "vs last week"
           } : undefined}
           square
           className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
        />
        <StatCard
           title="Total Approved"
           value={stats?.totalApproved || 0}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           progress={stats?.approvalRate}
           square
           className="bg-gradient-to-br from-emerald-50/50 to-green-50/50"
        />
        <StatCard
           title="Total Rejected"
           value={stats?.totalRejected || 0}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           progress={stats?.rejectionRate}
           square
           className="bg-gradient-to-br from-rose-50/50 to-pink-50/50"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-12">
          {(['pending', 'my-requests', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-6 px-1 border-b-[3px] font-black text-xs uppercase tracking-[0.3em] transition-all
                ${activeTab === tab
                  ? 'border-primary text-slate-900 drop-shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-100'
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
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Type
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Requester
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Status
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Progress
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Requested
                </th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                       <div className="w-12 h-12 border-[3px] border-slate-100 border-t-primary rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Workflow Nodes...</p>
                    </div>
                  </td>
                </tr>
              ) : !approvals || approvals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Active Telemetry Nodes Found</p>
                  </td>
                </tr>
              ) : (
                approvals.map((approval: Approval) => (
                  <tr key={approval.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer border-b border-slate-100 last:border-none">
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-2 drop-shadow-sm">
                          {entityTypeLabels[approval.entityType] || approval.entityType}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">
                          NODE INDEX: {approval.entityId.slice(0, 8)}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.25rem] bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:scale-110 transition-transform shadow-sm">
                             {approval.requester?.firstName?.[0]}
                             {approval.requester?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-1 drop-shadow-sm">
                            {approval.requester?.firstName} {approval.requester?.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <Badge variant={getStatusColor(approval.status)} className="font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                        {approval.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      {approval.totalSteps > 1 ? (
                        <div className="w-48">
                          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            <span>Step {approval.currentStep} / {approval.totalSteps}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200 p-[1px]">
                            <div
                              className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                              style={{
                                width: `${(approval.currentStep / approval.totalSteps) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Single-Node Protocol</span>
                      )}
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap text-right">
                      {approval.status === 'pending' && activeTab === 'pending' && (
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(approval.id)}
                            className="h-10 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10"
                            disabled={approveMutation.isPending}
                          >
                            Authorize
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openRejectModal(approval.id)}
                            className="h-10 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/10"
                            disabled={rejectMutation.isPending}
                          >
                            Quarantine
                          </Button>
                        </div>
                      )}
                      {approval.status !== 'pending' && (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
                          {approval.approvedAt
                            ? `FINALIZED ${new Date(approval.approvedAt).toLocaleDateString()}`
                            : 'ARCHIVED'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-6 transition-all duration-500">
          <div className="glass-strong rounded-[3rem] p-12 w-full max-w-lg border border-white shadow-2xl gloss-overlay">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-4 drop-shadow-sm">Quarantine Protocol</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">Divert node from primary execution pipeline</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                  REJECTION TELEMETRY LOG
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 text-slate-900 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
                  rows={4}
                  placeholder="Specify critical failure reason..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedApprovalId(null);
                }}
                className="rounded-[1.5rem] h-14 px-8 border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              >
                Abort
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                className="rounded-[1.5rem] h-14 px-8 shadow-2xl shadow-rose-500/10"
                disabled={!rejectionReason || rejectMutation.isPending}
              >
                Confirm Quarantine
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
