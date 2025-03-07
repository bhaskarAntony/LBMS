import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateDummyLeads } from '../utils/dummyData';

const LeadContext = createContext();

export function LeadProvider({ children }) {
  const [leads, setLeads] = useState(() => {
    const savedLeads = localStorage.getItem('leads');
    return savedLeads ? JSON.parse(savedLeads) : generateDummyLeads(30);
  });

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  const addLead = (lead) => {
    setLeads([...leads, { ...lead, id: Date.now().toString() }]);
  };

  const updateLead = (id, updates) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, ...updates } : lead
    ));
  };

  const deleteLead = (id) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const assignLeads = (adminId, leadIds) => {
    setLeads(leads.map(lead => 
      leadIds.includes(lead.id) ? { ...lead, assignedTo: adminId } : lead
    ));
  };

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, assignLeads }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  return useContext(LeadContext);
}