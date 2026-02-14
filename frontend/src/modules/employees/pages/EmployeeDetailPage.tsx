import { useParams, Link } from 'react-router-dom';
import { useEmployee } from '../hooks/useEmployee';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  TERMINATED: 'danger',
  SUSPENDED: 'danger',
};

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading, error } = useEmployee(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading employee details. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/employees" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-600">{employee.employeeCode}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/employees/${employee.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 flex-shrink-0">
            {employee.profilePicture ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={employee.profilePicture}
                alt=""
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium text-2xl">
                  {employee.firstName[0]}
                  {employee.lastName[0]}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusColors[employee.status]}>
                {employee.status.replace('_', ' ')}
              </Badge>
              <Badge variant="info">{employee.employmentType.replace('_', ' ')}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 text-gray-900">{employee.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <span className="ml-2 text-gray-900">{employee.phone || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Department:</span>
                <span className="ml-2 text-gray-900">{employee.department?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Designation:</span>
                <span className="ml-2 text-gray-900">{employee.designation?.title || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Manager:</span>
                <span className="ml-2 text-gray-900">
                  {employee.manager
                    ? `${employee.manager.firstName} ${employee.manager.lastName}`
                    : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Join Date:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(employee.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Emergency Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
          {employee.address ? (
            <div className="text-sm text-gray-600 space-y-1">
              <p>{employee.address.street}</p>
              <p>
                {employee.address.city}, {employee.address.state} {employee.address.zipCode}
              </p>
              <p>{employee.address.country}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No address information available</p>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          {employee.emergencyContact ? (
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Name:</span> {employee.emergencyContact.name}
              </p>
              <p>
                <span className="font-medium">Relationship:</span>{' '}
                {employee.emergencyContact.relationship}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {employee.emergencyContact.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No emergency contact information available</p>
          )}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
        {employee.bankDetails ? (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Bank Name:</span>
              <span className="ml-2 text-gray-900">{employee.bankDetails.bankName}</span>
            </div>
            <div>
              <span className="text-gray-500">Account Number:</span>
              <span className="ml-2 text-gray-900">{employee.bankDetails.accountNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">IFSC Code:</span>
              <span className="ml-2 text-gray-900">{employee.bankDetails.ifscCode}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No bank details available</p>
        )}
      </div>
    </div>
  );
}
