import { Link } from 'react-router-dom';
import { useComplianceDashboard, useComplianceStats, useUpcomingFilings } from '../hooks/useCompliance';
import { Badge } from '../../../shared/components/ui/Badge';

const filingTypeColors: Record<string, string> = {
  PF: 'bg-blue-100 text-blue-800',
  ESI: 'bg-green-100 text-green-800',
  TDS: 'bg-purple-100 text-purple-800',
  GST: 'bg-orange-100 text-orange-800',
  PT: 'bg-yellow-100 text-yellow-800',
  ITR: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function ComplianceDashboard() {
  const { data: dashboard, isLoading: dashboardLoading } = useComplianceDashboard();
  const { data: stats, isLoading: statsLoading } = useComplianceStats();
  const { data: upcomingFilings } = useUpcomingFilings();

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      acknowledged: 'success',
      filed: 'success',
      pending: 'warning',
    };
    return colors[status] || 'default';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track regulatory filings and policy compliance
          </p>
        </div>
        <Link to="/compliance/filings">
          <Badge variant="primary" className="cursor-pointer">
            Manage Filings →
          </Badge>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Filings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalFilings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingFilings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.filedFilings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.overdueCount || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Filings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Due Dates</h2>
            <Link to="/compliance/filings" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {!upcomingFilings || upcomingFilings.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No upcoming filings</div>
            ) : (
              upcomingFilings.slice(0, 5).map((filing) => (
                <div key={filing.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${filingTypeColors[filing.type]}`}>
                        {filing.type}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{filing.period}</p>
                        {filing.dueDate && (
                          <p className={`text-xs ${isOverdue(filing.dueDate) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            Due: {new Date(filing.dueDate).toLocaleDateString()}
                            {isOverdue(filing.dueDate) && ' (Overdue)'}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(filing.status)}>
                      {filing.status}
                    </Badge>
                  </div>
                  {filing.amount && (
                    <p className="text-sm text-gray-600 mt-2">
                      Amount: ${filing.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Acknowledgements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Policy Acknowledgements</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {dashboardLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : !dashboard?.recentAcknowledgements || dashboard.recentAcknowledgements.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No recent acknowledgements</div>
            ) : (
              dashboard.recentAcknowledgements.slice(0, 5).map((ack) => (
                <div key={ack.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ack.policyName}</p>
                      <p className="text-xs text-gray-500">
                        {ack.employee?.firstName} {ack.employee?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(ack.acknowledgedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
