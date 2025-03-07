import React, { useState } from 'react';
import { useLeads } from '../../contexts/LeadContext';
import { 
  MessageSquare, 
  Send, 
  Settings, 
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

function WhatsappAutomation() {
  const { leads } = useLeads();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const templates = [
    { id: 'welcome', name: 'Welcome Message', content: 'Hi {{name}}, welcome to our software training institute!' },
    { id: 'followup', name: 'Follow-up Message', content: 'Hi {{name}}, how was your experience with the demo session?' },
    { id: 'reminder', name: 'Class Reminder', content: 'Hi {{name}}, reminder for your upcoming class tomorrow!' },
    { id: 'admission', name: 'Admission Details', content: 'Hi {{name}}, here are your admission details for {{course}}.' }
  ];

  const recentMessages = [
    { 
      id: 1,
      studentName: 'John Doe',
      template: 'Welcome Message',
      status: 'sent',
      timestamp: new Date().toISOString()
    },
    { 
      id: 2,
      studentName: 'Jane Smith',
      template: 'Follow-up Message',
      status: 'delivered',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const handleSendMessage = () => {
    alert('WhatsApp integration will be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">WhatsApp Automation</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Templates */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Send Message</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {templates.find(t => t.id === selectedTemplate)?.content}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Recipients
              </label>
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {leads.map(lead => (
                  <div key={lead.id} className="flex items-center p-3 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => {
                        setSelectedLeads(current =>
                          current.includes(lead.id)
                            ? current.filter(id => id !== lead.id)
                            : [...current, lead.id]
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{lead.studentName}</p>
                      <p className="text-sm text-gray-500">{lead.phoneNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!selectedTemplate || selectedLeads.length === 0}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </button>
          </div>
        </div>

        {/* Stats & Recent Messages */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">150</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Messages Sent</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Users className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">45</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Recipients</p>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Messages</h2>
            <div className="space-y-4">
              {recentMessages.map(message => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className={`mt-1 ${
                    message.status === 'sent' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {message.status === 'sent' ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {message.studentName}
                      </p>
                      <span className="text-xs text-gray-500">
                        {format(parseISO(message.timestamp), 'pp')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{message.template}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">WhatsApp Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Business Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your WhatsApp business number"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your WhatsApp API key"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Settings saved');
                    setShowSettings(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsappAutomation;