// models/task.model.ts (o dove preferisci)
export interface Task {
  id: number;
  plantId: number;
  nickname: string;
  type_id: number;
  type: string;
  scheduled_date: string;     
  status_id: number;
  status: string;
  completed_date?: string|null;
}
