import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule  } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-plants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule 
  ],
  templateUrl: './plants.html',
  styleUrl: './plants.scss'
})
export class PlantsComponent implements OnInit {  
   private fb = inject(FormBuilder);

  constructor(
    private api: ApiService, 
    private router: Router) {}

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

  isMobile: boolean = false;

  editMode = false;
  plantForm = this.fb.group({
    species_id: [''],
    nickname: [''],
    planted_date: [null],
    status_id: [null],
    location: [''],
    notes: [''],
    last_watering: [null],
    last_fertilizing: [null],
    last_pruning: [null],
  });

  ngOnInit(): void {
    this.checkScreenSize();
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

    this.api.getSpecies().subscribe({
        next: (res) => this.species = res,
        error: () => this.error = 'Errore nel caricamento specie'
      });

    this.api.getPlants().subscribe({
      next: (res) => {
        this.plants = res;
        this.loading = false;
        if (!this.isMobile && this.plants.length > 0) {
           this.selectPlant(0);
        }
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle piante';
        this.loading = false;
      }
    });
  }

    // Rilevamento dimensione schermo
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768; // breakpoint tablet/mobile
  }

  // Selezione pianta
  selectPlant(index: number) {
    this.selectedIndex = index;
    const plantId = this.plants[index].id;
    this.plantForm.disable();
    this.getPlantDetails(plantId);   
  }

  getPlantDetails(id: number) {
    this.api.getPlantDetail(id).subscribe({
      next: (detail) => {
        this.selectedPlant = detail;
        this.plantForm.patchValue({
          species_id: this.selectedPlant.species_id,
          nickname: this.selectedPlant.nickname,
          planted_date: this.selectedPlant.planted_date?.slice(0,10) ?? null,
          status_id: this.selectedPlant.status_id ?? null,
          location: this.selectedPlant.location ?? '',
          notes: this.selectedPlant.plant_notes ?? this.selectedPlant.notes ?? '',
          last_watering: this.selectedPlant.last_watering?.slice(0,10) ?? null,
          last_fertilizing: this.selectedPlant.last_fertilizing?.slice(0,10) ?? null,
          last_pruning: this.selectedPlant.last_pruning?.slice(0,10) ?? null,
        });
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

  toggleEdit() { 
    this.editMode = !this.editMode; 
    if (this.editMode) {
      this.plantForm.enable();
    } else {
      this.plantForm.disable();
    }
  }

  savePlant() {
    const id = this.selectedPlant.id || this.selectedPlant.plant_id;
    this.api.updatePlant(id, this.plantForm.value).subscribe({
      next: () => { 
        this.editMode = false; 
        this.getPlantDetails(id); 
       },
      error: () => alert('Errore nel salvataggio pianta')
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
