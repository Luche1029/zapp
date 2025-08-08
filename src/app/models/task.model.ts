// models/task.model.ts (o dove preferisci)
export interface Task {
  id: number;
  plant_id: number;
  plant_name: string;
  type: 'watering'|'fertilizing'|'pruning'|'harvest'|'custom';
  scheduled_date: string;      // ISO date
  status: 'pending'|'completed'|'skipped';
  completed_date?: string|null;
}
