import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../contexts/LeadContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, parseISO, isAfter, subDays } from 'date-fns';
import * as XLSX from 'xlsx';

function LeadManagement() {
  const { leads, assignLeads } = useLeads();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    stage: '',
    origin: '',
    course: '',
    assignedTo: ''
  });

  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        // Filter by search term
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          lead.studentName.toLowerCase().includes(searchLower) ||
          lead.phoneNumber.includes(searchTerm) ||
          lead.courseSelected.toLowerCase().includes(searchLower);

        // Filter by stage, origin, course, and assignment
        const matchesStage = !filters.stage || lead.stage === filters.stage;
        const matchesOrigin = !filters.origin || lead.origin === filters.origin;
        const matchesCourse = !filters.course || lead.courseSelected === filters.course;
        const matchesAssignment = !filters.assignedTo || lead.assignedTo === filters.assignedTo;

        // For normal admins, only show their assigned leads
        if (user.role !== 'superadmin') {
          return matchesSearch && 
                 matchesStage && 
                 matchesOrigin && 
                 matchesCourse && 
                 lead.assignedTo === user.username;
        }

        return matchesSearch && 
               matchesStage && 
               matchesOrigin && 
               matchesCourse && 
               matchesAssignment;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [leads, searchTerm, sortConfig, filters, user]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads(current => 
      current.includes(leadId)
        ? current.filter(id => id !== leadId)
        : [...current, leadId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLeads(current => 
      current.length === filteredLeads.length
        ? []
        : filteredLeads.map(lead => lead.id)
    );
  };

  const handleAssignLeads = (adminId) => {
    if (selectedLeads.length === 0) {
      alert('Please select leads to assign');
      return;
    }
    assignLeads(adminId, selectedLeads);
    setSelectedLeads([]);
  };

  const downloadLeads = () => {
    const data = filteredLeads.map(lead => ({
      'Student Name': lead.studentName,
      'Phone Number': lead.phoneNumber,
      'Date': format(parseISO(lead.date), 'PPP'),
      'Course': lead.courseSelected,
      'Stage': lead.stage,
      'Origin': lead.origin,
      'Assigned To': lead.assignedTo,
      'Last Updated': format(parseISO(lead.lastUpdated), 'PPP')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const isOverdue = (lastUpdated) => {
    return isAfter(new Date(), subDays(parseISO(lastUpdated), 5));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Lead Management</h1>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={downloadLeads}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.stage}
            onChange={(e) => setFilters(f => ({ ...f, stage: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            <option value="RNR">RNR</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Demo">Demo</option>
            <option value="Demo Completed">Demo Completed</option>
            <option value="Admission">Admission</option>
          </select>

          <select
            value={filters.origin}
            onChange={(e) => setFilters(f => ({ ...f, origin: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Origins</option>
            <option value="DGM">DGM</option>
            <option value="Website Lead">Website Lead</option>
            <option value="Facebook Lead">Facebook Lead</option>
            <option value="Direct Call">Direct Call</option>
          </select>

          {user.role === 'superadmin' && (
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(f => ({ ...f, assignedTo: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Counselors</option>
              <option value="admin1">Admin 1</option>
              <option value="admin2">Admin 2</option>
            </select>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {user.role === 'superadmin' && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('studentName')}
              >
                <div className="flex items-center gap-2">
                  Student Name
                  {sortConfig.key === 'studentName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              {user.role === 'superadmin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map(lead => (
              <tr 
                key={lead.id}
                className={isOverdue(lead.lastUpdated) ? 'bg-red-50' : ''}
              >
                {user.role === 'superadmin' && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">{lead.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.phoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(parseISO(lead.date), 'PPP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.courseSelected}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${lead.stage === 'RNR' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${lead.stage === 'Interested' ? 'bg-green-100 text-green-800' : ''}
                    ${lead.stage === 'Not Interested' ? 'bg-red-100 text-red-800' : ''}
                    ${lead.stage === 'Walk-in' ? 'bg-blue-100 text-blue-800' : ''}
                    ${lead.stage === 'Demo' ? 'bg-purple-100 text-purple-800' : ''}
                    ${lead.stage === 'Demo Completed' ? 'bg-indigo-100 text-indigo-800' : ''}
                    ${lead.stage === 'Admission' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {lead.stage}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{lead.origin}</td>
                {user.role === 'superadmin' && (
                  <td className="px-6 py-4 whitespace-nowrap">{lead.assignedTo}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Leads Action (Super Admin Only) */}
      {user.role === 'superadmin' && selectedLeads.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedLeads.length} leads selected
            </span>
            <select
              onChange={(e) => handleAssignLeads(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Assign to...</option>
              <option value="admin1">Admin 1</option>
              <option value="admin2">Admin 2</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadManagement;