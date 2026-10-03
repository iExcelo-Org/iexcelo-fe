import { affiliateSchema, sponsorSchema, studentSchema } from "@/schemas";
import type { InferType } from "yup";
import { UserType as UserTypeEnum } from "./enums";

// Re-export UserType enum
export { UserType } from "./enums";

// UserType with null for store/state management
export type UserTypeOrNull = UserTypeEnum | null;

// Field name types for signup forms
export type SignUpFieldNameTypes =
  | "phoneNumber"
  | "email"
  | "password"
  | "countryCode"
  | "confirmPassword"
  | "firstName"
  | "lastName"
  | "agreeToTerms"
  | "examTypeId"
  | "category"
  | "companyName";

// Form data types derived from Yup schemas
export type StudentFormDataTypes = InferType<typeof studentSchema>;
export type SponsorFormDataTypes = InferType<typeof sponsorSchema>;
export type AffiliateFormDataTypes = InferType<typeof affiliateSchema>;

export type RegistrationFormDataTypes =
  | StudentFormDataTypes
  | SponsorFormDataTypes
  | AffiliateFormDataTypes;

// Login form data
export type LoginFormData = {
  email: string;
  password: string;
};

// Onboarding form data types
export type OnboardingFormData = {
  // Student fields
  examTypeId?: string;
  subjectIds?: string[];
  // Sponsor fields
  category?: string;
  companyName?: string;
  // Common fields
  phoneNumber?: string;
  countryCode?: string;
};

// Legacy type alias for compatibility
export type StudentOnboardingState = OnboardingFormData;
