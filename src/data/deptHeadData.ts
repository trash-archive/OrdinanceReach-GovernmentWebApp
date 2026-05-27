// Department Head role data — scoped to their office
// In a real system this would be fetched based on session user

export interface DeptHeadUser {
  id: string;
  name: string;
  avatar: string;
  title: string;
  office: string;
  officeShort: string;
  email: string;
  phone: string;
  role: 'department_head';
  notifEmail: boolean;   // receive email notifications
  notifSms: boolean;     // receive SMS notifications
  notifInApp: boolean;   // receive in-app notifications
}

export const DEPT_HEAD_USER: DeptHeadUser = {
  id: 'dh-1',
  name: 'Ramon Villanueva',
  avatar: 'RV',
  title: 'Director',
  office: 'Traffic Management Office',
  officeShort: 'TMO',
  email: 'r.villanueva@cebu.gov.ph',
  phone: '+63 32 255-1234',
  role: 'department_head',
  notifEmail: true,
  notifSms: true,
  notifInApp: true,
};

export interface AssignedOrdinance {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  dateAssigned: string;
  deadline: string;          // display string e.g. "May 12, 2024"
  deadlineISO: string;       // ISO date for comparison e.g. "2024-05-12"
  priority: 'normal' | 'urgent' | 'immediate'; // set by encoder at publish time
  publishedBy: string;
  complianceStatus: 'compliant' | 'in-progress' | 'delayed' | 'pending' | 'overdue';
  progress: number; // 0–100
  lastReportDate: string;
  reports: ComplianceReport[];
  isNew: boolean; // newly published, not yet viewed
  extensionRequest?: ExtensionRequest;
}

export interface ExtensionRequest {
  id: string;
  requestedDeadline: string;   // display string
  requestedDeadlineISO: string;
  reason: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'denied';
  reviewNote?: string;
}

export interface ComplianceReport {
  id: string;
  date: string;
  status: 'compliant' | 'in-progress' | 'delayed';
  notes: string;
  submittedBy: string;
  evidence: string[];
}

export const ASSIGNED_ORDINANCES: AssignedOrdinance[] = [
  {
    id: '1',
    number: 'SP-2024-033',
    title: 'Revised Traffic Code for the City of Cebu',
    category: 'Traffic',
    summary: 'Updates traffic rules including penalties for colorum vehicles and e-bike regulations. All traffic enforcement personnel must be briefed within 30 days of publication.',
    dateAssigned: 'Mar 5, 2024',
    deadline: 'Apr 5, 2024',
    deadlineISO: '2024-04-05',
    priority: 'normal',
    publishedBy: 'Enc. M. Santos',
    complianceStatus: 'compliant',
    progress: 100,
    lastReportDate: 'Mar 10, 2024',
    isNew: false,
    reports: [
      { id: 'r1', date: 'Mar 10, 2024', status: 'compliant', notes: 'All traffic enforcers briefed via seminar on March 8–9. New penalty schedule posted at all TMO stations. E-bike checkpoints established at 5 major intersections.', submittedBy: 'Dir. R. Villanueva', evidence: ['TMO_BriefingReport_Mar8.pdf', 'PenaltySchedule_Posted.jpg', 'Checkpoint_Photos.zip'] },
    ],
  },
  {
    id: '2',
    number: 'SP-2024-041',
    title: 'Anti-Littering and Solid Waste Segregation Ordinance',
    category: 'Sanitation',
    summary: 'Mandates proper waste segregation near roadways and traffic areas. TMO officers are deputized to issue citations for littering from vehicles.',
    dateAssigned: 'Apr 12, 2024',
    deadline: 'May 12, 2024',
    deadlineISO: '2024-05-12',
    priority: 'normal',
    publishedBy: 'Enc. M. Santos',
    complianceStatus: 'in-progress',
    progress: 55,
    lastReportDate: 'Apr 18, 2024',
    isNew: true,
    reports: [
      { id: 'r2', date: 'Apr 18, 2024', status: 'in-progress', notes: 'Coordination with EMB ongoing. 12 of 20 TMO officers have received deputation training. Citation forms being printed.', submittedBy: 'Dir. R. Villanueva', evidence: ['DepuationList_Apr18.pdf'] },
    ],
  },
  {
    id: '3',
    number: 'SP-2024-011',
    title: 'Barangay Disaster Preparedness and Early Warning System',
    category: 'Safety',
    summary: 'Requires coordination with barangay units for traffic flow management during disaster response. TMO must provide dedicated lanes and emergency protocols.',
    dateAssigned: 'Jan 8, 2024',
    deadline: 'Feb 8, 2024',
    deadlineISO: '2024-02-08',
    priority: 'urgent',
    publishedBy: 'Enc. M. Santos',
    complianceStatus: 'compliant',
    progress: 100,
    lastReportDate: 'Feb 1, 2024',
    isNew: false,
    reports: [
      { id: 'r3', date: 'Feb 1, 2024', status: 'compliant', notes: 'Emergency traffic protocols updated. Dedicated disaster response lanes mapped for all major roads. Drill conducted Jan 28.', submittedBy: 'Dir. R. Villanueva', evidence: ['EmergencyProtocol_v2.pdf', 'DrillReport_Jan28.pdf'] },
    ],
  },
  {
    id: '4',
    number: 'SP-2024-NEW',
    title: 'Road Safety and Pedestrian Right-of-Way Ordinance',
    category: 'Traffic',
    summary: 'New ordinance establishing strict pedestrian right-of-way rules at all crosswalks. TMO must deploy officers at all pedestrian crossings during peak hours and install signage.',
    dateAssigned: 'May 20, 2024',
    deadline: 'Jun 20, 2024',
    deadlineISO: '2024-06-20',
    priority: 'normal',
    publishedBy: 'Enc. L. Reyes',
    complianceStatus: 'pending',
    progress: 0,
    lastReportDate: '—',
    isNew: true,
    reports: [],
  },
  {
    id: '5',
    number: 'SP-2024-007',
    title: 'Mandatory CCTV Installation in Public Transport Terminals',
    category: 'Safety',
    summary: 'Requires all public transport terminals to install CCTV cameras at entry/exit points. TMO must coordinate installation and submit inspection reports.',
    dateAssigned: 'Jan 15, 2024',
    deadline: 'Mar 15, 2024',
    deadlineISO: '2024-03-15',
    priority: 'urgent',
    publishedBy: 'Enc. M. Santos',
    complianceStatus: 'overdue',
    progress: 30,
    lastReportDate: 'Feb 20, 2024',
    isNew: false,
    reports: [
      { id: 'r5', date: 'Feb 20, 2024', status: 'in-progress', notes: 'Procurement process initiated. 3 of 10 terminals have CCTV installed. Budget constraints causing delays.', submittedBy: 'Dir. R. Villanueva', evidence: ['Procurement_Feb20.pdf'] },
    ],
    extensionRequest: {
      id: 'ext-1',
      requestedDeadline: 'Apr 30, 2024',
      requestedDeadlineISO: '2024-04-30',
      reason: 'Procurement delays due to budget re-alignment. Additional 45 days needed to complete installation across all terminals.',
      submittedDate: 'Mar 18, 2024',
      status: 'pending',
    },
  },
];

export interface DeptNotification {
  id: string;
  type: 'new_ordinance' | 'reminder' | 'overdue' | 'acknowledged' | 'extension_approved' | 'extension_denied' | 'escalated';
  title: string;
  message: string;
  ordinanceNumber?: string;
  time: string;
  read: boolean;
}

export const DEPT_NOTIFICATIONS: DeptNotification[] = [
  { id: 'n1', type: 'new_ordinance', title: 'New Ordinance Assigned', message: 'SP-2024-NEW (Road Safety and Pedestrian Right-of-Way Ordinance) has been assigned to your office. Deadline: June 20, 2024.', ordinanceNumber: 'SP-2024-NEW', time: '2 hours ago', read: false },
  { id: 'n2', type: 'new_ordinance', title: 'New Ordinance Assigned', message: 'SP-2024-041 (Anti-Littering Ordinance) has been assigned to your office. Please submit initial report within 30 days.', ordinanceNumber: 'SP-2024-041', time: '2 days ago', read: false },
  { id: 'n3', type: 'overdue', title: 'Compliance Report Overdue', message: 'Your implementation report for SP-2024-007 (CCTV Installation) was due on March 15, 2024 and has not been submitted. Please submit immediately or request an extension.', ordinanceNumber: 'SP-2024-007', time: '3 days ago', read: false },
  { id: 'n4', type: 'reminder', title: 'Compliance Report Due Soon', message: 'Your implementation report for SP-2024-041 is due in 24 days. Current progress: 55%.', ordinanceNumber: 'SP-2024-041', time: '4 days ago', read: true },
  { id: 'n5', type: 'acknowledged', title: 'Report Acknowledged', message: 'Your compliance report for SP-2024-033 has been received and acknowledged by the City Council Office.', ordinanceNumber: 'SP-2024-033', time: '1 week ago', read: true },
  { id: 'n6', type: 'acknowledged', title: 'Report Acknowledged', message: 'Your compliance report for SP-2024-011 has been marked as Compliant by the encoder.', ordinanceNumber: 'SP-2024-011', time: '2 weeks ago', read: true },
];