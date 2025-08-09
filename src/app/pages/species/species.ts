import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-species',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './species.html',
  styleUrl: './species.scss'
})
export class SpeciesComponent implements OnInit {
  species: any[] = [];
  categories: any[] = [];
  sunExposure: any[] = [];
  selectedSpecies: any = null;
  selectedIndex = -1;
  loading = true;
  error = '';
  isMobile = false;

  showAddModal = false;
  newSpecies = {
    common_name: '',
    scientific_name: '',
    category: '',
    sun_exposure: '',
    watering_freq: 7,
    fertilizing_freq: 30,
    pruning_freq: null,
    sowing_period: '',
    harvest_period: '',
    notes: '',
    image_url: ''
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.api.getSunExposure().subscribe({
      next: (res: any) => {
        this.sunExposure = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento delle esposizioni';
        this.loading = false;
      }
    });

    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento delle specie';
        this.loading = false;
      }
    });

    this.api.getSpecies().subscribe({
      next: (res) => {
        this.species = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Errore nel caricamento delle specie';
        this.loading = false;
      }
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  selectSpecies(index: number) {
    this.selectedIndex = index;
    this.selectedSpecies = this.species[index];
  }

  deselectSpecies() {
    this.selectedSpecies = null;
  }

  goToPlants() {
    this.router.navigate(['/plants']);
  }

  openAddSpeciesForm() {
    this.showAddModal = true;
  }

  closeAddSpeciesForm() {
    this.showAddModal = false;
  }

  addSpecies() {
    this.api.saveSpecies(this.newSpecies).subscribe({
      next: (res) => {
        this.showAddModal = false;
        this.api.getSpecies().subscribe(species => this.species = species);
      },
      error: () => this.error = 'Errore nel salvataggio specie'
    });
  }
}
