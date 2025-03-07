import React, { useState, useMemo } from 'react';
import { useLeads } from '../../contexts/LeadContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Dashboard() {
  const { leads } = useLeads();
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const filteredLeads = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate, endDate;
    
    switch (dateRange) {
      case 'today':
        startDate = today;
        endDate = now;
        break;
      case 'yesterday':
        startDate = subDays(today, 1);
        endDate = today;
        break;
      case '15days':
        startDate = subDays(today, 15);
        endDate = now;
        break;
      case '1month':
        startDate = subDays(today, 30);
        endDate = now;
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = parseISO(customStartDate);
          endDate = parseISO(customEndDate);
        }
        break;
      default:
        startDate = today;
        endDate = now;
    }

    return leads.filter(lead => {
      const leadDate = parseISO(lead.date);
      return isWithinInterval(leadDate, { start: startDate, end: endDate });
    });
  }, [leads, dateRange, customStartDate, customEndDate]);

  const stageData = useMemo(() => {
    const stages = {};
    filteredLeads.forEach(lead => {
      stages[lead.stage] = (stages[lead.stage] || 0) + 1;
    });
    return Object.entries(stages).map(([name, value]) => ({ name, value }));
  }, [filteredLeads]);

  const originData = useMemo(() => {
    const origins = {};
    filteredLeads.forEach(lead => {
      origins[lead.origin] = (origins[lead.origin] || 0) + 1;
    });
    return Object.entries(origins).map(([name, value]) => ({ name, value }));
  }, [filteredLeads]);

  const overdueLeads = useMemo(() => {
    const fiveDaysAgo = subDays(new Date(), 5);
    return leads.filter(lead => {
      const lastUpdated = parseISO(lead.lastUpdated);
      return lastUpdated < fiveDaysAgo;
    }).length;
  }, [leads]);

  const downloadReport = () => {
    // Implementation for Excel download will go here
    alert('Download functionality will be implemented with XLSX library');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="15days">Last 15 Days</option>
            <option value="1month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Total Leads</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{filteredLeads.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Overdue Leads</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{overdueLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Conversion Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {filteredLeads.length ? 
              `${((filteredLeads.filter(l => l.stage === 'Admission').length / filteredLeads.length) * 100).toFixed(1)}%` 
              : '0%'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Fresh Leads</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {filteredLeads.filter(l => !l.lastUpdated || parseISO(l.lastUpdated) > subDays(new Date(), 1)).length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Leads by Stage</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Leads by Origin</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {originData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;