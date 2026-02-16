import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCandidates, useJobs, useMoveCandidateStage, useConvertToEmployee, useDeleteCandidate } from '../hooks/useRecruitment';
import type { CandidateStage } from '../types';

const stages: CandidateStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

const stageColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  hired: 'bg-green-500 text-white',
  rejected: 'bg-red-100 text-red-800',
};

export default function CandidatesPage() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';
  
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [selectedStage, setSelectedStage] = useState<CandidateStage | ''>('');
  
  const { data: candidates, isLoading } = useCandidates({
    jobId: selectedJob || undefined,
    stage: selectedStage || undefined,
  });
  const { data: jobs } = useJobs();
  
  const moveStageMutation = useMoveCandidateStage();
  const convertMutation = useConvertToEmployee();
  const deleteMutation = useDeleteCandidate();

  const handleMoveStage = async (id: string, newStage: CandidateStage) => {
    await moveStageMutation.mutateAsync({ id, stage: newStage });
  };

  const handleConvert = async (id: string) => {
    if (window.confirm('Convert this candidate to an employee?')) {
      await convertMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this candidate?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">
            Track and manage job candidates through the hiring pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Jobs</option>
            {jobs?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as CandidateStage | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {stages.map((stage) => {
            const count = candidates?.data?.filter((c) => c.stage === stage).length || 0;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(selectedStage === stage ? '' : stage)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedStage === stage
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : ''
                } ${stageColors[stage]}`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs capitalize">{stage}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
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
              ) : !candidates?.data || candidates.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No candidates found
                  </td>
                </tr>
              ) : (
                candidates.data.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {candidate.firstName[0]}{candidate.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                          {candidate.phone && (
                            <div className="text-xs text-gray-400">{candidate.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.job?.title}
                      {candidate.job?.department && (
                        <p className="text-xs text-gray-500">{candidate.job.department.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={candidate.stage}
                        onChange={(e) => handleMoveStage(candidate.id, e.target.value as CandidateStage)}
                        className={`text-xs font-medium rounded px-2 py-1 border-0 ${stageColors[candidate.stage]}`}
                        disabled={moveStageMutation.isPending}
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {candidate.source || 'Direct'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(candidate.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {candidate.stage === 'hired' && (
                        <button
                          onClick={() => handleConvert(candidate.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={convertMutation.isPending}
                        >
                          Convert to Employee
                        </button>
                      )}
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Resume
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
