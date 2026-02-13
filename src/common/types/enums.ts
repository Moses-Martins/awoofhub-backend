export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS = 'business',
}

export enum BusinessCategory {
  TECH = 'Tech',
  FOOD = 'Food',
  EVENTS = 'Events',
  SERVICES = 'Services'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TokenPurpose {
  EMAIL_VERIFICATION = 'email_verification',
  EMAIL_CHANGE = 'email_change',
}

export enum AuthProvider {
  GOOGLE = "google",
  LOCAL = "local",
}

export enum NotificationType {
  PROFILE_UPDATED = "PROFILE_UPDATED",
  OFFER_CREATED = "OFFER_CREATED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  NEW_MESSAGE = "NEW_MESSAGE",
  OFFER_APPROVED = "OFFER_APPROVED",
  OFFER_REJECTED = "OFFER_REJECTED",
}