import { subDays } from 'date-fns';

const courses = ['Full Stack Development', 'Data Science', 'Cloud Computing', 'DevOps', 'Cybersecurity'];
const stages = ['RNR', 'Interested', 'Not Interested', 'Walk-in', 'Interested Walk-in', 'Demo', 'Demo Completed', 'Admission'];
const origins = ['DGM', 'Website Lead', 'Facebook Lead', 'Direct Call'];

export function generateDummyLeads(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    studentName: `Student ${i + 1}`,
    phoneNumber: `98765${(43210 + i).toString().padStart(5, '0')}`,
    date: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
    courseSelected: courses[Math.floor(Math.random() * courses.length)],
    stage: stages[Math.floor(Math.random() * stages.length)],
    origin: origins[Math.floor(Math.random() * origins.length)],
    assignedTo: Math.random() > 0.5 ? 'admin1' : 'admin2',
    history: [],
    lastUpdated: new Date().toISOString(),
    remarks: ''
  }));
}