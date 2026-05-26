export type OrdStatus = 'active' | 'draft' | 'amended' | 'repealed';
export type ComplianceStatus = 'compliant' | 'in-progress' | 'delayed' | 'pending';
export type UserRole = 'encoder' | 'department_head' | 'barangay' | 'enforcement' | 'admin' | 'records';

export interface Ordinance {
  id: string;
  number: string;
  title: string;
  category: string;
  status: OrdStatus;
  datePassed: string;
  offices: string[];
  summary: string;
  author: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  compliance: ComplianceStatus;
  assignedCount: number;
  completedCount: number;
  lastUpdate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  time: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  target: string;
  time: string;
  ip: string;
}

export const CATEGORIES = ['Traffic', 'Environment', 'Health', 'Business', 'Safety', 'Sanitation', 'Zoning', 'Education'];

export const OFFICES = [
  'City Engineering Office', 'Traffic Management Office', 'Environmental Management Bureau',
  'Business Permits & Licensing', 'City Health Office', 'Barangay Affairs Office',
  'Disaster Risk Reduction', 'City Planning & Development', 'City Assessor',
];

export const ordinances: Ordinance[] = [
  { id: '1', number: 'SP-2024-041', title: 'Anti-Littering and Solid Waste Segregation Ordinance', category: 'Sanitation', status: 'active', datePassed: 'Apr 12, 2024', offices: ['Environmental Management Bureau', 'Barangay Affairs Office'], summary: 'Mandates proper waste segregation in all barangays. Imposes fines for littering in public spaces.', author: 'Enc. M. Santos' },
  { id: '2', number: 'SP-2024-038', title: 'Ordinance Regulating Single-Use Plastics in Commercial Establishments', category: 'Environment', status: 'active', datePassed: 'Mar 28, 2024', offices: ['Environmental Management Bureau', 'Business Permits & Licensing'], summary: 'Bans single-use plastic bags in supermarkets, markets, and commercial establishments.', author: 'Enc. L. Reyes' },
  { id: '3', number: 'SP-2024-033', title: 'Revised Traffic Code for the City of Cebu', category: 'Traffic', status: 'active', datePassed: 'Mar 5, 2024', offices: ['Traffic Management Office', 'City Engineering Office'], summary: 'Updates traffic rules including penalties for colorum vehicles and e-bike regulations.', author: 'Enc. M. Santos' },
  { id: '4', number: 'SP-2024-029', title: 'Mandatory Health Protocols for Food Establishments', category: 'Health', status: 'active', datePassed: 'Feb 19, 2024', offices: ['City Health Office', 'Business Permits & Licensing'], summary: 'Requires food handlers to have valid health certificates renewed annually.', author: 'Enc. A. Cruz' },
  { id: '5', number: 'SP-2024-022', title: 'Noise Control and Curfew Ordinance Amendments', category: 'Safety', status: 'amended', datePassed: 'Jan 30, 2024', offices: ['Barangay Affairs Office', 'City Health Office'], summary: 'Amends allowable noise levels in residential areas between 10 PM and 6 AM.', author: 'Enc. L. Reyes' },
  { id: '6', number: 'SP-2024-017', title: 'Business Permit Streamlining and Digital Processing Ordinance', category: 'Business', status: 'active', datePassed: 'Jan 15, 2024', offices: ['Business Permits & Licensing', 'City Planning & Development'], summary: 'Mandates online application for business permits. Reduces processing time to 3 working days.', author: 'Enc. A. Cruz' },
  { id: '7', number: 'SP-2024-011', title: 'Barangay Disaster Preparedness and Early Warning System', category: 'Safety', status: 'active', datePassed: 'Jan 8, 2024', offices: ['Disaster Risk Reduction', 'Barangay Affairs Office'], summary: 'Requires all barangays to conduct quarterly disaster drills and maintain emergency equipment.', author: 'Enc. M. Santos' },
  { id: '8', number: 'SP-2023-198', title: 'Urban Greening and Tree Preservation Ordinance', category: 'Environment', status: 'active', datePassed: 'Dec 18, 2023', offices: ['City Planning & Development', 'Environmental Management Bureau'], summary: 'Prohibits removal of trees with trunk diameter over 10cm without proper permits.', author: 'Enc. L. Reyes' },
  { id: '9', number: 'SP-2024-045', title: 'Draft: Ordinance on Street Vendor Zoning and Regulation', category: 'Zoning', status: 'draft', datePassed: '—', offices: [], summary: 'Pending review. Proposes designated vending zones in high-foot-traffic areas.', author: 'Enc. A. Cruz' },
];

export const departments: Department[] = [
  { id: '1', name: 'Traffic Management Office', head: 'Dir. Ramon Villanueva', compliance: 'compliant', assignedCount: 5, completedCount: 5, lastUpdate: '2 days ago' },
  { id: '2', name: 'Environmental Management Bureau', head: 'Dir. Carla Mendoza', compliance: 'in-progress', assignedCount: 6, completedCount: 4, lastUpdate: '5 hours ago' },
  { id: '3', name: 'City Health Office', head: 'Dr. Patricia Lim', compliance: 'compliant', assignedCount: 4, completedCount: 4, lastUpdate: '1 day ago' },
  { id: '4', name: 'Business Permits & Licensing', head: 'Dir. Joel Tabada', compliance: 'delayed', assignedCount: 5, completedCount: 2, lastUpdate: '8 days ago' },
  { id: '5', name: 'Barangay Affairs Office', head: 'Dir. Susan Ocampo', compliance: 'in-progress', assignedCount: 7, completedCount: 5, lastUpdate: '3 days ago' },
  { id: '6', name: 'City Engineering Office', head: 'Eng. Marco dela Cruz', compliance: 'pending', assignedCount: 3, completedCount: 0, lastUpdate: 'Not yet started' },
  { id: '7', name: 'Disaster Risk Reduction', head: 'Dir. Felix Abella', compliance: 'compliant', assignedCount: 2, completedCount: 2, lastUpdate: '1 day ago' },
  { id: '8', name: 'City Planning & Development', head: 'Dir. Ana Torres', compliance: 'in-progress', assignedCount: 4, completedCount: 2, lastUpdate: '4 days ago' },
];

export const notifications: Notification[] = [
  { id: '1', title: 'New Ordinance Published', message: 'SP-2024-041 has been published and assigned to 2 offices.', type: 'success', time: '2 hours ago', read: false },
  { id: '2', title: 'Compliance Deadline Approaching', message: 'Business Permits & Licensing has a pending report due in 2 days.', type: 'warning', time: '5 hours ago', read: false },
  { id: '3', title: 'Ordinance Amended', message: 'SP-2024-022 has been updated. Affected offices have been notified.', type: 'info', time: 'Yesterday', read: true },
  { id: '4', title: 'System Alert', message: '3 ordinances are approaching their review date this month.', type: 'alert', time: '2 days ago', read: true },
  { id: '5', title: 'Report Submitted', message: 'TMO submitted implementation report for SP-2024-033.', type: 'success', time: '3 days ago', read: true },
];

export const auditLogs: AuditLog[] = [
  { id: '1', user: 'M. Santos', role: 'Encoder', action: 'Published Ordinance', target: 'SP-2024-041', time: 'Today 10:32 AM', ip: '192.168.1.10' },
  { id: '2', user: 'A. Cruz', role: 'Encoder', action: 'Edited Metadata', target: 'SP-2024-033', time: 'Today 9:15 AM', ip: '192.168.1.11' },
  { id: '3', user: 'Admin', role: 'System Admin', action: 'Added User', target: 'J. Dela Vega (Department Head)', time: 'Yesterday 4:22 PM', ip: '192.168.1.2' },
  { id: '4', user: 'L. Reyes', role: 'Encoder', action: 'Uploaded Document', target: 'SP-2024-038 PDF', time: 'Yesterday 2:10 PM', ip: '192.168.1.12' },
  { id: '5', user: 'R. Villanueva', role: 'Dept. Head', action: 'Submitted Report', target: 'SP-2024-033 Compliance', time: '2 days ago 11:05 AM', ip: '192.168.2.5' },
  { id: '6', user: 'Admin', role: 'System Admin', action: 'Changed Permissions', target: 'Barangay Affairs Office', time: '3 days ago 3:44 PM', ip: '192.168.1.2' },
];