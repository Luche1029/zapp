import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-species',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule 
  ],
  templateUrl: './species.html',
  styleUrl: './species.scss'
})
export class SpeciesComponent implements OnInit {
  private fb = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

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

  editMode = false;
  uploading = false;
  speciesForm = this.fb.group({
    scientific_name: [''],
    common_name: [''],
    category_id: [null],
    sun_exposure_id: [null],
    watering_freq: [null],
    fertilizing_freq: [null],
    pruning_freq: [null],
    sowing_period: [''],
    harvest_period: [''],
    notes: [''],
    image_url: ['']
  });

  cameraOpen = false;
  shotUrl: string | null = null;
  private mediaStream?: MediaStream;


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
        if (!this.isMobile && this.species.length > 0) {
          this.selectSpecies(0);
        }
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
    this.speciesForm.patchValue({
          common_name: this.selectedSpecies.common_name,
          scientific_name: this.selectedSpecies.scientific_name,
          category_id: this.selectedSpecies.category_id,
          sun_exposure_id: this.selectedSpecies.sun_exposure_id,
          watering_freq: this.selectedSpecies.watering_freq,
          fertilizing_freq: this.selectedSpecies.fertilizing_freq,
          pruning_freq: this.selectedSpecies.pruning_freq,
          sowing_period: this.selectedSpecies.sowing_period,
          harvest_period: this.selectedSpecies.harvest_period,
          notes: this.selectedSpecies.notes,
          image_url: this.selectedSpecies.image_url
        });
    this.speciesForm.disable();
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

  toggleEdit() { 
    this.editMode = !this.editMode; 
    if (this.editMode) {
      this.speciesForm.enable();
    } else {
      this.speciesForm.disable();
    }
  }

  saveSpecies() {
    const id = this.selectedSpecies.id || this.selectedSpecies.species_id;
    this.api.updateSpecies(id, this.speciesForm.value).subscribe({
      next: () => { 
        this.editMode = false; 
       },
      error: (err) => alert(`Errore nel salvataggio specie`)
    });
  }

  uploadImage() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedSpecies) return;

    this.uploading = true;
    const id = this.selectedSpecies.id;

    this.api.uploadSpeciesImage(id, file).subscribe({
      next: (res: any) => {
        // res.url = URL pubblico dell'immagine
        this.speciesForm.patchValue({ image_url: res.url });
        this.uploading = false;
      },
      error: () => {
        alert('Errore nel caricamento immagine');
        this.uploading = false;
      }
    });
  }

  async openCamera() {
    try {
      this.cameraOpen = true;
      this.shotUrl = null;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false
      });
      this.videoRef.nativeElement.srcObject = this.mediaStream;
    } catch (err) {
      this.cameraOpen = false;
      alert('Impossibile accedere alla fotocamera');
    }
  }

  closeCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = undefined;
    }
    this.cameraOpen = false;
  }

  takePhoto() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    // dimensioni native del video
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.shotUrl = canvas.toDataURL('image/jpeg', 0.9);

    // invio diretto allo stesso endpoint upload
    this.uploadDataUrl(this.shotUrl);
  }

  private uploadDataUrl(dataUrl: string) {
    // dataURL -> Blob -> File
    const blob = this.dataURLtoBlob(dataUrl);
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

    this.uploading = true;
    const id = this.selectedSpecies?.id;
    if (!id) return;

    this.api.uploadSpeciesImage(id, file).subscribe({
      next: (res: any) => {
        this.speciesForm.patchValue({ image_url: res.url });
        this.uploading = false;
        this.closeCamera();
      },
      error: () => { this.uploading = false; alert('Errore upload scatto'); }
    });
  }

  private dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }
}
