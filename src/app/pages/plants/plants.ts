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
  status: any[] = [];
  selectedPlant: any = null;
  selectedIndex = -1;
  loading = true;
  error = '';

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
    this.api.getPlantStatus().subscribe({
      next: (res: any) => {
        this.status = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento degli stati';
        this.loading = false;
      }
    });  

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


}
