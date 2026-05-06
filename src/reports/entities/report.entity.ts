import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;


}


{
  "report_id": "uuid_v4_string",
  "reporter_user_id": "123456789",
  "target_type": "TWEET", // or "USER", "DM"
  "target_id": "2051315373425807783", 
  "report_category": "harassment",
  "report_subcategory": "threats",
  "timestamp": "2026-05-06T13:54:45Z",
  "metadata": {
    "ip_address": "...",
    "client_device": "firefox_win_10",
    "session_id": "..."
  },
  "status": "PENDING_REVIEW" 
}
