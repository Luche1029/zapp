import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.fetchTasks();
  }

  fetchTasks() {
    const plantId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.api.getTasks(plantId).subscribe({
      next: (t: any) => { this.days = this.groupTasksByDate(t); this.loading = false; },
      error: () => { this.error = 'Errore nel caricamento task'; this.loading = false; }
    });
  }

  groupTasksByDate(tasks: Task[]): DayTasks[] {
    const bucket: Record<string, Task[]> = {};
    for (const t of tasks) {
      const key = t.scheduled_date.slice(0, 10); 
      (bucket[key] ||= []).push(t);
    }
    return Object.keys(bucket)
      .sort() 
      .map(d => ({ date: d, tasks: bucket[d].sort((a, b) => a.plant_name.localeCompare(b.plant_name)) }));
  }

  completeAll(day: DayTasks) {
    console.log("complete all", JSON.stringify(day));
    const pending = day.tasks.filter(t => t.status === 'pending');
    if (!pending.length) return;

    forkJoin(pending.map(t => this.api.updateTask(t.id, 'completed')))
      .subscribe({
        next: () => this.refreshCalendar(),
        error: () => this.error = 'Errore nel completare i task del giorno'
      });
  }

  skipAll(day: DayTasks) {
    const pending = day.tasks.filter(t => t.status === 'pending');
    if (!pending.length) return;

    forkJoin(pending.map(t => this.api.updateTask(t.id, 'skipped')))
      .subscribe({
        next: () => this.refreshCalendar(),
        error: () => this.error = 'Errore nel saltare i task del giorno'
      });
  }

  private refreshCalendar() {
    const plantId = Number(this.route.snapshot.paramMap.get('id')) || 0;  
    this.api.getTasks(plantId).subscribe({
      next: (t: Task[]) => {
        this.days = this.groupTasksByDate(t);
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento task';
        this.loading = false;
      }
    });

  }

  goToPlants() {
    this.router.navigate(['/plants']);
  }
}
