import { Component, OnInit, HostListener } from '@angular/core';
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
  selectedPlant: any = null;
  selectedIndex = 0;
  loading = true;
  error = '';
  isMobile = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.api.getPlants().subscribe({
      next: (res) => {
        this.plants = res;
        this.loading = false;

        // Se abbiamo piante, selezioniamo la prima di default
        if (this.plants.length > 0) {
          this.selectedIndex = 0;
          this.selectedPlant = this.plants[0];
        }
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle piante';
        this.loading = false;
      }
    });
  }

  // Selezione pianta
  selectPlant(index: number) {
    this.selectedIndex = index;
    this.selectedPlant = this.plants[index];
  }

  // Deselezione per mobile
  deselectPlant() {
    this.selectedPlant = null;
  }

  // Rilevamento dimensione schermo
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768; // breakpoint tablet/mobile
  }
}
