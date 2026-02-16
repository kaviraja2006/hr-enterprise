import { Link } from 'react-router-dom';
import { useGoals, useReviews, usePerformanceStats } from '../hooks/usePerformance';
import { Badge } from '../../../shared/components/ui/Badge';

export default function PerformanceDashboard() {
  const { data: goals, isLoading: goalsLoading } = useGoals({ status: 'in-progress' });
  const { data: reviews, isLoading: reviewsLoading } = useReviews({ status: 'draft' });
  const { data: stats, isLoading: statsLoading } = usePerformanceStats();

  const getGoalStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
      completed: 'success',
      'in-progress': 'warning',
      pending: 'default',
      cancelled: 'danger',
    };
    return colors[status] || 'default';
  };

  const getReviewStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      acknowledged: 'success',
      submitted: 'success',
      draft: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track employee goals and performance reviews
          </p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalGoals || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedGoals || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.averageRating ? stats.averageRating.toFixed(1) : '-'}/5
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingReviews || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Active Goals</h2>
            <Link to="/performance/goals" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {goalsLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : !goals?.data || goals.data.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No active goals</div>
            ) : (
              goals.data.slice(0, 5).map((goal) => (
                <div key={goal.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                      <p className="text-xs text-gray-500">
                        {goal.employee?.firstName} {goal.employee?.lastName}
                      </p>
                    </div>
                    <Badge variant={getGoalStatusColor(goal.status)}>
                      {goal.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((goal.achievedValue / goal.targetValue) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min((goal.achievedValue / goal.targetValue) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
            <Link to="/performance/reviews" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {reviewsLoading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : !reviews?.data || reviews.data.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">No pending reviews</div>
            ) : (
              reviews.data.slice(0, 5).map((review) => (
                <div key={review.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {review.employee?.firstName?.[0]}
                          {review.employee?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.employee?.firstName} {review.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{review.reviewPeriod}</p>
                      </div>
                    </div>
                    <Badge variant={getReviewStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                  </div>
                  {review.rating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {'★'.repeat(Math.round(review.rating))}
                        {'☆'.repeat(5 - Math.round(review.rating))}
                      </span>
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
