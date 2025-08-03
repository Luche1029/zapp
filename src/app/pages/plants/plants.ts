import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-plants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plants.html',
  styleUrl: './plants.scss'
})
export class PlantsComponent implements OnInit {
  plants: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getPlants().subscribe({
      next: (res) => {
        this.plants = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle piante';
        this.loading = false;
      }
    });
  }
}
