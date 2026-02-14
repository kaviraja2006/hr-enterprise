import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { ExecutiveSummary } from '../types';

interface ExecutiveChartsProps {
  data: ExecutiveSummary;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface ChartDataItem {
  name: string;
  value: number;
}

interface LabelProps {
  name: string;
  percent: number;
}

const renderCustomLabel = ({ name, percent }: LabelProps): string =>
  `${name} (${(percent * 100).toFixed(0)}%)`;

export function ExecutiveCharts({ data }: ExecutiveChartsProps) {
  // Handle both old and new backend response formats
  const departments = Array.isArray(data.departments) ? data.departments : [];
  const departmentData: ChartDataItem[] = departments.map((dept) => ({
    name: dept.name,
    value: dept.employeeCount,
  }));

  // Backend returns attendance with different field names
  const attendance = data.attendance || {};
  const attendanceData: ChartDataItem[] = [
    { name: 'Present', value: attendance.presentToday ?? attendance.present ?? 0 },
    { name: 'Absent', value: attendance.absentToday ?? attendance.absent ?? 0 },
    { name: 'Late', value: attendance.lateToday ?? attendance.late ?? 0 },
    { name: 'On Leave', value: attendance.onLeaveToday ?? attendance.onLeave ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Department Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={departmentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {departmentData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Attendance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attendanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="#10B981" />
              <Cell fill="#EF4444" />
              <Cell fill="#F59E0B" />
              <Cell fill="#3B82F6" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}