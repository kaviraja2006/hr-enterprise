import { useState } from 'react';
import { useAttritionData } from '../hooks/useAnalytics';

export default function AttritionAnalytics() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { data: attrition, isLoading } = useAttritionData(selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attrition Analytics</h1>
          <p className="text-gray-600 mt-1">
            Analyze employee turnover and retention trends
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={currentYear}>{currentYear}</option>
          <option value={currentYear - 1}>{currentYear - 1}</option>
          <option value={currentYear - 2}>{currentYear - 2}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !attrition ? (
        <div className="text-center py-12 text-gray-500">No data available</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Starting Headcount</p>
              <p className="text-3xl font-bold text-gray-900">{attrition.startingHeadcount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">New Hires</p>
              <p className="text-3xl font-bold text-green-600">+{attrition.newHires}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Exits</p>
              <p className="text-3xl font-bold text-red-600">-{attrition.terminations}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Attrition Rate</p>
              <p className="text-3xl font-bold text-blue-600">{attrition.attritionRate}%</p>
            </div>
          </div>

          {/* Exit Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voluntary Exits</h3>
              <p className="text-4xl font-bold text-orange-600">{attrition.voluntaryExits}</p>
              <p className="text-sm text-gray-500 mt-2">Employees who resigned</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Involuntary Exits</h3>
              <p className="text-4xl font-bold text-red-600">{attrition.involuntaryExits}</p>
              <p className="text-sm text-gray-500 mt-2">Terminations and layoffs</p>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attrition Trend</h3>
            <div className="space-y-4">
              {attrition.monthlyData.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(selectedYear, month.month - 1).toLocaleString('default', { month: 'short' })}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {month.hires > 0 && (
                      <div
                        className="h-6 bg-green-500 rounded-l"
                        style={{ width: `${Math.min(month.hires * 5, 150)}px` }}
                        title={`${month.hires} hires`}
                      />
                    )}
                    {month.exits > 0 && (
                      <div
                        className="h-6 bg-red-500 rounded-r"
                        style={{ width: `${Math.min(month.exits * 5, 150)}px` }}
                        title={`${month.exits} exits`}
                      />
                    )}
                    {month.hires === 0 && month.exits === 0 && (
                      <div className="h-6 w-1 bg-gray-200 rounded" />
                    )}
                  </div>
                  <div className="w-32 text-right text-sm">
                    <span className="text-green-600">+{month.hires}</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-red-600">-{month.exits}</span>
                    <span className="text-gray-400 mx-2">=</span>
                    <span className={month.netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {month.netChange > 0 ? '+' : ''}{month.netChange}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Hires</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-600">Exits</span>
              </div>
            </div>
          </div>

          {/* Final Headcount */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">Ending Headcount ({selectedYear})</p>
                <p className="text-blue-600 text-sm">
                  Net change: {attrition.endingHeadcount - attrition.startingHeadcount > 0 ? '+' : ''}
                  {attrition.endingHeadcount - attrition.startingHeadcount} employees
                </p>
              </div>
              <p className="text-4xl font-bold text-blue-900">{attrition.endingHeadcount}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
