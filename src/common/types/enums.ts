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
  PASSWORD_RESET = 'password_reset',
}