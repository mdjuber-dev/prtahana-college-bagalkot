export interface FeeItem { name: string; pcmb: number; pcmc: number; }
export interface FeeCategory { categoryName: string; items: FeeItem[]; }

// Internal fee data is preserved for admin/CMS use. Public pages intentionally do not render these amounts.
export const feeCategories: FeeCategory[] = [
  { categoryName: 'Tuition & Academic Fees', items: [
    { name: 'Tuition Fee (Annual)', pcmb: 45000, pcmc: 50000 },
    { name: 'Admission Fee (One-time)', pcmb: 5000, pcmc: 5000 },
    { name: 'Examination Fee', pcmb: 3000, pcmc: 3000 },
    { name: 'Library Fee', pcmb: 2000, pcmc: 2000 },
    { name: 'Laboratory Fee', pcmb: 5000, pcmc: 5000 },
  ]},
  { categoryName: 'Coaching & Coaching Support', items: [
    { name: 'NEET / KCET / JEE Integrated Coaching', pcmb: 35000, pcmc: 35000 },
    { name: 'Study Material & Question Bank', pcmb: 5000, pcmc: 5000 },
    { name: 'Mock Test Series', pcmb: 3000, pcmc: 3000 },
  ]},
  { categoryName: 'Development & Infrastructure', items: [
    { name: 'Campus Development Fund', pcmb: 5000, pcmc: 5000 },
    { name: 'Sports & Cultural Activities', pcmb: 2000, pcmc: 2000 },
    { name: 'Smart Classroom Fee', pcmb: 3000, pcmc: 3000 },
  ]},
  { categoryName: 'Optional Services', items: [
    { name: 'Hostel Fee (Annual, if applicable)', pcmb: 35000, pcmc: 35000 },
    { name: 'Transport (Annual, if applicable)', pcmb: 15000, pcmc: 15000 },
    { name: 'Uniform (2 sets)', pcmb: 2000, pcmc: 2000 },
  ]},
];

export function calculateTotal(category: FeeCategory, stream: 'pcmb' | 'pcmc'): number {
  return category.items.reduce((sum, item) => sum + item[stream], 0);
}

export function calculateGrandTotal(stream: 'pcmb' | 'pcmc', includeOptional: boolean): number {
  const cats = includeOptional ? feeCategories : feeCategories.slice(0, 3);
  return cats.reduce((sum, cat) => sum + calculateTotal(cat, stream), 0);
}

export interface ScholarshipInfo { name: string; eligibility: string; discount: string; note?: string; }

export const SCHOLARSHIP_POLICY_NOTE =
  'Merit concessions and free-seat benefits are subject to eligibility, availability and approval by the Principal / Management. Terms and conditions may apply.';

export const SCHOLARSHIP_BOARD_NOTE =
  'Scholarship benefits are based on SSLC / 10th Board examination performance.';

export const scholarshipInfo: ScholarshipInfo[] = [
  {
    name: '95% & Above',
    eligibility: 'SSLC / 10th score 95% and above - First 25 eligible students',
    discount: 'Free Seats',
    note: SCHOLARSHIP_POLICY_NOTE,
  },
  {
    name: '90% - 94.99%',
    eligibility: 'SSLC / 10th score between 90% and 94.99%',
    discount: '80% Fee Concession',
    note: SCHOLARSHIP_POLICY_NOTE,
  },
  {
    name: '85% - 89.99%',
    eligibility: 'SSLC / 10th score between 85% and 89.99%',
    discount: 'Merit-Based Concession / Subject to Approval',
    note: SCHOLARSHIP_POLICY_NOTE,
  },
  {
    name: '75% - 84.99%',
    eligibility: 'SSLC / 10th score between 75% and 84.99%',
    discount: '20% Fee Concession',
    note: SCHOLARSHIP_POLICY_NOTE,
  },
];

export const feeNotes: string[] = [
  'Fee structure and applicable charges are available from the college admissions office.',
  'Contact the college admissions office for detailed fee information and instalment guidance.',
  SCHOLARSHIP_BOARD_NOTE,
  SCHOLARSHIP_POLICY_NOTE,
];
