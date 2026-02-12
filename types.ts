export enum View {
  DASHBOARD = 'DASHBOARD',
  TRAVEL_REQUEST = 'TRAVEL_REQUEST',
  SUPPLIER_REGISTRATION = 'SUPPLIER_REGISTRATION',
  EXPENSE_CLAIM = 'EXPENSE_CLAIM',
}

export interface TravelRequestData {
  requestName: string;
  description: string;
  projectCurrency: string;
  budget: number;
  travelToCountry: string;
  travelToCity: string;
  travelDate: string;
  returnDate: string;
  purpose: string;
  accommodationType: string;
  isUrgent: boolean;
  attendees: string;
  accommodationPreference: string;
  notes: string;
  attachments: string[]; // Mock list of file names
  selectedSupplier: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  merchant: string;
  isRecurring?: boolean;
  taxAmount?: number;
  currency?: string;
  vendorAddress?: string;
  paymentMethod?: string;
}

export interface SupplierData {
  id: string;
  legalName: string;
  taxId: string;
  country: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  companyAddress?: string;
  contactPerson?: string;
  email?: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}