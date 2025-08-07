import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

type TaskStatus = 'pending' | 'completed' | 'skipped';
interface Task {
  id: number;
  plant_id: number;
  plant_name: string;
  type: string; // watering, fertilizing, pruning, ...
  scheduled_date: string; // ISO
  status: TaskStatus;
  completed_date?: string | null;
}

interface DayTasks {
  date: string; // yyyy-mm-dd
  tasks: Task[];
}

@Component({
  selector: 'app-tasks-calendar',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './tasks-calendar.html',
  styleUrl: './tasks-calendar.scss'
})
export class TasksCalendarComponent implements OnInit {
  loading = true;
  error = '';
  days: DayTasks[] = [];

  // Se hai già un ApiService/TasksService, usa quello; qui vado diretto per chiarezza
  private baseUrl = 'https://api.zapp.justabit.xyz';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
      const plantId = this.route.snapshot.paramMap.get('id');
      if (plantId) {
        this.fetchTasksByPlant(+plantId);
      } else {
        this.fetchAllTasks();
      }
  }

  fetchAllTasks() {
    this.loading = true;
    this.http.get<Task[]>(`${this.baseUrl}/tasks`).subscribe({
      next: (tasks) => {
        // opzionale: filtra solo prossimi N giorni
        const today = new Date();
        const future = tasks.filter(t => new Date(t.scheduled_date) >= new Date(today.toDateString()));
        this.days = this.groupTasksByDate(future);
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento task';
        this.loading = false;
      }
    });
  }

  fetchTasksByPlant(plantId: number) {
    this.http.get<Task[]>(`${this.baseUrl}/tasks/${plantId}`).subscribe({
      next: (tasks) => { this.days = this.groupTasksByDate(tasks); this.loading = false; },
      error: () => { this.error = 'Errore nel caricamento task'; this.loading = false; }
    });
  }
  groupTasksByDate(tasks: Task[]): DayTasks[] {
    const bucket: Record<string, Task[]> = {};
    for (const t of tasks) {
      const key = t.scheduled_date.slice(0, 10); // yyyy-mm-dd
      (bucket[key] ||= []).push(t);
    }
    return Object.keys(bucket)
      .sort() // cronologico
      .map(d => ({ date: d, tasks: bucket[d].sort((a, b) => a.plant_name.localeCompare(b.plant_name)) }));
  }

  completeAll(day: DayTasks) {
    const calls = day.tasks
      .filter(t => t.status === 'pending')
      .map(t => this.http.put(`${this.baseUrl}/tasks/${t.id}`, { status: 'completed' }));
    if (calls.length === 0) return;
    // esegui in parallelo
    Promise.all(calls.map(obs => obs.toPromise()))
      .then(() => this.fetchAllTasks())
      .catch(() => this.error = 'Errore nel completare i task del giorno');
  }

  skipAll(day: DayTasks) {
    const calls = day.tasks
      .filter(t => t.status === 'pending')
      .map(t => this.http.put(`${this.baseUrl}/tasks/${t.id}`, { status: 'skipped' }));
    if (calls.length === 0) return;
    Promise.all(calls.map(obs => obs.toPromise()))
      .then(() => this.fetchAllTasks())
      .catch(() => this.error = 'Errore nel saltare i task del giorno');
  }
}
