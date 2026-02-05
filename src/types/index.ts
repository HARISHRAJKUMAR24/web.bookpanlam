export type Option = {
  value: string;
  label: string;
  selected?: boolean;
  full?: any;   // ← ADD THIS

};

// Add these to your types
type TokenHistoryType = {
  id: number;
  doctor_schedule_id: number;
  slot_batch_id: string;
  old_token: number;
  new_token: number;
  total_token: number;
  updated_by: number | null;
  created_at: string;
};

type TokenUpdateAction = 'set' | 'increase' | 'decrease';


export interface InputField {
  type:
  | "text"
  | "url"
  | "number"
  | "email"
  | "password"
  | "select"
  | "textarea"
  | "phone"
  | "date"
  | "checkbox"
  | "time"
  | "calendar"
  | "file"
  | "switch"
  | "editor";

  value: string | boolean;

  placeholder?: string;
  options?: { label: string; value: string; selected?: boolean }[];
  label?: string | React.ReactNode;
  labelDescription?: string | React.ReactNode;
  setValue?: (value: any) => void;
  required?: boolean;
  containerClassName?: string;
  rows?: number;
  description?: string;

  inputFieldBottomArea?: React.ReactNode;

  /** ⬇️ ADD THESE NEW LINES */
  min?: string | number;
  step?: string | number;
  readOnly?: boolean;
}

// Add to your existing types

export type LimitData = {
  can_add: boolean;
  message: string;
  current: number;
  limit: number | string;
  remaining: number;
  plan_expired: boolean;
  expiry_message: string;
};

// Update DataTableProps if needed in your types
export interface NavLinkProps {
  label: string;
  icon: JSX.Element;
  href?: string;   // ← FIXED
  serviceType?: number;
  children?: {
    label: string;
    href: string;
  }[];
}


export interface StatsCardProps {
  icon: React.ReactElement;
  value: string;
  label: string;
  color?: string;
  compact?: boolean;   // ✅ ADD THIS
}

export interface GraphStatsCardProps {
  label: string;
  value: string;
  color?: string;
}

export interface ListCardProps {
  title?: string;
  icon?: React.ReactElement;
  list: {
    icon?: React.ReactElement;
    label: string;
    value: string | React.ReactElement;
  }[];
  color?: string;
}

export interface CopyLinkProps {
  text: string;
  link: string;
  disabled?: boolean;
  compact?: boolean;   // ✅ ADD THIS
}

export interface LinkCardProps {
  title: string;
  subtitle?: string;   // ✅ ADD THIS
  icon?: React.ReactElement;
  link?: string;
  className?: string;
  compact?: boolean;   // ✅ ADD THIS
}


export interface FormValueProps {
  [key: string]: { value: any; setValue?: (value: any) => void };
}

// Update CategoryFormProps interface if needed
export interface CategoryFormProps {
  categoryId: string;     // ✔ only string
  categoryData: Category | null;
  isEdit: boolean;
  userId: number;         // ✔ remove null
  
}

export type Department = {
  id: number;
  departmentId: string;
  userId: number;
  name: string;
  slug?: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;

  // Add this missing field
  additionalImages?: string[];

  // Main type fields
  typeMainName?: string;
  typeMainAmount?: number | string;
  typeMainHsn?: string;

  appointmentSettings?: AppointmentSettings;

  // Additional type fields (1-25)
  type1Name?: string;
  type1Amount?: number | string;
  type1Hsn?: string;
  type2Name?: string;
  type2Amount?: number | string;
  type2Hsn?: string;
  type3Name?: string;
  type3Amount?: number | string;
  type3Hsn?: string;
  type4Name?: string;
  type4Amount?: number | string;
  type4Hsn?: string;
  type5Name?: string;
  type5Amount?: number | string;
  type5Hsn?: string;
  type6Name?: string;
  type6Amount?: number | string;
  type6Hsn?: string;
  type7Name?: string;
  type7Amount?: number | string;
  type7Hsn?: string;
  type8Name?: string;
  type8Amount?: number | string;
  type8Hsn?: string;
  type9Name?: string;
  type9Amount?: number | string;
  type9Hsn?: string;
  type10Name?: string;
  type10Amount?: number | string;
  type10Hsn?: string;
  type11Name?: string;
  type11Amount?: number | string;
  type11Hsn?: string;
  type12Name?: string;
  type12Amount?: number | string;
  type12Hsn?: string;
  type13Name?: string;
  type13Amount?: number | string;
  type13Hsn?: string;
  type14Name?: string;
  type14Amount?: number | string;
  type14Hsn?: string;
  type15Name?: string;
  type15Amount?: number | string;
  type15Hsn?: string;
  type16Name?: string;
  type16Amount?: number | string;
  type16Hsn?: string;
  type17Name?: string;
  type17Amount?: number | string;
  type17Hsn?: string;
  type18Name?: string;
  type18Amount?: number | string;
  type18Hsn?: string;
  type19Name?: string;
  type19Amount?: number | string;
  type19Hsn?: string;
  type20Name?: string;
  type20Amount?: number | string;
  type20Hsn?: string;
  type21Name?: string;
  type21Amount?: number | string;
  type21Hsn?: string;
  type22Name?: string;
  type22Amount?: number | string;
  type22Hsn?: string;
  type23Name?: string;
  type23Amount?: number | string;
  type23Hsn?: string;
  type24Name?: string;
  type24Amount?: number | string;
  type24Hsn?: string;
  type25Name?: string;
  type25Amount?: number | string;
  type25Hsn?: string;

  createdAt: string;
  updatedAt?: string;

  [key: string]: any;

};



export interface DepartmentFormProps {
  departmentId: string;
  departmentData: Department | null;
  isEdit: boolean;
  userId: string;

}

// Update DepartmentTypeFormProps interface
export interface DepartmentTypeFormProps {
  name: { value: string; setValue: (v: string) => void };
  slug: { value: string; setValue: (v: string) => void };

  // Main type
  typeMainName: { value: string; setValue: (v: string) => void };
  typeMainAmount: { value: string; setValue: (v: string) => void };
  typeMainHsn: { value: string; setValue: (v: string) => void };

  // Additional types (1-25) with HSN
  type1Name?: { value: string; setValue: (v: string) => void };
  type1Amount?: { value: string; setValue: (v: string) => void };
  type1Hsn?: { value: string; setValue: (v: string) => void };
  type2Name?: { value: string; setValue: (v: string) => void };
  type2Amount?: { value: string; setValue: (v: string) => void };
  type2Hsn?: { value: string; setValue: (v: string) => void };
  type3Name?: { value: string; setValue: (v: string) => void };
  type3Amount?: { value: string; setValue: (v: string) => void };
  type3Hsn?: { value: string; setValue: (v: string) => void };
  type4Name?: { value: string; setValue: (v: string) => void };
  type4Amount?: { value: string; setValue: (v: string) => void };
  type4Hsn?: { value: string; setValue: (v: string) => void };
  type5Name?: { value: string; setValue: (v: string) => void };
  type5Amount?: { value: string; setValue: (v: string) => void };
  type5Hsn?: { value: string; setValue: (v: string) => void };
  type6Name?: { value: string; setValue: (v: string) => void };
  type6Amount?: { value: string; setValue: (v: string) => void };
  type6Hsn?: { value: string; setValue: (v: string) => void };
  type7Name?: { value: string; setValue: (v: string) => void };
  type7Amount?: { value: string; setValue: (v: string) => void };
  type7Hsn?: { value: string; setValue: (v: string) => void };
  type8Name?: { value: string; setValue: (v: string) => void };
  type8Amount?: { value: string; setValue: (v: string) => void };
  type8Hsn?: { value: string; setValue: (v: string) => void };
  type9Name?: { value: string; setValue: (v: string) => void };
  type9Amount?: { value: string; setValue: (v: string) => void };
  type9Hsn?: { value: string; setValue: (v: string) => void };
  type10Name?: { value: string; setValue: (v: string) => void };
  type10Amount?: { value: string; setValue: (v: string) => void };
  type10Hsn?: { value: string; setValue: (v: string) => void };
  type11Name?: { value: string; setValue: (v: string) => void };
  type11Amount?: { value: string; setValue: (v: string) => void };
  type11Hsn?: { value: string; setValue: (v: string) => void };
  type12Name?: { value: string; setValue: (v: string) => void };
  type12Amount?: { value: string; setValue: (v: string) => void };
  type12Hsn?: { value: string; setValue: (v: string) => void };
  type13Name?: { value: string; setValue: (v: string) => void };
  type13Amount?: { value: string; setValue: (v: string) => void };
  type13Hsn?: { value: string; setValue: (v: string) => void };
  type14Name?: { value: string; setValue: (v: string) => void };
  type14Amount?: { value: string; setValue: (v: string) => void };
  type14Hsn?: { value: string; setValue: (v: string) => void };
  type15Name?: { value: string; setValue: (v: string) => void };
  type15Amount?: { value: string; setValue: (v: string) => void };
  type15Hsn?: { value: string; setValue: (v: string) => void };
  type16Name?: { value: string; setValue: (v: string) => void };
  type16Amount?: { value: string; setValue: (v: string) => void };
  type16Hsn?: { value: string; setValue: (v: string) => void };
  type17Name?: { value: string; setValue: (v: string) => void };
  type17Amount?: { value: string; setValue: (v: string) => void };
  type17Hsn?: { value: string; setValue: (v: string) => void };
  type18Name?: { value: string; setValue: (v: string) => void };
  type18Amount?: { value: string; setValue: (v: string) => void };
  type18Hsn?: { value: string; setValue: (v: string) => void };
  type19Name?: { value: string; setValue: (v: string) => void };
  type19Amount?: { value: string; setValue: (v: string) => void };
  type19Hsn?: { value: string; setValue: (v: string) => void };
  type20Name?: { value: string; setValue: (v: string) => void };
  type20Amount?: { value: string; setValue: (v: string) => void };
  type20Hsn?: { value: string; setValue: (v: string) => void };
  type21Name?: { value: string; setValue: (v: string) => void };
  type21Amount?: { value: string; setValue: (v: string) => void };
  type21Hsn?: { value: string; setValue: (v: string) => void };
  type22Name?: { value: string; setValue: (v: string) => void };
  type22Amount?: { value: string; setValue: (v: string) => void };
  type22Hsn?: { value: string; setValue: (v: string) => void };
  type23Name?: { value: string; setValue: (v: string) => void };
  type23Amount?: { value: string; setValue: (v: string) => void };
  type23Hsn?: { value: string; setValue: (v: string) => void };
  type24Name?: { value: string; setValue: (v: string) => void };
  type24Amount?: { value: string; setValue: (v: string) => void };
  type24Hsn?: { value: string; setValue: (v: string) => void };
  type25Name?: { value: string; setValue: (v: string) => void };
  type25Amount?: { value: string; setValue: (v: string) => void };
  type25Hsn?: { value: string; setValue: (v: string) => void };
}

export interface ServiceFormProps {
  serviceId: string;
  serviceData: DoctorSchedule; // ✅ CORRECT
  isEdit: boolean;
}


export interface PaginationProps {
  totalPages: number;
  totalRecords: number;
}

export interface FileDialogProps {
  multiple?: boolean;
  files?: any;
  setFiles?: (value: any) => void;
}

export interface CouponFormProps {
  couponId: string;
  couponData: Coupon;
  isEdit: boolean;
}

export interface EmployeeFormProps {
  user_id: number;
  employeeId: string;
  employeeData: Employee;
  isEdit: boolean;

}

export interface PaymentMethodCardProps {
  userId?: number;

  name?: string;
  value?: {
    value: string | number | boolean;
    setValue: (value: any) => void;
  };
  method: {
    name: string;
    icon: string;
  };
  inputFields?: {
    [key: string]: InputField;
  };
}

export interface ManualPaymentMethodCardProps {
  data: ManualPaymentMethod;
  setReload?: (value: number) => void;
}

export interface ManualPaymentMethodFormProps {
  children: React.ReactNode;
  isEdit?: boolean;
  data?: ManualPaymentMethod;
  setReload?: (value: number) => void;
}

export interface AvailableAreaCardProps {
  color?: string;
  data: availableArea;
}

export interface AvailableAreaFormProps {
  isEdit?: boolean;
  data?: availableArea;
}

export interface PageFormProps {
  isEdit?: boolean;
  data?: Page;
}

export interface CustomerOverviewCardProps {
  value: string;
  label: string;
  icon: React.ReactElement;
  color?: string;
}

export type Appointment = {
  id: number;
  appointmentId: string;
  userId: number;
  customerId: number;
  serviceId: number;
  employeeId: number;
  departmentId?: number; // Add this if appointments can be for departments
  name: string;
  phone: string;
  email: string;
  date: Date;
  time: string;
  amount: string;
  charges: string;
  gstNumber: string;
  gstType: string;
  gstPercentage: number | null;
  paymentMethod: string;
  paymentId: string;
  area: string;
  postalCode: string;
  address: string;
  remark: string;
  status: string;
  paymentStatus: string;
  paidAt: Date;
  createdAt: Date;
  user: User;
  employee: Employee;
  service: Service;
  customer: Customer;
  employeeCommission: number;
};

export type Customer = {
  customerId: number;       // ✔ actual backend field
  id?: number;              // optional (if sometimes included)
  userId?: number;          // optional (backend doesn't send)

  name: string;
  photo: string | null;
  phone: string;
  email: string;

  password?: string;        // optional (never returned from API)

  createdAt: string | Date;

  countData: {
    totalSpent: number;
    appointments: number;
    completed: number;
    cancelled: number;
    unpaid: number;
    booked: number;
    paid: number;
    processing: number;
    refund: number;

  };

  user?: Partial<User>;
};


export type Employee = {
  id: number;
  user_id: number;
  employee_id: string;
  name: string;
  position: string;
  image: string | null;
  phone: string;
  email: string;
  address: string;
  joining_date?: string;   // ✅ NEW
  created_at: string;
};


export type User = {
  id?: number;
  user_id?: number;
  userId?: number;

  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  country?: string;
  image?: string;

  siteName?: string;
  siteSlug?: string;
  createdAt?: Date | string;

  // siteSettings can be an array or a single object
  siteSettings?: Array<{
    logo_url?: string;
    favicon_url?: string;
    currency?: string;
    [key: string]: any;
  }> | {
    logo_url?: string;
    favicon_url?: string;
    currency?: string;
    [key: string]: any;
  };

  // catch extra fields
  [key: string]: any;
};

export interface Banner {
  url: string;   // MUST BE required
  path: string;
  title?: string;
  link?: string;
  order?: number;
}


export type siteSettings = {
  id: number;
  userId: number;
  logo: string;
  favicon: string;
  phone: string;
  whatsapp: string;
  email: string;
  currency: string;
  country: string;
  state: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  sharingImagePreview: string;
  gstNumber: string;
  gstType: string;

  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  pinterest: string;

  cashInHand: boolean;

  /** 🔥 ADD THESE TWO */
  razorpayKeyId: string;
  razorpaySecretKey: string;    // 👈 FIX

  phonepeSaltKey: string;
  phonepeSaltIndex: string;
  phonepeMerchantId: string;

  payuApiKey: string;
  payuSalt: string;
};

export type Category = {
  id: number;
  categoryId: string;
  userId: number;
  name: string;
  slug: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: Date;

  // Doctor details
  doctorDetails?: {
    doctorName?: string;
    specialization?: string;
    qualification?: string;
    experience?: string;
    regNumber?: string;
    doctorImage?: string;
    hsnCode?: string; // ✅ ADD HSN CODE HERE
  };

  // ✅ ADD direct HSN field as well (for backward compatibility)
  hsnCode?: string;
};


export type AdditionalImage = {
  id: number;
  image: string;
  created_at: string;   // MUST MATCH backend
};

export type Service = {
  id: number;
  service_id: string;      // <- must match backend
  user_id: number;         // <- backend uses user_id, not userId
  name: string;
  slug: string;
  amount: string;
  previous_amount: string;
  image: string;
  department_id?: number | null; // Add this if services can belong to departments
  category_id: number | null;
  time_slot_interval: string;
  interval_type: string;
  description: string;
  gst_percentage: number | null;
  meta_title: string | null;
  meta_description: string | null;
  status: boolean;
  created_at: string;      // <- must match backend
  category: Category | null;
  additionalImages: AdditionalImage[];
  user: User;
};

export type registerUserData = {
  name: string;
  email: string;
  phone: string;
  country: string;
  siteName: string;
  password: string;
};

export type sendOtp = {
  phone: string;
  unique?: boolean;
  registered?: boolean;
};

export type loginUserData = {
  phone: string;
  password: string;
};

export type forgotPasswordData = {
  user: string;
  password: string;
};

export type categoriesParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type categoryData = {
  name: string;
  slug: string;
  image: string;
  metaTitle: string;
  metaDescription: string;

  // ✅ ADD HSN to category/doctor data
  hsnCode?: string;

  // Doctor fields
  doctorName?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  regNumber?: string;
  doctorImage?: string;
};

export type departmentsParams = {
  limit?: number;
  page?: number;
  q?: string;
};


// Update departmentData type
export interface departmentData {
  name: string;
  slug?: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;

  // Main type
  typeMainName?: string;
  typeMainAmount?: number | string;
  typeMainHsn?: string;

  // Additional types
  type1Name?: string;
  type1Amount?: number | string;
  type1Hsn?: string;
  type2Name?: string;
  type2Amount?: number | string;
  type2Hsn?: string;
  type3Name?: string;
  type3Amount?: number | string;
  type3Hsn?: string;
  type4Name?: string;
  type4Amount?: number | string;
  type4Hsn?: string;
  type5Name?: string;
  type5Amount?: number | string;
  type5Hsn?: string;
  type6Name?: string;
  type6Amount?: number | string;
  type6Hsn?: string;
  type7Name?: string;
  type7Amount?: number | string;
  type7Hsn?: string;
  type8Name?: string;
  type8Amount?: number | string;
  type8Hsn?: string;
  type9Name?: string;
  type9Amount?: number | string;
  type9Hsn?: string;
  type10Name?: string;
  type10Amount?: number | string;
  type10Hsn?: string;
  type11Name?: string;
  type11Amount?: number | string;
  type11Hsn?: string;
  type12Name?: string;
  type12Amount?: number | string;
  type12Hsn?: string;
  type13Name?: string;
  type13Amount?: number | string;
  type13Hsn?: string;
  type14Name?: string;
  type14Amount?: number | string;
  type14Hsn?: string;
  type15Name?: string;
  type15Amount?: number | string;
  type15Hsn?: string;
  type16Name?: string;
  type16Amount?: number | string;
  type16Hsn?: string;
  type17Name?: string;
  type17Amount?: number | string;
  type17Hsn?: string;
  type18Name?: string;
  type18Amount?: number | string;
  type18Hsn?: string;
  type19Name?: string;
  type19Amount?: number | string;
  type19Hsn?: string;
  type20Name?: string;
  type20Amount?: number | string;
  type20Hsn?: string;
  type21Name?: string;
  type21Amount?: number | string;
  type21Hsn?: string;
  type22Name?: string;
  type22Amount?: number | string;
  type22Hsn?: string;
  type23Name?: string;
  type23Amount?: number | string;
  type23Hsn?: string;
  type24Name?: string;
  type24Amount?: number | string;
  type24Hsn?: string;
  type25Name?: string;
  type25Amount?: number | string;
  type25Hsn?: string;
}

export type TimeSlot = {
  from: string;
  to: string;
  breakFrom: string;
  breakTo: string;
  token: number;
};

export type DaySchedule = {
  enabled: boolean;
  slots: TimeSlot[];
};

export type AppointmentSettings = {
  [key: string]: DaySchedule; // Keys: "Sun", "Mon", "Tue", etc.
};

export type servicesParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type serviceData = {
  name: string;
  slug: string;
  amount: string;
  previousAmount: string;
  image: string;
  categoryId: number | null;
  timeSlotInterval: string;
  intervalType: string;
  description: string;
  gstPercentage: string | number | null;
  metaTitle: string;
  metaDescription: string;
  status: boolean;
  additionalImages: string[];
};

export type File = {
  type: string;
  name: string;
  path: string;
};

export type couponsParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type pagesParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type couponData = {
  name: string;
  code: string;
  discountType: string;
  discount: number;
  startDate: Date | null;
  endDate: Date | null;
  usageLimit: number | null;
  minBookingAmount: number | null;
};

export type pageData = {
  name: string;
  slug: string;
  content: string;
};

export type Coupon = {
  id: number;
  couponId: string;
  user: User;
  name: string;
  code: string;
  discountType: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  minBookingAmount: number;
  createdAt: Date;
};

export type Page = {
  id: number;
  pageId: string;
  name: string;
  slug: string;
  content: string;
  createdAt: Date;
};

export type employeeParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type employeeData = {
  user_id: number;
  employee_id?: string;
  name: string;
  position?: string;
  email?: string;
  phone: string;
  address?: string;
  image?: string;
};


export type siteSettingsData = {
  logo?: string;
  favicon?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  currency?: string;
  country?: string;
  state?: string;
  address?: string;
  metaTitle?: string;
  metaDescription?: string;
  sharingImagePreview?: string;
  gstNumber?: string | null;
  gstType?: string | null;

  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  pinterest?: string;

  cashInHand?: boolean;
  razorpayKeyId?: string;
  phonepeSaltKey?: string;
  phonepeSaltIndex?: string;
  phonepeMerchantId?: string;
  payuApiKey?: string;
  payuSalt?: string;

  sunday?: boolean;
  sundayStarts?: string;
  sundayEnds?: string;
  monday?: boolean;
  mondayStarts?: string;
  mondayEnds?: string;
  tuesday?: boolean;
  tuesdayStarts?: string;
  tuesdayEnds?: string;
  wednesday?: boolean;
  wednesdayStarts?: string;
  wednesdayEnds?: string;
  thursday?: boolean;
  thursdayStarts?: string;
  thursdayEnds?: string;
  friday?: boolean;
  fridayStarts?: string;
  fridayEnds?: string;
  saturday?: boolean;
  saturdayStarts?: string;
  saturdayEnds?: string;
};

export type manualPaymentMethodsParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type manualPaymentMethodData = {
  name: string;
  icon: string;
  instructions: string;
  image: string;
};

export type ManualPaymentMethod = {
  id: number;
  userId: number;
  name: string;
  icon: string;
  upi_id?: string | null;
  instructions: string;
  image: string;
  status?: string;
  createdAt: string; // 🔥 string, not Date (backend sends string)
};
export type availableAreasParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type availableArea = {
  id: number;
  areaId: string;
  area: string;
  charges: string;
  createdAt: Date;
  user: User;
};

export type availableAreaData = {
  area: string;
  charges: string;
};

export type appointmentsParams = {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  customerId?: number;
  fromDate?: string;
  toDate?: string;
};

export type updateAppointmentData = {
  status: string;
  paymentStatus: string;
  employeeId: number;
  employeeCommission: string;
};

export type updateUserData = {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  image: string;
};


export type changePasswordData = {
  currentPassword: string;
  password: string;
};

export type customerParams = {
  limit?: number;
  page?: number;
  q?: string;
};

export type Plugin = {
  id: number;
  name: string;
  description: string;
  icon: string;
  fieldLabel: string;
  fieldPlaceholder: string;
};

export interface PluginCardProps {
  id: number;
  name: string;
  description: string;
  icon: string;
  fieldLabel: string;
  fieldPlaceholder: string;
}

export interface PluginFormProps {
  id: number;
  title: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  children: React.ReactNode;
}

export interface ReportOverviewCardProps {
  label: string;
  number: number;
  index: number;
}

export interface RevenueGraph {
  date: string;
  revenue: number;
  appointments: number;
}

export interface WebsiteSettingsData {
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  navLinks?: NavLink[];
}

export interface WebsiteSettings {
  user_id: number;
  banners: any;
  id: number;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  navLinks: NavLink[];
}

export interface NavLink {
  label: string;
  link: string;
}


// types/menu.ts
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  menu_id: number;
  category_id?: number;
  category: string;
  menu: string;
  food_type: 'veg' | 'non-veg';
  halal: boolean;
  stock_type: string;
  stock_qty?: number;
  stock_unit?: string;
  stock: string;
  customer_limit?: number;
  customer_limit_period?: string;
  image?: string;
  preparationTime: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  orderCount: number;
  rating: number;
  bestSeller: boolean;
  available: boolean;
  showOnSite: boolean;
  lastUpdated: string;
  veg: boolean;
}


export type DoctorSchedule = {
  id: number;
  serviceId: number;
  userId: number;

  name: string;
  doctor_name?: string;

  slug: string;
  amount: string;

  // tokens
  token_limit: string;

  categoryId?: string;
  description?: string;

  specialization?: string | null;
  qualification?: string | null;
  experience?: string | null;

  doctorImage?: string | null;
  doctor_image?: string | null;

  image?: string | null;

  weeklySchedule?: any;
  leaveDates?: string[];

  metaTitle?: string;
  metaDescription?: string;

  doctorLocation?: any;

  // 🔥🔥🔥 REQUIRED FOR YOUR FORM TO WORK 🔥🔥🔥
  appointmentTimeFromFormatted?: {
    time: string;
    period: "AM" | "PM";
  };

  appointmentTimeToFormatted?: {
    time: string;
    period: "AM" | "PM";
  };

  createdAt: string;
  updatedAt?: string;
};




export interface Variation {
  id?: number;
  name: string;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent?: number;
  dineInPrice?: number;
  takeawayPrice?: number;
  deliveryPrice?: number;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  menu_id: number;
  category_id?: number;
  food_type: 'veg' | 'non-veg';
  halal: boolean;
  stock_type: 'limited' | 'unlimited' | 'out_of_stock';
  stock_qty?: number;
  stock_unit?: string;
  customer_limit?: number;
  customer_limit_period?: string;
  image?: string;
  variations: Variation[];
}