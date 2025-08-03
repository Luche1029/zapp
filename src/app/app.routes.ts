import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { PlantsComponent } from './pages/plants/plants';
import { SpeciesComponent } from './pages/species/species';
import { TasksComponent } from './pages/tasks/tasks';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'plants', component: PlantsComponent },
  { path: 'species', component: SpeciesComponent },
  { path: 'tasks', component: TasksComponent }
];
