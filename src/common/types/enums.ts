export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS = 'business',
}

export enum OfferStatus {
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
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  ACCOUNT_BLOCKED = "ACCOUNT_BLOCKED",
  ACCOUNT_DELETED = "ACCOUNT_DELETED",
  ACCOUNT_ACTIVATED = "ACCOUNT_ACTIVATED",
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

export enum AccountStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
  DELETED = "deleted"
}

export enum ModerationActionType {
  WARNING = 'warning',
  SUSPEND = 'suspend',
  BLOCK = 'block',
  DELETE = 'delete',
  RESTORE = 'restore',
  ACTIVATE = 'activate',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}