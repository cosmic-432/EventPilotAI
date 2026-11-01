/**
 * EventPilot AI - Core Domain Models & Schemas
 */

export type EventCategory =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'college_festival'
  | 'community'
  | 'fundraiser'
  | 'corporate'
  | 'custom';

export type VenuePreference = 'indoor' | 'outdoor' | 'flexible' | 'hybrid';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'nice_to_have';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid_in_full' | 'waived';

export type BookingStatus =
  | 'not_started'
  | 'contacted'
  | 'quotation_received'
  | 'negotiating'
  | 'confirmed'
  | 'cancelled';

export interface EventDetails {
  id: string;
  name: string;
  category: EventCategory;
  customCategoryName?: string;
  targetDate: string; // ISO date: YYYY-MM-DD
  dateFlexibility?: 'strict' | 'plus_minus_3_days' | 'flexible_month';
  location: string;
  venueStatus: 'need_to_find' | 'shortlisted' | 'booked';
  venuePreference: VenuePreference;
  guestCount: number;
  totalBudgetMinor: number; // Stored in minor currency units (paise/cents)
  currency: string; // INR, USD, EUR, GBP, etc.
  styleTheme: string;
  dietaryRequirements: string[];
  accessibilityRequirements: string[];
  priorities: string[];
  naturalLanguagePrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssumptionItem {
  id: string;
  category: string;
  description: string;
  isConfirmed: boolean;
  userNote?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedAmountMinor: number;
  actualAmountMinor: number;
  quantity: number;
  unitCostMinor: number;
  priority: PriorityLevel;
  vendorId?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  isAiEstimated: boolean;
}

export interface BudgetState {
  totalBudgetMinor: number;
  contingencyPercentage: number; // e.g. 10 for 10%
  contingencyReserveMinor: number;
  currency: string;
  items: BudgetItem[];
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string; // YYYY-MM-DD
  daysBeforeEvent: number;
  priority: PriorityLevel;
  status: TaskStatus;
  dependencies: string[]; // IDs of tasks that must be done first
  notes?: string;
  isAiGenerated: boolean;
}

export interface VendorItem {
  id: string;
  category: string;
  title: string;
  selectionGuidance: string;
  estimatedCostMinor: number;
  targetBookingDate: string; // YYYY-MM-DD
  bookingStatus: BookingStatus;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  selectionCriteria: string[];
}

export interface GuestLogistics {
  estimatedGuests: number;
  cateringPerHeadMinor: number;
  estimatedSpaceSqFt: number;
  seatingStyle: string;
  dietaryBreakdown: Record<string, number>;
  accessibilityProvisions: string[];
  logisticsNotes: string[];
}

export interface ThemeIdea {
  id: string;
  title: string;
  vibe: string;
  description: string;
  colorPalette: string[];
  budgetImpact: 'low' | 'medium' | 'high';
  culturalContext?: string;
}

export interface RiskRecommendation {
  id: string;
  title: string;
  category: 'weather' | 'vendor' | 'budget' | 'logistics' | 'compliance' | 'technical';
  probability: 'low' | 'medium' | 'high';
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
  contingencyAction: string;
  isResolved: boolean;
}

export interface EventPlan {
  id: string;
  schemaVersion: number;
  eventDetails: EventDetails;
  assumptions: AssumptionItem[];
  budget: BudgetState;
  timeline: {
    tasks: TimelineTask[];
  };
  vendors: {
    items: VendorItem[];
  };
  guestPlan: GuestLogistics;
  ideas: {
    themeConcepts: ThemeIdea[];
    sustainabilitySuggestions: string[];
    costSavingAlternatives: string[];
  };
  risks: {
    items: RiskRecommendation[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalculatedBudgetSummary {
  totalBudgetMinor: number;
  totalEstimatedSpendMinor: number;
  totalActualSpendMinor: number;
  contingencyReserveMinor: number;
  // Committed includes estimated spend + contingency reserve
  totalCommittedSpendMinor: number;
  // Remaining vs estimated budget
  remainingEstimatedMinor: number;
  // Remaining vs actual spend
  remainingActualMinor: number;
  isOverrun: boolean;
  overrunAmountMinor: number;
  overrunPercentage: number;
  actualPaidMinor: number;
  actualPendingMinor: number;
}
