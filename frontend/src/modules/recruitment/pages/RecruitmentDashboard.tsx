import { Link } from 'react-router-dom';
import { useJobs, useCandidates, useRecruitmentStats, useRecruitmentSummary } from '../hooks/useRecruitment';
import { Badge } from '../../../shared/components/ui/Badge';

const stageColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  hired: 'bg-green-500 text-white',
  rejected: 'bg-red-100 text-red-800',
};

export default function RecruitmentDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useJobs({ status: 'open' });
  const { data: candidates, isLoading: candidatesLoading } = useCandidates({ limit: 5 });
  const { data: stats, isLoading: statsLoading } = useRecruitmentStats();
  const { data: summary } = useRecruitmentSummary();

  const getJobStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
      open: 'success',
      draft: 'warning',
      closed: 'default',
      archived: 'danger',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track hiring pipeline and candidate status
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/recruitment/jobs">
            <Badge variant="primary" className="cursor-pointer">
              Manage Jobs
            </Badge>
          </Link>
          <Link to="/recruitment/candidates">
            <Badge variant="success" className="cursor-pointer">
              View Candidates
            </Badge>
          </Link>
        </div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.openJobs || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCandidates || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.newCandidatesThisMonth || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hired This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.hiredThisMonth || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pipeline Overview */}
      {summary?.candidatesByStage && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiring Pipeline</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {Object.entries(summary.candidatesByStage).map(([stage, count]) => (
              <div key={stage} className="text-center">
                <div className={`${stageColors[stage]} rounded-lg p-4 mb-2`}>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <p className="text-sm text-gray-600 capitalize">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Open Positions</h2>
            <Link to="/recruitment/jobs" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {jobsLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : !jobs || jobs.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No open positions</div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">
                        {job.department?.name || 'No Department'} • {job.location || 'Remote'}
                      </p>
                    </div>
                    <Badge variant={getJobStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{job.candidateCount || 0} candidates</span>
                    <span>{job.openings} openings</span>
                    {job.postedAt && (
                      <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Candidates</h2>
            <Link to="/recruitment/candidates" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {candidatesLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : !candidates?.data || candidates.data.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No candidates yet</div>
            ) : (
              candidates.data.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {candidate.firstName[0]}{candidate.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {candidate.job?.title} • {candidate.source || 'Direct'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${stageColors[candidate.stage]}`}>
                      {candidate.stage}
                    </span>
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
