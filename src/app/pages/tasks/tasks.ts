import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  loading = true;
  error = '';
  plantId: number = 0;
  plantNickname = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.plantId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTasks();
  }

  fetchTasks() {
    this.api.getTasks(0).subscribe({
      next: (res) => {
        this.tasks = res;
        //if (res.length > 0) this.plantNickname = res[0].nickname;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento dei task';
        this.loading = false;
      }
    });
  }

  completeTask(taskId: number) {
    this.api.updateTask(taskId, 'completed').subscribe(() => {
      this.fetchTasks();
    });
  }

  skipTask(taskId: number) {
    this.api.updateTask(taskId, 'skipped').subscribe(() => {
      this.fetchTasks();
    });
  }
  goToPlants() {
    this.router.navigate(['/plants']);
  }

}
