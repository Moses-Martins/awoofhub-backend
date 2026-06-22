export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS = 'business',
}

export enum OfferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum DealType {
  CASHBACK = 'cashback',
  FREEBIE = 'freebie',
  DISCOUNT = 'discount',
  BOGO = 'bogo',
  PROMO_CODE = 'promo_code',
  FREE_TRIAL = 'free_trial',
  FREE_DELIVERY = 'free_delivery',
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
  OFFER_APPROVED = "OFFER_APPROVED",
  OFFER_REJECTED = "OFFER_REJECTED",
}

export enum MyOffersTab {
  ALL = 'all',
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum ReportType {
  SPAM = 'spam',
  SCAM = 'scam',
  ABUSE = 'abuse',
  EXPLICIT = 'explicit',
  VIOLENCE = 'violence',
  ILLEGAL = 'illegal',
  SELF_HARM = 'self_harm',
  OTHER = 'other',
}

export enum TargetType {
  USER = 'user',
  OFFER = 'offer',
  COMMENT = 'comment',
}

export enum ReportStatus {
  PENDING = "pending",
  RESOLVED = "resolved",
  DISMISSED = "dismissed"
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DELETED = 'deleted',
}

export enum ModerationActionType {
  WARNING = 'warning',
  SUSPEND = 'suspend',
  BLOCK = 'block',
  DELETE = 'delete',
  ACTIVATE = 'activate',
}