import { useState } from 'react';
import { useFilings, useCreateFiling, useFileFiling, useAcknowledgeFiling } from '../hooks/useCompliance';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import type { FilingType, FilingStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

const filingTypes: FilingType[] = ['PF', 'ESI', 'TDS', 'GST', 'PT', 'ITR', 'OTHER'];
const filingStatuses: FilingStatus[] = ['pending', 'filed', 'acknowledged'];

const filingTypeColors: Record<string, string> = {
  PF: 'bg-blue-100 text-blue-800',
  ESI: 'bg-green-100 text-green-800',
  TDS: 'bg-purple-100 text-purple-800',
  GST: 'bg-orange-100 text-orange-800',
  PT: 'bg-yellow-100 text-yellow-800',
  ITR: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function FilingsPage() {
  const { hasPermission } = useAuthContext();
  const [selectedType, setSelectedType] = useState<FilingType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<FilingStatus | ''>('');
  
  const { data: filings, isLoading } = useFilings({
    type: selectedType || undefined,
    status: selectedStatus || undefined,
  });
  
  const createMutation = useCreateFiling();
  const fileMutation = useFileFiling();
  const acknowledgeMutation = useAcknowledgeFiling();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedFilingId, setSelectedFilingId] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState('');
  
  const [newFiling, setNewFiling] = useState({
    type: 'PF' as FilingType,
    period: '',
    amount: undefined as number | undefined,
    dueDate: '',
    notes: '',
  });

  const canManage = hasPermission('compliance:manage');

  const handleCreate = async () => {
    await createMutation.mutateAsync(newFiling);
    setShowCreateModal(false);
    setNewFiling({
      type: 'PF',
      period: '',
      amount: undefined,
      dueDate: '',
      notes: '',
    });
  };

  const handleFile = async () => {
    if (selectedFilingId) {
      await fileMutation.mutateAsync({ id: selectedFilingId, receiptNo });
      setFileModalOpen(false);
      setReceiptNo('');
      setSelectedFilingId(null);
    }
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeMutation.mutateAsync(id);
  };

  const openFileModal = (id: string) => {
    setSelectedFilingId(id);
    setFileModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      acknowledged: 'success',
      filed: 'success',
      pending: 'warning',
    };
    return colors[status] || 'default';
  };

  const isOverdue = (dueDate?: string) => {
    return dueDate ? new Date(dueDate) < new Date() : false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statutory Filings</h1>
          <p className="text-gray-600 mt-1">
            Manage regulatory filings and compliance documentation
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as FilingType | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {filingTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FilingStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {filingStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          {canManage && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Add Filing
            </Button>
          )}
        </div>
      </div>

      {/* Filings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filed By
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
              ) : !filings?.data || filings.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No filings found
                  </td>
                </tr>
              ) : (
                filings.data.map((filing) => (
                  <tr key={filing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${filingTypeColors[filing.type]}`}>
                        {filing.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {filing.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(filing.status)}>
                        {filing.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {filing.dueDate ? (
                        <span className={isOverdue(filing.dueDate) && filing.status === 'pending' ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {new Date(filing.dueDate).toLocaleDateString()}
                          {isOverdue(filing.dueDate) && filing.status === 'pending' && ' (Overdue)'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {filing.amount ? `$${filing.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {filing.filedByUser ? (
                        <div>
                          <p>{filing.filedByUser.firstName} {filing.filedByUser.lastName}</p>
                          {filing.filedAt && (
                            <p className="text-xs text-gray-400">
                              {new Date(filing.filedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {filing.status === 'pending' && canManage && (
                        <button
                          onClick={() => openFileModal(filing.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={fileMutation.isPending}
                        >
                          File
                        </button>
                      )}
                      {filing.status === 'filed' && canManage && (
                        <button
                          onClick={() => handleAcknowledge(filing.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          disabled={acknowledgeMutation.isPending}
                        >
                          Acknowledge
                        </button>
                      )}
                      {filing.receiptNo && (
                        <span className="text-xs text-gray-500">
                          Receipt: {filing.receiptNo}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Filing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newFiling.type}
                  onChange={(e) => setNewFiling({ ...newFiling, type: e.target.value as FilingType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {filingTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <input
                  type="text"
                  value={newFiling.period}
                  onChange={(e) => setNewFiling({ ...newFiling, period: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024-01 or Q1-2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={newFiling.amount || ''}
                  onChange={(e) => setNewFiling({ ...newFiling, amount: Number(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newFiling.dueDate}
                  onChange={(e) => setNewFiling({ ...newFiling, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newFiling.notes}
                  onChange={(e) => setNewFiling({ ...newFiling, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes..."
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
                disabled={!newFiling.period || createMutation.isPending}
              >
                Add Filing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File Modal */}
      {fileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Filing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter receipt/acknowledgment number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setFileModalOpen(false);
                  setReceiptNo('');
                  setSelectedFilingId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleFile}
                disabled={fileMutation.isPending}
              >
                Confirm Filing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
