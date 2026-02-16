import { useState } from 'react';
import { useReviews, useCreateReview, useSubmitReview, useAcknowledgeReview } from '../hooks/usePerformance';
import { useEmployees } from '../../employees/hooks/useEmployee';
import type { ReviewStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

const reviewStatuses: ReviewStatus[] = ['draft', 'submitted', 'acknowledged'];

export default function ReviewsPage() {
  const [status, setStatus] = useState<ReviewStatus | ''>('');
  const { data: reviews, isLoading } = useReviews(status ? { status } : {});
  const { data: employees } = useEmployees({ limit: 100 });
  
  const createMutation = useCreateReview();
  const submitMutation = useSubmitReview();
  const acknowledgeMutation = useAcknowledgeReview();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReview, setNewReview] = useState({
    employeeId: '',
    reviewerId: '',
    reviewPeriod: '',
    rating: 3,
    comments: '',
    strengths: '',
    improvements: '',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(newReview);
    setShowCreateModal(false);
    setNewReview({
      employeeId: '',
      reviewerId: '',
      reviewPeriod: '',
      rating: 3,
      comments: '',
      strengths: '',
      improvements: '',
    });
  };

  const handleSubmit = async (id: string) => {
    await submitMutation.mutateAsync(id);
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeMutation.mutateAsync(id);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      acknowledged: 'success',
      submitted: 'success',
      draft: 'warning',
    };
    return colors[status] || 'default';
  };

  const renderStars = (rating: number) => {
    return (
      <span className="text-yellow-500">
        {'★'.repeat(Math.round(rating))}
        {'☆'.repeat(5 - Math.round(rating))}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-600 mt-1">
            Manage performance review cycles and evaluations
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReviewStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {reviewStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            New Review
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : !reviews?.data || reviews.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.data.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {review.employee?.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={review.employee.profilePicture}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {review.employee?.firstName?.[0]}
                                {review.employee?.lastName?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {review.employee?.firstName} {review.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{review.employee?.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.reviewPeriod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-gray-600">({review.rating}/5)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.reviewDate
                        ? new Date(review.reviewDate).toLocaleDateString()
                        : new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {review.status === 'draft' && (
                        <button
                          onClick={() => handleSubmit(review.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={submitMutation.isPending}
                        >
                          Submit
                        </button>
                      )}
                      {review.status === 'submitted' && (
                        <button
                          onClick={() => handleAcknowledge(review.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          disabled={acknowledgeMutation.isPending}
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => alert('View details coming soon')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Performance Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={newReview.employeeId}
                  onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  {employees?.data?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer</label>
                <select
                  value={newReview.reviewerId}
                  onChange={(e) => setNewReview({ ...newReview, reviewerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Reviewer</option>
                  {employees?.data?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Period</label>
                <input
                  type="text"
                  value={newReview.reviewPeriod}
                  onChange={(e) => setNewReview({ ...newReview, reviewPeriod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1-2024 or 2024-Annual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating: {newReview.rating}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="text-2xl mt-1">{renderStars(newReview.rating)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={newReview.comments}
                  onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Overall comments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                <textarea
                  value={newReview.strengths}
                  onChange={(e) => setNewReview({ ...newReview, strengths: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Employee strengths..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas for Improvement</label>
                <textarea
                  value={newReview.improvements}
                  onChange={(e) => setNewReview({ ...newReview, improvements: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Areas to improve..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!newReview.employeeId || !newReview.reviewerId || !newReview.reviewPeriod || createMutation.isPending}
              >
                Create Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
