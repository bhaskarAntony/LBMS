import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../../contexts/LeadContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  Tag, 
  Globe,
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const stages = [
  { id: 'RNR', label: 'RNR', icon: AlertCircle, color: 'text-yellow-500' },
  { id: 'Interested', label: 'Interested', icon: CheckCircle2, color: 'text-green-500' },
  { id: 'Not Interested', label: 'Not Interested', icon: XCircle, color: 'text-red-500' },
  { id: 'Walk-in', label: 'Walk-in', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 'Demo', label: 'Demo', icon: Clock, color: 'text-purple-500' },
  { id: 'Demo Completed', label: 'Demo Completed', icon: CheckCircle2, color: 'text-indigo-500' },
  { id: 'Admission', label: 'Admission', icon: CheckCircle2, color: 'text-green-500' }
];

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead } = useLeads();
  const { user } = useAuth();
  const [remarks, setRemarks] = useState('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [stageRemarks, setStageRemarks] = useState('');

  const lead = leads.find(l => l.id === id);

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Lead not found</h2>
          <button
            onClick={() => navigate('/leads')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  const handleAddRemarks = () => {
    if (!remarks.trim()) return;

    const newHistory = [
      ...lead.history,
      {
        type: 'remark',
        content: remarks,
        timestamp: new Date().toISOString(),
        user: user.username
      }
    ];

    updateLead(id, {
      history: newHistory,
      lastUpdated: new Date().toISOString()
    });

    setRemarks('');
    toast.success('Remarks added successfully');
  };

  const handleStageUpdate = () => {
    if (!selectedStage || !stageRemarks.trim()) return;

    const newHistory = [
      ...lead.history,
      {
        type: 'stage',
        from: lead.stage,
        to: selectedStage,
        content: stageRemarks,
        timestamp: new Date().toISOString(),
        user: user.username
      }
    ];

    updateLead(id, {
      stage: selectedStage,
      history: newHistory,
      lastUpdated: new Date().toISOString()
    });

    setShowStageModal(false);
    setSelectedStage('');
    setStageRemarks('');
    toast.success('Stage updated successfully');
  };

  const getStageIcon = (stageName) => {
    const stage = stages.find(s => s.id === stageName);
    return stage?.icon || AlertCircle;
  };

  const getStageColor = (stageName) => {
    const stage = stages.find(s => s.id === stageName);
    return stage?.color || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/leads')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Lead Details</h1>
        </div>
        <button
          onClick={() => setShowStageModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Update Stage
        </button>
      </div>

      {/* Lead Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="w-6"><Phone className="w-5 h-5" /></span>
              <span>{lead.phoneNumber}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="w-6"><Calendar className="w-5 h-5" /></span>
              <span>{format(parseISO(lead.date), 'PPP')}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="w-6"><BookOpen className="w-5 h-5" /></span>
              <span>{lead.courseSelected}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="w-6"><Tag className="w-5 h-5" /></span>
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
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <span className="w-6"><Globe className="w-5 h-5" /></span>
              <span>{lead.origin}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Remarks</h2>
          
          <div className="space-y-4">
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks here..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            />
            
            <button
              onClick={handleAddRemarks}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Add Remarks
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up History */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Follow-up History</h2>
        
        <div className="space-y-6">
          {lead.history.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No history available</p>
          ) : (
            <div className="relative">
              {lead.history.map((item, index) => {
                const Icon = item.type === 'stage' ? getStageIcon(item.to) : MessageSquare;
                
                return (
                  <div key={index} className="flex group items-start mb-8 last:mb-0">
                    <div className="flex items-center">
                      <div className="relative flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'stage' ? getStageColor(item.to) : 'text-blue-500'
                        } bg-gray-50`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {index !== lead.history.length - 1 && (
                          <div className="absolute top-10 left-1/2 w-0.5 h-full -translate-x-1/2 bg-gray-200" />
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {item.user}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(item.timestamp), 'PPp')}
                          </span>
                        </div>
                        
                        {item.type === 'stage' ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-gray-500">Stage changed from</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                                {item.from}
                              </span>
                              <span className="text-sm text-gray-500">to</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                                {item.to}
                              </span>
                            </div>
                            <p className="text-gray-700">{item.content}</p>
                          </div>
                        ) : (
                          <p className="text-gray-700">{item.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stage Update Modal */}
      {showStageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Stage</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a stage</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={stageRemarks}
                  onChange={(e) => setStageRemarks(e.target.value)}
                  placeholder="Enter remarks for stage change..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStageModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStageUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Update Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadDetails;