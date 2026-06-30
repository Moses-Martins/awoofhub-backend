import { NotificationEntityType, NotificationType } from "./enums";

export interface CreateNotificationArgs {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
}