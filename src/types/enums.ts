// User types enum
export enum UserType {
  STUDENT = "student",
  SPONSOR = "sponsor",
  AFFILIATE = "affiliate",
}

// Sponsor category enum
export enum SponsorCategory {
  INDIVIDUAL = "individual",
  COMPANY = "company",
  RELIGIOUS = "religious",
  GOVERNMENT = "government",
}

export enum CommissionStatus {
  CONFIRMED = "confirmed",
  PAID = "paid",
}

export enum PayoutStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum SubscriptionStatus {
  PENDING = "pending", // Awaiting payment confirmation
  ACTIVE = "active", // Currently active subscription
  EXPIRED = "expired", // Past end date
  CANCELLED = "cancelled", // Cancelled by user or admin
  PAST_DUE = "past_due", // Payment failed but in grace period
  SUSPENDED = "suspended", // Suspended due to payment issues
}
