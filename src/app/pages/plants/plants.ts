import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './plants.html',
  styleUrl: './plants.scss'
})
export class PlantsComponent implements OnInit {
  plants: any[] = [];
  selectedPlant: any = null;
  selectedIndex = -1;
  loading = true;
  error = '';
  isMobile = false;

  showAddModal = false;
  newPlant = {
    species_id: '',
    nickname: '',
    planted_date: '',
    status: 'seed',
    location: ''
  };
  species: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.api.getPlants().subscribe({
      next: (res) => {
        this.plants = res;
        this.loading = false;

        // Se abbiamo piante, selezioniamo la prima di default
       /* if (this.plants.length > 0) {
          this.selectedIndex = 0;
          this.selectedPlant = this.plants[0];
        }*/
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
    const plantId = this.plants[index].id;

    this.api.getPlantDetail(plantId).subscribe({
      next: (detail) => {
        this.selectedPlant = detail;
      },
      error: () => {
        this.selectedPlant = null;
        this.error = 'Errore nel caricamento dettagli pianta';
      }
    });
  }


  // Deselezione per mobile
  deselectPlant() {
    this.selectedPlant = null;
  }

  openAddPlantForm() {
    this.showAddModal = true;

    // Se non abbiamo ancora caricato le specie, caricale
    if (this.species.length === 0) {
      this.api.getSpecies().subscribe({
        next: (res) => this.species = res,
        error: () => this.error = 'Errore nel caricamento specie'
      });
    }
  }

  closeAddPlantForm() {
    this.showAddModal = false;
  }

  addPlant() {
    this.api.savePlant(this.newPlant).subscribe({
      next: (res) => {
        this.showAddModal = false;
        // Aggiorna lista piante
        this.api.getPlants().subscribe(plants => this.plants = plants);
      },
      error: () => this.error = 'Errore nel salvataggio pianta'
    });
  }

  
  goToSpecies() {
    this.router.navigate(['/species']);
  }

  goToTasks() {
    const plantId = this.selectedPlant.plant_id || this.selectedPlant.id;
    this.router.navigate([`/plants/${plantId}/tasks`]);
  }

  goToCalendar(plantId: number) {
    if (plantId > 0) {
      this.router.navigate(['/tasks/calendar/plant', plantId]);
    } else {
      this.router.navigate(['/tasks/calendar']);
    }
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
